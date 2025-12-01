# 组件和系统使用指南

## 组件系统

### 基础组件

#### TransformComponent

描述实体的位置、旋转和缩放变换。

```typescript
import { TransformComponent } from '@engine/base';
import { Vector3, Euler } from 'three';

// 创建变换组件
const transform = new TransformComponent(
  new Vector3(0, 0, 0),    // 位置
  new Euler(0, 0, 0),      // 旋转
  new Vector3(1, 1, 1)     // 缩放
);

// 添加到实体
entity.addComponents([transform]);
```

**属性**:
- `position`: Vector3 - 实体在世界坐标系中的位置
- `rotation`: Euler - 实体的旋转角度（弧度）
- `scale`: Vector3 - 实体在每个轴上的缩放比例

#### VelocityComponent

定义实体的运动速度向量。

```typescript
import { VelocityComponent } from '@engine/base';

// 创建速度组件 (x, y, z 方向的速度，单位：单位/秒)
const velocity = new VelocityComponent(1.0, 0.0, 0.0); // 向右移动

entity.addComponents([velocity]);
```

**属性**:
- `x`: number - X轴速度
- `y`: number - Y轴速度
- `z`: number - Z轴速度

#### ModelComponent

封装 Three.js 的 Group 对象，用于渲染。

```typescript
import { ModelComponent } from '@engine/base';
import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';

const modelComponent = new ModelComponent();

// 创建几何体和材质
const geometry = new BoxGeometry(1, 1, 1);
const material = new MeshBasicMaterial({ color: 0x00ff00 });
const mesh = new Mesh(geometry, material);

// 添加到模型组件
modelComponent.model.add(mesh);

entity.addComponents([modelComponent]);
```

**属性**:
- `model`: Group - Three.js 组对象，包含所有渲染元素

#### GravityComponent

定义重力加速度（目前未实现具体逻辑）。

```typescript
import { GravityComponent } from '@engine/base';

const gravity = new GravityComponent();
entity.addComponents([gravity]);
```

### 自定义组件创建

要创建自定义组件，需要继承 Component 基类：

```typescript
import { Component } from '@engine/core';

export class HealthComponent extends Component {
  public static CompName = "HealthComponent";

  public currentHealth: number;
  public maxHealth: number;

  constructor(maxHealth: number = 100) {
    super();
    this.currentHealth = maxHealth;
    this.maxHealth = maxHealth;
  }

  // 可以添加辅助方法
  public takeDamage(amount: number): void {
    this.currentHealth = Math.max(0, this.currentHealth - amount);
  }

  public heal(amount: number): void {
    this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
  }
}
```

**重要规则**:
1. 必须定义静态 `CompName` 属性，且全局唯一
2. 只包含数据，不包含逻辑（业务逻辑应在系统中实现）
3. 提供合理的默认值
4. 使用合适的数据类型

## 系统系统

### 基础系统

#### MoveSystem

处理具有 VelocityComponent 和 TransformComponent 的实体移动。

**自动处理**:
- 根据速度向量更新位置
- 时间基准归一化（毫秒转秒）
- 只处理具有所需组件的实体

**使用示例**:
```typescript
// MoveSystem 自动注册，不需要手动创建
// 只需要给实体添加相应的组件即可
entity.addComponents([
  new TransformComponent(new Vector3(0, 0, 0), new Euler(), new Vector3(1, 1, 1)),
  new VelocityComponent(1, 0, 0) // 每秒向右移动1个单位
]);
```

#### GravitySystem

处理重力效果（目前为占位符实现）。

#### EventSystem

管理事件分发和处理。

### 自定义系统创建

创建自定义系统需要继承 System 基类：

```typescript
import { System } from '@engine/core';
import { HealthComponent, DamageComponent } from './components';

export class HealthSystem extends System {
  public layer: number = 20; // 在 MoveSystem (15) 之后执行

  public Start(): void {
    // 初始化逻辑
    console.log('Health system started');
  }

  public Update(delta: number): void {
    // 获取有健康组件的实体
    const entities = this.entitiesM.getEntitiesWithComponent([HealthComponent.CompName]);

    for (const entity of entities.values()) {
      const health = entity.components.get(HealthComponent.CompName) as HealthComponent;

      // 处理生命值相关逻辑
      if (health.currentHealth <= 0) {
        // 实体死亡处理
        this.entitiesM.removeEntity(entity);
      }
    }
  }

  public LateUpdate(delta: number): void {
    // 延迟更新逻辑（如果需要）
  }

  public Pause(): void {
    // 暂停时的处理
  }

  public Stop(): void {
    // 停止时的清理
  }
}
```

### 系统注册

自定义系统需要手动注册到世界：

```typescript
const world = new World(container);
world.start();

// 注册自定义系统
world.systemsManager.registerSystem(new HealthSystem());
world.systemsManager.registerSystem(new AISystem());
```

## 组件查询

### 基础查询

```typescript
import { EntitiesManager } from '@engine/managers';

// 获取实体管理器实例
const entitiesM = EntitiesManager.GetInstance();

// 查询具有特定组件的实体
const movableEntities = entitiesM.getEntitiesWithComponent([
  TransformComponent.CompName,
  VelocityComponent.CompName
]);

// 遍历实体
for (const entity of movableEntities.values()) {
  const transform = entity.components.get(TransformComponent.CompName) as TransformComponent;
  const velocity = entity.components.get(VelocityComponent.CompName) as VelocityComponent;

  // 处理实体...
}
```

### 高级查询模式

```typescript
// 查询有健康但没有无敌组件的实体
const vulnerableEntities = entitiesM.getEntitiesWithComponent([
  HealthComponent.CompName
]).filter(entity => !entity.components.has(InvincibleComponent.CompName));

// 查询所有实体
const allEntities = entitiesM.getAllEntities();
```

## 事件系统

### 监听事件

```typescript
import { EventManager } from '@engine/managers';
import { ExternalEvent, ExternalEventPayload } from '@engine/types';

const eventM = EventManager.GetInstance();

// 监听外部事件
eventM.addEventListener(ExternalEvent.CUSTOM_EVENT, (payload: ExternalEventPayload[ExternalEvent.CUSTOM_EVENT]) => {
  console.log('Received custom event:', payload);
});
```

### 触发事件

```typescript
// 触发自定义事件
eventM.dispatch(ExternalEvent.CUSTOM_EVENT, {
  message: 'Hello from system!',
  timestamp: Date.now()
});
```

### 预定义事件

**内部事件** (InternalEvent):
- `ENTITY_COMPONENT_ADDED`: 组件添加到实体时
- `ENTITY_COMPONENT_REMOVED`: 组件从实体移除时

**外部事件** (ExternalEvent):
- `WORLD_STARTED`: 世界启动时
- `WORLD_STOPPED`: 世界停止时
- `WORLD_PAUSED`: 世界暂停时
- `WORLD_RESUMED`: 世界恢复时
- `WORLD_DESTROYED`: 世界销毁时

## 最佳实践

### 组件设计

1. **单一职责**: 每个组件只负责一种类型的数据
2. **最小化**: 只包含必要的数据字段
3. **序列化友好**: 使用可序列化的数据类型
4. **默认值**: 提供合理的默认值

### 系统设计

1. **明确职责**: 每个系统处理特定的组件组合
2. **性能意识**: 避免不必要的计算
3. **错误处理**: 妥善处理异常情况
4. **优先级合理**: 设置合适的执行顺序

### 查询优化

1. **缓存结果**: 避免重复查询
2. **缩小范围**: 使用最具体的组件组合
3. **批量处理**: 一次性处理多个实体
4. **条件过滤**: 在遍历前进行预过滤

### 事件使用

1. **最小化监听**: 只监听需要的事件
2. **清理监听器**: 在系统停止时移除监听器
3. **类型安全**: 使用正确的类型定义
4. **异步友好**: 考虑事件的异步特性

## 常见模式

### 组件组合模式

```typescript
// 玩家实体组合
entity.addComponents([
  new TransformComponent(new Vector3(0, 0, 0), new Euler(), new Vector3(1, 1, 1)),
  new VelocityComponent(0, 0, 0),
  new HealthComponent(100),
  new PlayerInputComponent()
]);
```

### 系统协作模式

```typescript
// 物理系统在运动系统之前执行
export class PhysicsSystem extends System {
  public layer: number = 10; // 先于 MoveSystem (15) 执行
}

export class MoveSystem extends System {
  public layer: number = 15; // 使用物理计算结果
}
```

### 状态机模式

```typescript
export class AIStateMachine extends Component {
  public static CompName = "AIStateMachine";

  public currentState: string = 'idle';
  public states: Map<string, () => void> = new Map();
}
```

这个指南为使用和扩展 ThreeECS 框架的组件和系统提供了完整的参考。
