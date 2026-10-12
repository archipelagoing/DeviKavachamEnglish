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

## Repository layout

- `Devi_Kavacham_English_Only.txt`: source text for the website.
- `build.py`: generates both reader themes, `contents.html`, `about.html`, and `Devi-Kavacham.epub`. Run it after editing the source.
- `templates/`: editable sources for the Contents and About companions.
- `assets/`: shared reader code, styles, artwork, lotus icon, and local vendor libraries with their licenses. Artwork sources are in `assets/ARTWORK-LICENSES.md`.
- `Devi-Kavacham-editable.docx`: separately editable master for print/export editions.
- `export_editions.py`, `export_pdfs.mjs`, and `exports/`: DOCX export tools and generated editions.

Generated website files and downloadable editions are committed so GitHub Pages can serve this repository directly. Keep both HTML pages and the EPUB together when rebuilding.

See [EDITION.md](EDITION.md) for reader behavior and GitHub Pages setup, and [EDITING.md](EDITING.md) for the Word-to-PDF/EPUB workflow.

Source reference: [Stotra Nidhi — Devi Kavacham](https://stotranidhi.com/en/durga-saptasati-devi-kavacham-in-english/).
