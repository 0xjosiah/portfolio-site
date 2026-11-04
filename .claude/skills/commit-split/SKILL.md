---
name: commit-split
description: Split uncommitted changes into small, logical git commits. Use when the user wants to break up their working tree changes into multiple commits.
disable-model-invocation: true
argument-hint: [branch-strategy]
allowed-tools: Bash
---

Split the current uncommitted changes into small, logical commits. Each commit should be small enough that the message is one or two sentences. Do not include author info in commit messages.

All commit messages must include the required Conventional Commit-style prefix expected by hooks (for example: `feat:`, `fix:`, `refactor:`, `style:`, `chore:`, `docs:`, `test:`, or scoped variants like `feat(nav):`).

The skill directory contains three scripts in the `scripts/` subdirectory. Always invoke them using the base directory path provided at skill invocation time (e.g. `<base>/scripts/assess.sh`).

## Steps

### 1. Assess the changes

Run `<base>/scripts/assess.sh` to gather git status, the full diff, and recent commit style.

### 2. Ask about branch strategy

Before committing, ask the user which option they prefer:

1. **Current branch** — commit directly to `!`git branch --show-current``
2. **Existing branch** — switch to a branch they name
3. **New branch** — suggest a branch name based on the themes in the changes, then create it

Wait for the user's answer before proceeding.

### 3. Plan the commits

Group related changes into logical commits. Present the plan to the user as a numbered list showing:
- Which files go in each commit
- The **exact commit message** that will be used (quoted in the plan)
- Ensure every planned commit message includes the required prefix

Wait for approval before proceeding.

### 4. Execute the commits

For each commit in the approved plan, run:
```
<base>/scripts/commit.sh "<exact message from plan>" file1 file2 ...
```

- If a file has changes belonging to multiple commits, use `git add -p` with non-interactive scripting or stage the file in the commit where the majority of its changes belong
- Run commits sequentially — do not wait for user input between them

After all commits, run `<base>/scripts/verify.sh` to confirm everything is clean and show the final commit list.

## Rules

- No `Co-Authored-By` or author info in commit messages
- Always include required commit prefixes so commit hooks pass
- Never amend existing commits
- Never force push
- If multiple working directories are added, handle each repo's commits separately
- Create branches in other repos if needed to match
