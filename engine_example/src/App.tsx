import { useCallback, useEffect, useRef, useState } from 'react'
import { World } from '@engine/world'
import { BoxGeometry, SphereGeometry, CylinderGeometry, Mesh, MeshBasicMaterial, MeshStandardMaterial } from 'three'
import { VelocityComponent, GravityComponent } from '@engine/base'
import { ExternalEvent, ExternalEventPayload } from '@engine/types/externalEventMap'

function App() {
  const worldRef = useRef<World>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [entityCount, setEntityCount] = useState(0)
  const [fps, setFps] = useState(0)
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0 })

  // 用于记录各种实体位置
  const positionsRef = useRef({
    staticBox: { x: -8, y: -2 },
    sphere: { x: -6, y: 3 },
    cylinder: { x: -4, y: 1 }
  })

  // 更新实体计数
  const updateEntityCount = useCallback(() => {
    if (worldRef.current) {
      const count = worldRef.current.entitiesManager.getAllEntities().size
      setEntityCount(count)
    }
  }, [])

  // 添加静态立方体
  const addStaticBox = useCallback(() => {
    if (worldRef.current) {
      const { x, y } = positionsRef.current.staticBox
      const entity = worldRef.current.createVisibleEntity()
      const mesh = new Mesh(
        new BoxGeometry(0.2, 0.2, 0.2),
        new MeshStandardMaterial({ color: 0x0088ff, metalness: 0.3, roughness: 0.4 })
      )
      entity.modelComponent.model.add(mesh)
      entity.transformComponent.position.set(x, y, 0)

      // 位置更新
      positionsRef.current.staticBox.x += 0.4
      if (positionsRef.current.staticBox.x > 8) {
        positionsRef.current.staticBox.x = -8
        positionsRef.current.staticBox.y -= 0.4
      }

      updateEntityCount()
      worldRef.current.eventManager.dispatch<ExternalEventPayload[ExternalEvent.TEST]>(
        ExternalEvent.TEST,
        { msg: '添加了一个静态立方体', time: Date.now() }
      )
    }
  }, [updateEntityCount])

  // 添加运动立方体
  const addMoveBox = useCallback(() => {
    if (worldRef.current) {
      const entity = worldRef.current.createVisibleEntity()
      const mesh = new Mesh(
        new BoxGeometry(0.2, 0.2, 0.2),
        new MeshStandardMaterial({ color: 0x00ff88, metalness: 0.3, roughness: 0.4 })
      )
      entity.modelComponent.model.add(mesh)
      entity.transformComponent.position.set(-8, 2, 0)
      entity.addComponents([new VelocityComponent(0.15, 0, 0)])

      updateEntityCount()
      worldRef.current.eventManager.dispatch<ExternalEventPayload[ExternalEvent.TEST]>(
        ExternalEvent.TEST,
        { msg: '添加了一个运动立方体', time: Date.now() }
      )
    }
  }, [updateEntityCount])

  // 添加重力球体
  const addGravitySphere = useCallback(() => {
    if (worldRef.current) {
      const { x, y } = positionsRef.current.sphere
      const entity = worldRef.current.createVisibleEntity()
      const mesh = new Mesh(
        new SphereGeometry(0.15, 16, 16),
        new MeshStandardMaterial({ color: 0xff4444, metalness: 0.1, roughness: 0.8 })
      )
      entity.modelComponent.model.add(mesh)
      entity.transformComponent.position.set(x, y, 0)
      entity.addComponents([
        new VelocityComponent(0, 0, 0),
        new GravityComponent()
      ])

      // 位置更新
      positionsRef.current.sphere.x += 0.5
      if (positionsRef.current.sphere.x > 6) {
        positionsRef.current.sphere.x = -6
        positionsRef.current.sphere.y += 0.3
      }

      updateEntityCount()
    }
  }, [updateEntityCount])

  // 添加弹跳圆柱体
  const addBouncingCylinder = useCallback(() => {
    if (worldRef.current) {
      const { x, y } = positionsRef.current.cylinder
      const entity = worldRef.current.createVisibleEntity()
      const mesh = new Mesh(
        new CylinderGeometry(0.1, 0.1, 0.4, 8),
        new MeshStandardMaterial({ color: 0xffaa00, metalness: 0.5, roughness: 0.2 })
      )
      entity.modelComponent.model.add(mesh)
      entity.transformComponent.position.set(x, y, 2)
      entity.addComponents([
        new VelocityComponent(Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0),
        new GravityComponent()
      ])

      // 位置更新
      positionsRef.current.cylinder.x += 0.6
      if (positionsRef.current.cylinder.x > 4) {
        positionsRef.current.cylinder.x = -4
        positionsRef.current.cylinder.y += 0.4
      }

      updateEntityCount()
    }
  }, [updateEntityCount])

  // 清除所有实体
  const clearAllEntities = useCallback(() => {
    if (worldRef.current) {
      const entities = worldRef.current.entitiesManager.getAllEntities()
      for (const entity of entities.values()) {
        worldRef.current.entitiesManager.removeEntity(entity)
      }

      // 重置位置计数器
      positionsRef.current = {
        staticBox: { x: -8, y: -2 },
        sphere: { x: -6, y: 3 },
        cylinder: { x: -4, y: 1 }
      }

      updateEntityCount()
      worldRef.current.eventManager.dispatch<ExternalEventPayload[ExternalEvent.TEST]>(
        ExternalEvent.TEST,
        { msg: '清除了所有实体', time: Date.now() }
      )
    }
  }, [updateEntityCount])

  // 批量添加实体（性能测试）
  const addBatchEntities = useCallback(() => {
    const batchSize = 20
    for (let i = 0; i < batchSize; i++) {
      setTimeout(() => {
        const entityType = Math.floor(Math.random() * 3)
        switch (entityType) {
          case 0:
            addStaticBox()
            break
          case 1:
            addMoveBox()
            break
          case 2:
            addGravitySphere()
            break
        }
      }, i * 50) // 错开添加时间，避免同时创建太多实体
    }
  }, [addStaticBox, addMoveBox, addGravitySphere])

  // FPS 监控
  useEffect(() => {
    const updateFPS = () => {
      const now = performance.now()
      fpsCounterRef.current.frames++

      if (now - fpsCounterRef.current.lastTime >= 1000) {
        setFps(Math.round((fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime)))
        fpsCounterRef.current.frames = 0
        fpsCounterRef.current.lastTime = now
      }

      requestAnimationFrame(updateFPS)
    }

    updateFPS()
  }, [])

  useEffect(() => {
    if (containerRef.current && !worldRef.current) {
      worldRef.current = new World(containerRef.current)
      worldRef.current.start()

      // 设置事件监听器
      worldRef.current.eventManager.addEventListener(ExternalEvent.TEST, (payload: ExternalEventPayload[ExternalEvent.TEST]) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${payload.msg}`)
      })

      updateEntityCount()
    }
  }, [updateEntityCount])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      {/* Three.js 渲染容器 */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}
      />

      {/* 顶部状态栏 */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        right: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        zIndex: 20
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
          ThreeECS 示例应用
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>实体数量: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{entityCount}</span></div>
          <div>FPS: <span style={{ color: '#0088ff', fontWeight: 'bold' }}>{fps}</span></div>
        </div>
      </div>

      {/* 左侧控制面板 */}
      <div style={{
        position: 'absolute',
        top: 80,
        left: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>实体控制</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={addStaticBox}
              style={buttonStyle('#0088ff')}
            >
              ➕ 添加静态立方体
            </button>
            <button
              onClick={addMoveBox}
              style={buttonStyle('#00ff88')}
            >
              ➕ 添加运动立方体
            </button>
            <button
              onClick={addGravitySphere}
              style={buttonStyle('#ff4444')}
            >
              ➕ 添加重力球体
            </button>
            <button
              onClick={addBouncingCylinder}
              style={buttonStyle('#ffaa00')}
            >
              ➕ 添加弹跳圆柱体
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '15px',
          borderRadius: '8px',
          color: 'white'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>批量操作</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={addBatchEntities}
              style={buttonStyle('#aa44ff')}
            >
              🚀 批量添加 (20个)
            </button>
            <button
              onClick={clearAllEntities}
              style={buttonStyle('#ff4444')}
            >
              🗑️ 清除所有实体
            </button>
          </div>
        </div>
      </div>

      {/* 右侧信息面板 */}
      <div style={{
        position: 'absolute',
        top: 80,
        right: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '15px',
        borderRadius: '8px',
        color: 'white',
        maxWidth: '300px',
        zIndex: 10
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>功能说明</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
          <p><strong>静态立方体:</strong> 蓝色，固定位置</p>
          <p><strong>运动立方体:</strong> 绿色，向右匀速移动</p>
          <p><strong>重力球体:</strong> 红色，受到重力影响</p>
          <p><strong>弹跳圆柱体:</strong> 橙色，随机方向 + 重力</p>
          <p style={{ marginTop: '10px', fontSize: '12px', color: '#ccc' }}>
            使用鼠标拖拽旋转视角，滚轮缩放
          </p>
        </div>
      </div>

      {/* 底部控制栏 */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '10px 20px',
        borderRadius: '8px',
        color: 'white',
        textAlign: 'center',
        zIndex: 10
      }}>
        <div style={{ fontSize: '12px', color: '#ccc' }}>
          ThreeECS 框架演示 - 展示 ECS 架构的核心功能
        </div>
      </div>
    </div>
  )
}

// 按钮样式函数
const buttonStyle = (color: string) => ({
  padding: '8px 16px',
  backgroundColor: color,
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: 'bold',
  transition: 'all 0.2s',
  minWidth: '160px',
  textAlign: 'left' as const,
  ':hover': {
    opacity: 0.8,
    transform: 'translateY(-1px)'
  }
})

export default App

export default App