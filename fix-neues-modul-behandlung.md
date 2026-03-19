# Fix-Auftrag: Neues Modul m1b.html + Navigation-Update aller Dateien

## Übersicht
Neues Modul «Behandlung» (`m1b.html`) zwischen M1 (Depression) und M2 (Kommunikation) einfügen.
Die Website wächst von 6 auf 7 Module. Die Dateinamen m1–m6 bleiben bestehen.

## Schritt 1: Neue Datei anlegen
Kopiere die beiliegende Datei `m1b.html` ins Root-Verzeichnis des Repos.

## Schritt 2: Navigation in ALLEN bestehenden HTML-Dateien aktualisieren

In jeder Datei (`index.html`, `m1.html`, `m2.html`, `m3.html`, `m4.html`, `m5.html`, `m6.html`) muss die Navigation um den neuen Link ergänzt werden.

### 2a: Desktop-Navigation (`nav-links`)
In jeder Datei gibt es eine `<ul class="nav-links">`. Füge nach dem Depression-Link einen neuen Eintrag ein:

```html
<li><a href="m1b.html">Behandlung</a></li>
```

Dieser Link kommt NACH `m1.html` (Depression) und VOR `m2.html` (Kommunikation).

In `m1b.html` selbst steht dort stattdessen:
```html
<li><a href="#" aria-current="page" title="Behandlung">Behandlung</a></li>
```

### 2b: Mobile-Navigation (`mobile-menu`)
In jeder Datei gibt es ein `<div class="mobile-menu">` mit einer `<ul>`. Füge nach dem Depression-Link ein:

```html
<li><a href="m1b.html">Behandlung</a></li>
```

### 2c: Modulzählung (module-progress)
Die `module-progress` Leiste zeigt Punkte für jedes Modul. Aktuell 6 Punkte → jetzt 7 Punkte.

**Jede Datei** braucht einen zusätzlichen Punkt+Linie. Ausserdem muss die Modulnummer angepasst werden:

| Datei       | Neuer Label-Text     | Active-Dot Position |
|-------------|----------------------|---------------------|
| index.html  | (kein Progress-Bar)  | —                   |
| m1.html     | Modul 1 / 7          | Punkt 1 (active)    |
| m1b.html    | Modul 2 / 7          | Punkt 2 (active)    |
| m2.html     | Modul 3 / 7          | Punkt 3 (active)    |
| m3.html     | Modul 4 / 7          | Punkt 4 (active)    |
| m4.html     | Modul 5 / 7          | Punkt 5 (active)    |
| m5.html     | Modul 6 / 7          | Punkt 6 (active)    |
| m6.html     | Modul 7 / 7          | Punkt 7 (active)    |

Neues Progress-Bar HTML-Template (7 Punkte):
```html
<div class="module-progress" aria-label="Fortschritt: Modul X von 7">
<span class="module-progress-dot done" aria-hidden="true"></span><span class="module-progress-line" aria-hidden="true"></span><span class="module-progress-dot done" aria-hidden="true"></span><span class="module-progress-line" aria-hidden="true"></span><span class="module-progress-dot " aria-hidden="true"></span><span class="module-progress-line" aria-hidden="true"></span><span class="module-progress-dot " aria-hidden="true"></span><span class="module-progress-line" aria-hidden="true"></span><span class="module-progress-dot " aria-hidden="true"></span><span class="module-progress-line" aria-hidden="true"></span><span class="module-progress-dot " aria-hidden="true"></span><span class="module-progress-line" aria-hidden="true"></span><span class="module-progress-dot " aria-hidden="true"></span>
<span class="module-progress-label">Modul X / 7</span>
</div>
```
Wobei alle Dots VOR dem aktuellen Modul `class="module-progress-dot done"` haben und der aktuelle `class="module-progress-dot active"` hat.

## Schritt 3: index.html — Modulkarten aktualisieren

In `index.html` gibt es einen Bereich «Die 6 Module». Ändere die Überschrift zu «Die 7 Module» und füge nach Modul 1 eine neue Karte ein:

```html
<a href="m1b.html" class="module-card">
<span class="module-card-number">Modul 2</span>
<span class="module-card-title">Wie wird Depression behandelt?</span>
<span class="module-card-desc">Psychotherapie, Medikamente, Bewegung — wann hilft was? Abgestuft nach Schweregrad.</span>
<span class="module-card-link">Zum Modul →</span>
</a>
```

Die Nummern der nachfolgenden Karten (bisher 2–6) müssen auf 3–7 aktualisiert werden.

## Schritt 4: Eyebrow-Texte in bestehenden Modulen anpassen

Die `<span class="eyebrow">` Zeile in jedem Modul zeigt die Modulnummer:

| Datei    | Alt                                          | Neu                                           |
|----------|----------------------------------------------|-----------------------------------------------|
| m1.html  | Modul 1 · Krankheitsverständnis              | Modul 1 · Krankheitsverständnis               |
| m1b.html | Modul 2 · Behandlungswege                    | (schon korrekt)                               |
| m2.html  | Modul 2 · Kommunikation &amp; Gespräch       | Modul 3 · Kommunikation &amp; Gespräch        |
| m3.html  | Modul 3 · Beziehung &amp; Loyalität          | Modul 4 · Beziehung &amp; Loyalität           |
| m4.html  | Modul 4 · Komorbiditäten                     | Modul 5 · Komorbiditäten                      |
| m5.html  | Modul 5 · Selbstsorge &amp; Schutz           | Modul 6 · Selbstsorge &amp; Schutz            |
| m6.html  | Modul 6 · Ressourcen &amp; Handeln           | Modul 7 · Ressourcen &amp; Handeln            |

## Schritt 5: Verweise auf m1b in m1.html einfügen

In `m1.html` den «Weiter»-Link am Ende anpassen:

```
Alt:  Weiter zu <a href="m2.html">Modul 2: Kommunikation & Gespräch →</a>
Neu:  Weiter zu <a href="m1b.html">Modul 2: Behandlungswege →</a>
```

Und den page-nav-Button:
```
Alt:  <a href="m2.html" class="page-nav-btn primary" ...>Kommunikation →</a>
Neu:  <a href="m1b.html" class="page-nav-btn primary" ...>Behandlung →</a>
```

## Schritt 6: Rückverweis in m2.html anpassen

In `m2.html` den «Zurück»-Link anpassen:

```
Alt:  <a href="m1.html" class="page-nav-btn" ...>← Was ist Depression?</a>
Neu:  <a href="m1b.html" class="page-nav-btn" ...>← Behandlung</a>
```

## Validierung
Nach allen Änderungen prüfen:
- [ ] `m1b.html` existiert und lädt korrekt
- [ ] Navigation in allen 8 HTML-Dateien zeigt 7 Module (inkl. «Behandlung»)
- [ ] Modulnummern in Eyebrows sind konsistent (1–7)
- [ ] Progress-Bar zeigt überall 7 Punkte
- [ ] Vorwärts-/Rückwärts-Navigation: m1 → m1b → m2 → m3 → m4 → m5 → m6
- [ ] index.html zeigt 7 Modulkarten mit korrekten Nummern
- [ ] Kein toter Link auf m1b.html
