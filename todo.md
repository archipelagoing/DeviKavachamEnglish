# Devi Kavacham English TODO

Last updated: 2026-10-13. The repository contains two static reading themes,
an embedded EPUB reader, Contents and About guides, and separate print/export
editions. `python3 build.py --check` passed on 2026-10-13: both HTML themes and
the website EPUB preserve the complete source text, with seven verses per EPUB
reading section. Current user priorities are explanatory tabs with relevant
pictures, reliable dark mode, a usable mobile experience, and Google search
discoverability using the existing GitHub Pages address without buying a domain. Dark mode
was broken: the main reader ignored saved colors, and the EPUB
rendered light text over a white surface. Both issues are fixed locally. Chrome
emulation checks pass across phone, landscape, and desktop layouts; physical
devices, Safari/Firefox, and assistive technology remain unverified. Search
metadata and a sitemap are ready. Contents now has eleven expandable explanations
and nine illustrated Navadurga stories with Wikipedia and source-linked verse links. Publication and Search Console ownership
verification/indexing remain outstanding; DOCX exports were not rerun.

## Maintenance instructions

- Read the current user request and relevant project materials before updating
  this file. User instructions and applicable repository rules take precedence.
- Keep the format simple. Use `[ ]` for unfinished work and `[x]` for work that
  meets the stated task conditions. No task IDs or status tables are required.
- Write concrete tasks with observable outcomes. Split implementation and
  verification when they can be completed independently.
- Add short qualifiers when useful: `(in progress)`, `(needs verification)`,
  `(blocked: reason; unblock action)`, or `(deferred: reason)`.
- Record evidence in the progress paragraph beneath the relevant checklist:
  what was checked, when, and the result. Link to files or artifacts where useful.
  Label historical reports and user confirmations as such. Never invent results.
- Keep verification specific to its scope. A local test does not prove a live
  integration works; one device or environment does not prove another works.
- Keep each checkbox in one main section. The next-steps list is a short ordered
  summary referencing those sections, so it cannot develop conflicting statuses.
- After meaningful work, update affected checkboxes, section notes, next steps,
  and the date. If verification remains, leave that task unchecked and say why.
  Reopen tasks when evidence contradicts completion.
- Preserve unrelated tasks and user edits. Record reasons for deferral or
  cancellation; do not silently remove real work. Add newly discovered necessary
  tasks without treating them as authorization to expand the current request.
- Use checks appropriate to the project, including tests, artifact review,
  calculations, or manual walkthroughs. Do not require software tools for
  projects that do not use them. Never store credentials or secrets here.
- Keep notes concise and current. Ordinary discussion need not change the file.

## Next steps

1. Publish the verified reader fixes and search preparation through the existing GitHub Pages setup — sections 6 and 8.
2. Supply the Google Search Console verification token, publish the verification tag, and submit the sitemap/request indexing — section 8 and SEARCH.md.
3. Check the updated site on a physical phone and in Safari/Firefox — section 4.
4. Complete screen-reader and full keyboard walkthroughs — section 4.
5. Build explanatory tabs and beginner/resource guidance — sections 7 and 9.

The two current priorities are implemented and checked locally. Publishing and
Google account actions remain separate steps; local verification is not evidence
of the updated live site or Google indexing.

## 1. Define the project

- [x] Document an English reading edition of the Devi Kavacham in honor of Durga Puja.
- [x] Establish exact preservation of the supplied text as a build requirement.
- [x] Document a static website with local assets and no required npm, Ruby, or database setup.
- [x] Keep editorial guides separate from the hymn and document that this is not a definitive translation.
- [x] Document the independent TXT-based website and DOCX-based export workflows.

Progress: Scope and constraints are recorded in [README.md](README.md),
[EDITION.md](EDITION.md), and [EDITING.md](EDITING.md). Source preservation has
an executable check; usability and accessibility still need manual evidence.

## 2. Set up the foundation

- [x] Organize the original TXT, editable DOCX, templates, shared assets, and generated editions.
- [x] Document local HTTP preview and website build/check commands.
- [x] Include local vendor libraries with license notices and artwork attribution.
- [x] Provide the source-preservation check without third-party Python packages.

Progress: Files and instructions were inspected on 2026-10-13. The Python check
runs successfully in this workspace. Chrome and Node.js requirements for PDF
generation are documented but were not exercised during this review.

## 3. Reading site and downloadable editions

- [x] Implement Tufte and Reader View pages using the same source text and EPUB.
- [x] Implement desktop facing pages, mobile single pages, and two-sided page-turn animation.
- [x] Implement continuous text, section selection, page controls, and keyboard/scroll navigation.
- [x] Implement saved Reader View palettes, fonts, size, width, and line spacing.
- [x] Add Contents and About companions with shared navigation, verse links, and Durga imagery.
- [x] Add alternating verse colors and small verse markers while retaining reconstructable source text.
- [x] Verify the committed HTML themes and website EPUB reproduce the original TXT exactly.
- [x] Provide an editable DOCX master, export scripts, and committed seven- and eight-page editions.
- [ ] Run the DOCX exporter in temporary output and verify text and supported formatting survive in both exported EPUBs.
- [ ] Generate PDFs and verify seven/eight A4 pages, readable text, and no clipping; visually inspect the artifacts.
- [ ] Open the website EPUB and DOCX-derived EPUBs in an external reader and check navigation and reflow.

Progress: Implementation is present in [build.py](build.py), [assets/reader.js](assets/reader.js),
the shared styles, and [templates/](templates/). The initial guide/artwork work landed in `f633aea` (2026-10-12). Reader fixes,
search preparation, and illustrated expandable guides are now recorded in
`c63e954` (2026-10-13), with final guide copy/layout refinements still pending.
The source-preservation check passed on 2026-10-13. Export artifacts exist in
[exports/](exports/); their presence does not establish current export or visual
verification. Completed implementation tasks above do not imply browser testing.

## 4. Usability, presentation, and accessibility

- [x] Reproduce the user's suspected dark-mode failure; record the affected page, reading mode, browser, and steps before diagnosing it.
- [x] Fix confirmed dark-mode issues across page backgrounds, text, controls, guides, embedded EPUB pages, and animated page-turn faces.
- [x] Verify selecting dark mode, reloading, switching reading modes, and visiting guides preserve a readable dark palette; check switching back to light and sepia.
- [x] Give EPUB text panels an explicit palette background and restore a visible center crease in dark mode; visually review desktop spreads in both themes.
- [x] Version generated CSS/JavaScript URLs by file content so changed assets use fresh browser cache entries after publication/reload.
- [ ] Review both themes in current desktop browsers; confirm opening, spread pairing, page turns, text fitting, and first/last-page controls.
- [ ] Review a narrow mobile viewport and a touch device; confirm single pages, readable verses, and appearance menus stay within the viewport. (Chrome touch emulation passed; physical touch device still needs verification.)
- [x] Fix mobile issues found in the walkthrough; ensure header tabs, controls, images, and menus fit without unintended horizontal scrolling and remain usable by touch.
- [ ] Check resizing across the 900px spread breakpoint, orientation changes, and larger text settings for clipping or lost position.
- [ ] Follow each Contents link; confirm the correct verse opens and is highlighted in both reading modes.
- [ ] Verify theme switching, guide navigation, and returning to Read preserve the expected section and preferences.
- [ ] Complete a keyboard-only walkthrough: skip link, controls, menus, Escape/outside-click behavior, and visible focus.
- [ ] Check screen-reader labels, page-position announcements, hidden content, and focus during navigation and mode changes.
- [ ] Check contrast and readability in light, dark, and sepia palettes, including alternating verse colors and verse markers.
- [ ] Verify reduced-motion behavior and continuous-text printing.

Initial review: Responsive controls, accessibility attributes, and reduced-motion
handling were present but not manually verified. Accessibility conformance
remains unclaimed; the current browser evidence follows.
Update, 2026-10-13: Reproduced both dark-mode problems in Chrome: main-theme
preferences were ignored and the fitted EPUB had a white reading surface.
Shared palettes/controls and explicit iframe backgrounds now fix both. Browser
checks cover all four pages at 320×568, 390×844, 844×390, 900×700, and 1280×800,
all palettes, fitting/fallback, settings bounds, Escape focus, reload, continuous
text, animated turns, guide links, and theme switching. The mobile dark-mode
screenshot was visually reviewed. See `scripts/check_reader.mjs`. Physical-device,
Safari/Firefox, contrast audit, and screen-reader checks remain open.
Follow-up, 2026-10-13: The user showed pale text on white panels and a barely
visible fold. A fresh Chrome load of the current live pages had dark HTML/body
surfaces, while the fold's low-opacity brown shading was still too faint. The
screenshot's white-panel state was not reproduced on that fresh load; its exact
browser/cache state is unverified. Explicit text-panel backgrounds, a stronger
palette-aware fold, and content-versioned assets now pass local desktop-spread
checks (`--spread`) and the full reader suite. The 1440×900 dark spread was
visually reviewed. These follow-up changes remain unpublished by this agent.

## 5. Build and reader resilience

- [ ] Regenerate website artifacts in a temporary copy and confirm all four HTML pages and EPUB are produced and pass the source check.
- [ ] Check missing/out-of-order verse headings fail clearly without silently producing an invalid edition.
- [ ] Verify complete HTML text remains usable with JavaScript disabled and when opening the site as local files.
- [ ] Simulate EPUB/library loading failure and confirm a usable continuous-text fallback with an understandable state.
- [ ] Verify reading works with unavailable browser storage and malformed saved preferences.
- [ ] Check rapid navigation and resize/appearance changes during a page turn for overlapping turns, blank pages, or stale position.
- [ ] Resolve findings from sections 4–5 and recheck each affected behavior before closing its verification task.

Progress: Source checks validate text, EPUB structure, metadata, and sitemap.
The Chrome checks now cover the reader interactions and expanded guides described
in sections 4 and 7. Dark-mode failures were reproduced and fixed. General
failure/storage scenarios listed above remain separate, unfinished checks.

## 6. Delivery and documentation

- [x] Commit generated website pages, EPUB, local assets, and export artifacts for direct static hosting.
- [x] Document GitHub Pages branch/root setup and relative asset paths.
- [x] Provide the intended site link in the README.
- [x] Document text-editing, website rebuilding, DOCX exports, licensing, and accessibility limitations.
- [ ] Check the live [GitHub Pages site](https://archipelagoing.github.io/DeviKavachamEnglish/) serves the current intended edition and all reader/guide assets load.
- [ ] Verify live verse links, theme links, original-text download, and EPUB download under the repository's project-site path.
- [ ] After an authorized deployment, verify the new explanatory tabs and pictures, dark-mode fixes, and mobile layout on the live site.
- [ ] Review Contents/About wording, captions, and credits for clarity and consistency; record any source-based editorial corrections separately from the preserved hymn.
- [ ] Update documentation with browser/export findings and any confirmed limitations after verification.

Progress: The local `main` branch matched its recorded `origin/main` at review
time, before adding this checklist; no remote fetch or deployment check was
performed. The README's site URL is a documented destination, not proof that
the current revision is live. Publishing changes requires a separate authorized
task. Latest local status on 2026-10-13 matches the recorded `origin/main` at
`c63e954`; no live check of that newly recorded commit has been performed.
Final guide refinements and log/checklist updates remain uncommitted.

## 7. Explanatory tabs and relevant pictures

- [ ] Select the most important contents themes to explain and define a concise set of top navigation tabs, building on the existing Read, Contents, and About navigation.
- [x] Write clear explanations for each selected theme with links to the relevant verses; keep the explanations separate from the preserved hymn.
- [ ] Implement the explanatory views in editable templates and the shared generated navigation so rebuilding retains them.
- [ ] Add pictures relevant to each explanation; record source, reuse rights, captions, and useful alt text, and size assets for mobile loading.
- [ ] Verify each new tab and verse link works, indicates the current view, and supports keyboard navigation and direct links.
- [ ] Verify the new views and pictures remain readable in dark mode and fit mobile screens without crowded navigation or clipped content.

Progress: Requested by the user on 2026-10-13. Existing Contents and About pages
already provide thematic summaries and two Durga artworks; the requested work
extends those companions with more prominent explanations and relevant imagery.
Update, 2026-10-13: The user requested expansion of the existing Contents rows.
All eleven themes now expand in place with conversational explanations and a
separate Read link. The Navadurga section includes nine locally hosted images,
reviewed stories, Wikipedia links, and exact verse links. Future top-level tabs
remain open; the new work builds on the existing Contents navigation.

- [x] Make all eleven Contents themes expandable while retaining direct verse links and no-JavaScript use.
- [x] Add a photograph, short story, Wikipedia link, and verse link for each of the nine Navadurga forms.
- [x] Record image sources, author/license credits, alt text, dimensions, and lazy loading for the new cards.
- [x] Use Unicode normalization and dictionary-based entity linking to map names/aliases to the unchanged source verses; distinguish Kūṣmāṇḍā from similarly named spirits.
- [x] Verify expanded themes, nine images, credits, keyboard controls, direct deity fragments, and both reader destinations in Chrome at 320, 390, 900, and 1280 pixels, in dark/sepia palettes and with JavaScript disabled.

Evidence: `node scripts/check_reader.mjs --contents` passes with no uncaught
browser errors. Three `unittest` checks verify introductory verses, spelling
variants, and false-positive avoidance. Mobile and desktop screenshots were
reviewed; the full source still passes `python3 build.py --check`. Image credits
are in `assets/ARTWORK-LICENSES.md` and `assets/navadurga/media.json`. Stories and
aliases are editable in `content/navadurga.json`. These are local checks, not
live publication or physical-device/screen-reader verification.

## 8. Google search discoverability without a paid domain

- [ ] Check whether Google already indexes the current GitHub Pages site; record the findings without treating a missing search result alone as definitive proof of non-indexing.
- [ ] Verify the public pages are accessible to crawlers, return successful responses, and have no unintended indexing restrictions.
- [x] Add or improve descriptive titles, meta descriptions, headings, and internal links for the reading page and explanatory guides, using natural wording such as “Devi Kavacham English translation.”
- [x] Set canonical URLs using the existing GitHub Pages address; identify the preferred reading URL for the two themes and avoid duplicate print-export pages competing with it.
- [x] Generate a sitemap of preferred public page URLs through the build process and verify it works under the repository's project-site path.
- [ ] Set up a Google Search Console URL-prefix property for `https://archipelagoing.github.io/DeviKavachamEnglish/`; complete ownership verification with the user's account and the verification file or tag Google supplies.
- [ ] Once changes are live, submit the sitemap and inspect/request indexing for the main reading page and important guides through Search Console.
- [ ] Recheck indexing after Google processes the site; record reported exclusions and fix actionable issues. Treat indexing and ranking as separate outcomes.

Progress: Requested by the user on 2026-10-13. Keep the existing free GitHub
Pages URL; purchasing a domain or paying for advertising is outside this goal.
Search preparation is implemented and checked locally. `python3 build.py --check`
now verifies metadata and the sitemap as well as source preservation. Chrome
checks verify public pages under the project-site path. Temporary-output checks
passed for verification-token insertion and invalid-token rejection. The current
live homepage returned HTTP 200, with no robots meta/header; host-root robots.txt
returned 404. A search returned no results, which is not definitive indexing
evidence. Search Console account actions require the user's access; no real
verification token has been supplied. See [SEARCH.md](SEARCH.md). Eligibility and indexing requests do not guarantee inclusion,
timing, or ranking. Follow Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
and [URL Inspection guidance](https://support.google.com/webmasters/answer/9012289)
when implementing and verifying this work.

## 9. Beginner guidance and resource transparency

- [ ] Add “Start here” guidance explaining what the Kavacham is, who this edition serves, and a suggested first reading path with links into the text and guides.
- [ ] Add a glossary for names and terms such as Navadurgā, the Mothers, guṇas, and vital breaths; cite explanations and link relevant occurrences in the reading text without changing the preserved source wording.
- [ ] Make glossary access usable by keyboard and touch, with a clear return to the reading position; verify it in continuous text and book mode.
- [ ] Expand the existing About page with the edition's purpose, supplied translation provenance, preservation method, and a clear distinction between source text and editorial explanations.
- [ ] Cite editorial explanations and acknowledge relevant differences between traditions where supported by sources; avoid claiming a definitive translation or universal practice.
- [ ] Add clear download guidance identifying EPUB for external readers, the seven/eight-page PDFs for printing, and the DOCX for editing, with direct links and a brief explanation of each layout.
- [ ] Verify every download link and ensure labels distinguish the TXT-based website edition from separately edited DOCX exports.
- [ ] Add a visible corrections route for translation questions, broken controls, and accessibility problems; choose a maintained contact or GitHub issue destination and invite a verse/page reference and reproduction details.
- [ ] Verify the corrections link is usable without a GitHub account if an alternative contact method is provided; make any account requirement explicit.
- [ ] Review the new guidance on mobile and in dark mode, and confirm it survives regeneration without altering the original hymn.

Progress: These five additions were explicitly requested on 2026-10-13 and are
recorded as unfinished implementation work. About already exists at
[about.html](about.html), with editable content in [templates/about.html](templates/about.html);
expand that page rather than creating a duplicate. Glossary wording needs source
review, and the corrections destination still needs selection. No new public
contact details have been assumed or published.

## 10. Search, bookmarks, sharing, and offline reading

- [ ] Add resource search for words, deity names, themes, and verse numbers, with results linking to the matching passage or guide.
- [ ] Verify search handles diacritics and common unaccented spellings, offers a clear no-results state, and works with keyboard and touch.
- [ ] Add persistent verse bookmarks and resume reading after closing the browser, with clear controls to remove bookmarks or reset the saved position.
- [ ] Verify saved positions reopen correctly in both reading modes and unavailable browser storage does not prevent reading.
- [ ] Add a share/copy action for a verse with its number, edition credit, and direct URL, with a usable fallback when native sharing or clipboard access is unavailable.
- [ ] Verify shared links open the correct verse in a fresh browser session and copied text preserves the selected passage accurately.
- [ ] Add offline access to the reading text and essential guides after an initial online visit; explain what is available offline and how updates are received.
- [ ] Verify offline navigation, reloads, and return-online updates under the GitHub Pages project path without leaving readers on stale or partially cached editions.

Progress: Accepted by the user on 2026-10-13. These features are not yet
implemented. Existing session-only position memory does not fulfill persistent
bookmarks, and downloadable EPUBs do not fulfill offline website access. Audio
was explicitly declined and is excluded from the backlog.

## 11. Checklist and commit-log maintenance

- [x] Create `commits.md` with relevant proposed messages for uncommitted changes and the existing Git commit history.
- [x] Add repository instructions in `AGENTS.md` to maintain the checklist and change log after meaningful authorized changes.
- [x] Format each change-log entry with a short, natural subject and a longer email-style body, preserving actual Git subjects in historical entries.
- [x] Add the first 15-commit batch summary covering commits 1–15.
- [ ] Add the next summary when actual Git history reaches commit 30, covering commits 16–30.

Progress: Created on 2026-10-13. The local history now contains 15 commits; pending
changes are listed separately and do not count toward batch summaries. No
commit or push was performed during setup. Maintenance is instructed through
`AGENTS.md`; no automatic Git hook was installed.
On 2026-10-13, reformatted pending changes and the original 13 historical commits into
subject/body entries at the user's request, and updated the maintenance rules.
Historical descriptions are based on Git subjects and changed-file records;
they do not assert new runtime verification. Commit `1da918e` was subsequently
reconciled as commit 14, covering the original backlog and log setup. Commit
`c63e954` then combined the reader/search fixes and illustrated guide work as
commit 15; the first batch summary is now recorded. Final guide copy/layout and
maintenance refinements remain uncommitted.

## Blockers and decisions

- **Dependency:** Search Console ownership verification needs the user’s Google account and verification token. Updated live-site checks need publication first. Physical-device, other-browser, external-reader, and PDF-export checks remain pending.
- **Open question:** No explicit browser/device support target is recorded; document the environments actually tested when completing section 4.
- **Existing decision:** Preserve the supplied website TXT exactly; keep DOCX edits and their exported editions independent until deliberately integrated (see EDITION.md and EDITING.md).
- **User priorities, 2026-10-13:** Add top tabs explaining the most important contents themes with relevant pictures; investigate and fix dark mode; verify and improve mobile behavior. These are active priorities rather than optional stretch goals.
- **User constraint, 2026-10-13:** Make the site discoverable in Google using its existing GitHub Pages URL, without purchasing a domain.
- **User additions, 2026-10-13:** Add Start here guidance, a linked glossary, source/editorial transparency through the existing About page, clear download choices, and a corrections route.
- **User additions, 2026-10-13:** Add resource search, persistent bookmarks, verse sharing, and offline reading. Audio is explicitly excluded.
- **Guide decision, 2026-10-13:** Expand existing Contents themes and illustrate all nine Navadurga forms with source-linked stories. Use practical name-to-verse entity linking; keep reviewed copy in the repository instead of generating unreviewed stories live.
- **Maintenance:** This is the authoritative project checklist. `AGENTS.md` now instructs future repository work to update it and `commits.md`; summarize each batch of 15 actual commits.
