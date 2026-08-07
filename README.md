# Filmwerkstatt Sonderwoche

Interaktive, rein statische Website (kein Backend, keine Datenbank) für KV-Lernende
zur Vorbereitung auf die Filmproduktion im Lager. Eigenständiges Projekt, das
stilistisch zum Schwesterprojekt [`Bildwerkstatt_Sonderwoche`](https://github.com/GBSLDamian/Bildwerkstatt_Sonderwoche)
passt, aber ein komplett separates Repo/Deployment ist.

Konzipiert für die Nutzung **im Zug** (Mobile-First, nach dem ersten Laden ohne
weitere Serveranfragen nutzbar, ausser für die eingebetteten YouTube-Beispielvideos
in Modul 4 – der Rest der Seite funktioniert auch ohne Internetverbindung).

## Inhalt

- **Modul 1 – Technikabnahme**: 7 Technik-Karten mit je einer konkreten
  **iPhone-** und **Android-Anleitung** (recherchiert anhand offizieller Apple-
  und Google-Support-Dokumentation) sowie einer kurzen Verständnisfrage mit
  Feedback – erst nach Beantworten gilt eine Karte als erledigt. Dazu ein echtes
  Foto-Beispiel zur Drittelregel.
- **Modul 2 – Bildsprache drauf haben**: 6 Einstellungsgrössen + 3 Perspektiven als
  selbst gezeichnete SVG-Illustrationen, ergänzt um zwei echte Fotobeispiele
  (Vogel-/Froschperspektive), plus vertiefte Kompositionsregeln (Führungslinien,
  Blickrichtungsraum, Symmetrie) und Kamerabewegung (Schwenk, Fahrt, Zoom vs.
  Fahrt, Handheld vs. stabilisiert), abgeschlossen mit einem 7-Fragen-Quick-Check.
- **Modul 3 – Die Zug-Challenge**: keine künstlichen Countdown-Timer mehr. Statt
  vier isolierter Drills planen Lernende in einem echten **Drehplan-Tool**
  (Shot-List-Builder) eine zusammenhängende Mini-Produktion („Die
  Zugfahrt-Doku"), filmen sie dann mit der eigenen Handykamera und reflektieren
  anschliessend.
- **Modul 4 – Filmformate kombinieren**: Zuordnungsspiel zu 5 Filmformaten
  (Imagefilm, Werbespot, Mini-Doku, Action-Sport, Testimonial) inkl. **fünf
  preisgekrönter/redaktioneller Beispielvideos** (u. a. ein Oscar- und ein
  Cannes-Lions-Grand-Prix-Gewinner) als Klick-zum-Laden-Vorschaubilder
  (Facade-Pattern, robust gegen Adblocker) mit direktem YouTube-Link als
  Fallback.
- **Spickzettel fürs Lager**: druckbare Ein-Seiten-Zusammenfassung aller Module,
  inkl. persönlichem Wunschformat.

Die Module werden sequenziell freigeschaltet, der Fortschritt wird ausschliesslich
lokal im Browser gespeichert (`localStorage`, Präfix `fws_`).

## Technik

Reines HTML5 / CSS3 / Vanilla JavaScript (ES6-Module), kein Framework, kein
Build-Step. Die Filmformat-Daten liegen in `data/formate.json` und werden per
`fetch()` geladen; die SVG-Illustrationen liegen als eigenständige Dateien in
`assets/svg/` und werden zur Laufzeit geladen und ins Dokument eingefügt (damit sie
das Farbschema per CSS-Variablen übernehmen, auch im Dark Mode). Die Video-Beispiele
in Modul 4 laden nie automatisch ein Iframe – ein Klick auf das Vorschaubild
injiziert erst dann den echten YouTube-Embed.

## Medien-Sourcing

- Die SVG-Illustrationen (Einstellungsgrössen, Perspektiven) sind vollständig
  selbst erstellt.
- Die 3 Fotos in `assets/img/` stammen aus lizenzgeprüften Quellen (Wikimedia
  Commons / Openverse) und sind entsprechend im Bild bzw. in der Bildunterschrift
  attribuiert (CC0 bzw. CC BY/CC BY-SA mit Namensnennung).
- Die 5 Video-Beispiele in Modul 4 sind offizielle YouTube-Embeds (kein
  Selbst-Hosting), alle vor der Verwendung auf `playableInEmbed` geprüft:
  Victorinox AG, Marcel (Cannes-Lions-Gewinner für Orange), New York Times
  Opinion/Op-Docs (Oscar-Gewinner "The Queen of Basketball"), Teton Gravity
  Research, Patagonia.

## Lokal starten

Da ES-Module und `fetch()` verwendet werden, muss die Seite über einen lokalen
Webserver aufgerufen werden (nicht per Doppelklick auf `index.html`):

```bash
npx serve .
```

Danach die angezeigte lokale Adresse (z. B. `http://localhost:3000`) im Browser
öffnen.

## Deployment: GitHub → Netlify (Continuous Deployment)

### 1. GitHub-Repo erstellen und verbinden

```bash
git init
git add .
git commit -m "Initial commit: Filmwerkstatt Sonderwoche"
git branch -M main
git remote add origin https://github.com/<dein-github-name>/Filmwerkstatt_Sonderwoche.git
git push -u origin main
```

Ersetze `<dein-github-name>` mit deinem GitHub-Benutzernamen bzw. -Organisation.
Das Repo `Filmwerkstatt_Sonderwoche` muss vorher leer auf GitHub angelegt worden
sein.

### 2. Mit Netlify verbinden

1. Auf [app.netlify.com](https://app.netlify.com) einloggen.
2. **„Add new site” → „Import an existing project”** wählen.
3. GitHub als Quelle wählen und das Repo `Filmwerkstatt_Sonderwoche` auswählen.
4. Build-Einstellungen werden automatisch aus `netlify.toml` übernommen
   (Publish-Verzeichnis: `.`, kein Build-Command nötig).
5. **„Deploy site”** klicken. Site-Name in den Einstellungen auf
   `filmwerkstatt-sonderwoche` setzen (Site settings → Change site name).

Ab sofort wird bei jedem Push auf den `main`-Branch automatisch ein neues
Deployment ausgelöst.

## Fortschritt zurücksetzen

In der Fusszeile jeder Seite gibt es einen Button „Gesamten Fortschritt
zurücksetzen” (mit Sicherheitsabfrage), der alle `fws_`-`localStorage`-Daten
dieser Seite löscht.
