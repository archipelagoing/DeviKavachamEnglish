# Edit once, export both editions

Open `Devi-Kavacham-editable.docx` in Word or LibreOffice. Select text and apply bold, italics, underline, font colors, or highlights, then save the DOCX. Keep the `Verse 1` through `Verse 56` headings intact and in order. The editable document starts with exactly the supplied text, including its blank lines and diacritics.

Run from the repository:

```sh
python3 export_editions.py
```

This generates four files in `exports/`:

| File | Layout |
| --- | --- |
| `Devi-Kavacham-8-pages-7-verses.pdf` | Exactly eight A4 pages, seven verses per page |
| `Devi-Kavacham-7-pages-8-verses.pdf` | Exactly seven A4 pages, eight verses per page |
| `Devi-Kavacham-8-pages-7-verses.epub` | Eight sections, seven verses per section |
| `Devi-Kavacham-7-pages-8-verses.epub` | Seven sections, eight verses per section |

The title and dedication appear before the verses on the first page/section of each edition. They do not add a separate page. EPUBs reflow with screen and font size, so their section counts do not guarantee eight or seven physical screens. A reader's own appearance settings can override colors.

The exporter carries direct run formatting from the DOCX into both formats. It preserves the text and paragraph breaks of the edited master, and verifies both EPUBs against it. If you deliberately edit the wording, the exports follow those edits; the original TXT is never overwritten. The `exports/edited-text.txt` snapshot lets you compare the master with the original. Tracked changes, comments, tables, images, and arbitrary Word layout settings are not an export workflow; keep the master as ordinary paragraphs and accept tracked changes before exporting.

PDF export requires installed Chrome and Node.js 22 or newer; no npm or Python packages are needed. On an unusual installation, set `DEVI_CHROME_PATH` to Chrome's executable. The exporter fits the text to A4 pages without clipping, records the chosen font sizes, and checks the PDF page counts. It refuses layouts that require text smaller than 10 pt; additional text may require adjusting the paper/layout rather than shrinking indefinitely. Generated PDFs contain selectable text and tags, but assistive-technology testing is still needed before claiming accessibility conformance.

For EPUBs and print HTML without Chrome:

```sh
python3 export_editions.py --no-pdf
```

The DOCX is created only when absent. Re-running exports never overwrites your edited master. `build.py` remains the separate website builder based on the original TXT; these edited editions are independent of the site's source until you choose to integrate them.
