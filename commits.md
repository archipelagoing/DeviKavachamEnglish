# Commit and change log

Last updated: 2026-10-13.

## Maintenance

Record a relevant proposed commit message for every meaningful change in
Pending changes, including work that has not been committed. One entry describes
one logical change, not every individual file edit. When the change is committed,
move or reconcile it into Commit history with the actual Git hash, date, and
subject. Never label pending work as committed or count it toward summaries.

Write each entry like an email: a short, natural **Subject** followed by a
longer **Body** explaining what changed, why it matters, and any relevant
verification or unfinished work. Use plain language rather than a list of
filenames. For historical commits, keep the exact Git subject as separate
metadata when the human-readable subject differs. Bodies written retrospectively
are log explanations, not original Git commit bodies. Use this subject/body
format for pending changes and 15-commit summaries too.

Number actual commits chronologically from the repository's initial commit,
including each merge commit once. Preserve history and add a summary after
commits 15, 30, 45, and so on, covering that batch's changes, verification
evidence, and remaining limitations. Before writing a summary, inspect the
relevant commits rather than relying only on their titles.

Update this file alongside authorized work. The next maintenance pass can fill
in a newly created commit's hash; do not make an extra commit merely to record
the hash of the commit that contains this log. See [AGENTS.md](AGENTS.md) for
the repository maintenance instructions. This is a maintained document, not an
automatic Git hook, and it does not authorize commits or pushes.

## Pending changes

### 2026-10-13 — Pending

**Subject:** Polish the guide’s wording and phone layout

**Body:** Put each deity’s name above its photograph so the identity is clear
before a phone reader reaches the story. Make image credits more readable and
rewrite the theme teasers in a direct, conversational voice. Document the new
content sources, entity-linking behavior, and verification commands.

Update the checklist with the completed expansions and record the new commit
`c63e954` as commit 15, including the first batch summary. The previously pending
reader fixes, search preparation, log-format update, and initial illustrated
guide landed together in that commit. These final copy/layout/documentation
refinements remain uncommitted; this agent did not commit or push them.

Chrome guide checks pass at four viewport widths, including all nine images,
credits, native expansion, dark/sepia layouts, direct fragments, and exact verse
links in both readers. Three entity-linking tests and the source-preservation
check pass. Phone and desktop screenshots were reviewed.

### 2026-10-13 — Pending

**Subject:** Keep dark pages readable and bring back the fold

**Body:** Respond to the white-panel and missing-crease screenshot by applying
explicit paper colors to EPUB text panels as well as HTML/body. Strengthen the
center fold with palette-aware shadow and highlight colors so it remains visible
on dark pages. Version generated stylesheet/script URLs by content hash so a
reload after publication requests the updated assets.

A fresh live Chrome load already had dark HTML/body backgrounds, so the precise
cause of the screenshot’s white panels remains unverified. The old fold was too
faint. The corrected local desktop spread was visually reviewed; both reader
themes pass explicit text-surface, fold, and asset-version checks. The full
phone/desktop/palette/navigation suite and source-preservation check also pass.
These changes are local; no commit or push was performed by this agent.

## Commit history


Historical entries below come from local Git history inspected on 2026-10-13.
Git subjects and changed-file records were reviewed to write the explanations
below. These retrospective bodies describe recorded changes, not independent
runtime verification or original Git commit bodies.

### 1 · 2026-10-09 · `f4dba54`

**Subject:** Start the Devi Kavacham project

**Body:** Create the initial README to introduce the repository. This establishes
the project before the source text and reading website are added.

**Git subject:** Initial commit

### 2 · 2026-10-09 · `01faeef`

**Subject:** Dedicate the edition to Durga Puja

**Body:** Update the README's event reference to Durga Puja so the project
introduction reflects the occasion behind the edition.

**Git subject:** Update event reference to Durga Puja

### 3 · 2026-10-09 · `2cfdbce`

**Subject:** Point readers to the source reference

**Body:** Add the Devi Kavacham source link to the README, giving readers a place
to consult the referenced text alongside this project.

**Git subject:** Add source link for Devi Kavacham transliteration

### 4 · 2026-10-09 · `151bd45`

**Subject:** Bring the supplied text into the repository

**Body:** Add the English-only source text as a plain-text file. This gives the
reading edition a source that can be preserved and checked during generation.

**Git subject:** added an initial working transliteration to the repo

### 5 · 2026-10-09 · `77fc0b2`

**Subject:** Build the first reading edition

**Body:** Add the initial website, generated EPUB, Python builder, reader assets,
and locally stored vendor libraries with their licenses. Include edition
instructions and static-hosting setup so the text can be read as a website or
downloaded as an EPUB.

**Git subject:** Add initial implementation for Devi Kavacham reading edition

### 6 · 2026-10-09 · `11f50ab`

**Subject:** Add another reading style and printable editions

**Body:** Add Reader View styles and a second reading page, alongside changes to
the shared reader. Introduce an editable Word master, export tools, and seven-
and eight-page PDF/EPUB editions with editing instructions. This gives readers
more ways to read and prepare the text for print.

**Git subject:** Add English translation and reader view for Devi Kavacham

### 7 · 2026-10-09 · `5640afb`

**Subject:** Make the reader easier to maintain

**Body:** Rework the shared reader code, styles, and builder, then update the
generated reading pages and EPUB. Keep the edition documentation alongside
those changes so the implementation and its description stay together.

**Git subject:** Refactor code structure for improved readability and maintainability

### 8 · 2026-10-09 · `b4dcd29`

**Subject:** Improve the reading layout and accessibility support

**Body:** Update both generated pages, the shared reader, and its styles to
improve layout and accessibility support. Rebuild the EPUB and revise edition
notes. These implementation changes do not establish accessibility conformance;
browser and assistive-technology testing remain separate work.

**Git subject:** Enhance reader-view layout and accessibility features

### 9 · 2026-10-09 · `47f4ee8`

**Subject:** Give the site a lotus identity

**Body:** Add a lotus SVG for the header and favicon, update the builder and
reading pages to use it, and document its source and license. The shared asset
keeps the visible logo and browser icon consistent.

**Git subject:** Add lotus logo and update header with favicon in HTML files

### 10 · 2026-10-12 · `de8ae0a`

**Subject:** Simplify the reader controls and project structure

**Body:** Rework EPUB controls and navigation, update the generated pages and
documentation, and remove duplicated nested assets. Add ignore rules for local
development files. This keeps the active reader assets and setup instructions
easier to find and maintain.

**Git subject:** Refactor EPUB reader controls and improve navigation features

### 11 · 2026-10-12 · `b5a0455`

**Subject:** Keep appearance settings on screen on mobile

**Body:** Adjust the appearance-panel styles and reader positioning logic to
keep the settings within the mobile viewport. This records the intended fix;
the current mobile walkthrough is still pending in the project checklist.

**Git subject:** Keep mobile appearance settings within the viewport

### 12 · 2026-10-12 · `36ac6a3`

**Subject:** Make page turns feel like turning a book

**Body:** Rework the page-turn code and styles so a two-sided sheet turns around
the binding, and update the edition notes to describe the behavior. The change
adds the book-like transition to the existing reading experience.

**Git subject:** Turn two-sided pages around the book binding

### 13 · 2026-10-12 · `f633aea`

**Subject:** Help readers explore the prayer's themes

**Body:** Add Contents and About guides with shared navigation, thematic verse
links, and locally hosted Durga artwork with credits. Update verse styling to
alternate black and forest green, and adjust the reader and builder to support
the companion pages. This provides context alongside the preserved hymn.

**Git subject:** Add contents and background guides with forest-green verse styling

### 14 · 2026-10-13 · `1da918e`

**Subject:** Record the project backlog and keep a change log

**Body:** Add the project checklist, initial commit log, and repository
maintenance instructions. Record the requested reading improvements and the
rule to summarize each batch of 15 actual commits. This commit combines the
initial backlog and log setup that were previously listed as pending; it does
not implement the requested reader features.

**Git subject:** added a maintainable commit log that should add summaries every 15 commits.

### 15 · 2026-10-13 · `c63e954`

**Subject:** Fix the reader and make Contents a richer guide

**Body:** Add shared appearance controls, correct the white EPUB surface in dark
mode, improve phone menus and controls, and switch to continuous text when a
mobile book page would require tiny type. Prepare the free GitHub Pages site
for Google with search metadata, canonical URLs, a sitemap, and rebuild-safe
Search Console verification support.

Expand all eleven Contents themes and add nine credited photographs, short
Navadurga stories, Wikipedia links, and automatically matched verse links.
Include entity-linking tests and Chrome regression checks. This commit also
adopts the email-style log format and records earlier checklist updates. Later
copy/layout refinements are tracked separately as pending work.

**Git subject:** expanded a it on the contents page, attempt to link relevant pictures and wikipedia articles

## Batch summaries

### Commits 1–15 · 2026-10-09 to 2026-10-13

**Subject:** From a text file to an illustrated reading resource

**Body:** The first batch establishes the Durga Puja edition, adds its source
reference and supplied text, and builds a static reading website with an EPUB
viewer. It then adds Reader View, appearance settings, an editable Word master,
and seven/eight-page print and EPUB exports. Reader refactors improve layout,
controls, and page navigation, with a lotus identity and two-sided book turns.

Contents and About provide context alongside the hymn, with Durga artwork and
alternating verse colors. The batch closes with fixes for the main reader’s
dark-mode preference handling and the EPUB’s white surface, improved mobile
controls and readability, eleven expandable explanations, and nine illustrated
Navadurga stories. Name normalization and entity linking connect those stories
to the actual verses without changing the source. Search metadata, canonical
URLs, and a generated sitemap prepare the existing free site for Google.

The repository now includes a maintained checklist, this subject/body change
log, and repeatable source/browser/entity-linking checks. Local development
checks passed for source preservation, metadata, dark/mobile behavior, native
expansion, and source-linked cards. Physical devices, other browsers,
assistive technology, and current DOCX export verification remain open. Google
Search Console verification and indexing still need account-side evidence;
local tests do not establish deployment or search ranking. Final copy and card
layout refinements made after commit 15 remain in Pending changes.

**Range:** `f4dba54` → `c63e954` (15 actual commits; pending changes excluded).
The next batch summary is due after commit 30 and will cover commits 16–30.
