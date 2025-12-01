# 错误处理和调试指南

## 概述

良好的错误处理和调试机制是构建健壮应用程序的关键。本指南介绍 ThreeECS 框架的错误处理策略、调试技巧和故障排除方法。

## 框架异常类型

### 预定义异常

框架定义了特定的异常类型来处理常见错误情况：

```typescript
import { AlreadyExistsError, EmptyError, NotFoundError } from '@engine/types/exception';
```

#### AlreadyExistsError

当尝试添加重复组件或重复注册系统时抛出：

```typescript
try {
  entity.addComponents([new TransformComponent(), new TransformComponent()]);
} catch (error) {
  if (error instanceof AlreadyExistsError) {
    console.error('组件已存在:', error.message);
    // 处理重复组件错误
  }
}
```

#### NotFoundError

当请求的资源不存在时抛出：

```typescript
try {
  const system = systemsManager.getSystem('NonExistentSystem');
} catch (error) {
  if (error instanceof NotFoundError) {
    console.error('系统未找到:', error.message);
    // 处理未找到的系统
  }
}
```

#### EmptyError

当集合为空但期望有元素时抛出：

```typescript
try {
  const firstEntity = entitiesManager.getFirstEntity();
} catch (error) {
  if (error instanceof EmptyError) {
    console.log('没有实体存在，这是正常的初始状态');
  }
}
```

## 错误处理策略

### 防御性编程

在系统和组件中实现防御性检查：

```typescript
export class SafeSystem extends System {
  public Update(delta: number): void {
    try {
      const entities = this.entitiesM.getEntitiesWithComponent([RequiredComponent.CompName]);

      for (const entity of entities.values()) {
        this.processEntitySafely(entity);
      }
    } catch (error) {
      console.error(`系统 ${this.constructor.name} 更新失败:`, error);
      // 继续执行，不让单个系统错误影响整个应用
    }
  }

  private processEntitySafely(entity: Entity): void {
    try {
      // 检查组件是否存在
      const component = entity.components.get(RequiredComponent.CompName);
      if (!component) {
        console.warn(`实体 ${entity.id} 缺少必需组件`);
        return;
      }

      // 类型检查
      if (!(component instanceof RequiredComponent)) {
        console.error(`实体 ${entity.id} 的组件类型不正确`);
        return;
      }

      // 处理逻辑...
      this.processComponent(component);
    } catch (error) {
      console.error(`处理实体 ${entity.id} 时出错:`, error);
      // 可以选择移除有问题的实体或组件
    }
  }

  private processComponent(component: RequiredComponent): void {
    // 实际的业务逻辑
  }
}
```

### 优雅降级

当功能失败时提供备选方案：

```typescript
export class ResilientRenderingSystem extends System {
  public Update(delta: number): void {
    const entities = this.entitiesM.getEntitiesWithComponent([ModelComponent.CompName]);

    for (const entity of entities.values()) {
      try {
        this.renderEntity(entity);
      } catch (renderError) {
        console.warn(`渲染实体 ${entity.id} 失败，使用备选方案:`, renderError);
        this.renderFallback(entity);
      }
    }
  }

  private renderEntity(entity: Entity): void {
    const model = entity.components.get(ModelComponent.CompName) as ModelComponent;
    // 正常的渲染逻辑...

    if (!model.model.visible) {
      throw new Error('模型不可见');
    }
  }

  private renderFallback(entity: Entity): void {
    // 备选渲染方案，比如显示占位符
    const fallbackGeometry = new BoxGeometry(0.1, 0.1, 0.1);
    const fallbackMaterial = new MeshBasicMaterial({ color: 0xff0000 });
    const fallbackMesh = new Mesh(fallbackGeometry, fallbackMaterial);

    // 添加到场景...
  }
}
```

## 调试技巧

### 日志记录

实现结构化的日志记录：

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

class Logger {
  private static level: LogLevel = LogLevel.INFO;

  static debug(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }

  static info(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  static warn(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  static error(message: string, ...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
}

// 在系统中使用
export class DebuggableSystem extends System {
  public Update(delta: number): void {
    Logger.debug(`系统 ${this.constructor.name} 开始更新`);

    const entities = this.entitiesM.getEntitiesWithComponent([TargetComponent.CompName]);
    Logger.debug(`找到 ${entities.size} 个目标实体`);

    for (const entity of entities.values()) {
      try {
        this.processEntity(entity);
        Logger.debug(`成功处理实体 ${entity.id}`);
      } catch (error) {
        Logger.error(`处理实体 ${entity.id} 失败:`, error);
      }
    }

    Logger.debug(`系统 ${this.constructor.name} 更新完成`);
  }
}
```

### 断言和验证

在开发阶段使用断言来捕获逻辑错误：

```typescript
class Assert {
  static isTrue(condition: boolean, message: string = '断言失败'): void {
    if (!condition) {
      throw new Error(`断言失败: ${message}`);
    }
  }

  static isNotNull(value: any, message: string = '值不能为空'): void {
    if (value === null || value === undefined) {
      throw new Error(`断言失败: ${message}`);
    }
  }

  static isInstanceOf(value: any, type: Function, message?: string): void {
    if (!(value instanceof type)) {
      throw new Error(`断言失败: 期望 ${type.name}, 实际 ${value?.constructor?.name || 'null'}`);
    }
  }
}

// 在代码中使用断言
export class ValidatedSystem extends System {
  public Update(delta: number): void {
    Assert.isTrue(delta > 0, 'delta 必须大于 0');
    Assert.isNotNull(this.entitiesM, '实体管理器不能为空');

    const entities = this.entitiesM.getEntitiesWithComponent([RequiredComponent.CompName]);
    Assert.isNotNull(entities, '查询结果不能为空');

    for (const entity of entities.values()) {
      Assert.isInstanceOf(entity, Entity, '必须是 Entity 实例');

      const component = entity.components.get(RequiredComponent.CompName);
      Assert.isNotNull(component, `实体 ${entity.id} 缺少必需组件`);

      this.processComponent(component as RequiredComponent);
    }
  }
}
```

## 事件调试

### 事件监听器调试

跟踪事件监听器的添加和移除：

```typescript
class EventDebugger {
  private static listeners: Map<string, Function[]> = new Map();

  static addListener(event: string, handler: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);

    console.log(`添加事件监听器: ${event}, 总监听器数: ${this.listeners.get(event)!.length}`);
  }

  static removeListener(event: string, handler: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(handler);
      if (index > -1) {
        eventListeners.splice(index, 1);
        console.log(`移除事件监听器: ${event}, 剩余监听器数: ${this.listeners.get(event)!.length}`);
      }
    }
  }

  static logEventStats(): void {
    console.table(
      Array.from(this.listeners.entries()).map(([event, listeners]) => ({
        事件: event,
        监听器数: listeners.length
      }))
    );
  }
}

// 包装 EventManager
const originalAddListener = EventManager.prototype.addEventListener;
const originalRemoveListener = EventManager.prototype.removeEventListener;

EventManager.prototype.addEventListener = function(event: string, handler: Function) {
  EventDebugger.addListener(event, handler);
  return originalAddListener.call(this, event, handler);
};

EventManager.prototype.removeEventListener = function(event: string, handler: Function) {
  EventDebugger.removeListener(event, handler);
  return originalRemoveListener.call(this, event, handler);
};
```

### 事件触发跟踪

记录所有事件触发：

```typescript
class EventTracer {
  private static traceEnabled: boolean = false;

  static enableTracing(): void {
    this.traceEnabled = true;
  }

  static disableTracing(): void {
    this.traceEnabled = false;
  }

  static trace(event: string, payload?: any): void {
    if (this.traceEnabled) {
      console.log(`[EVENT] ${event}`, payload ? JSON.stringify(payload, null, 2) : '');
    }
  }
}

// 在 EventManager 中集成跟踪
const originalDispatch = EventManager.prototype.dispatch;
EventManager.prototype.dispatch = function(event: string, payload?: any) {
  EventTracer.trace(event, payload);
  return originalDispatch.call(this, event, payload);
};
```

## 性能调试

### 系统性能分析

```typescript
class SystemProfiler {
  private static profiles: Map<string, { calls: number, totalTime: number, maxTime: number }> = new Map();

  static start(systemName: string): () => void {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;

      if (!this.profiles.has(systemName)) {
        this.profiles.set(systemName, { calls: 0, totalTime: 0, maxTime: 0 });
      }

      const profile = this.profiles.get(systemName)!;
      profile.calls++;
      profile.totalTime += duration;
      profile.maxTime = Math.max(profile.maxTime, duration);
    };
  }

  static report(): void {
    console.table(
      Array.from(this.profiles.entries()).map(([name, profile]) => ({
        系统: name,
        调用次数: profile.calls,
        平均时间: `${(profile.totalTime / profile.calls).toFixed(2)}ms`,
        最大时间: `${profile.maxTime.toFixed(2)}ms`,
        总时间: `${profile.totalTime.toFixed(2)}ms`
      }))
    );
  }
}

// 在系统中使用
export class ProfiledSystem extends System {
  public Update(delta: number): void {
    const endProfile = SystemProfiler.start(this.constructor.name);

    // 系统逻辑...

    endProfile();
  }
}
```

## 常见问题和解决方案

### 内存泄漏

**问题**: 实体或组件没有被正确清理
**解决方案**:
- 使用对象池复用实例
- 在系统停止时清理事件监听器
- 定期检查实体引用

**调试方法**:
```typescript
// 检查实体数量增长
setInterval(() => {
  const entityCount = entitiesManager.getAllEntities().size;
  console.log(`当前实体数量: ${entityCount}`);
}, 5000);
```

### 性能问题

**问题**: 帧率下降或卡顿
**解决方案**:
- 使用 SystemProfiler 识别慢系统
- 实现对象池减少垃圾回收
- 优化组件查询

**调试方法**:
```typescript
// 监控帧率
let lastTime = 0;
let frameCount = 0;

function monitorFPS() {
  const now = performance.now();
  frameCount++;

  if (now - lastTime >= 1000) {
    const fps = (frameCount * 1000) / (now - lastTime);
    console.log(`FPS: ${fps.toFixed(1)}`);
    frameCount = 0;
    lastTime = now;
  }

  requestAnimationFrame(monitorFPS);
}

monitorFPS();
```

### 组件查询问题

**问题**: 查询返回意外结果
**解决方案**:
- 检查组件名称拼写
- 验证组件已正确添加到实体
- 使用调试日志跟踪查询过程

**调试方法**:
```typescript
const entities = entitiesManager.getEntitiesWithComponent([TargetComponent.CompName]);
console.log(`查询到 ${entities.size} 个实体`);

for (const entity of entities.values()) {
  console.log(`实体 ${entity.id} 有组件:`, Array.from(entity.components.keys()));
}
```

## 开发环境设置

### 调试构建

启用详细日志和断言：

```typescript
// 在开发环境中
if (process.env.NODE_ENV === 'development') {
  Logger.level = LogLevel.DEBUG;
  Assert.enable(); // 如果实现断言启用
  EventTracer.enableTracing();
}
```

### 错误边界

在应用层面实现错误边界：

```typescript
class GameErrorBoundary {
  static wrap(fn: Function, context: string): Function {
    return (...args: any[]) => {
      try {
        return fn.apply(null, args);
      } catch (error) {
        console.error(`错误发生在 ${context}:`, error);
        // 可以发送错误报告、显示用户友好的错误信息等
        this.handleError(error, context);
      }
    };
  }

  private static handleError(error: Error, context: string): void {
    // 错误处理逻辑
    // 比如显示错误对话框、重启系统等
  }
}

// 包装系统方法
const safeUpdate = GameErrorBoundary.wrap(system.update.bind(system), 'MoveSystem.update');
```

## 最佳实践

### 1. 及早失败
- 在错误发生时立即抛出异常
- 不要隐藏或忽略错误
- 提供清晰的错误消息

### 2. 渐进增强
- 从基本功能开始，逐步添加错误处理
- 确保核心功能在异常情况下仍能工作
- 提供合理的默认行为

### 3. 监控和日志
- 在生产环境中保持必要的日志
- 监控关键性能指标
- 定期审查错误日志

### 4. 测试驱动
- 为错误情况编写测试
- 使用断言验证假设
- 进行边界条件测试

### 5. 用户体验
- 为用户提供有意义的错误信息
- 实现优雅的错误恢复
- 避免应用崩溃

通过遵循这些错误处理和调试的最佳实践，可以构建更加健壮和可维护的 ThreeECS 应用程序。
