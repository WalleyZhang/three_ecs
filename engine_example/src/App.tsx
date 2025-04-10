import { useCallback, useEffect, useRef } from 'react'
import { World } from '@engine/world'
import { BoxGeometry, MeshBasicMaterial } from 'three'
import { VelocityComponent } from './components/velocityComponent'
import { MoveSystem } from './systems/moveSystem'
import { SystemsManager } from '@engine/managers/systemsManager'

function App() {
  const worldRef = useRef<World>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 用于记录静态立方体当前的位置
  const staticBoxPos = useRef({ x: -4, y: -8 })

  // 添加静态立方体，每次位置 x+0.1, y+0.2
  const addStaticBox = useCallback(() => {
    if (worldRef.current) {
      const { x, y } = staticBoxPos.current
      const entity = worldRef.current.createEntity()
      entity.meshComponent.mesh.geometry = new BoxGeometry(0.5, 0.5, 0.5)
      entity.meshComponent.mesh.material = new MeshBasicMaterial({ color: 0x0000ff })
      entity.transformComponent.position.set(x, y, 0)

      // 位置更新
      staticBoxPos.current.x += 0.1
      staticBoxPos.current.y += 0.2
    }
  }, [])

  // 添加运动立方体
  const addMoveBox = useCallback(() => {
    if (worldRef.current) {
      const { x } = staticBoxPos.current
      const entity = worldRef.current.createEntity()
      entity.meshComponent.mesh.geometry = new BoxGeometry(0.5, 0.5, 0.5)
      entity.meshComponent.mesh.material = new MeshBasicMaterial({ color: 0x00ff00 })
      entity.transformComponent.position.set(x, 0, 0)
      entity.addComponents([new VelocityComponent(0.1, 0, 0)])
    }
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      worldRef.current = new World(containerRef.current)
      worldRef.current.start()
      SystemsManager.GetInstance().registerSystem(MoveSystem.GetInstance())
    }
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Three.js 渲染容器 */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', background: '#000' }}
      />

      {/* 控制按钮面板 */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        right: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 10
      }}>
        <button onClick={addStaticBox}>添加静态立方体</button>
        <button onClick={addMoveBox}>添加运动立方体</button>
      </div>
    </div>
  )
}

export default App