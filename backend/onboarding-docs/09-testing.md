# MemoMind Backend — Testing

## Current State

**There are no tests.** A search of the entire repository found zero test files (`*test*`, `*spec*`, `*__tests__*`).

No testing framework is declared in `deno.json`. There are no `deno test` tasks, no test directories, and no test utilities.

---

## What to Test First (When You Add Tests)

Given the architecture, the highest-risk areas with no coverage are:

1. **`RetrievalController.retrieve()`** — the iterative loop has a correctness bug (see Gotchas). This should be the first unit test written.

2. **`embeddings_generator.tokenize()`** — the sentence-splitting regex is fragile (fails on unpunctuated text). Easy to unit test with strings.

3. **`NotebookController.updateNotebook()`** — the MongoDB pipeline update has conditional logic. Worth verifying the `ingestCount` only increments on the right condition.

4. **`loginHandler`** — the auto-create-on-first-login behavior is non-obvious and worth an integration test.

---

## How to Run Tests (Once Added)

```bash
deno test --allow-ffi --allow-net --allow-env --allow-read
```

Deno's built-in test runner discovers files matching `*_test.ts`, `*.test.ts`, or `*_spec.ts`.
