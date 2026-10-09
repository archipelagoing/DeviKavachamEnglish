# Tufte reading edition

The site uses the original Tufte CSS stylesheet, with a small reader stylesheet. It is static HTML, CSS, and JavaScript; no Ruby, npm, database, or theme plugins are required. The source text is never edited by the builder.

## Updating the text

Edit `Devi_Kavacham_English_Only.txt`, then run `python3 build.py`. Commit the source and generated `index.html` and `Devi-Kavacham.epub` together. The builder requires 56 consecutive `Verse N` headings and puts seven verses into each of eight reading pages. The title and dedication have a separate opening page.

Run `python3 build.py --check` to verify that extracting the text from both HTML and EPUB reproduces the UTF-8 source exactly, including all whitespace, punctuation, and diacritics. Line wrapping changes with the viewport; source line breaks and spacing are preserved. No proofreading, translation, or transliteration correction is performed.

The EPUB has eight verse sections and an opening. Reflowable EPUB readers paginate according to screen and font size, so the EPUB is not limited to eight physical screens. On screens at least 900 pixels wide, the embedded viewer shows facing pages; scrolling over the book or using arrow keys advances a spread. On smaller screens, it uses the continuous EPUB manager with vertical document scrolling. Resizing across the breakpoint rebuilds the viewer at the current reading location.

The EPUB viewer opens automatically when served over HTTP. The Continuous text button switches to the complete HTML reading view, where all eight groups follow one another without next-button clicks. JavaScript failures leave the full text available. Verse labels and thin rules distinguish verses in both formats; their text, source whitespace, and ordering remain unchanged.

## Preview and GitHub Pages

Run `python3 -m http.server 8000` in the repo and visit `http://localhost:8000`. Opening the HTML as a file is sufficient for the regular reading pages, but the embedded EPUB reader needs HTTP.

In GitHub Settings → Pages, choose Deploy from a branch, the branch containing this edition, and `/ (root)`. All asset URLs are relative for project-site compatibility. No workflow is required. The site is not automatically published by the builder.

JavaScript adds a browser EPUB reader and section navigation. With JavaScript disabled, the complete HTML text remains available. Both modes have adjustable text size and a section selector. The HTML view includes a skip link, visible keyboard focus, and a print layout. Browser and assistive-technology testing is still needed before claiming accessibility conformance.

Vendor files are stored locally. Tufte CSS is licensed under MIT; EPUB.js under BSD-2-Clause; JSZip under MIT or GPLv3 (used here under MIT). Their license notices are alongside the files. We use Georgia and Times New Roman as system serif fonts rather than a remote font service.

To try the second theme later, keep the source, builder, and reader behavior; change the presentation stylesheet. No second theme is included yet.
