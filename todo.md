# Devi Kavacham English TODO

Last updated: 2026-10-13. The repository contains two static reading themes,
an embedded EPUB reader, Contents and About guides, and separate print/export
editions. `python3 build.py --check` passed on 2026-10-13: both HTML themes and
the website EPUB preserve the complete source text, with seven verses per EPUB
reading section. Current user priorities are explanatory tabs with relevant
pictures, reliable dark mode, a usable mobile experience, and Google search
discoverability using the existing GitHub Pages address without buying a domain. The user suspects
dark mode is currently broken; this has not yet been reproduced. The next major
gap is browser and accessibility verification;
the current live deployment and DOCX export workflow have not been checked in
this review.

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

1. Reproduce the reported dark-mode problem and fix confirmed issues — section 4.
2. Check the mobile reading journey and fix layout/touch issues — section 4.
3. Build explanatory tabs with relevant pictures and beginner guidance; expand About and add glossary, downloads, and corrections guidance — sections 7 and 9.
4. Verify the updated tabs, dark mode, and mobile journey on the live site — section 6.
5. Prepare search metadata and a sitemap, then verify Google indexing through Search Console — section 8.

The implementation and committed reading artifacts are ready for review. Record
specific environments and findings before treating the reading experience as
verified. These next steps are a proposed verification backlog, not authorization
to publish changes or execute unrelated work.

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
the shared styles, and [templates/](templates/). The latest feature commit is
`f633aea` (2026-10-12): guides, artwork, and forest-green verse styling.
The source-preservation check passed on 2026-10-13. Export artifacts exist in
[exports/](exports/); their presence does not establish current export or visual
verification. Completed implementation tasks above do not imply browser testing.

## 4. Usability, presentation, and accessibility

- [ ] Reproduce the user's suspected dark-mode failure; record the affected page, reading mode, browser, and steps before diagnosing it.
- [ ] Fix confirmed dark-mode issues across page backgrounds, text, controls, guides, embedded EPUB pages, and animated page-turn faces.
- [ ] Verify selecting dark mode, reloading, switching reading modes, and visiting guides preserve a readable dark palette; check switching back to light and sepia.
- [ ] Review both themes in current desktop browsers; confirm opening, spread pairing, page turns, text fitting, and first/last-page controls.
- [ ] Review a narrow mobile viewport and a touch device; confirm single pages, readable verses, and appearance menus stay within the viewport.
- [ ] Fix mobile issues found in the walkthrough; ensure header tabs, controls, images, and menus fit without unintended horizontal scrolling and remain usable by touch.
- [ ] Check resizing across the 900px spread breakpoint, orientation changes, and larger text settings for clipping or lost position.
- [ ] Follow each Contents link; confirm the correct verse opens and is highlighted in both reading modes.
- [ ] Verify theme switching, guide navigation, and returning to Read preserve the expected section and preferences.
- [ ] Complete a keyboard-only walkthrough: skip link, controls, menus, Escape/outside-click behavior, and visible focus.
- [ ] Check screen-reader labels, page-position announcements, hidden content, and focus during navigation and mode changes.
- [ ] Check contrast and readability in light, dark, and sepia palettes, including alternating verse colors and verse markers.
- [ ] Verify reduced-motion behavior and continuous-text printing.

Progress: Responsive controls, accessibility attributes, and reduced-motion
handling are implemented and described in [EDITION.md](EDITION.md). Manual
browser, touch, and assistive-technology verification was not performed in this
review; accessibility conformance remains unclaimed.
User report, 2026-10-13: dark mode is suspected not to work. Treat it as a
priority investigation, not a verified defect or a completed feature. Mobile
behavior must be checked and corrected where necessary, rather than assumed
working from responsive CSS alone.

## 5. Build and reader resilience

- [ ] Regenerate website artifacts in a temporary copy and confirm all four HTML pages and EPUB are produced and pass the source check.
- [ ] Check missing/out-of-order verse headings fail clearly without silently producing an invalid edition.
- [ ] Verify complete HTML text remains usable with JavaScript disabled and when opening the site as local files.
- [ ] Simulate EPUB/library loading failure and confirm a usable continuous-text fallback with an understandable state.
- [ ] Verify reading works with unavailable browser storage and malformed saved preferences.
- [ ] Check rapid navigation and resize/appearance changes during a page turn for overlapping turns, blank pages, or stale position.
- [ ] Resolve findings from sections 4–5 and recheck each affected behavior before closing its verification task.

Progress: The completed check validates HTML/EPUB text and EPUB structure, not
reader interactions, guide rendering, full regeneration, or error handling.
No runtime failure has been established by this repository review.

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
task.

## 7. Explanatory tabs and relevant pictures

- [ ] Select the most important contents themes to explain and define a concise set of top navigation tabs, building on the existing Read, Contents, and About navigation.
- [ ] Write clear explanations for each selected theme with links to the relevant verses; keep the explanations separate from the preserved hymn.
- [ ] Implement the explanatory views in editable templates and the shared generated navigation so rebuilding retains them.
- [ ] Add pictures relevant to each explanation; record source, reuse rights, captions, and useful alt text, and size assets for mobile loading.
- [ ] Verify each new tab and verse link works, indicates the current view, and supports keyboard navigation and direct links.
- [ ] Verify the new views and pictures remain readable in dark mode and fit mobile screens without crowded navigation or clipped content.

Progress: Requested by the user on 2026-10-13. Existing Contents and About pages
already provide thematic summaries and two Durga artworks; the requested work
extends those companions with more prominent explanations and relevant imagery.
New tab labels, explanatory content, and image choices have not yet been
implemented. Candidate themes from the current Contents guide include the nine
forms of Durgā, the Mothers, and protection of directions/body/inner life; these
are planning suggestions, not approved final tab labels.

## 8. Google search discoverability without a paid domain

- [ ] Check whether Google already indexes the current GitHub Pages site; record the findings without treating a missing search result alone as definitive proof of non-indexing.
- [ ] Verify the public pages are accessible to crawlers, return successful responses, and have no unintended indexing restrictions.
- [ ] Add or improve descriptive titles, meta descriptions, headings, and internal links for the reading page and explanatory guides, using natural wording such as “Devi Kavacham English translation.”
- [ ] Set canonical URLs using the existing GitHub Pages address; identify the preferred reading URL for the two themes and avoid duplicate print-export pages competing with it.
- [ ] Generate a sitemap of preferred public page URLs through the build process and verify it works under the repository's project-site path.
- [ ] Set up a Google Search Console URL-prefix property for `https://archipelagoing.github.io/DeviKavachamEnglish/`; complete ownership verification with the user's account and the verification file or tag Google supplies.
- [ ] Once changes are live, submit the sitemap and inspect/request indexing for the main reading page and important guides through Search Console.
- [ ] Recheck indexing after Google processes the site; record reported exclusions and fix actionable issues. Treat indexing and ranking as separate outcomes.

Progress: Requested by the user on 2026-10-13. Keep the existing free GitHub
Pages URL; purchasing a domain or paying for advertising is outside this goal.
Search preparation and actual indexing have not yet been assessed. Search Console
account actions require the user's access; no verification token is available
in this review. Eligibility and indexing requests do not guarantee inclusion,
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
- [ ] Add the first 15-commit batch summary once actual Git history reaches commit 15; continue at each subsequent multiple of 15.

Progress: Created on 2026-10-13. The local history contains 13 commits; pending
changes are listed separately and do not count toward batch summaries. No
commit or push was performed during setup. Maintenance is instructed through
`AGENTS.md`; no automatic Git hook was installed.

## Blockers and decisions

- **Blocker:** None observed for local source verification. Browser, external-reader, PDF-export, and live-site checks remain unassessed rather than confirmed blocked.
- **Open question:** No explicit browser/device support target is recorded; document the environments actually tested when completing section 4.
- **Existing decision:** Preserve the supplied website TXT exactly; keep DOCX edits and their exported editions independent until deliberately integrated (see EDITION.md and EDITING.md).
- **User priorities, 2026-10-13:** Add top tabs explaining the most important contents themes with relevant pictures; investigate and fix dark mode; verify and improve mobile behavior. These are active priorities rather than optional stretch goals.
- **User constraint, 2026-10-13:** Make the site discoverable in Google using its existing GitHub Pages URL, without purchasing a domain.
- **User additions, 2026-10-13:** Add Start here guidance, a linked glossary, source/editorial transparency through the existing About page, clear download choices, and a corrections route.
- **User additions, 2026-10-13:** Add resource search, persistent bookmarks, verse sharing, and offline reading. Audio is explicitly excluded.
- **Maintenance:** This is the authoritative project checklist. `AGENTS.md` now instructs future repository work to update it and `commits.md`; summarize each batch of 15 actual commits.
