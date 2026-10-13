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

**Subject:** Give each change a readable subject and explanation

**Body:** Convert the original log table into email-style subjects and fuller
explanations while preserving the actual Git subjects, dates, and hashes. Apply
this format to future changes and batch summaries through the repository
instructions. Reconcile the checklist/log setup with actual commit `1da918e`,
which combined the initial pending documentation work into commit 14.

### 2026-10-13 — Pending

**Subject:** Make dark mode and phone reading work across the site

**Body:** Fix two reproduced problems: the main reader ignored saved appearance
preferences, and fitted EPUB pages showed pale text over a white reading surface.
Share appearance controls and palettes across both reading themes and the guides,
apply the selected palette to EPUB backgrounds and page-turn faces, and preserve
settings during reloads and navigation.

Keep phone controls at least 44 pixels tall, keep menus inside the viewport, and
fit the book to the visual viewport. Switch to continuous text when fitting a
mobile page would require text below 12 pixels, keeping the selected position.
Chrome emulation checks cover four public pages at five viewport sizes, all
three palettes, navigation, settings, saved colors, continuous text, and animated
turns; a mobile dark screenshot was visually reviewed. Physical phones, other
browsers, and assistive technology remain separate verification tasks.

### 2026-10-13 — Pending

**Subject:** Prepare the free site for Google search

**Body:** Add descriptive titles, canonical URLs, and a generated sitemap for
the existing GitHub Pages address. Keep the original reading text available in
HTML and mark print-only HTML exports as noindex. Add rebuild-safe support for a
Search Console verification token and document the account-side setup in SEARCH.md.

Source preservation and metadata checks pass, and temporary-output checks verify
token insertion and invalid-token rejection. The existing live homepage returns
HTTP 200, without robots indexing restrictions in its HTML or headers; the
host-root robots file returns 404. The updated files have not been published,
and Search Console verification, sitemap submission, and Google indexing remain
pending. No paid domain, Git commit, or push is part of this local change.

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

## Batch summaries

No complete batch yet: 14 actual commits are recorded. The first summary is due
after commit 15 and will cover commits 1–15. Pending changes above do not advance
this count.

