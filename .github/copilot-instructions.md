# Angular 17 Development & Documentation Rules

## Cache & Sync Validation (Highest Priority)
1. **Anti-Stale Protocol:** WebStorm may provide cached or outdated file content. If the user mentions a change that you do not "see" in the provided file context, **trust the user's description over the file content.**
2. **Read Verification:** Do not assume `cat` or internal file-read commands reflect the most recent unsaved edits.
3. **No Legacy Restoration:** If a user says "I deleted X," do not re-insert X based on your cached memory of the file.

## Context & State Integrity
1. **Source of Truth:** The currently opened file is the primary reference. Do not reconstruct deleted logic.
2. **Conflict Resolution:** If there is a mismatch between previous suggestions and the current file state, the current file state (updated by user input) wins.

## Angular 17 Technical Constraints
1. **Reactivity:** Use **Angular Signals** (`signal`, `computed`, `effect`) for all new state management.
2. **Templates:** Use structural directives (`*ngIf`, `*ngFor`) for control flow (Angular 17).
3. **Architecture:** Prefer **Standalone Components** and the `inject()` function for dependencies.

## Documentation & File Generation Control (Strict)
1. **No New Doc Files:** Do not create new `.md` files or external documentation files.
2. **Consolidation:** Keep documentation as a brief comment block within the code or append to the existing `README.md`. **No multiple doc files per task.**
3. **Minimalism:** Provide the absolute minimum explanation. Skip "Next Steps," "Summary," or "Best Practices."

## Refactoring Discipline
1. **Minimal Scope:** Modify only necessary lines. Do not rewrite the entire file.
2. **Preservation:** Maintain existing naming conventions and formatting.

## Import & Dependency Safety
1. **No Ghost Imports:** Do not reintroduce deleted imports.
2. **Workspace Awareness:** Use existing project utilities; do not create new helpers.

## Output Format
1. **Diff-Oriented:** Provide minimal code blocks showing only changed sections.
2. **Unchanged Code:** Do not reprint large blocks of unchanged code.
