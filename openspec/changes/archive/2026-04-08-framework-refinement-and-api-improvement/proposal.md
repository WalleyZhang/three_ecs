# Framework Refinement and API Improvement

## Problem

The current three_ecs framework has several categories of issues that hinder external usage and developer experience:

### Critical Bugs
1. **`Entity.removeComponents` is broken** — dispatches a removal event but never actually removes components from the `Map` or unsets `component.entity`, leaving entity/index state inconsistent.
2. **`GravitySystem` uses `return` instead of `continue`** — when one entity has `gravity.enabled === false`, the entire loop terminates, skipping all subsequent entities.
3. **`TransformComponent` missing `CompName`** — inherits default `"Component"`, so component index lookups for transforms silently fail or collide with other unnamed components.
4. **`StateManager.State` setter never assigns the value** — the setter validates but never writes `this.state = state`, making state management non-functional.
5. **`World.resume()` never resumes systems** — it clears `_isPaused` and dispatches an event, but `SystemsManager` remains paused because there's no call to unpause it.
6. **`EntitiesManager.getEntitiesWithComponent` mutates the original Set** — when computing intersections, it deletes entries from the stored `componentIndex` Set, corrupting the index for future queries.

### API / Developer Experience Issues
7. **No unified package entry point** — consumers must import from deep paths (`src/world`, `src/base`, `src/types/...`). There's no root `index.ts` that re-exports the public API.
8. **`addComponents` only accepts arrays** — adding a single component requires wrapping in `[]`, which is unnecessarily verbose.
9. **Component queries use string names** — not type-safe; easy to typo. No way to query by class reference.
10. **System lifecycle methods use PascalCase + typo** — `Start`, `Update`, `LatedUpdate` (should be `LateUpdate`) diverges from TypeScript conventions.
11. **World events use raw strings** — `'world_started'`, `'world_stopped'` etc. are not in any enum, bypassing the type system.
12. **`GravityComponent`/`GravitySystem` not exported from base** — exist in code but aren't accessible via the barrel export, and `World.start()` doesn't register `GravitySystem`.
13. **No build pipeline** — no `tsc`/`rollup` build, no `dist` output, no `.d.ts` declarations. `main` in `package.json` points to non-existent `index.js`.
14. **`typescript` in `dependencies`** — should be in `devDependencies`.
15. **README is minimal and in Chinese** — needs a proper English README with installation, usage, API overview.

### ThreeManager Rigidity
16. **ThreeManager hardcodes scene setup** — camera FOV, position, skybox, ambient light are all baked in with no configuration options. External consumers can't customize renderer settings, camera type, or disable the default skybox.

## Proposed Solution

A comprehensive refinement that:
1. **Fixes all critical bugs** to ensure correctness.
2. **Introduces a Studio-level API surface** — unified entry point, type-safe component access, convenience methods for entity/component/system operations.
3. **Standardizes naming conventions** — camelCase lifecycle methods, fix the `LatedUpdate` typo.
4. **Adds a build pipeline** — TypeScript compilation to `dist/` with declarations.
5. **Writes a complete English README** — installation, quick start, architecture overview, API reference.
6. **Makes ThreeManager configurable** — accept options for camera, renderer, and scene setup.

## Non-Goals

- Multi-World isolation (non-singleton managers) — flagged but deferred.
- Advanced features like entity pooling, archetype-based storage, or spatial indexing.
- Full test coverage rewrite (existing tests will be fixed to run, but not expanded).
- npm publishing workflow.

## Impact

- **Breaking changes**: System lifecycle method renames (`Start` → `start`, `LatedUpdate` → `lateUpdate`). Existing custom systems must update method names.
- **Non-breaking additions**: New convenience methods, unified exports, build output.
- **Affected files**: ~20 source files across `src/`, plus `package.json`, `tsconfig.json`, `README.md`.
