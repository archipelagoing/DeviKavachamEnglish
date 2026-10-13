# Commit and change log

Last updated: 2026-10-13.

## Maintenance

Record a relevant proposed commit message for every meaningful change in
Pending changes, including work that has not been committed. One entry describes
one logical change, not every individual file edit. When the change is committed,
move or reconcile it into Commit history with the actual Git hash, date, and
subject. Never label pending work as committed or count it toward summaries.

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

- 2026-10-13 — `Document the project backlog and requested reader improvements`
  — Create and populate `todo.md` with current-state evidence and priorities
  for explanatory tabs/pictures, dark mode, mobile, Google indexing, beginner
  guidance, glossary, About, downloads, corrections, search, bookmarks, sharing,
  and offline reading. Audio is excluded by the user's decision. Feature
  implementation remains pending. Earlier verification in this session:
  `python3 build.py --check` passed for the existing HTML themes and website EPUB.
- 2026-10-13 — `Add a maintained commit log with summaries every 15 commits`
  — Create `commits.md` and `AGENTS.md`, seed the 13 existing commits, and define
  pending-change recording, reconciliation, and summary rules. Documentation
  review only; no Git commit or push performed.

## Commit history

Historical entries below come from local Git history inspected on 2026-10-13.
Their titles describe recorded changes, not independent runtime verification.

| # | Date | Commit | Message |
| --- | --- | --- | --- |
| 1 | 2026-10-09 | `f4dba54` | Initial commit |
| 2 | 2026-10-09 | `01faeef` | Update event reference to Durga Puja |
| 3 | 2026-10-09 | `2cfdbce` | Add source link for Devi Kavacham transliteration |
| 4 | 2026-10-09 | `151bd45` | added an initial working transliteration to the repo |
| 5 | 2026-10-09 | `77fc0b2` | Add initial implementation for Devi Kavacham reading edition |
| 6 | 2026-10-09 | `11f50ab` | Add English translation and reader view for Devi Kavacham |
| 7 | 2026-10-09 | `5640afb` | Refactor code structure for improved readability and maintainability |
| 8 | 2026-10-09 | `b4dcd29` | Enhance reader-view layout and accessibility features |
| 9 | 2026-10-09 | `47f4ee8` | Add lotus logo and update header with favicon in HTML files |
| 10 | 2026-10-12 | `de8ae0a` | Refactor EPUB reader controls and improve navigation features |
| 11 | 2026-10-12 | `b5a0455` | Keep mobile appearance settings within the viewport |
| 12 | 2026-10-12 | `36ac6a3` | Turn two-sided pages around the book binding |
| 13 | 2026-10-12 | `f633aea` | Add contents and background guides with forest-green verse styling |

## Batch summaries

No complete batch yet: 13 actual commits are recorded. The first summary is due
after commit 15 and will cover commits 1–15. Pending changes above do not advance
this count.

