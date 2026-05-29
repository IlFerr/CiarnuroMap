# Il Ciarnuro Galactic Map

Mappa galattica 3D interattiva per il gioco di ruolo **"Il Ciarnuro"** ideato da Matteo Lupo Pasini.
Il progetto mira a creare un'esperienza immersiva che permetta di esplorare costellazioni, sistemi stellari e pianeti in un ambiente tridimensionale navigabile.

## Descrizione

Il progetto consiste in una **web app 3D** sviluppata con [Three.js](https://threejs.org/), pensata per essere **eseguibile completamente offline** senza alcuna dipendenza esterna o installazione.

Include:

- Navigazione 3D tra costellazioni e sistemi stellari
- Visualizzazione di informazioni sui pianeti
- Struttura modulare dei dati in file JSON
- Possibilità di estensione con layer narrativi, confini imperiali e biomi

## Come avviare il progetto

Essendo una web app statica, è sufficiente aprire `index.html` con un browser moderno.

> Alcuni browser bloccano le richieste fetch su file locali (`file://`). Se la mappa non si carica, avvia un server locale minimale, ad esempio:
>
> ```
> python -m http.server 8000
> ```
>
> e apri `http://localhost:8000` nel browser.

## Tecnologie utilizzate

- **Three.js** (incluso localmente in `assets/libs/`)
- HTML, CSS, JavaScript (ES Modules nativi)
- Dati in file JSON locali

_Questo progetto è rilasciato per fini didattici e non commerciali._
_© 2025 — Team Ciarnuro Map & Matteo Lupo Pasini._
