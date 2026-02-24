# Angular 17 Development & Documentation Rules

## Context & State Integrity
1. **Source of Truth:** Always treat the currently opened file as the single source of truth. Do not reconstruct deleted logic or assume the existence of symbols not present in the current workspace.
2. **Stale Cache Prevention:** If there is a conflict between a previous suggestion and the current file state, the current file state wins.

## Angular 17 Technical Constraints
1. **Reactivity:** Use **Angular Signals** (`signal`, `computed`, `effect`) for all new state management.
2. **Templates:** Use structural directives (`*ngIf`, `*ngFor`) for control flow.
3. **Architecture:** Prefer **Standalone Components** and the `inject()` function for dependencies.

## Documentation & File Generation Control (Strict)
1. **No New Doc Files:** Do not create new `.md` files or external documentation files unless specifically named and requested by the user.
2. **Consolidation:** If documentation is necessary, keep it as a brief comment block within the relevant code file or append to the existing `README.md`. **Do not split one task into multiple documentation files.**
3. **Minimalism:** Provide the absolute minimum explanation. Avoid "Next Steps," "Summary of Changes," or "Best Practices" headers.

## Refactoring Discipline
1. **Minimal Scope:** Do not rewrite the entire file. Modify only the necessary lines.
2. **Preservation:** Maintain existing naming conventions and formatting styles.

## Import & Dependency Safety
1. **No Ghost Imports:** Do not reintroduce deleted imports.
2. **Workspace Awareness:** Use existing utilities within the project instead of creating new helpers.

## Output Format
1. **Diff-Oriented:** Provide minimal code blocks showing only the changed sections.
2. **Unchanged Code:** Avoid reprinting large blocks of unchanged code.
