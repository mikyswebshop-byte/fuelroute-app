# FuelRoute / Fleet OS — Gebruikershandleiding

Handleiding voor **chauffeurs** en **planners/dispatchers**.  
Versie: Fleet OS (webapp) · Taal: Nederlands (UI ook omschakelbaar via 🌐 in de navigatie)

---

## Inhoud

1. [Snel starten](#1-snel-starten)
2. [PWA / iPhone-installatie](#2-pwa--iphone-installatie)
3. [Rollen & inloggen](#3-rollen--inloggen)
4. [Handleiding Chauffeur](#4-handleiding-chauffeur)
5. [Voice AI-commando’s](#5-voice-ai-commandos)
6. [e-CMR handtekening](#6-e-cmr-handtekening)
7. [Digitale Handschoenvak](#7-digitale-handschoenvak)
8. [Handleiding Planner / Dispatcher](#8-handleiding-planner--dispatcher)
9. [Taal & GPS / HTTPS](#9-taal--gps--https)
10. [Veelgestelde vragen](#10-veelgestelde-vragen)

---

## 1. Snel starten

1. Open de app in de browser (bij voorkeur **Safari** op iPhone, **Chrome** op Android/desktop).
2. Op het startscherm kiest u uw rol (bijv. **Chauffeur** of **Planner / Dispatcher**).
3. Er is **geen PIN of wachtwoord** nodig — één tik op de rol opent de juiste modules.
4. U komt terecht op de homepagina van die rol (chauffeur → *Chauffeur Cockpit*, planner → *Rit-Planner*).
5. Wisselen van rol: in de navigatie **Wissel Rol / Uitloggen**, of de snelle knoppen **Chauffeur** / **Planner**.

> **Tip:** Op het netwerk (bijv. `https://192.168.x.x:3000`) werkt locatie op iPhone alleen betrouwbaar via **HTTPS**. Zie [§9](#9-taal--gps--https).

---

## 2. PWA / iPhone-installatie

FuelRoute is een webapp die u als icoon op het beginscherm kunt zetten (PWA-achtig gebruik).

### iPhone (Safari) — Zet op beginscherm

1. Open de app-URL in **Safari** (niet in Chrome-in-app of Facebook-browser).
2. Tik op het **Deel**-pictogram (vierkant met pijl omhoog).
3. Scroll en kies **Zet op beginscherm** / **Add to Home Screen**.
4. Pas desgewenst de naam aan (bijv. `FuelRoute`) en tik op **Voeg toe**.
5. Open de app voortaan via het icoon — voller scherm, snellere toegang tot cockpit en microfoon/GPS-prompts.

### Android (Chrome) — optioneel

1. Open de URL in Chrome.
2. Menu **⋮** → **App installeren** of **Toevoegen aan startscherm**.

### Vereisten voor GPS & Voice op iPhone

| Functie        | Vereiste                                      |
|----------------|-----------------------------------------------|
| Precieze GPS   | **HTTPS** of `localhost` (HTTP op LAN blokkeert vaak locatie) |
| Voice AI (STT) | Microfoontoestemming in Safari                 |
| Locatie        | Instellingen → Safari → Locatie → **Vragen** of **Toestaan** |

---

## 3. Rollen & inloggen

| Rol | Homepagina | Kerntaken |
|-----|------------|-----------|
| **Chauffeur** | `/driver` | Cockpit, navigatie, tanken, walkaround, schade, e-CMR |
| **Planner / Dispatcher** | `/planner` | Ritplanning, stops, maut/tol, vlootoverzicht |
| Overige rollen | wisselend | ZZP, eigenaar, boekhouding, garage (zie startscherm) |

- Het menu toont **alleen modules die bij uw rol horen**.
- Opnieuw kiezen: **Wissel Rol** → startscherm.

---

## 4. Handleiding Chauffeur

### 4.1 Cockpit openen

1. Kies op het startscherm **Chauffeur**.
2. U ziet de **Driver Cockpit**: kaart, statuschips (rijtijd, volgende stop, brandstof), grote **Voice AI**- en **Nood**-knoppen.

### 4.2 Rij-modus vs stilstand

| Actie | Effect |
|-------|--------|
| **Simuleer Rijden** | Demo-rit (~72 km/h), rij-modus, snelheidsmeter beweegt, telemetrie leeft |
| **Stilstand** | Snelheid 0, stilstand-tools zichtbaar (handschoenvak, e-CMR) |
| Live GPS | Via **Locatie toestaan** / **GPS starten** — echte snelheid op de route |

- In **rij-modus** blijft de interface bewust eenvoudig (kaart, ETA, voice, nood).
- Bij **stilstand** verschijnen documenten, e-CMR en gedetailleerde telemetrie.

### 4.3 Locatie / GPS

1. Tik op **Locatie toestaan** of **GPS starten**.
2. Sta locatie toe in de browserprompt.
3. Bij weigering gebruikt de app **democoördinaten** (Kassel-hub) zodat u kunt blijven oefenen.
4. Als de snelheid op een actieve rit onder ~15 km/h zakt (niet bewust stilstand), kan de banner **FILE / VERTRAGING** tonen met aangepaste ETA.

### 4.4 Telemetrie & brandstof

- Statusbalk: brandstof, AdBlue, accu, banden, bereik.
- Tijdens simulatie/rijden bewegen meters; brandstof loopt langzaam terug (demo).
- Lage brandstof (&lt; ~20%) wordt rood/oranje gemarkeerd.

### 4.5 Noodgeval / pech

1. Tik op de grote **🆘**-knop, of zeg via Voice AI *“Pech”* / *“Noodgeval”*.
2. Pechprotocol opent (GPS-positie, bevestiging pechmelding).
3. Volg de instructies van planner / pechdienst.

### 4.6 Walkaround, schade & scans (uitgebreide driver-UI)

Afhankelijk van rol/modus kunt u ook:

- Pre-trip / walkaround-foto’s maken  
- Schadezones markeren  
- Tankbon / CMR scannen (camera + OCR-simulatie)  

Gebruik hiervoor de actieknoppen op de chauffeurpagina of snelle acties (waar zichtbaar).

---

## 5. Voice AI-commando’s

### 5.1 Microfoon gebruiken

1. Tik op de grote **🎤 Voice AI**-knop.
2. Sta **microfoontoegang** toe (eenmalig).
3. De knop pulseert en toont **“Luistert…”**.
4. Er verschijnt een hint met voorbeeldcommando’s.
5. Spreek duidelijk (bij voorkeur Nederlands); de app antwoordt met spraak (TTS).

> Op iPhone: gebruik Safari of de beginscherm-app; controleer Instellingen → FuelRoute/Safari → Microfoon.

### 5.2 Ondersteunde commando’s (NL)

| U zegt (voorbeelden) | Actie |
|----------------------|--------|
| **Status** / **Voertuig status** | Toont telemetrie-overlay (snelheid, brandstof, ETA, GPS) |
| **Tanken** / **Brandstof** / **Tankstation** | Tankstop-info (volgende Autohof, afstand, reserve) |
| **Stilstand** / **Pauze** | Zet stilstand-modus (snelheid 0, tools zichtbaar) |
| **Simuleer** / **Start rit** / **Rijden** | Start rit-simulatie / drive mode |
| **Handschoenvak** / **Documenten** | Opent Digitale Handschoenvak *(alleen bij stilstand)* |
| **CMR** / **Handtekening** | Opent e-CMR-handtekening *(alleen bij stilstand)* |
| **Rijtijd** / **Hoe lang nog?** | Spreekt resterende rijtijd / ETA |
| **Berichten** | Spreekt ongelezen plannerberichten |
| **Pech** / **Noodgeval** | Start nood-/pechprotocol |

### 5.3 Tips voor herkenning

- Spreek één commando per keer, zonder lange zinnen.  
- Bij “Sorry, ik begreep het niet…” opnieuw tikken op 🎤 en korter herhalen.  
- Zonder spraakherkenning in de browser blijft **TTS** (voorlezen) soms wel werken; STT vereist een ondersteunde browser.

---

## 6. e-CMR handtekening

Digitale handtekening van de ontvanger, gekoppeld aan de rit / e-CMR.

### Stappen (chauffeur)

1. Zet de cabine op **Stilstand** (veiligheid — niet tekenen tijdens rijden).
2. Tik op **e-CMR Handtekening**, of zeg *“CMR”* / *“Handtekening”*.
3. Vul de **naam van de ontvanger / ondertekenaar** in.
4. Zet de handtekening op het **canvas** met vinger of stylus.
5. Gebruik desgewenst **Wissen** om opnieuw te beginnen.
6. Bevestig/opslaan — de handtekening wordt als afbeelding gekoppeld aan de actieve rit.

### Belangrijk

- Alleen beschikbaar bij **stilstand**.  
- Bij een CMR-scan via camera kan de app direct doorverwijzen naar het handtekeningscherm.  
- Bewaar geen gevoelige gegevens buiten de app-procedures van uw bedrijf.

---

## 7. Digitale Handschoenvak

Centraal overzicht van voertuigdocumenten (NIWO, kenteken, verzekering, APK, ADR, schadeformulier) plus **eigen uploads**.

### Openen

- Cockpit (stilstand) → **Digitale Handschoenvak**, of Voice: *“Handschoenvak”*.  
- Of via vloot/voertuigenpagina’s (uploadpaneel).

### Documenten bekijken

1. Kies het **voertuig / kenteken**.  
2. Zoek desgewenst in het zoekveld.  
3. **Bekijken**, **PDF downloaden** (demo) of **Delen**.

### Document uploaden (met OCR-simulatie)

1. Sleep een **PDF / JPG / PNG** in het uploadvak, of tik om te kiezen.  
2. Wacht op **AI-scanning** (type + vervaldatum worden voorgesteld).  
3. Controleer documenttype, kenteken, vervaldatum en notities.  
4. Tik op **Opslaan in Digitale Handschoenvak**.  
5. Uploads blijven bewaard in de browser (**localStorage**) op dit apparaat.

---

## 8. Handleiding Planner / Dispatcher

### 8.1 Openen

1. Startscherm → **Planner / Dispatcher**, of navigatie-knop **Planner**.  
2. Homepagina: **Rit-Planner** (`/planner`).

### 8.2 Typische workflow

1. Stel **herkomst, bestemming, voertuig en lading** in (ADR, afmetingen, aslast waar van toepassing).  
2. Bekijk **aanbevolen tankstops** (prijs, omrijdtijd, ADR, doorrijhoogte, besparing).  
3. Gebruik maut/tol- en nettobesparing-secties waar zichtbaar voor uw rol.  
4. Start of deel navigatie naar een Autohof met de chauffeur.  
5. Controleer compliance / ruststops / ESPORG waar beschikbaar.

### 8.3 Wat de planner wél / niet ziet

- Menu is gefilterd: o.a. planner, vloot, chauffeur-cockpit (meekijken), stations, compliance, settings.  
- Geen volledige boekhoud- of garage-werkplaats (andere rollen).  
- Financiële of maut-blokken kunnen achter **rolegates** zitten — niet elke knop is voor elke rol zichtbaar.

### 8.4 Chauffeur ondersteunen

| Situatie | Actie |
|----------|--------|
| Chauffeur in file | Cockpit toont FILE/VERTRAGING + nieuwe ETA — stem af via berichten/telefoon |
| Pechmelding | Chauffeur activeert pechprotocol met GPS; planner volgt opvolging |
| Documenten | Vraag chauffeur stilstand → handschoenvak / e-CMR |
| Rol wisselen | Navigatie: **Chauffeur** om de cockpit te openen (demo/training) |

---

## 9. Taal & GPS / HTTPS

### Taal

1. Tik rechtsboven op **🌐** (taalkiezer).  
2. Kies bijv. **NL**, **DE**, **EN**, …  
3. Navigatie en veel schermen volgen deze taal; de chauffeur-cockpit volgt de globale taal waar mogelijk.

### HTTPS voor iPhone GPS

- Open de app bij voorkeur via **`https://…`** (niet `http://192.168…`).  
- Lokaal voor ontwikkelaars: `npm run dev:https` (certificaten in `certificates/`).  
- Bij HTTP op een LAN-IP toont de app een waarschuwing: iOS Safari beperkt precieze locatie.

### Locatie & privacy (AVG)

- GPS-tracking hoort bij **dienstmodus**.  
- Privé/offline-modus beperkt tracking (zie header/compliance waar beschikbaar).

---

## 10. Veelgestelde vragen

**De rolknoppen op het startscherm reageren niet**  
Vernieuw de pagina, gebruik Safari/Chrome, controleer of er geen overlay/devtools overheen ligt. Tik stevig midden op de tegel.

**Voice AI hoort niets**  
Microfoon toestaan → opnieuw 🎤. Op iPhone alleen in Safari / beginscherm-app. Test met korte woorden zoals *“Status”*.

**GPS blijft op demopositie**  
Locatie geweigerd of HTTP zonder HTTPS. Sta locatie toe en open via HTTPS.

**e-CMR of handschoenvak niet zichtbaar**  
Eerst **Stilstand** activeren. Tijdens rij-modus zijn deze tools verborgen.

**Uploads weg na wissen van browsergegevens**  
Documenten staan in localStorage van dit apparaat — wissen van sitegegevens wist uploads.

**Hoe wissel ik naar planner?**  
Navigatie → **Planner**, of **Wissel Rol** → startscherm → Planner / Dispatcher.

---

## Snelle checklist chauffeur (dagelijkse rit)

1. □ App openen / beginscherm-icoon  
2. □ Rol **Chauffeur**  
3. □ Locatie toestaan (HTTPS)  
4. □ Walkaround / voertuigcheck indien gevraagd  
5. □ Route & tankstop controleren  
6. □ Handsfree: Voice AI gebruiken tijdens rit  
7. □ Bij stilstand: e-CMR laten tekenen  
8. □ Documenten/tankbon uploaden in handschoenvak  
9. □ Bij pech: 🆘 of zeg *“Pech”*

---

## Snelle checklist planner

1. □ Rol **Planner / Dispatcher**  
2. □ Rit aanmaken / filters (ADR, hoogte, omrijdtijd)  
3. □ Tankstops & besparing controleren  
4. □ Instructie naar chauffeur (Autohof / ETA)  
5. □ Bij verstoring: FILE-status / pech opvolgen  
6. □ Compliance / ruststops meenemen in planning  

---

*FuelRoute / Fleet OS — interne gebruikershandleiding. Voor technische installatie (HTTPS-certificaten, `npm run dev:https`) zie `README.md` en `package.json`.*
