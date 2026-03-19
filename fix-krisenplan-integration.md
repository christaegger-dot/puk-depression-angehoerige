# Fix-Auftrag: Krisenplan-Seite integrieren

## Übersicht
Die Datei `krisenplan.html` (interaktiver Krisenplan für Angehörige) wird als eigenständige Seite ins Repo aufgenommen und aus mehreren Modulen verlinkt.

## Schritt 1: Datei anlegen
Kopiere die beiliegende Datei `krisenplan.html` ins Root-Verzeichnis des Repos.

## Schritt 2: Navigation ergänzen

### 2a: In `m6.html` (Hilfe finden) — neuen Ressourcen-Eintrag einfügen
Suche den Abschnitt `<h3 id="m6-2">` (Für Angehörige — Beratung und Unterstützung).
Füge **am Ende** dieses Abschnitts (nach dem letzten Ressourcen-Eintrag, vor `<h3 id="m6-3">`) einen neuen Eintrag ein:

```html
<div class="resource-item" style="--module-color:var(--m6);">
<span class="resource-icon" aria-hidden="true">📋</span>
<div class="resource-body">
<strong>Persönlicher Krisenplan (interaktiv)</strong>
<p>Frühwarnzeichen, Kontakte und Stufenplan vorbereiten — direkt ausfüllbar und druckbar.</p>
<p><a href="krisenplan.html" style="color:var(--m6);font-weight:600;">Krisenplan ausfüllen →</a></p>
</div>
</div>
```

Falls die Ressourcen-Einträge ein anderes HTML-Pattern verwenden (z.B. `<li>` mit Emoji + Text), passe das Format entsprechend an. Das Wichtige ist: Link zu `krisenplan.html` mit dem Text «Krisenplan ausfüllen →».

## Schritt 3: Verweise aus relevanten Modulen

### 3a: In `m1b.html` (Behandlung) — Verweis im Abschnitt «Ergänzende Ansätze»
Suche den Absatz über MBCT / Achtsamkeit (letzter Eintrag unter «Ergänzende Ansätze mit Evidenz»).
Füge **nach** dem schliessenden `</div>` dieses Card-Blocks folgenden Absatz ein:

```html
<p style="margin-top:1.5rem;font-size:.92rem;"><strong>Rückfallprävention konkret:</strong> Nutzen Sie unseren <a href="krisenplan.html" style="color:var(--m1);font-weight:600;">interaktiven Krisenplan</a>, um Frühwarnzeichen und Handlungsschritte für den Ernstfall festzuhalten.</p>
```

### 3b: In `m1.html` (Was ist Depression?) — Verweis im Abschnitt «Verlauf, Phasen und Behandlung»
Suche den Text «Rückfälle sind häufig» (im Abschnitt m1-3).
Füge am Ende dieses Absatzes hinzu:

```html
 Unser <a href="krisenplan.html">interaktiver Krisenplan</a> hilft Ihnen, sich auf einen möglichen Rückfall vorzubereiten.
```

### 3c: In `m5.html` (Selbstsorge) — Verweis im Abschnitt «Konkrete Strategien»
Suche den Bereich «Was Sie jetzt tun können» (action-box).
Füge einen zusätzlichen Listenpunkt ein:

```html
<li>Füllen Sie den <a href="krisenplan.html" style="color:var(--m5);">persönlichen Krisenplan</a> aus — damit Sie im Ernstfall vorbereitet sind.</li>
```

## Schritt 4: Startseite (index.html) — optionaler Quick-Link

In `index.html` gibt es den Bereich «Wo stehen Sie gerade?» mit mehreren Einstiegskarten. Füge nach der Karte «Ich suche konkrete Hilfe» eine weitere ein:

```html
<a href="krisenplan.html" class="entry-card">
<span class="entry-icon" aria-hidden="true">📋</span>
<span class="entry-title">Ich möchte mich auf einen Rückfall vorbereiten</span>
<span class="entry-desc">Erstellen Sie einen persönlichen Krisenplan mit Warnsignalen, Kontakten und Handlungsschritten.</span>
</a>
```

Falls die Einstiegskarten ein anderes HTML-Pattern verwenden, passe das Format an. Das Wichtige ist der Link.

## Schritt 5: 404.html — Krisenplan in Seitenübersicht aufnehmen

Falls `404.html` eine Liste aller Seiten enthält, ergänze:

```html
<li><a href="krisenplan.html">Persönlicher Krisenplan</a></li>
```

## Validierung
Nach allen Änderungen prüfen:
- [ ] `krisenplan.html` lädt korrekt im Browser
- [ ] Link aus `m6.html` funktioniert
- [ ] Link aus `m1b.html` funktioniert
- [ ] Link aus `m1.html` funktioniert
- [ ] Link aus `m5.html` funktioniert
- [ ] Link auf `index.html` funktioniert
- [ ] Druckfunktion im Krisenplan öffnet Print-Dialog
- [ ] Auf Mobile: Tabs scrollen korrekt
