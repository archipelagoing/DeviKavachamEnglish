# Reading editions

`index.html` is the Tufte version; `reader-view.html` is a Reader View adaptation inspired by [tabreturn's theme](https://github.com/tabreturn/tabreturn.jekyll.theme). Each header links to the other version at the current section. Both use the same generated text, EPUB file, and shared reader behavior. Running `python3 build.py` regenerates and verifies both pages.

Reader View offers light, dark, and sepia palettes, serif/sans-serif fonts, text size, reading width, and line spacing. Preferences are stored in the reader's browser when storage is available. These settings apply to both continuous text and the embedded EPUB. The implementation uses local CSS and native HTML controls, with no Jekyll conversion or extra libraries. The original TXT, editable DOCX, and exported PDFs/EPUBs are not modified by appearance changes.

The site uses the original Tufte CSS stylesheet, with a small reader stylesheet. It is static HTML, CSS, and JavaScript; no Ruby, npm, database, or theme plugins are required. The source text is never edited by the builder.

## Updating the text

Edit `Devi_Kavacham_English_Only.txt`, then run `python3 build.py`. Commit the source and generated `index.html` and `Devi-Kavacham.epub` together. The builder requires 56 consecutive `Verse N` headings and puts seven verses into each of eight reading pages. The title and dedication have a separate opening page.

Run `python3 build.py --check` to verify that extracting the text from both HTML and EPUB reproduces the UTF-8 source exactly, including all whitespace, punctuation, and diacritics. Line wrapping changes with the viewport; source line breaks and spacing are preserved. No proofreading, translation, or transliteration correction is performed.

The EPUB has eight verse sections and an opening. On screens at least 900 pixels wide, the website uses two independent EPUB page panels: page 1 (verses 1–7) faces page 2 (verses 8–14), followed by 3–4, 5–6, and 7–8. The opening appears alone. Each panel contains one complete seven-verse section rather than reflowing a single section across both columns. Scrolling or arrow keys advance the spread; when enlarged text overflows, that page can scroll before advancing. The book fills almost the entire available screen width and height. Reading-width settings still control the continuous HTML text.

On smaller screens, the viewer uses continuous EPUB scrolling. Resizing across the breakpoint keeps the selected section. Downloaded EPUBs remain reflowable, so external readers control their own screen pagination.

The EPUB viewer opens automatically when served over HTTP. The Continuous text button switches to the complete HTML reading view, where all eight groups follow one another without next-button clicks. JavaScript failures leave the full text available. Verse labels and thin rules distinguish verses in both formats; their text, source whitespace, and ordering remain unchanged.

## Preview and GitHub Pages

Run `python3 -m http.server 8000` in the repo and visit `http://localhost:8000`. Opening the HTML as a file is sufficient for the regular reading pages, but the embedded EPUB reader needs HTTP.

In GitHub Settings → Pages, choose Deploy from a branch, the branch containing this edition, and `/ (root)`. All asset URLs are relative for project-site compatibility. No workflow is required. The site is not automatically published by the builder.

JavaScript adds a browser EPUB reader and section navigation. With JavaScript disabled, the complete HTML text remains available. Both modes have adjustable text size and a section selector. The HTML view includes a skip link, visible keyboard focus, and a print layout. Browser and assistive-technology testing is still needed before claiming accessibility conformance.

Vendor files are stored locally. Tufte CSS is licensed under MIT; EPUB.js under BSD-2-Clause; JSZip under MIT or GPLv3 (used here under MIT). Their license notices are alongside the files. We use Georgia and Times New Roman as system serif fonts rather than a remote font service.

Reader View defaults to sepia and serif typography. Its reference palettes and font choices come from tabreturn's Firefox Reader View design; the controls and CSS are implemented locally for this book site. Credit is included in the Reader View footer.
