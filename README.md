# three_ecs

An **Entity-Component-System** framework built on top of [Three.js](https://threejs.org/), designed for building 3D applications with clean data-driven architecture.

## Features

- **ECS Architecture** — Entities hold data (Components); Systems contain logic. Clean separation of concerns.
- **Built-in Three.js Integration** — Automatic scene management, rendering loop, camera, and orbit controls out of the box.
- **Type-safe Component Access** — Retrieve components by class reference with full TypeScript inference.
- **Layered System Execution** — Systems run in priority order (0–49) each frame: data → physics → logic → animation → rendering.
- **Event System** — Queue-based event dispatch processed each frame, with typed internal and external events.
- **Configurable Renderer** — Customize camera, antialiasing, skybox, and ambient light via options.

## Installation

```bash
npm install three_ecs
# or
pnpm add three_ecs
```

> **Peer dependency**: `three` >= 0.174.0

## Quick Start

```typescript
import { World, VelocityComponent, ExternalEvent } from "three_ecs";

// Create a world attached to a DOM container
const world = new World(document.getElementById("app")!);

// Listen to lifecycle events
world.on(ExternalEvent.WORLD_STARTED, () => {
  console.log("Engine is running");
});

// Start the engine
world.start();

// Create an entity with a 3D model in the scene
const entity = world.createVisibleEntity();

// Add a velocity component — the built-in MoveSystem will move it each frame
entity.addComponent(new VelocityComponent(1, 0, 0));
```

## Architecture

```
World
├── EntitiesManager    — stores entities + component index
├── SystemsManager     — update loop with layered execution
├── ThreeManager       — Three.js scene, camera, renderer
├── EventManager       — queue-based event bus
└── StateManager       — world state tracking

Entity
├── Component A (data only)
├── Component B (data only)
└── ...

System
└── update(delta) → queries entities by component, runs logic
```

**Entities** are lightweight containers identified by a numeric ID. They hold **Components** — pure data objects with no behavior. **Systems** query entities by component type and implement the actual logic (movement, physics, rendering, etc.). The **World** ties everything together and drives the frame loop.

## API Reference

### World

```typescript
const world = new World(container: HTMLElement, options?: ThreeManagerOptions);
```

| Method | Description |
|--------|-------------|
| `start()` | Start the rendering loop and all systems |
| `stop()` | Stop the loop and all systems |
| `pause()` | Pause system updates (rendering continues) |
| `resume()` | Resume after pause |
| `destroy()` | Stop, remove all entities, clear listeners |
| `createEntity()` | Create a plain entity |
| `createVisibleEntity()` | Create an entity with a 3D model in the scene |
| `registerSystem(system)` | Register a custom system |
| `on(event, callback)` | Subscribe to an event |
| `off(event, callback)` | Unsubscribe from an event |

### Entity

| Method | Description |
|--------|-------------|
| `addComponent(comp)` | Add a single component |
| `addComponents([...])` | Batch-add multiple components |
| `removeComponent(comp)` | Remove a single component |
| `removeComponents([...])` | Batch-remove multiple components |
| `getComponent(Class)` | Type-safe component getter |
| `hasComponent(Class)` | Check if entity has a component type |

### Component

Extend the abstract `Component` class. Each subclass **must** define a unique static `CompName`:

```typescript
import { Component } from "three_ecs";

class HealthComponent extends Component {
  public static CompName = "HealthComponent";
  constructor(public hp: number = 100) {
    super();
  }
}
```

### System

Extend the abstract `System` class and implement lifecycle methods:

```typescript
import { System } from "three_ecs";

class DamageSystem extends System {
  public layer = 20; // execution priority (0 = first, 49 = last)

  private static instance: DamageSystem;
  public static GetInstance(): DamageSystem {
    if (!DamageSystem.instance) DamageSystem.instance = new DamageSystem();
    return DamageSystem.instance;
  }

  private constructor() { super(); }

  public start(): void { /* one-time setup */ }
  public update(delta: number): void { /* every frame, before render */ }
  public lateUpdate(delta: number): void { /* every frame, after render */ }
  public pause(): void { }
  public stop(): void { }
}

// Register it
world.registerSystem(DamageSystem.GetInstance());
```

## Built-in Components & Systems

### Components

| Component | Description |
|-----------|-------------|
| `ModelComponent` | Holds a `THREE.Group` as the entity's 3D model |
| `TransformComponent` | References to position, rotation, scale of the model |
| `VelocityComponent` | Linear velocity (x, y, z) |
| `GravityComponent` | Gravity acceleration, toggleable via `enabled` |

### Systems

| System | Layer | Description |
|--------|-------|-------------|
| `EventSystem` | 0 | Processes queued events (up to 20 per frame) |
| `GravitySystem` | 10 | Applies gravity to velocity for entities with `GravityComponent` |
| `MoveSystem` | 15 | Applies velocity to position for entities with `VelocityComponent` |

### Entities

| Entity | Description |
|--------|-------------|
| `VisibleEntity` | Entity pre-configured with `ModelComponent` + `TransformComponent` |

## Configuration

Pass options to customize the Three.js setup:

```typescript
const world = new World(container, {
  antialias: true,
  skybox: false,
  ambientLight: { color: 0xffffff, intensity: 0.8 },
  camera: {
    fov: 60,
    near: 0.1,
    far: 10000,
    position: [0, 5, 10],
    up: [0, 1, 0],
  },
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `antialias` | `boolean` | `false` | Enable WebGL antialiasing |
| `skybox` | `boolean` | `true` | Show gradient skybox |
| `ambientLight` | `{ color, intensity } \| false` | `{ 0xffffff, 0.5 }` | Ambient light config, or `false` to disable |
| `camera` | `object` | See defaults | Perspective camera settings |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run `npm run build` to verify compilation
5. Submit a pull request

## License

[MIT](LICENSE)
