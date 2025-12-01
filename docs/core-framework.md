# ThreeECS 核心框架规范

## 概述

ThreeECS 是一个专为 Three.js 设计的 Entity-Component-System (ECS) 框架。它提供了一种高效、模块化的方式来构建和管理 3D 应用程序。

## 架构概览

### ECS 模式

框架采用经典的 ECS 架构模式：

- **Entity (实体)**: 游戏对象的唯一标识符，不包含数据
- **Component (组件)**: 纯数据结构，描述实体的属性
- **System (系统)**: 包含逻辑的处理单元，操作具有特定组件的实体

### 核心类层次

```
World (世界)
├── EntitiesManager (实体管理器)
├── SystemsManager (系统管理器)
├── ThreeManager (Three.js 管理器)
├── EventManager (事件管理器)
└── StateManager (状态管理器)
```

## 核心组件

### World 类

World 是框架的主要入口点，协调所有管理器的生命周期。

#### 构造函数
```typescript
constructor(container: HTMLElement, useGlobalManagers: boolean = true)
```

#### 主要方法

**生命周期控制**:
- `start()`: 启动世界，初始化所有系统
- `stop()`: 停止世界，清理资源
- `pause()`: 暂停世界更新
- `resume()`: 恢复世界更新
- `destroy()`: 销毁世界，释放所有资源

**实体创建**:
- `createVisibleEntity()`: 创建绑定 Three.js 模型的实体

#### 示例用法
```typescript
const world = new World(container);
world.start();

// 创建实体
const entity = world.createVisibleEntity();

// 使用完毕后清理
world.destroy();
```

### Entity 类

Entity 表示游戏世界中的一个对象，是组件的容器。

#### 组件管理

```typescript
// 添加组件
entity.addComponents([new TransformComponent(), new VelocityComponent()]);

// 移除组件
entity.removeComponents([VelocityComponent]);
```

#### 属性
- `id`: 唯一实体标识符
- `name`: 实体名称（可选）
- `components`: 组件映射表

### Component 抽象类

所有组件必须继承自 Component 基类。

#### 必需属性
- `static CompName`: 组件的唯一名称标识符

#### 示例组件
```typescript
export class TransformComponent extends Component {
  public static CompName = "TransformComponent";

  public position: Vector3;
  public rotation: Euler;
  public scale: Vector3;

  constructor(pos: Vector3, rot: Euler, scale: Vector3) {
    super();
    this.position = pos;
    this.rotation = rot;
    this.scale = scale;
  }
}
```

### System 抽象类

System 定义了处理特定组件逻辑的类。

#### 必需属性
- `layer`: 系统优先级 (0-49，数字越小优先级越高)

#### 必需方法
- `Start()`: 系统初始化
- `Update(delta: number)`: 每帧更新逻辑
- `LateUpdate(delta: number)`: 每帧延迟更新逻辑
- `Pause()`: 系统暂停
- `Stop()`: 系统停止

#### 示例系统
```typescript
export class MoveSystem extends System {
  public layer: number = 15;

  public Update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([VelocityComponent.CompName]);

    for (const entity of entities.values()) {
      const velocity = entity.components.get(VelocityComponent.CompName) as VelocityComponent;
      const transform = entity.components.get(TransformComponent.CompName) as TransformComponent;

      const deltaS = delta / 1000;
      transform.position.x += velocity.x * deltaS;
      // ... 其他坐标更新
    }
  }
}
```

## 管理器系统

### EntitiesManager

负责所有实体的生命周期管理和组件查询。

#### 主要功能
- 实体注册和移除
- 组件索引维护
- 高效的组件查询

#### 查询方法
```typescript
// 根据组件类型查询实体
const entities = entitiesManager.getEntitiesWithComponent([
  TransformComponent.CompName,
  VelocityComponent.CompName
]);
```

### SystemsManager

管理系统注册、优先级排序和执行顺序。

#### 系统注册
```typescript
systemsManager.registerSystem(new MoveSystem());
systemsManager.registerSystem(new GravitySystem());
```

#### 执行顺序
系统按 `layer` 属性升序执行，确保正确的更新顺序。

### ThreeManager

封装 Three.js 的场景、渲染器和相机管理。

#### 主要功能
- 场景管理和对象添加
- 渲染循环控制
- 自动尺寸调整
- 相机和控制器管理

### EventManager

提供发布-订阅模式的全局事件系统。

#### 事件类型
- **内部事件**: 框架内部状态变化通知
- **外部事件**: 应用程序级事件

#### 使用示例
```typescript
// 监听事件
eventManager.addEventListener('world_started', (payload) => {
  console.log('World started:', payload);
});

// 触发事件
eventManager.dispatch('custom_event', { data: 'value' });
```

## 生命周期和执行流程

### 启动流程
1. World 构造函数创建所有管理器实例
2. `world.start()` 被调用
3. 系统按优先级注册并初始化
4. Three.js 渲染循环启动
5. 每帧执行系统更新

### 更新循环
```
渲染帧开始
├── SystemsManager.Update()     // 所有系统更新
├── Three.js 渲染               // 场景渲染
└── SystemsManager.LateUpdate() // 所有系统延迟更新
```

### 清理流程
1. `world.stop()` 停止渲染循环
2. 系统按相反优先级顺序停止
3. 清理事件监听器
4. 释放 Three.js 资源

## 设计原则

### 单例模式
所有管理器都采用单例模式，确保全局状态一致性。

### 组件纯数据
组件只包含数据，不包含逻辑，确保可序列化和可测试性。

### 系统解耦
系统之间通过组件数据耦合，不直接依赖，确保模块化。

### 性能优先
- 组件查询使用索引优化
- 对象池减少垃圾回收
- 批量操作提高效率

## 类型安全

框架使用 TypeScript 提供完整的类型安全：

- 泛型组件查询
- 类型守卫和断言
- 接口定义的契约

## 错误处理

框架定义了特定的异常类型：

- `AlreadyExistsError`: 重复组件错误
- `EmptyError`: 空集合错误
- `NotFoundError`: 未找到错误

## 扩展性

框架设计支持扩展：

- 自定义组件继承 Component
- 自定义系统继承 System
- 插件系统架构预留接口
- 事件系统支持自定义事件

## 最佳实践

### 组件设计
- 保持组件数据结构简单
- 使用合适的数据类型
- 为组件提供有意义的默认值

### 系统设计
- 合理设置系统优先级
- 避免系统间直接依赖
- 实现完整的生命周期方法

### 性能优化
- 复用对象避免频繁创建
- 使用对象池管理实体
- 合理使用事件系统避免过度监听

这个规范文档为 ThreeECS 框架的使用和扩展提供了完整的参考指南。
