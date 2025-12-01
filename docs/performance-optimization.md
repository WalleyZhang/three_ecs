# 性能优化最佳实践

## 概述

ThreeECS 框架在设计时就考虑了性能因素。本指南提供了一系列优化技术和最佳实践，帮助开发者构建高性能的 3D 应用程序。

## 内存管理

### 对象池模式

避免频繁的对象创建和销毁，使用对象池来复用实例：

```typescript
class EntityPool {
  private pool: Entity[] = [];
  private maxSize: number = 1000;

  public get(): Entity {
    return this.pool.pop() || new Entity();
  }

  public release(entity: Entity): void {
    if (this.pool.length < this.maxSize) {
      // 重置实体状态
      entity.name = "Entity";
      entity.components.clear();
      this.pool.push(entity);
    }
  }
}

// 使用示例
const entityPool = new EntityPool();

function createTemporaryEntity(): Entity {
  const entity = entityPool.get();
  // 使用实体...
  return entity;
}

function destroyTemporaryEntity(entity: Entity): void {
  entityPool.release(entity);
}
```

### 组件复用

对于频繁使用的组件类型，考虑复用实例：

```typescript
class ComponentPool<T extends Component> {
  private pool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T) {
    this.factory = factory;
  }

  public get(): T {
    return this.pool.pop() || this.factory();
  }

  public release(component: T): void {
    // 重置组件状态
    this.pool.push(component);
  }
}

// 使用示例
const transformPool = new ComponentPool(() =>
  new TransformComponent(new Vector3(), new Euler(), new Vector3(1, 1, 1))
);
```

## 查询优化

### 缓存查询结果

避免在每一帧都执行相同的查询：

```typescript
export class CachedQuerySystem extends System {
  private cachedEntities: Set<Entity> | null = null;
  private lastQueryTime: number = 0;
  private cacheTimeout: number = 100; // 毫秒

  public Update(delta: number): void {
    const now = Date.now();

    // 检查缓存是否过期
    if (!this.cachedEntities || (now - this.lastQueryTime) > this.cacheTimeout) {
      this.cachedEntities = this.entitiesM.getEntitiesWithComponent([
        TransformComponent.CompName,
        VelocityComponent.CompName
      ]);
      this.lastQueryTime = now;
    }

    // 使用缓存的实体集合
    for (const entity of this.cachedEntities.values()) {
      // 处理实体...
    }
  }
}
```

### 增量查询

只查询新添加或修改的实体：

```typescript
export class IncrementalQuerySystem extends System {
  private processedEntities: Set<number> = new Set();

  public Start(): void {
    // 监听实体组件变化事件
    EventManager.GetInstance().addEventListener(
      InternalEvent.ENTITY_COMPONENT_ADDED,
      this.onEntityChanged.bind(this)
    );
  }

  private onEntityChanged(payload: InternalEventPayload[InternalEvent.ENTITY_COMPONENT_ADDED]): void {
    // 标记实体为需要处理
    this.processedEntities.delete(payload.entity.id);
  }

  public Update(delta: number): void {
    // 只处理未处理的实体
    const allEntities = this.entitiesM.getEntitiesWithComponent([TargetComponent.CompName]);

    for (const entity of allEntities.values()) {
      if (!this.processedEntities.has(entity.id)) {
        // 处理新实体或更新的实体
        this.processEntity(entity);
        this.processedEntities.add(entity.id);
      }
    }
  }

  private processEntity(entity: Entity): void {
    // 实体处理逻辑
  }
}
```

## 系统优化

### 批量操作

使用批量操作减少函数调用开销：

```typescript
export class BatchProcessSystem extends System {
  private pendingUpdates: Array<{entity: Entity, data: any}> = [];

  public Update(delta: number): void {
    // 收集需要更新的实体
    const entities = this.entitiesM.getEntitiesWithComponent([TargetComponent.CompName]);

    for (const entity of entities.values()) {
      const component = entity.components.get(TargetComponent.CompName) as TargetComponent;
      this.pendingUpdates.push({
        entity,
        data: component.someData
      });
    }

    // 批量处理
    this.processBatch(this.pendingUpdates);

    // 清空待处理列表
    this.pendingUpdates.length = 0;
  }

  private processBatch(updates: Array<{entity: Entity, data: any}>): void {
    // 批量处理逻辑，可以利用 SIMD 或其他优化
    for (const update of updates) {
      // 处理单个更新...
    }
  }
}
```

### 系统优先级优化

合理安排系统执行顺序，减少缓存失效：

```typescript
// 优化执行顺序：物理 -> 碰撞检测 -> 渲染更新 -> 后期效果
export class PhysicsSystem extends System {
  public layer: number = 10; // 最先执行
}

export class CollisionSystem extends System {
  public layer: number = 15; // 在物理之后
}

export class RenderSystem extends System {
  public layer: number = 40; // 在逻辑处理之后
}

export class PostEffectSystem extends System {
  public layer: number = 45; // 最后执行
}
```

## Three.js 优化

### 几何体实例化

对于相同几何体的多个对象，使用实例化渲染：

```typescript
import { InstancedMesh, Matrix4 } from 'three';

export class InstancedRenderingSystem extends System {
  private instancedMesh: InstancedMesh;
  private matrices: Matrix4[] = [];

  public Start(): void {
    // 创建实例化网格
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0xffffff });
    this.instancedMesh = new InstancedMesh(geometry, material, 1000);

    // 添加到场景
    ThreeManager.GetInstance().scene.add(this.instancedMesh);
  }

  public Update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([
      TransformComponent.CompName,
      ModelComponent.CompName
    ]);

    let instanceIndex = 0;
    for (const entity of entities.values()) {
      const transform = entity.components.get(TransformComponent.CompName) as TransformComponent;

      // 更新实例变换矩阵
      const matrix = new Matrix4();
      matrix.setPosition(transform.position);
      matrix.scale(transform.scale);
      // 设置旋转...

      this.instancedMesh.setMatrixAt(instanceIndex, matrix);
      instanceIndex++;
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    this.instancedMesh.count = instanceIndex;
  }
}
```

### 视锥剔除

实现基本的视锥剔除以避免渲染不可见对象：

```typescript
export class FrustumCullingSystem extends System {
  private camera: Camera;
  private frustum: Frustum;

  public Start(): void {
    this.camera = ThreeManager.GetInstance().camera;
    this.frustum = new Frustum();
  }

  public Update(delta: number): void {
    // 更新视锥
    const matrix = new Matrix4().multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );
    this.frustum.setFromProjectionMatrix(matrix);

    const entities = this.entitiesM.getEntitiesWithComponent([ModelComponent.CompName]);

    for (const entity of entities.values()) {
      const model = entity.components.get(ModelComponent.CompName) as ModelComponent;

      // 检查模型是否在视锥内
      const inFrustum = this.frustum.intersectsObject(model.model);

      // 设置可见性
      model.model.visible = inFrustum;
    }
  }
}
```

### 细节层次 (LOD)

根据距离实现不同细节层次：

```typescript
export class LODSystem extends System {
  private camera: Camera;

  public Start(): void {
    this.camera = ThreeManager.GetInstance().camera;
  }

  public Update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([
      TransformComponent.CompName,
      LODComponent.CompName
    ]);

    for (const entity of entities.values()) {
      const transform = entity.components.get(TransformComponent.CompName) as TransformComponent;
      const lod = entity.components.get(LODComponent.CompName) as LODComponent;

      // 计算距离
      const distance = this.camera.position.distanceTo(transform.position);

      // 根据距离选择 LOD 级别
      let lodLevel = 0;
      if (distance > 100) lodLevel = 2;
      else if (distance > 50) lodLevel = 1;

      // 更新模型细节层次
      this.updateLODLevel(entity, lodLevel);
    }
  }

  private updateLODLevel(entity: Entity, level: number): void {
    const model = entity.components.get(ModelComponent.CompName) as ModelComponent;

    // 切换到对应的 LOD 模型
    // 实现细节取决于具体的 LOD 组件设计
  }
}
```

## 性能监控

### 内置性能统计

```typescript
export class PerformanceMonitorSystem extends System {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameTime: number = 0;

  public Update(delta: number): void {
    this.frameCount++;
    this.frameTime += delta;

    const currentTime = performance.now();
    if (currentTime - this.lastTime >= 1000) { // 每秒更新一次
      this.fps = (this.frameCount * 1000) / (currentTime - this.lastTime);
      this.frameTime = this.frameTime / this.frameCount;

      console.log(`FPS: ${this.fps.toFixed(1)}, Frame Time: ${this.frameTime.toFixed(2)}ms`);

      this.frameCount = 0;
      this.frameTime = 0;
      this.lastTime = currentTime;
    }
  }
}
```

### 系统性能分析

```typescript
export class SystemProfiler {
  private systemTimes: Map<string, number[]> = new Map();

  public startProfile(systemName: string): void {
    this.systemTimes.set(systemName, [performance.now()]);
  }

  public endProfile(systemName: string): void {
    const times = this.systemTimes.get(systemName);
    if (times) {
      times.push(performance.now());
      const duration = times[1] - times[0];
      console.log(`${systemName}: ${duration.toFixed(2)}ms`);
    }
  }
}

// 在系统中使用
export class ProfiledSystem extends System {
  private profiler: SystemProfiler;

  public Update(delta: number): void {
    this.profiler.startProfile('MySystem');

    // 系统逻辑...

    this.profiler.endProfile('MySystem');
  }
}
```

## 内存泄漏预防

### 事件监听器清理

```typescript
export class EventAwareSystem extends System {
  private eventListeners: Array<{event: string, handler: Function}> = [];

  public Start(): void {
    // 记录添加的监听器
    const handler = this.onEntityAdded.bind(this);
    this.eventListeners.push({
      event: InternalEvent.ENTITY_COMPONENT_ADDED,
      handler
    });

    EventManager.GetInstance().addEventListener(
      InternalEvent.ENTITY_COMPONENT_ADDED,
      handler
    );
  }

  public Stop(): void {
    // 清理所有监听器
    const eventM = EventManager.GetInstance();
    for (const {event, handler} of this.eventListeners) {
      eventM.removeEventListener(event, handler);
    }
    this.eventListeners.length = 0;
  }

  private onEntityAdded(payload: any): void {
    // 处理事件...
  }
}
```

### 资源清理

```typescript
export class ResourceManagingSystem extends System {
  private resources: any[] = [];

  public Stop(): void {
    // 清理所有资源
    for (const resource of this.resources) {
      if (resource.dispose) {
        resource.dispose();
      }
    }
    this.resources.length = 0;
  }

  private addResource(resource: any): void {
    this.resources.push(resource);
  }
}
```

## 最佳实践总结

### 1. 测量优先
- 使用性能监控工具识别瓶颈
- 不要在没有数据的情况下进行优化

### 2. 内存意识
- 复用对象减少垃圾回收
- 及时清理不再使用的资源
- 监控内存使用情况

### 3. 查询优化
- 缓存频繁的查询结果
- 使用增量更新减少计算
- 考虑查询的执行频率

### 4. 系统设计
- 合理安排系统执行顺序
- 使用批量操作提高效率
- 避免不必要的计算

### 5. Three.js 特定
- 使用实例化渲染大量相同对象
- 实现视锥剔除和 LOD
- 优化几何体和材质

### 6. 持续监控
- 在开发过程中保持性能监控
- 定期审查和优化代码
- 关注用户报告的性能问题

通过应用这些优化技术和最佳实践，可以显著提高 ThreeECS 应用程序的性能和响应性。
