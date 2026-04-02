# Skill Registry

Generated: 2026-03-31
Project: propiedades-rm

## Resolution

- Engram lookup: no existing `skill-registry` observation found.
- Local file lookup: no existing `.atl/skill-registry.md` found.
- Project skill directories: none found in `.claude/skills`, `.gemini/skills`, `.agent/skills`, `skills`.
- User-level skills scanned and deduplicated (project-level precedence rule applied; no project-level overrides present).

## Project Conventions

- No convention index files found in project root (`agents.md`, `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, `GEMINI.md`, `copilot-instructions.md`).
- Note: `.github/copilot-instructions.md` exists and is used as guidance, but it is outside the root-level convention scan contract.

## Registered Skills (deduplicated)

### 1) `issue-creation`
- Source: `C:\Users\daril\.config\opencode\skills\issue-creation\SKILL.md`
- Trigger: creating GitHub issues, bug reports, feature requests
- Compact Rules:
  - Use issue templates (no blank issues)
  - New issues start with `status:needs-review`
  - PRs require approved issue (`status:approved`)

### 2) `branch-pr`
- Source: `C:\Users\daril\.config\opencode\skills\branch-pr\SKILL.md`
- Trigger: creating/opening PRs
- Compact Rules:
  - PR must link an approved issue
  - Exactly one `type:*` label per PR
  - Use conventional commits and required template sections

### 3) `skill-creator`
- Source: `C:\Users\daril\.config\opencode\skills\skill-creator\SKILL.md`
- Trigger: creating new AI agent skills
- Compact Rules:
  - Use standard skill frontmatter and folder structure
  - Keep skills focused on reusable patterns
  - Register created skills in agent instructions index

### 4) `go-testing`
- Source: `C:\Users\daril\.config\opencode\skills\go-testing\SKILL.md`
- Trigger: Go testing and Bubbletea test coverage
- Compact Rules:
  - Prefer table-driven tests
  - Validate state transitions and integration flows
  - Use golden files only where output snapshots matter

### 5) `judgment-day`
- Source: `C:\Users\daril\.config\opencode\skills\judgment-day\SKILL.md`
- Trigger: adversarial dual-review requests
- Compact Rules:
  - Run two independent blind judges in parallel
  - Synthesize confirmed vs suspect findings
  - Re-judge after fixes before approval

## Exclusions Applied

- Excluded by policy: `sdd-*`, `_shared`, and `skill-registry` skills.
