# 教程 00: Hello World

欢迎来到 ThreeECS 的世界！在本教程中，我们将创建您的第一个 ThreeECS 应用程序 - 一个显示旋转立方体的简单场景。

## 🎯 学习目标

完成本教程后，您将能够：

- 设置基本的 ThreeECS 项目
- 创建和配置 World 实例
- 添加简单的 3D 对象到场景中
- 理解基本的应用程序生命周期

## 📋 前置要求

- Node.js (版本 16 或更高)
- npm 或 yarn
- 基本的 JavaScript/TypeScript 知识

## 🚀 步骤 1: 项目设置

### 1.1 创建新项目

```bash
# 创建项目目录
mkdir three-ecs-hello-world
cd three-ecs-hello-world

# 初始化 npm 项目
npm init -y

# 安装依赖
npm install three three-ecs typescript @types/three @types/node
npm install --save-dev vite @vitejs/plugin-react tsx
```

### 1.2 配置 TypeScript

创建 `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 1.3 配置 Vite

创建 `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@engine': '/node_modules/three-ecs/src'
    }
  }
})
```

### 1.4 更新 package.json

```json
{
  "name": "three-ecs-hello-world",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

## 🏗️ 步骤 2: 创建应用程序

### 2.1 创建 HTML 文件

创建 `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ThreeECS Hello World</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
      }
      #app {
        width: 100vw;
        height: 100vh;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2.2 创建主入口文件

创建 `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 2.3 创建应用程序组件

创建 `src/App.tsx`:

```typescript
import { useEffect, useRef } from 'react'
import { World } from 'three-ecs'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'

function App() {
  const worldRef = useRef<World | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && !worldRef.current) {
      // 创建 World 实例
      worldRef.current = new World(containerRef.current)

      // 启动世界
      worldRef.current.start()

      // 创建一个可见实体
      const entity = worldRef.current.createVisibleEntity()

      // 创建一个红色立方体
      const geometry = new BoxGeometry(1, 1, 1)
      const material = new MeshBasicMaterial({ color: 0xff0000 })
      const cube = new Mesh(geometry, material)

      // 添加到实体的模型组件中
      entity.modelComponent.model.add(cube)

      // 设置立方体位置
      entity.transformComponent.position.set(0, 0, 0)
    }

    // 清理函数
    return () => {
      if (worldRef.current) {
        worldRef.current.destroy()
        worldRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#000'
      }}
    />
  )
}

export default App
```

## 🏃‍♂️ 步骤 3: 运行应用程序

### 3.1 启动开发服务器

```bash
npm run dev
```

### 3.2 查看结果

打开浏览器访问 `http://localhost:5173`，您应该看到：

- 一个黑色的背景
- 一个红色的立方体在场景中央
- 可以使用鼠标拖拽旋转视角
- 可以使用滚轮缩放

## 🔍 代码解析

### World 类

```typescript
const world = new World(containerRef.current)
```

World 是 ThreeECS 的核心类，管理整个 ECS 系统。它需要一个 DOM 元素作为 Three.js 的渲染容器。

### 实体创建

```typescript
const entity = world.createVisibleEntity()
```

`createVisibleEntity()` 创建一个具有以下组件的实体：
- `ModelComponent`: 用于 Three.js 模型
- `TransformComponent`: 用于位置、旋转、缩放

### 组件访问

```typescript
entity.modelComponent.model.add(cube)
entity.transformComponent.position.set(0, 0, 0)
```

实体通过属性提供对组件的直接访问。

## 🎨 步骤 4: 添加动画

让我们让立方体旋转起来！

### 4.1 创建旋转系统

创建 `src/RotationSystem.ts`:

```typescript
import { System } from 'three-ecs'

export class RotationSystem extends System {
  public layer: number = 20

  public Start(): void {
    console.log('Rotation system started')
  }

  public Update(delta: number): void {
    // 查找所有具有 TransformComponent 的实体
    const entities = this.entitiesM.getEntitiesWithComponent(['TransformComponent'])

    for (const entity of entities.values()) {
      // 让每个实体旋转
      entity.transformComponent.rotation.x += delta * 0.001
      entity.transformComponent.rotation.y += delta * 0.002
    }
  }

  public LateUpdate(): void {
    // 延迟更新逻辑（可选）
  }

  public Pause(): void {
    console.log('Rotation system paused')
  }

  public Stop(): void {
    console.log('Rotation system stopped')
  }
}
```

### 4.2 注册系统

更新 `src/App.tsx`:

```typescript
import { useEffect, useRef } from 'react'
import { World } from 'three-ecs'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
import { RotationSystem } from './RotationSystem'

function App() {
  const worldRef = useRef<World | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current && !worldRef.current) {
      // 创建 World 实例
      worldRef.current = new World(containerRef.current)

      // 注册自定义系统
      worldRef.current.systemsManager.registerSystem(new RotationSystem())

      // 启动世界
      worldRef.current.start()

      // 创建立方体实体（代码与之前相同）
      // ...
    }

    return () => {
      if (worldRef.current) {
        worldRef.current.destroy()
        worldRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#000'
      }}
    />
  )
}

export default App
```

## 🎯 步骤 5: 添加多个立方体

让我们添加更多彩色的立方体：

```typescript
// 在 App.tsx 中添加
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff]

function createColoredCube(world: World, x: number, y: number, z: number, color: number) {
  const entity = world.createVisibleEntity()

  const geometry = new BoxGeometry(0.5, 0.5, 0.5)
  const material = new MeshBasicMaterial({ color })
  const cube = new Mesh(geometry, material)

  entity.modelComponent.model.add(cube)
  entity.transformComponent.position.set(x, y, z)

  return entity
}

// 在 useEffect 中添加
for (let i = 0; i < colors.length; i++) {
  const angle = (i / colors.length) * Math.PI * 2
  const radius = 3
  const x = Math.cos(angle) * radius
  const z = Math.sin(angle) * radius

  createColoredCube(worldRef.current, x, 0, z, colors[i])
}
```

## 🧪 步骤 6: 添加交互

添加一个按钮来动态创建立方体：

```typescript
import { useState } from 'react'

function App() {
  const [cubeCount, setCubeCount] = useState(6)
  // ... 其他代码 ...

  const addRandomCube = () => {
    if (!worldRef.current) return

    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 10
    const z = (Math.random() - 0.5) * 10
    const color = Math.floor(Math.random() * 0xffffff)

    createColoredCube(worldRef.current, x, y, z, color)
    setCubeCount(prev => prev + 1)
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          background: '#000'
        }}
      />

      {/* UI 控制 */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <div>立方体数量: {cubeCount}</div>
        <button
          onClick={addRandomCube}
          style={{
            marginTop: '10px',
            padding: '5px 10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          添加随机立方体
        </button>
      </div>
    </div>
  )
}
```

## 📝 总结

恭喜！您已经完成了第一个 ThreeECS 应用程序。在本教程中，您学习了：

✅ **项目设置**: 配置 TypeScript 和 Vite
✅ **World 创建**: 初始化 ECS 世界
✅ **实体管理**: 创建和配置实体
✅ **组件使用**: TransformComponent 和 ModelComponent
✅ **系统开发**: 创建自定义的 RotationSystem
✅ **Three.js 集成**: 添加 3D 对象到场景
✅ **用户交互**: 添加动态功能

## 🚀 下一步

现在您已经掌握了基础知识，可以继续学习：

- **[教程 01: 实体和组件](./01-entities-components.md)** - 深入理解 ECS 概念
- **[教程 02: 系统](./02-systems.md)** - 学习更复杂的系统开发
- **[教程 03: 渲染基础](./03-basic-rendering.md)** - Three.js 集成的详细说明

## 🔗 相关链接

- [ThreeECS GitHub 仓库](https://github.com/WalleyZhang/three_ecs)
- [Three.js 官方文档](https://threejs.org/docs/)
- [ECS 架构介绍](https://en.wikipedia.org/wiki/Entity_component_system)

---

🎉 **您的 ThreeECS 之旅才刚刚开始！继续探索更多功能吧！**
