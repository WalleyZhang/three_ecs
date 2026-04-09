import { useCallback, useEffect, useRef, useState } from 'react'
import { BoxGeometry, SphereGeometry, CylinderGeometry, Mesh, MeshStandardMaterial } from 'three'
import * as Engine from '@engine/index'

function App() {
    const worldRef = useRef<Engine.World>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [entityCount, setEntityCount] = useState(0)
    const [fps, setFps] = useState(0)
    const fpsCounterRef = useRef({ frames: 0, lastTime: 0 })

    const positionsRef = useRef({
        staticBox: { x: -8, y: -2 },
        sphere: { x: -6, y: 3 },
        cylinder: { x: -4, y: 1 }
    })

    const updateEntityCount = useCallback(() => {
        if (worldRef.current) {
            const count = worldRef.current.entitiesManager.getAllEntities().length
            setEntityCount(count)
        }
    }, [])

    const addStaticBox = useCallback(() => {
        if (worldRef.current) {
            const { x, y } = positionsRef.current.staticBox
            const entity = worldRef.current.createVisibleEntity()
            const mesh = new Mesh(
                new BoxGeometry(0.2, 0.2, 0.2),
                new MeshStandardMaterial({ color: 0x0088ff, metalness: 0.3, roughness: 0.4 })
            )
            entity.addComponent(new Engine.MeshComponent(mesh))
            entity.transformComponent.position.set(x, y, 0)

            positionsRef.current.staticBox.x += 0.4
            if (positionsRef.current.staticBox.x > 8) {
                positionsRef.current.staticBox.x = -8
                positionsRef.current.staticBox.y -= 0.4
            }

            updateEntityCount()
            worldRef.current.eventManager.dispatch<Engine.ExternalEventPayload[Engine.ExternalEvent.TEST]>(
                Engine.ExternalEvent.TEST,
                { msg: 'Added a static box', time: Date.now() }
            )
        }
    }, [updateEntityCount])

    const addMoveBox = useCallback(() => {
        if (worldRef.current) {
            const entity = worldRef.current.createVisibleEntity()
            const mesh = new Mesh(
                new BoxGeometry(0.2, 0.2, 0.2),
                new MeshStandardMaterial({ color: 0x00ff88, metalness: 0.3, roughness: 0.4 })
            )
            entity.addComponent(new Engine.MeshComponent(mesh))
            entity.transformComponent.position.set(-8, 2, 0)
            entity.addComponent(new Engine.VelocityComponent(0.15, 0, 0))

            updateEntityCount()
            worldRef.current.eventManager.dispatch<Engine.ExternalEventPayload[Engine.ExternalEvent.TEST]>(
                Engine.ExternalEvent.TEST,
                { msg: 'Added a moving box', time: Date.now() }
            )
        }
    }, [updateEntityCount])

    const addGravitySphere = useCallback(() => {
        if (worldRef.current) {
            const { x, y } = positionsRef.current.sphere
            const entity = worldRef.current.createVisibleEntity()
            const mesh = new Mesh(
                new SphereGeometry(0.15, 16, 16),
                new MeshStandardMaterial({ color: 0xff4444, metalness: 0.1, roughness: 0.8 })
            )
            entity.addComponent(new Engine.MeshComponent(mesh))
            entity.transformComponent.position.set(x, y, 0)
            entity.addComponents([
                new Engine.VelocityComponent(0, 0, 0),
                new Engine.GravityComponent()
            ])

            positionsRef.current.sphere.x += 0.5
            if (positionsRef.current.sphere.x > 6) {
                positionsRef.current.sphere.x = -6
                positionsRef.current.sphere.y += 0.3
            }

            updateEntityCount()
        }
    }, [updateEntityCount])

    const addBouncingCylinder = useCallback(() => {
        if (worldRef.current) {
            const { x, y } = positionsRef.current.cylinder
            const entity = worldRef.current.createVisibleEntity()
            const mesh = new Mesh(
                new CylinderGeometry(0.1, 0.1, 0.4, 8),
                new MeshStandardMaterial({ color: 0xffaa00, metalness: 0.5, roughness: 0.2 })
            )
            entity.addComponent(new Engine.MeshComponent(mesh))
            entity.transformComponent.position.set(x, y, 2)
            entity.addComponents([
                new Engine.VelocityComponent(Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0),
                new Engine.GravityComponent()
            ])

            positionsRef.current.cylinder.x += 0.6
            if (positionsRef.current.cylinder.x > 4) {
                positionsRef.current.cylinder.x = -4
                positionsRef.current.cylinder.y += 0.4
            }

            updateEntityCount()
        }
    }, [updateEntityCount])

    const clearAllEntities = useCallback(() => {
        if (worldRef.current) {
            const entities = worldRef.current.entitiesManager.getAllEntities()
            for (const entity of entities) {
                worldRef.current.entitiesManager.removeEntity(entity)
            }

            positionsRef.current = {
                staticBox: { x: -8, y: -2 },
                sphere: { x: -6, y: 3 },
                cylinder: { x: -4, y: 1 }
            }

            updateEntityCount()
            worldRef.current.eventManager.dispatch<Engine.ExternalEventPayload[Engine.ExternalEvent.TEST]>(
                Engine.ExternalEvent.TEST,
                { msg: 'Cleared all entities', time: Date.now() }
            )
        }
    }, [updateEntityCount])

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
            }, i * 50)
        }
    }, [addStaticBox, addMoveBox, addGravitySphere])

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
            worldRef.current = new Engine.World(containerRef.current)
            worldRef.current.registerSystem(Engine.GravitySystem.GetInstance())
            worldRef.current.start()

            worldRef.current.on(Engine.ExternalEvent.TEST, (payload: Engine.ExternalEventPayload[Engine.ExternalEvent.TEST]) => {
                console.log(`[${new Date().toLocaleTimeString()}] ${payload.msg}`)
            })

            updateEntityCount()
        }
    }, [updateEntityCount])

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
            <div
                ref={containerRef}
                style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' }}
            />

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
                    ThreeECS Demo
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div>Entities: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{entityCount}</span></div>
                    <div>FPS: <span style={{ color: '#0088ff', fontWeight: 'bold' }}>{fps}</span></div>
                </div>
            </div>

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
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Entity Controls</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={addStaticBox} style={buttonStyle('#0088ff')}>
                            + Static Box
                        </button>
                        <button onClick={addMoveBox} style={buttonStyle('#00ff88')}>
                            + Moving Box
                        </button>
                        <button onClick={addGravitySphere} style={buttonStyle('#ff4444')}>
                            + Gravity Sphere
                        </button>
                        <button onClick={addBouncingCylinder} style={buttonStyle('#ffaa00')}>
                            + Bouncing Cylinder
                        </button>
                    </div>
                </div>

                <div style={{
                    background: 'rgba(0, 0, 0, 0.8)',
                    padding: '15px',
                    borderRadius: '8px',
                    color: 'white'
                }}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Batch Operations</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button onClick={addBatchEntities} style={buttonStyle('#aa44ff')}>
                            Batch Add (20)
                        </button>
                        <button onClick={clearAllEntities} style={buttonStyle('#ff4444')}>
                            Clear All
                        </button>
                    </div>
                </div>
            </div>

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
                <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Legend</h3>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    <p><strong>Static Box:</strong> Blue, fixed position</p>
                    <p><strong>Moving Box:</strong> Green, constant velocity</p>
                    <p><strong>Gravity Sphere:</strong> Red, affected by gravity</p>
                    <p><strong>Bouncing Cylinder:</strong> Orange, random direction + gravity</p>
                    <p style={{ marginTop: '10px', fontSize: '12px', color: '#ccc' }}>
                        Drag to rotate, scroll to zoom
                    </p>
                </div>
            </div>

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
                    ThreeECS Framework Demo — ECS Architecture in Action
                </div>
            </div>
        </div>
    )
}

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
})

export default App
