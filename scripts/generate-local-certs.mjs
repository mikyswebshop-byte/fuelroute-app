/**
 * Generate local HTTPS certs for Next.js `dev:https`.
 * Requires OpenSSL on PATH (Git for Windows includes it).
 *
 * Usage:
 *   npm run certs:generate
 *   EXTRA_HOSTS=192.168.1.104,10.0.0.5 npm run certs:generate
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, unlinkSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'certificates');
const keyPath = path.join(outDir, 'localhost-key.pem');
const certPath = path.join(outDir, 'localhost.pem');
const cfgPath = path.join(outDir, 'openssl.cnf');

const extraHosts = (process.env.EXTRA_HOSTS ?? '192.168.1.104')
  .split(/[,\s]+/)
  .map((h) => h.trim())
  .filter(Boolean);

function findOpenSsl() {
  const candidates = [
    'openssl',
    'C:\\Program Files\\Git\\usr\\bin\\openssl.exe',
    'C:\\Program Files (x86)\\Git\\usr\\bin\\openssl.exe',
  ];
  for (const bin of candidates) {
    try {
      execFileSync(bin, ['version'], { stdio: 'ignore' });
      return bin;
    } catch {
      /* try next */
    }
  }
  return null;
}

const openssl = findOpenSsl();
if (!openssl) {
  console.error(
    'OpenSSL not found. Install Git for Windows (includes openssl) or OpenSSL, then re-run.\n' +
      'Or with mkcert:\n' +
      '  mkcert -key-file certificates/localhost-key.pem -cert-file certificates/localhost.pem localhost 127.0.0.1 ::1 192.168.1.104'
  );
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });

const hosts = ['localhost', '127.0.0.1', '::1', ...extraHosts];
const unique = [...new Set(hosts)];

let dnsIdx = 1;
let ipIdx = 1;
const altLines = unique.map((host) => {
  const isIp = /^\d+\.\d+\.\d+\.\d+$/.test(host) || host === '::1';
  if (isIp) return `IP.${ipIdx++} = ${host}`;
  return `DNS.${dnsIdx++} = ${host}`;
});

writeFileSync(
  cfgPath,
  `[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
CN = localhost
O = FuelRoute Local Dev
C = NL

[v3_req]
basicConstraints = CA:FALSE
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
${altLines.join('\n')}
`
);

console.log('Generating key + cert in certificates/ …');
console.log('SANs:', unique.join(', '));

execFileSync(
  openssl,
  [
    'req',
    '-x509',
    '-newkey',
    'rsa:2048',
    '-nodes',
    '-keyout',
    keyPath,
    '-out',
    certPath,
    '-days',
    '825',
    '-config',
    cfgPath,
  ],
  { stdio: 'inherit' }
);

try {
  unlinkSync(cfgPath);
} catch {
  /* ignore */
}

if (!existsSync(keyPath) || !existsSync(certPath)) {
  console.error('Certificate generation failed.');
  process.exit(1);
}

console.log('Wrote:');
console.log(' ', keyPath);
console.log(' ', certPath);
console.log('\nStart HTTPS dev server with: npm run dev:https');
