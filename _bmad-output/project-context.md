---
project_name: 'BoazPlan'
user_name: 'Jansen'
date: '2026-02-19T00:00:00Z'
sections_completed: ['technology_stack','existing_patterns','critical_rules']
existing_patterns_found: 4
---

# Project Context for AI Agents (BoazPlan)

_This file contains the critical, unobvious rules and conventions AI agents must follow when working in this repository._

---

## Technology stack & versions (discovered)

- BMAD Method (project workflows & agents) — installed in-repo (`_bmad/`) via `npx bmad-method` (installer used: v6.x).
- Node.js — tool/runtime detected on your machine: **v22.12.0** (used by BMAD tooling).
- Repository contents: primarily BMAD workflows, agents, and Markdown documentation — **no application source** (no `package.json`, `pom.xml`, `requirements.txt`, or similar detected).

> If you add application code, include appropriate package manifests (e.g. `package.json`, `pyproject.toml`, `pom.xml`) so agents can detect exact dependency versions.

---

## Existing patterns & repository organization

- BMAD micro-file architecture: workflows and agents live under `_bmad/{core,bmm,tea,...}/workflows` and `_bmad/*/agents`.
- Generated output and artifacts → `_bmad-output/` (planning-artifacts, implementation-artifacts, test-artifacts, etc.).
- Module & manifest metadata under `_bmad/_config/` (workflows, agents, manifests).
- Documentation and PRDs live in `docs/` and `_bmad-output/planning-artifacts/`.

---

## Critical implementation rules (must-follow)

1. Preserve `_bmad/` and `_bmad/_config/` structure — do not rename or move workflow/agent files unless intentionally updating BMAD modules.
2. All agent-generated artifacts must be written under `_bmad-output/` (do not commit generated files into `_bmad/` unless they are source templates).
3. Use the BMAD installer / tooling for lifecycle actions:
   - Install or update BMAD: `npx bmad-method install`
   - Check status: `npx bmad-method status`
   - Use `/bmad-help` within the BMAD agent UI for workflow guidance.
4. When adding code, include a standard manifest (`package.json`, `pyproject.toml`, etc.) so agents can detect dependencies and generate correct build/test tasks.
5. Keep `communication_language` = **English** and `user_name` = **Jansen** for agent-generated text and templates (these come from `_bmad/bmm/config.yaml`).
6. Testing: follow TEA conventions (Test Architect module installed). Put test outputs in `_bmad-output/test-artifacts` and add automated checks where applicable.
7. Documentation: prefer Markdown with frontmatter for generated docs; include `project_name`, `date`, and `sections_completed` fields when generating planning artifacts.
8. Naming & organization: follow existing BMAD naming patterns (`bmad:module:workflows`, kebab-case for workflow file names, descriptive titles in manifest CSVs).

---

## Next recommended actions

- Run `Generate Project Context` (this file has been created) — then run `Create PRD` (recommended next step).
- If you add source code, commit a package manifest so BMAD can detect language-specific rules automatically.

---

_If you want changes to any rule or want more/less detail in any section, tell me which section to adjust._