import React from 'react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-blue-400">
          FuelRoute App
        </h1>
        <p className="text-lg text-slate-300">
          Welkom! De basis en databasekoppeling zijn succesvol opgezet.
        </p>
        <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-green-400 font-semibold">
            ✓ Live verbinding actief
          </p>
        </div>
      </div>
    </main>
  );
}