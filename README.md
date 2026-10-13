# DeviKavachamEnglish
An English reading edition of the Devi Kavacham, created in honor of Durga Puja. The supplied text is preserved exactly; this project does not claim a definitive translation.

[Read the published site](https://archipelagoing.github.io/DeviKavachamEnglish/).

## Preview and verify

Requires Python 3.12 or newer. No third-party Python or npm packages are required.

```sh
python3 -m http.server 8000
```

Visit http://localhost:8000. The book reader needs HTTP; opening an HTML file directly shows the continuous text.

```sh
python3 build.py --check
```

For Chrome browser regression checks (Node.js 22+ and installed Chrome):

```sh
node scripts/check_reader.mjs
node scripts/check_reader.mjs --contents
python3 -m unittest discover -s tests -v
```

The check starts a disposable local server and Chrome profile, tests phone,
landscape, and desktop layouts, and writes a mobile dark-mode screenshot to
`/private/tmp/devi-mobile-dark.png`. Set `DEVI_CHROME_PATH` if Chrome is installed
outside the default macOS location. Physical-device and Safari/Firefox checks
remain separate from Chrome emulation.

## Repository layout

- `Devi_Kavacham_English_Only.txt`: source text for the website.
- `build.py`: generates both reader themes, `contents.html`, `about.html`, `sitemap.xml`, and `Devi-Kavacham.epub`. Run it after editing the source.
- `templates/`: editable sources for the Contents and About companions.
- `content/navadurga.json`: reviewed stories, names, aliases, and Wikipedia links for the nine forms.
- `guide_content.py`: matches deity names to source verses and generates the illustrated cards without a network connection.
- `assets/`: shared reader code, styles, artwork, lotus icon, and local vendor libraries with their licenses. Artwork sources are in `assets/ARTWORK-LICENSES.md`.
- `Devi-Kavacham-editable.docx`: separately editable master for print/export editions.
- `export_editions.py`, `export_pdfs.mjs`, and `exports/`: DOCX export tools and generated editions.

Generated website files and downloadable editions are committed so GitHub Pages can serve this repository directly. Keep both HTML pages and the EPUB together when rebuilding.

See [EDITION.md](EDITION.md) for reader behavior and GitHub Pages setup, and [EDITING.md](EDITING.md) for the Word-to-PDF/EPUB workflow.

See [SEARCH.md](SEARCH.md) for Google Search Console verification and sitemap
submission using the existing free GitHub Pages address.

Source reference: [Stotra Nidhi — Devi Kavacham](https://stotranidhi.com/en/durga-saptasati-devi-kavacham-in-english/).
