# Design: Framework Refinement and API Improvement

## Overview

This design covers four major areas: bug fixes, API modernization, build infrastructure, and documentation. Changes are organized to minimize disruption while maximizing developer experience improvement.

---

## 1. Critical Bug Fixes

### 1.1 Entity.removeComponents — Actually Remove Components

**Current**: Dispatches `ENTITY_COMPONENT_REMOVED` event but never calls `this.components.delete()` or sets `component.entity = null`.

**Fix**:
```typescript
public removeComponents<T extends Component>(components: T[]): boolean {
  const removed: Component[] = [];
  for (const component of components) {
    const compName = (component.constructor as ComponentConstructor<T>).CompName;
    if (this.components.has(compName)) {
      this.components.delete(compName);
      component.entity = null;
      removed.push(component);
    }
  }
  if (removed.length > 0) {
    Entity.eventM!.dispatch<InternalEventPayload[InternalEvent.ENTITY_COMPONENT_REMOVED]>(
      InternalEvent.ENTITY_COMPONENT_REMOVED,
      { entity: this, components: removed }
    );
    return true;
  }
  return false;
}
```

### 1.2 GravitySystem — `return` → `continue`

**Current**: `if (!gravity.enabled) return` exits the entire `Update` method.

**Fix**: Change to `continue` to skip only the current entity.

### 1.3 TransformComponent — Add CompName

**Fix**: Add `public static CompName = "TransformComponent";`

### 1.4 StateManager.State Setter — Assign the Value

**Fix**: Add `this.state = state;` after the duplicate-check guard.

### 1.5 World.resume() — Actually Resume SystemsManager

**Current**: `SystemsManager` has no `Resume()` method; `World.resume()` only clears `_isPaused`.

**Fix**: Add a `Resume()` method to `SystemsManager` that sets `_isPaused = false`, and call it from `World.resume()`.

### 1.6 EntitiesManager.getEntitiesWithComponent — Don't Mutate Index

**Current**: Computes intersection by calling `entities.delete()` on the Set stored in `componentIndex`.

**Fix**: Copy the first Set into a new `result` Set before filtering:
```typescript
public getEntitiesWithComponent(compNames: string[]): Set<Entity> | undefined {
  if (compNames.length === 0) throw new EmptyError("compNames is empty");
  const first = this.componentIndex.get(compNames[0]);
  if (!first || first.size === 0) return undefined;

  const result = new Set(first); // clone — never mutate the index
  for (let i = 1; i < compNames.length; i++) {
    const index = this.componentIndex.get(compNames[i]);
    if (!index || index.size === 0) return undefined;
    for (const entity of result) {
      if (!index.has(entity)) result.delete(entity);
    }
  }
  return result.size > 0 ? result : undefined;
}
```

---

## 2. API Modernization (Studio-Level)

### 2.1 Unified Package Entry Point

Create `src/index.ts` as the single entry that re-exports everything:

```
src/index.ts
├── Core: Entity, Component, System, ComponentConstructor
├── World
├── Base components: ModelComponent, TransformComponent, VelocityComponent, GravityComponent
├── Base entities: VisibleEntity
├── Base systems: MoveSystem, GravitySystem, EventSystem
├── Managers: EntitiesManager, SystemsManager, EventManager, ThreeManager, StateManager
├── Types: InternalEvent, ExternalEvent, EventData, State, exceptions
```

### 2.2 Convenience Methods on Entity

Add single-item overloads and type-safe component access:

```typescript
// Single component add
entity.addComponent(component);
// Array add (existing)
entity.addComponents([comp1, comp2]);

// Type-safe component retrieval
const transform = entity.getComponent(TransformComponent);
// Returns TransformComponent | undefined — no string names, no casting

// Check
entity.hasComponent(TransformComponent); // boolean
```

Implementation:
```typescript
public addComponent<T extends Component>(component: T): T {
  return this.addComponents([component])[0];
}

public getComponent<T extends Component>(ctor: ComponentConstructor<T>): T | undefined {
  return this.components.get(ctor.CompName) as T | undefined;
}

public hasComponent<T extends Component>(ctor: ComponentConstructor<T>): boolean {
  return this.components.has(ctor.CompName);
}
```

### 2.3 System Lifecycle Naming Convention

Rename PascalCase methods to camelCase and fix the typo:

| Before | After |
|--------|-------|
| `Start()` | `start()` |
| `Update(delta)` | `update(delta)` |
| `LatedUpdate(delta)` | `lateUpdate(delta)` |
| `Pause()` | `pause()` |
| `Stop()` | `stop()` |

This affects: `System` abstract class, `SystemsManager`, `ThreeManager.setAnimationLoop`, `MoveSystem`, `GravitySystem`, `EventSystem`.

### 2.4 World Convenience Methods

```typescript
// Register custom systems
world.registerSystem(system);

// Create basic (non-visible) entity
world.createEntity();

// Type-safe event subscription (wraps EventManager)
world.on(ExternalEvent.TEST, (payload) => { ... });
world.off(ExternalEvent.TEST, callback);
```

### 2.5 World Events — Use Enum

Add world lifecycle events to `ExternalEvent` enum:

```typescript
export enum ExternalEvent {
  TEST = "test",
  WORLD_STARTED = "world_started",
  WORLD_STOPPED = "world_stopped",
  WORLD_PAUSED = "world_paused",
  WORLD_RESUMED = "world_resumed",
  WORLD_DESTROYED = "world_destroyed",
}
```

### 2.6 Export GravityComponent/GravitySystem from Base

Add to `src/base/index.ts`:
```typescript
export { GravityComponent } from "./baseComponents/gravityComponent";
export { GravitySystem } from "./baseSystems/gravitySystem";
export { EventSystem } from "./baseSystems/eventSystem";
```

### 2.7 ThreeManager Configuration

Accept an options object for customizable scene setup:

```typescript
interface ThreeManagerOptions {
  antialias?: boolean;
  skybox?: boolean;
  ambientLight?: { color: number; intensity: number } | false;
  camera?: {
    fov?: number;
    near?: number;
    far?: number;
    position?: [number, number, number];
    up?: [number, number, number];
  };
}
```

Exposed via `World` constructor:
```typescript
new World(container, { antialias: true, skybox: false });
```

---

## 3. Build Infrastructure

### 3.1 tsconfig.json Updates

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["src/test", "node_modules", "dist", "engine_example"]
}
```

### 3.2 package.json Updates

```json
{
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "example": "pnpm --dir ./engine_example dev"
  },
  "dependencies": {
    "three": "^0.174.0"
  },
  "devDependencies": {
    "typescript": "^5.8.2",
    "@types/jest": "^29.5.14",
    "@types/three": "^0.174.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.6"
  }
}
```

---

## 4. README

Write a comprehensive English README covering:
- Project description and badges
- Features list
- Installation
- Quick Start (minimal working example)
- Architecture overview (Entity, Component, System, World)
- API Reference (key classes and methods)
- Built-in components and systems
- Custom component/system guide
- Contributing
- License

---

## Migration Guide (for Breaking Changes)

Users with custom systems need to rename lifecycle methods:

```typescript
// Before
class MySystem extends System {
  Start() { }
  Update(delta: number) { }
  LatedUpdate(delta: number) { }
  Pause() { }
  Stop() { }
}

// After
class MySystem extends System {
  start() { }
  update(delta: number) { }
  lateUpdate(delta: number) { }
  pause() { }
  stop() { }
}
```

No other changes required for existing consumer code — all additions are backward-compatible.
