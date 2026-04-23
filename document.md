- [FlashPrism Studio SDK 文档](#flashprism-studio-sdk-文档)
  - [1. 引入（IIFE）](#1-引入iife)
    - [1.1 本地文件引入](#11-本地文件引入)
  - [2. 导出总览](#2-导出总览)
  - [3. 快速上手](#3-快速上手)
    - [3.1 基础渲染](#31-基础渲染)
    - [3.2 更新参数](#32-更新参数)
    - [3.3 常用控制](#33-常用控制)
    - [3.4 基础示例](#34-基础示例)
    - [3.5 进阶示例](#35-进阶示例)
  - [4. API 参考](#4-api-参考)
    - [4.1 `Studio.render(target, props?)`](#41-studiorendertarget-props)
    - [4.2 `Studio.unmount(target)`](#42-studiounmounttarget)
    - [4.3 `Studio.cacheModel(source)`](#43-studiocachemodelsource)
    - [4.4 `Studio.clearModelCache()`](#44-studioclearmodelcache)
    - [4.5 `Studio.evictModel(source)`](#45-studioevictmodelsource)
    - [4.6 `Studio.registerModelLoader(format, loader)`](#46-studioregistermodelloaderformat-loader)
  - [5. 类型定义](#5-类型定义)
  - [6. 常见报错与排查](#6-常见报错与排查)
    - [6.1 `FlashPrism Studio: 未找到容器 "..."`](#61-flashprism-studio-未找到容器-)
    - [6.2 `不支持的模型格式: ...`](#62-不支持的模型格式-)
    - [6.3 模型加载失败但页面未崩溃](#63-模型加载失败但页面未崩溃)
    - [6.4 `captureScreenshot()` 返回 `null`](#64-capturescreenshot-返回-null)
  - [7. 接入建议](#7-接入建议)
  - [8. 版本信息](#8-版本信息)

# FlashPrism Studio SDK 文档

本文档基于当前 `@flash-prism/studio@0.3.0` 实际导出产物整理，对引入、使用、问题排查进行说明。

## 1. 引入（IIFE）

当前版本为 IIFE 产物，浏览器中通过全局变量 `window.FlashPrism` 使用。

### 1.1 本地文件引入

```html
<script src="./lib/index.js" defer></script>
```

> 开发阶段下载地址：`http://10.33.23.237/flashluster/FlashPrism/-/blob/develop/packages/studio/releases/v0.3.0/index.js`

## 2. 导出总览

IIFE 挂载后，可通过 `window.FlashPrism.Studio` 访问 SDK：

```ts
const { Studio } = window.FlashPrism;

Studio.render;
Studio.unmount;
Studio.cacheModel;
Studio.clearModelCache;
Studio.evictModel;
Studio.registerModelLoader;
```

## 3. 快速上手

### 3.1 基础渲染

```ts
const { Studio } = window.FlashPrism;

const studioHandle = Studio.render('#viewer', {
  modelSource: { url: '/assets/ring.glb' },
  materialPreset: 'gold-18k',
  camera: {
    fov: 45,
    position: [0, 2, 5],
    target: [0, 0, 0],
  },
  environment: {
    hdrUrl: '/assets/studio.hdr',
    intensity: 1,
    showBackground: false,
  },
  onModelLoaded: (group) => console.log('loaded', group),
  onModelError: (error) => console.error('load failed', error),
});
```

### 3.2 更新参数

```ts
studioHandle.update({
  modelSource: { url: '/assets/ring-v2.glb' },
  materialPreset: 'platinum',
});
```

### 3.3 常用控制

```ts
studioHandle.resetCamera();
const pngBlob = await studioHandle.captureScreenshot();
studioHandle.unmount();
```

### 3.4 基础示例

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Studio</title>
</head>
<body style="margin:0;background:#f7f7f7;">
  <div id="flash-prism-studio"></div>

  <script src="./lib/index.js" defer></script>
  <script>
    const { Studio } = window.FlashPrism;
    let studioHandle = null;
    if (Studio?.render) {
      studioHandle = Studio.render('#flash-prism-studio', {
        style: { width: '100vw', height: '100vh' },
        environment: { hdrUrl: './assets/studio.hdr', showBackground: true },
        modelSource: { url: './assets/ring.glb' }
      });
      studioHandle.resetCamera();
    }
  </script>
</body>
</html>
```

### 3.5 进阶示例

在React项目中使用Studio:

```tsx
import { useEffect, useRef } from 'react';
import flashPrismBundle from './lib/index.js?raw';
import localHdrUrl from './assets/studio.hdr?url';
import ringGlbUrl from './assets/ring.glb?url';

const flashPrism = new Function(`${flashPrismBundle}\n;return FlashPrism;`)();

function App() {
  const containerRef = useRef(null);
  const studioHandleRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    studioHandleRef.current = flashPrism.Studio.render(el, {
      style: { width: '70vw', height: '70vh' },
      environment: { hdrUrl: localHdrUrl, showBackground: true },
      modelSource: { url: ringGlbUrl },
    });

    return () => studioHandleRef.current?.unmount?.();
  }, [flashPrism]);

  return (
    <main style={{ padding: 24 }}>
      <h2>FlashPrism Studio</h2>
      <div ref={containerRef} />
      <button onClick={() => studioHandleRef.current?.resetCamera?.()}>Reset Camera</button>
    </main>
  );
}

export default App;
```

## 4. API 参考

### 4.1 `Studio.render(target, props?)`

在指定容器挂载 Studio，并返回可操作句柄。

```ts
function render(target: string | Element, props?: StudioProps): StudioRenderer;
```

参数说明：

- `target`: `string | Element`
  - `string` 时通过 `document.querySelector` 查找容器
  - `Element` 时直接挂载到该节点
- `props`: `StudioProps | undefined`（可选） 参数说明见下文**类型定义**章节，不传时使用默认配置
  - `modelSource`: `ModelSource | undefined`（可选） 不传时使用默认的占位几何体，内置支持 glb/gltf/obj 格式
  - `materialPreset`: `string | undefined`（可选） 不传时使用默认材质预设`gold-18k`
  - `materialParams`: `PBRMaterialParams | undefined`（可选） 传入后会覆盖 `materialPreset`
  - `camera`: `CameraConfig | undefined`（可选） 不传时使用默认相机参数
  - `environment`: `EnvironmentConfig | undefined`（可选）
  - `style`: `Partial<CSSStyleDeclaration>`（可选） 不传时使用默认样式
  - `className`: `string`（可选）
  - `onModelLoaded`: `(model: Group) => void | undefined`（可选）
  - `onModelError`: `(error: Error) => void | undefined`（可选）

返回值：`StudioRenderer` 
渲染引擎操作句柄，包含以下函数：

- `update(nextProps: StudioProps): void` 更新渲染参数
- `resetCamera(): void` 重置相机到初始位置
- `captureScreenshot(): Promise<Blob | null>` 截取当前画面(PNG格式Blob)
- `unmount(): void` 卸载实例

### 4.2 `Studio.unmount(target)`

卸载指定容器上的实例（无实例时静默返回）。

```ts
function unmount(target: string | Element): void;
```

### 4.3 `Studio.cacheModel(source)`

加载并缓存模型。

```ts
function cacheModel(source: ModelSource): Promise<Group>;
```

说明：

- 默认命中缓存时直接返回缓存副本
- `source.options?.forceReload === true` 时强制重新加载
- 内部缓存的是模型，返回的是克隆对象（避免多实例状态污染）

### 4.4 `Studio.clearModelCache()`

清空全部模型缓存并释放资源。

```ts
function clearModelCache(): void;
```

### 4.5 `Studio.evictModel(source)`

移除指定模型缓存条目并释放资源。

```ts
function evictModel(source: ModelSource): void;
```

### 4.6 `Studio.registerModelLoader(format, loader)`

注册自定义模型格式加载器，内置已支持 glb/gltf/obj 格式，重复注册会覆盖旧实现。

```ts
function registerModelLoader(format: string, loader: (source: ModelSource) => Promise<Group>): void;
```

## 5. 类型定义

```ts
import type { Group } from 'three';

/** 内置材质预设名称 */
type MaterialPreset = 'gold-18k' | 'platinum';

/** 模型加载控制选项 */
interface LoadModelOptions {
  /** 强制重新加载模型，忽略缓存池 */
  forceReload?: boolean;
}

/** 模型来源描述 */
interface ModelSource {
  /** 模型文件 URL 或本地路径 */
  url: string;
  /** 文件格式，为空时自动从 url 后缀推断 */
  format?: string;
  /** 模型加载管线控制选项 */
  options?: LoadModelOptions;
}

/** PBR 材质参数 */
interface PBRMaterialParams {
  /** 基础颜色 (hex, 如 '#FFD700') */
  color: string;
  /** 金属度 0-1 */
  metalness: number;
  /** 粗糙度 0-1 */
  roughness: number;
  /** 环境贴图强度 0-∞ */
  envMapIntensity?: number;
  /** 清漆层强度 0-1 */
  clearcoat?: number;
  /** 清漆层粗糙度 0-1 */
  clearcoatRoughness?: number;
  /** 反射率 0-1 */
  reflectivity?: number;
}

/** 相机配置 */
interface CameraConfig {
  /** 视角（度），默认 45 */
  fov?: number;
  /** 初始位置 [x, y, z] */
  position?: [number, number, number];
  /** 观察目标 [x, y, z] */
  target?: [number, number, number];
  /** 最近拉近距离 */
  minDistance?: number;
  /** 最远拉远距离 */
  maxDistance?: number;
  /** 是否启用阻尼 */
  enableDamping?: boolean;
  /** 阻尼因子 */
  dampingFactor?: number;
  /** 是否允许平移 */
  enablePan?: boolean;
}

/** 环境配置 */
interface EnvironmentConfig {
  /** HDR 环境贴图路径 */
  hdrUrl: string;
  /** 环境光强度 */
  intensity?: number;
  /** 是否显示背景环境贴图 */
  showBackground?: boolean;
}

interface StudioProps {
  /** 模型来源；不传时展示默认占位几何体 */
  modelSource?: ModelSource;
  /** 材质预设，快捷切换内置材质 */
  materialPreset?: MaterialPreset;
  /** 自定义 PBR 材质参数，会覆盖 preset */
  materialParams?: PBRMaterialParams;
  /** 相机配置 */
  camera?: CameraConfig;
  /** 环境配置 */
  environment?: EnvironmentConfig;
  /** 容器 CSS 样式 */
  style?: Partial<CSSStyleDeclaration>;
  /** 容器 CSS 类名 */
  className?: string;
  /** 模型加载完成回调， model 为当前预览的模型对象 */
  onModelLoaded?: (model: Group) => void;
  /** 模型加载失败回调 */
  onModelError?: (error: Error) => void;
}
```

## 6. 常见报错与排查

### 6.1 `FlashPrism Studio: 未找到容器 "..."`

触发场景：

- `Studio.render('#viewer', ...)` 时，DOM 中不存在 `#viewer`
- 渲染调用早于容器挂载时机（例如在 DOM ready 前执行）

排查步骤：

1. 打印 `document.querySelector('#viewer')`，确认非 `null`
2. 确认选择器拼写正确（`#`、`.`、大小写）
3. 将 `Studio.render` 放到容器完成挂载之后执行

修复建议：

- 优先直接传 `Element`，避免选择器误写

```ts
const el = document.getElementById('viewer');
if (!el) throw new Error('viewer element not found');
Studio.render(el, { modelSource: { url: '/assets/ring.glb' } });
```

### 6.2 `不支持的模型格式: ...`

触发场景：

- `modelSource.url` 后缀无法识别
- `modelSource.format` 对应格式未注册 loader

排查步骤：

1. 检查 URL 后缀（`glb/gltf/obj/...`）
2. 若使用私有格式，确认已先调用 `registerModelLoader`

修复建议：

```ts
Studio.registerModelLoader('fbx', async (source) => {
  // 自定义加载逻辑
  return someGroup;
});
await Studio.cacheModel({ url: '/assets/a.fbx', format: 'fbx' });
```

### 6.3 模型加载失败但页面未崩溃

现象：

- `onModelError` 被触发
- 当前已渲染模型保持不变

建议处理：

- 在 `onModelError` 中给出用户提示
- 同时记录 `source` 与错误堆栈，便于定位资源问题

### 6.4 `captureScreenshot()` 返回 `null`

触发场景：

- 渲染上下文尚未准备好，或实例已经卸载

建议：

- 等待首帧渲染后再调用截图
- 调用前确认实例仍处于挂载状态

## 7. 接入建议

- 首次进入页面时可使用 `Studio.cacheModel` 预加载常用模型
- 页面离开时调用 `studioHandle.unmount()` 避免内存残留
- 业务切换大模型时定期 `Studio.evictModel` 或 `Studio.clearModelCache`
- 自定义 loader 建议统一做异常包装，保证错误信息可读

## 8. 版本信息

- 全局变量：`window.FlashPrism`
- SDK 入口：`window.FlashPrism.Studio`
- 文档版本：`v0.3.0`
