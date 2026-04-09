# Tasks: Framework Refinement and API Improvement

## Task 1: Fix Critical Bugs
**Priority**: P0 — Must fix before any other changes  
**Files**: `src/core/ecs.ts`, `src/base/baseSystems/gravitySystem.ts`, `src/base/baseComponents/transformComponent.ts`, `src/managers/stateManager.ts`, `src/managers/systemsManager.ts`, `src/managers/entitiesManager.ts`, `src/world.ts`

### Subtasks

- [x] **1.1** `Entity.removeComponents` — After collecting `toBeRemoved`, actually call `this.components.delete(compName)` and set `component.entity = null` for each removed component, before dispatching the event.

- [x] **1.2** `GravitySystem.Update` — Change `if (!gravity.enabled) return` to `if (!gravity.enabled) continue` on line 33 of `gravitySystem.ts`.

- [x] **1.3** `TransformComponent` — Add `public static CompName = "TransformComponent";` to the class.

- [x] **1.4** `StateManager.State` setter — Add `this.state = state;` after the duplicate-check guard clause so the state actually changes.

- [x] **1.5** `SystemsManager` — Add a `Resume()` method that sets `_isPaused = false` (and resets `clock` to `Date.now()` to avoid a huge delta spike). Call this from `World.resume()`.

- [x] **1.6** `EntitiesManager.getEntitiesWithComponent` — Clone the first Set into `new Set(first)` before filtering, so the original `componentIndex` is never mutated.

---

## Task 2: Rename System Lifecycle Methods (Breaking Change)
**Priority**: P0  
**Files**: `src/core/ecs.ts`, `src/managers/systemsManager.ts`, `src/managers/threeManager.ts`, `src/base/baseSystems/moveSystem.ts`, `src/base/baseSystems/gravitySystem.ts`, `src/base/baseSystems/eventSystem.ts`

### Subtasks

- [x] **2.1** In `System` abstract class (`ecs.ts`), rename: `Start` → `start`, `Update` → `update`, `LatedUpdate` → `lateUpdate`, `Pause` → `pause`, `Stop` → `stop`.

- [x] **2.2** Update `SystemsManager` — all call sites: `system.Start()` → `system.start()`, `system.Update()` → `system.update()`, etc. Also rename the manager's own `Start/Update/LatedUpdate/Pause/Stop` to `start/update/lateUpdate/pause/stop`.

- [x] **2.3** Update `ThreeManager.setAnimationLoop` — change `instance.Start()` → `instance.start()`, `instance.Update()` → `instance.update()`, `instance.LatedUpdate()` → `instance.lateUpdate()`. Same for `unsetAnimationLoop`.

- [x] **2.4** Update all base systems (`MoveSystem`, `GravitySystem`, `EventSystem`) — rename their lifecycle method implementations to match the new abstract signatures.

- [x] **2.5** Update `World` — all calls to `SystemsManager` methods (`this.managers.systemM.Stop()` → `this.managers.systemM.stop()`, etc.).

---

## Task 3: Add Entity Convenience Methods
**Priority**: P1  
**Files**: `src/core/ecs.ts`

### Subtasks

- [x] **3.1** Add `addComponent<T>(component: T): T` — single-component overload that delegates to `addComponents([component])[0]`.

- [x] **3.2** Add `getComponent<T>(ctor: ComponentConstructor<T>): T | undefined` — type-safe getter that returns `this.components.get(ctor.CompName) as T | undefined`.

- [x] **3.3** Add `hasComponent<T>(ctor: ComponentConstructor<T>): boolean` — checks existence by CompName.

- [x] **3.4** Add `removeComponent<T>(component: T): boolean` — single-component removal shorthand.

---

## Task 4: Standardize World Events & Add Convenience Methods
**Priority**: P1  
**Files**: `src/types/externalEventMap.ts`, `src/world.ts`

### Subtasks

- [x] **4.1** Add world lifecycle events to `ExternalEvent` enum: `WORLD_STARTED`, `WORLD_STOPPED`, `WORLD_PAUSED`, `WORLD_RESUMED`, `WORLD_DESTROYED`. Add corresponding payload types to `ExternalEventPayload`.

- [x] **4.2** Update `World.start/stop/pause/resume/destroy` to use the enum values instead of raw strings.

- [x] **4.3** Add `World.registerSystem(system)` — convenience wrapper for `this.managers.systemM.registerSystem(system)`.

- [x] **4.4** Add `World.createEntity()` — creates a basic `Entity`, registers with `EntitiesManager`, and returns it.

- [x] **4.5** Add `World.on(event, callback)` and `World.off(event, callback)` — convenience wrappers for `EventManager` subscribe/unsubscribe.

---

## Task 5: Export Everything & Create Unified Entry Point
**Priority**: P1  
**Files**: `src/index.ts` (new), `src/base/index.ts`

### Subtasks

- [x] **5.1** Add missing exports to `src/base/index.ts`: `GravityComponent`, `GravitySystem`, `EventSystem`.

- [x] **5.2** Create `src/index.ts` that re-exports from `./core`, `./world`, `./base`, `./managers`, and `./types/*`. This becomes the single entry point for all consumers.

---

## Task 6: Make ThreeManager Configurable
**Priority**: P2  
**Files**: `src/managers/threeManager.ts`, `src/world.ts`

### Subtasks

- [x] **6.1** Define `ThreeManagerOptions` interface with optional fields: `antialias`, `skybox` (boolean), `ambientLight` (color/intensity or false), `camera` config (fov, near, far, position, up).

- [x] **6.2** Refactor `ThreeManager` constructor to accept options. Make skybox, ambient light, and camera setup conditional/configurable.

- [x] **6.3** Update `World` constructor signature to accept an optional options object, and pass relevant options to `ThreeManager`.

---

## Task 7: Build Infrastructure
**Priority**: P1  
**Files**: `tsconfig.json`, `package.json`

### Subtasks

- [x] **7.1** Update `tsconfig.json`: set `module: "ES2020"`, `moduleResolution: "node"`, `outDir: "./dist"`, `rootDir: "./src"`, `declaration: true`, `declarationMap: true`, `sourceMap: true`. Add `include: ["src"]` and `exclude` for test/example/dist.

- [x] **7.2** Create `tsconfig.build.json` that extends `tsconfig.json` but excludes test files, for clean builds.

- [x] **7.3** Update `package.json`: move `typescript` to `devDependencies`, set `main: "dist/index.js"`, add `types: "dist/index.d.ts"`, add `"build": "tsc -p tsconfig.build.json"` script, add `"files": ["dist"]`.

- [x] **7.4** Add `dist/` to `.gitignore`.

- [x] **7.5** Verify `tsc` compiles cleanly with no errors.

---

## Task 8: Write English README
**Priority**: P1  
**Files**: `README.md`

### Subtasks

- [x] **8.1** Write complete English README with sections:
  - Project title, badges, one-line description
  - Features
  - Installation (`npm install three_ecs`)
  - Quick Start (create World, add entity, add component, register system)
  - Architecture Overview (ECS pattern explanation with diagram)
  - API Reference (World, Entity, Component, System key methods)
  - Built-in Components & Systems table
  - Creating Custom Components & Systems (short guide)
  - Configuration Options (ThreeManager options)
  - Contributing
  - License

---

## Task 9: Update Example to Match New API
**Priority**: P2  
**Files**: `engine_example/src/App.tsx`, `engine_example/vite.config.ts`

### Subtasks

- [x] **9.1** Update imports to use the new unified entry point if alias allows.

- [x] **9.2** Fix `getAllEntities().size` → `getAllEntities().length`.

- [x] **9.3** Remove duplicate `export default App`.

- [x] **9.4** Register `GravitySystem` in the example if gravity entities are used.

- [x] **9.5** Update lifecycle method names in any custom systems used in the example.

---

## Execution Order

1. **Task 1** (Bug fixes) — foundation, everything depends on correctness
2. **Task 2** (Lifecycle rename) — breaking change, do early
3. **Task 3** (Entity convenience) — builds on fixed Entity
4. **Task 4** (World events & convenience) — builds on renamed lifecycle
5. **Task 5** (Unified exports) — needs all new APIs to exist
6. **Task 6** (ThreeManager config) — independent, but after API stabilizes
7. **Task 7** (Build infrastructure) — needs final source shape
8. **Task 8** (README) — needs final API to document
9. **Task 9** (Example update) — last, uses the new API
