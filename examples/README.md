# ThreeECS 常见用例解决方案

本目录包含各种常见应用场景的完整解决方案，每个示例都展示了如何使用 ThreeECS 框架解决实际问题。

## 📚 示例目录

### 🎮 游戏开发

#### [2D 平台游戏](./platformer-game.md)
- 完整的 2D 平台游戏实现
- 玩家控制、物理碰撞、动画系统
- 关卡设计和游戏状态管理

#### [粒子效果系统](./particle-system.md)
- GPU 加速的粒子渲染
- 多种发射器类型（点、圆形、矩形）
- 性能优化的实例化渲染

#### [塔防游戏](./tower-defense.md)
- 路径寻找 AI
- 实时策略游戏机制
- 资源管理和升级系统

### 🎨 可视化应用

#### [3D 数据可视化](./data-visualization.md)
- 大数据集的 3D 表示
- 交互式数据探索
- 实时数据更新和动画

#### [建筑可视化](./architecture-viz.md)
- BIM 模型加载和显示
- 建筑漫游和测量工具
- 材质和光照系统

#### [科学模拟](./scientific-simulation.md)
- 物理模拟和动画
- 数据驱动的可视化
- 实时参数调整

### 🛠️ 工具和编辑器

#### [3D 场景编辑器](./scene-editor.md)
- 拖拽式对象放置
- 属性面板和实时预览
- 场景保存和加载

#### [动画编辑器](./animation-editor.md)
- 关键帧动画制作
- 骨骼动画系统
- 动画混合和过渡

#### [材质编辑器](./material-editor.md)
- PBR 材质设计
- 实时材质预览
- 材质库管理

## 🚀 快速开始

### 运行示例

```bash
# 克隆仓库
git clone https://github.com/WalleyZhang/three_ecs.git
cd three_ecs

# 安装依赖
npm install

# 运行特定示例
cd examples/particle-system
npm install
npm run dev
```

### 示例结构

每个示例都包含：

```
example-name/
├── src/
│   ├── components/     # 自定义组件
│   ├── systems/        # 自定义系统
│   ├── utils/          # 工具函数
│   ├── App.tsx         # 主应用组件
│   └── main.tsx        # 入口文件
├── public/             # 静态资源
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 示例说明
```

## 🏗️ 核心概念演示

### 实体管理

```typescript
// 创建玩家实体
const player = world.createVisibleEntity()
player.addComponents([
  new TransformComponent(new Vector3(0, 0, 0), new Euler(), new Vector3(1, 1, 1)),
  new VelocityComponent(0, 0, 0),
  new HealthComponent(100),
  new PlayerInputComponent()
])
```

### 组件系统

```typescript
// 自定义组件
export class WeaponComponent extends Component {
  public static CompName = "WeaponComponent"

  public damage: number = 25
  public fireRate: number = 5 // shots per second
  public lastFired: number = 0
}

// 使用组件
const weapon = entity.components.get(WeaponComponent.CompName) as WeaponComponent
if (currentTime - weapon.lastFired > 1000 / weapon.fireRate) {
  // 发射子弹
  weapon.lastFired = currentTime
}
```

### 系统架构

```typescript
export class CombatSystem extends System {
  public layer: number = 30 // 在物理之后，渲染之前

  public Update(delta: number): void {
    // 处理战斗逻辑
    const attackers = this.entitiesM.getEntitiesWithComponent([
      WeaponComponent.CompName,
      TargetComponent.CompName
    ])

    for (const attacker of attackers.values()) {
      this.processCombat(attacker, delta)
    }
  }

  private processCombat(attacker: Entity, delta: number): void {
    // 战斗处理逻辑
  }
}
```

## 🎯 最佳实践

### 性能优化

1. **对象池**: 复用实体和组件实例
2. **组件查询缓存**: 避免频繁查询
3. **批量操作**: 一次性处理多个实体
4. **LOD 系统**: 根据距离调整细节层次

### 代码组织

1. **单一职责**: 每个组件和系统只负责一个功能
2. **依赖注入**: 通过组件接口解耦
3. **事件驱动**: 使用事件系统进行通信
4. **类型安全**: 充分利用 TypeScript 类型检查

### 错误处理

```typescript
export class SafeSystem extends System {
  public Update(delta: number): void {
    try {
      this.performUpdate(delta)
    } catch (error) {
      console.error(`系统错误: ${this.constructor.name}`, error)
      // 优雅降级或错误恢复
    }
  }
}
```

## 🔧 开发工具

### 调试工具

```typescript
// 实体检查器
class EntityInspector {
  static logEntity(entity: Entity): void {
    console.group(`实体 ${entity.id} (${entity.name})`)
    console.log('位置:', entity.transformComponent?.position)
    console.log('组件:', Array.from(entity.components.keys()))
    console.groupEnd()
  }
}

// 系统性能监控
class SystemProfiler {
  private static timings: Map<string, number[]> = new Map()

  static start(systemName: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      if (!this.timings.has(systemName)) {
        this.timings.set(systemName, [])
      }
      this.timings.get(systemName)!.push(duration)
    }
  }

  static report(): void {
    for (const [name, times] of this.timings) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length
      console.log(`${name}: 平均 ${avg.toFixed(2)}ms`)
    }
  }
}
```

## 📊 性能基准

### 测试结果

| 示例 | 实体数量 | FPS | 内存使用 |
|------|----------|-----|----------|
| 粒子系统 | 10,000 | 60 | 45MB |
| 平台游戏 | 500 | 60 | 25MB |
| 数据可视化 | 50,000 | 30 | 120MB |
| 建筑可视化 | 100,000 | 25 | 200MB |

*测试环境: Intel i7-9700K, RTX 3070, 32GB RAM*

## 🤝 贡献示例

我们欢迎社区贡献新的示例！

### 贡献步骤

1. **选择主题**: 确定示例的主题和复杂度
2. **创建结构**: 按照标准目录结构创建示例
3. **编写代码**: 提供清晰、可读的代码
4. **添加文档**: 包含详细的 README 和注释
5. **测试兼容性**: 确保在不同浏览器中工作
6. **提交 PR**: 按照贡献指南提交

### 示例标准

- ✅ **完整性**: 示例应该可以直接运行
- ✅ **文档化**: 包含详细的使用说明
- ✅ **模块化**: 代码应该易于理解和修改
- ✅ **性能**: 展示最佳实践和优化技巧
- ✅ **教育性**: 解释概念和设计决策

## 📞 获取帮助

- **示例问题**: 在相应示例的 issue 中报告
- **一般问题**: 使用 [GitHub Discussions](https://github.com/WalleyZhang/three_ecs/discussions)
- **性能问题**: 分享您的系统规格和使用场景

---

🎮 **准备探索这些示例了吗？从 [粒子系统](./particle-system.md) 开始您的 ThreeECS 冒险之旅！**
