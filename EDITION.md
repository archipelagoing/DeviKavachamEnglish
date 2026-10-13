# Reading editions

`index.html` is the Tufte version; `reader-view.html` is a Reader View adaptation inspired by [tabreturn's theme](https://github.com/tabreturn/tabreturn.jekyll.theme). Each header links to the other version at the current section. Both use the same generated text, EPUB file, and shared reader behavior. Running `python3 build.py` regenerates and verifies both pages.

Reader View offers light, dark, and sepia palettes, serif/sans-serif fonts, text size, reading width, and line spacing. Preferences are stored in the reader's browser when storage is available. These settings apply to both continuous text and the embedded EPUB. The implementation uses local CSS and native HTML controls, with no Jekyll conversion or extra libraries. The original TXT, editable DOCX, and exported PDFs/EPUBs are not modified by appearance changes.

Both reading themes now expose Appearance controls and share the saved palette,
font, size, width, and spacing preferences. Contents and About also expose a
page-color selector. The shared palette includes the EPUB document background,
verse colors, controls, and page-turn faces; fitted EPUB pages use an explicit
paper background rather than a transparent body over a white iframe surface.

Phone controls and tabs have 44-pixel minimum heights, menus remain within the
viewport, and the reader responds to visual-viewport height changes. When fitting
a seven-verse page on a narrow screen would require text below 12 pixels, the
reader switches to continuous text, explains the change, and keeps the selected
verse or page position. Continuous text supports larger sizes and ordinary page
scrolling. This behavior also applies on short landscape screens.

On 2026-10-13, Chrome emulation checks passed at 320×568, 390×844, 844×390,
900×700, and 1280×800 for all four public pages. Checks covered all three palettes,
EPUB backgrounds/verse colors, layout overflow, settings bounds, and Escape focus.
Additional checks passed for saved dark mode after reload, continuous text,
animated turns, guide verse links, and theme switching. These checks do not
establish Safari/Firefox, physical-device, or screen-reader conformance.

The site uses the original Tufte CSS stylesheet, with a small reader stylesheet. It is static HTML, CSS, and JavaScript; no Ruby, npm, database, or theme plugins are required. The source text is never edited by the builder.

## Updating the text

Edit `Devi_Kavacham_English_Only.txt`, then run `python3 build.py`. Commit the source and generated `index.html`, `reader-view.html`, and `Devi-Kavacham.epub` together. The builder requires 56 consecutive `Verse N` headings and puts seven verses into each of eight reading pages. The title and dedication have a separate opening page.

Run `python3 build.py --check` to verify that extracting the text from both HTML and EPUB reproduces the UTF-8 source exactly, including all whitespace, punctuation, and diacritics. Line wrapping changes with the viewport; source line breaks and spacing are preserved. No proofreading, translation, or transliteration correction is performed.

The EPUB has eight verse sections and an opening. The website fits each complete seven-verse section within the available screen height. Screens at least 900 pixels wide, including typical 13-inch laptop viewports, show page 1 facing page 2, followed by 3–4, 5–6, and 7–8. The opening appears alone. Screens narrower than 900 pixels use one fitted page. Desktop spreads remain paired while text size adjusts to fit. Font size is measured against the actual rendered text, so all verses remain visible without scrolling within a page. Scroll gestures, arrow keys, and the navigation buttons turn pages.

The header keeps the title, verse selector, appearance controls, a paired text-size control, and page navigation visible. Downloads, original text, theme switching, and Continuous text live in a More menu on all screen sizes. A small position label beside the arrows identifies the current page or spread. The toolbar uses light warm tones and soft borders; narrow screens wrap the controls. Menus close on outside clicks or Escape, which returns keyboard focus to their summary. Arrow names and tooltips identify the previous/next page or spread. A two-sided paper sheet turns around the center fold, carrying the outgoing text on its front and the next facing page on its back. The current spread stays visible while the next spread loads and fits. Single pages and the opening turn around the outer binding edge. Navigation waits for the turn to finish, preventing overlapping turns. Reduced-motion preferences disable it. A red cover sits beneath the paper spread, with layered paper edges and a cover lip visible along the outside and bottom. Facing pages meet at a shaded paper fold; no red binding strip separates them. The viewer uses paper-colored pages, traditional serif typography, generous outer margins, running page labels, and a subtle center fold. Appearance and font changes refit the content. Continuous text remains available for readers who prefer larger text or scrolling, including on mobile. Reading-width settings control that HTML view. Downloaded EPUBs remain reflowable, so external readers control their own screen pagination.

The EPUB viewer opens automatically when served over HTTP. The Continuous text button switches to the complete HTML reading view, where all eight groups follow one another without next-button clicks. JavaScript failures leave the full text available. Verse text alternates between black and forest green by verse number, with light green in dark mode. The colors are navigation aids, not differences in meaning. Small muted red markers such as `(v20)` introduce each verse, with a small gap between verses and no divider lines. Original `Verse N` headings, their following newlines, trailing `(N)` numbers, and separator whitespace remain in hidden source spans, so the source can still be reconstructed exactly. The supplied TXT, DOCX, and separate exported editions are unchanged.

## Preview and GitHub Pages

Run `python3 -m http.server 8000` in the repo and visit `http://localhost:8000`. Opening the HTML as a file is sufficient for the regular reading pages, but the embedded EPUB reader needs HTTP.

In GitHub Settings → Pages, choose Deploy from a branch, the branch containing this edition, and `/ (root)`. All asset URLs are relative for project-site compatibility. No workflow is required. The site is not automatically published by the builder.

JavaScript adds a browser EPUB reader and section navigation. With JavaScript disabled, the complete HTML text remains available. Both modes have adjustable text size and a section selector. The HTML view includes a skip link, visible keyboard focus, and a print layout. Browser and assistive-technology testing is still needed before claiming accessibility conformance.

Vendor files are stored locally. Tufte CSS is licensed under MIT; EPUB.js under BSD-2-Clause; JSZip under MIT or GPLv3 (used here under MIT). Their license notices are alongside the files. We use Georgia and Times New Roman as system serif fonts rather than a remote font service.

Reader View defaults to sepia and serif typography. Its reference palettes and font choices come from tabreturn's Firefox Reader View design; the controls and CSS are implemented locally for this book site. Credit is included in the Reader View footer.

Desktop toolbar controls use 36-pixel minimum heights. Touch pointers retain 44-pixel targets. Reduced spacing affects only the controls, not the text.

The header logo and favicon use `assets/lotus.svg`, a CC0 Pinhead lotus icon tinted muted red. Source and license details are in `assets/LOTUS-LICENSE.md`. Replace that one SVG to change both uses.

## Reading companions

Read, Contents, and About tabs appear across the site. Contents groups this edition’s 56 verses by theme; each item opens its first verse in the selected reader theme. The selected verse is outlined without scrolling the fitted EPUB page. About explains the protective invocation, its devotional context, and how to read this edition. These editorial explanations remain separate from the preserved hymn.

`templates/contents.html` and `templates/about.html` contain the companion content. `build.py` generates their full pages, including the shared navigation. The Read link remembers the previous reader theme and page for the current browser session; guides follow saved Reader View appearance preferences when available. The guides and their links also work without JavaScript.

Public-domain Durga imagery from The Met and the Smithsonian is hosted locally, with captions and links to collection records and rights statements. See `assets/ARTWORK-LICENSES.md`.

In book mode the selector describes the whole visible spread (for example, Pages 5–6), or an individual page on small screens. Continuous text uses verse ranges. The position label remains available to assistive technology. The burgundy cover edge and center-fold shading are softened to give the text more visual space.
