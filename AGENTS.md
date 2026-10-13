# Repository instructions

- Read `todo.md` and `commits.md` before working on this repository.
- After authorized work changes project state, update the relevant checklist,
  progress evidence, next steps, and date in `todo.md`. The backlog alone does
  not authorize unrelated implementation work.
- For every meaningful change, add a concise, relevant proposed commit message
  to the pending changes in `commits.md` before responding. Update an existing
  pending entry when continuing the same logical change; do not log each file
  edit separately.
- Format every log entry like an email: a short, human-readable Subject followed
  by a longer Body explaining the change, its purpose, and relevant verification
  or limitations. Apply this to pending entries, actual commits, and batch
  summaries. Preserve the exact Git subject separately when rewriting it for
  readability; retrospective explanations are not original Git commit bodies.
- Reconcile pending entries with actual Git history on subsequent work. Record
  each new commit once, in chronological order, with its hash, date, and actual
  subject. Pending entries do not count as commits. If several pending changes
  land in one commit, combine them under that commit.
- After every 15 actual commits, append a summary of that completed batch of
  15 commits in `commits.md`. Count from the initial repository commit, including
  merge commits once. Preserve prior entries and summaries; do not reset the
  count when starting a new session. Base summaries on commit contents, and
  distinguish implementation from verified behavior.
- Keep the log update in the same authorized change or next maintenance update;
  do not create recursive commits just to record a log commit's hash. Creating
  or maintaining these files does not authorize committing or pushing changes.

