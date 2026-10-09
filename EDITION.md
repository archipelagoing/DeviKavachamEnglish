# Reading editions

`index.html` is the Tufte version; `reader-view.html` is a Reader View adaptation inspired by [tabreturn's theme](https://github.com/tabreturn/tabreturn.jekyll.theme). Each header links to the other version at the current section. Both use the same generated text, EPUB file, and shared reader behavior. Running `python3 build.py` regenerates and verifies both pages.

Reader View offers light, dark, and sepia palettes, serif/sans-serif fonts, text size, reading width, and line spacing. Preferences are stored in the reader's browser when storage is available. These settings apply to both continuous text and the embedded EPUB. The implementation uses local CSS and native HTML controls, with no Jekyll conversion or extra libraries. The original TXT, editable DOCX, and exported PDFs/EPUBs are not modified by appearance changes.

The site uses the original Tufte CSS stylesheet, with a small reader stylesheet. It is static HTML, CSS, and JavaScript; no Ruby, npm, database, or theme plugins are required. The source text is never edited by the builder.

## Updating the text

Edit `Devi_Kavacham_English_Only.txt`, then run `python3 build.py`. Commit the source and generated `index.html` and `Devi-Kavacham.epub` together. The builder requires 56 consecutive `Verse N` headings and puts seven verses into each of eight reading pages. The title and dedication have a separate opening page.

Run `python3 build.py --check` to verify that extracting the text from both HTML and EPUB reproduces the UTF-8 source exactly, including all whitespace, punctuation, and diacritics. Line wrapping changes with the viewport; source line breaks and spacing are preserved. No proofreading, translation, or transliteration correction is performed.

The EPUB has eight verse sections and an opening. The website fits each complete seven-verse section within the available screen height. Screens at least 900 pixels wide, including typical 13-inch laptop viewports, show page 1 facing page 2, followed by 3–4, 5–6, and 7–8. The opening appears alone. Screens narrower than 900 pixels use one fitted page. Desktop spreads remain paired while text size adjusts to fit. Font size is measured against the actual rendered text, so all verses remain visible without scrolling within a page. Scroll gestures, arrow keys, and the navigation buttons turn pages.

The header shows the title, page selection, reading controls, download links, and theme switching on desktop. On mobile, links collapse into a More menu. A subtle warm gradient distinguishes the header, and a tinted button identifies Continuous text. Matching arrow buttons (‹ and ›) appear above and below the book and share disabled states at the beginning and end. Their accessible names and tooltips identify the previous/next page or spread. A brief 180 ms hinge animation runs after a page loads; navigation does not wait for the animation. Reduced-motion preferences disable it. A red cover rim and dark center spine frame the paper pages, with subtle stacked page edges and gutter shadows. The viewer uses paper-colored pages, traditional serif typography, generous outer margins, running page labels, and a subtle center fold. Appearance and font changes refit the content. Continuous text remains available for readers who prefer larger text or scrolling, including on mobile. Reading-width settings control that HTML view. Downloaded EPUBs remain reflowable, so external readers control their own screen pagination.

The EPUB viewer opens automatically when served over HTTP. The Continuous text button switches to the complete HTML reading view, where all eight groups follow one another without next-button clicks. JavaScript failures leave the full text available. Verse text alternates between dark ink and brown by verse number, with lighter warm ink in dark mode. Muted red markers such as `(v20)` introduce each verse, with a small gap between verses and no divider lines. Original `Verse N` headings, their following newlines, trailing `(N)` numbers, and separator whitespace remain in hidden source spans, so the source can still be reconstructed exactly. The supplied TXT, DOCX, and separate exported editions are unchanged.

## Preview and GitHub Pages

Run `python3 -m http.server 8000` in the repo and visit `http://localhost:8000`. Opening the HTML as a file is sufficient for the regular reading pages, but the embedded EPUB reader needs HTTP.

In GitHub Settings → Pages, choose Deploy from a branch, the branch containing this edition, and `/ (root)`. All asset URLs are relative for project-site compatibility. No workflow is required. The site is not automatically published by the builder.

JavaScript adds a browser EPUB reader and section navigation. With JavaScript disabled, the complete HTML text remains available. Both modes have adjustable text size and a section selector. The HTML view includes a skip link, visible keyboard focus, and a print layout. Browser and assistive-technology testing is still needed before claiming accessibility conformance.

Vendor files are stored locally. Tufte CSS is licensed under MIT; EPUB.js under BSD-2-Clause; JSZip under MIT or GPLv3 (used here under MIT). Their license notices are alongside the files. We use Georgia and Times New Roman as system serif fonts rather than a remote font service.

Reader View defaults to sepia and serif typography. Its reference palettes and font choices come from tabreturn's Firefox Reader View design; the controls and CSS are implemented locally for this book site. Credit is included in the Reader View footer.

Desktop toolbar controls use 32-pixel minimum heights and compact arrow rows. Touch pointers retain 44-pixel targets. Reduced spacing affects only the controls, not the text.
