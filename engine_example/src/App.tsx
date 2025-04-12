import { useCallback, useEffect, useRef } from 'react'
import { World } from '@engine/world'
import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three'
import { VelocityComponent } from '@engine/base'
import { ExternalEvent, ExternalEventPayload } from '@engine/types/externalEventMap'

function App() {
  const worldRef = useRef<World>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 用于记录静态立方体当前的位置
  const staticBoxPos = useRef({ x: -8, y: -2 })

  // 添加静态立方体，每次位置 x+0.1, y+0.2
  const addStaticBox = useCallback(() => {
    if (worldRef.current) {
      const { x, y } = staticBoxPos.current
      const entity = worldRef.current.createVisibleEntity()
      const mesh = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshBasicMaterial({ color: 0x0000ff }))
      entity.modelComponent.model.add(mesh)
      entity.transformComponent.position.set(x, y, 0)

      // 位置更新
      staticBoxPos.current.x += 0.4
    }
  }, [])

  // 添加运动立方体
  const addMoveBox = useCallback(() => {
    if (worldRef.current) {
      const entity = worldRef.current.createVisibleEntity()
      const mesh = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), new MeshBasicMaterial({ color: 0x00ff00 }))
      entity.modelComponent.model.add(mesh)
      entity.transformComponent.position.set(-8, 2, 0)
      entity.addComponents([new VelocityComponent(0.1, 0, 0)])
      worldRef.current.eventManager.dispatch<ExternalEventPayload[ExternalEvent.TEST]>(ExternalEvent.TEST, { msg: '添加了一个运动立方体', time: Date.now() })
    }
  }, [])

  useEffect(() => {
    if (containerRef.current && !worldRef.current) {
      worldRef.current = new World(containerRef.current)
      worldRef.current.start()
      worldRef.current.eventManager.addEventListener(ExternalEvent.TEST, (payload: ExternalEventPayload[ExternalEvent.TEST]) => {
        console.log('间隔 ' + (Date.now() - payload.time) + 'ms 之后收到消息:' + payload.msg)
      })
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