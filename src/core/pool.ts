namespace ECS {
  let eId = 0
  const componentPool = new Map<string, Component[]>();
  const entityPool = new Map<string, Entity[]>();

  /** 缓存池 */
  export class Pool {
    /** 从缓存池中获取一个 Entity */
    public static GetEntity<T extends Entity>(entityType: EntityConstructor<T>): Entity {
      const entity = entityPool.get(entityType.EntityName)
      if (entity?.length && entity[0]) {
        return entity.shift() as T
      }
      const newEntity = new entityType()
      newEntity.id = eId++
      return newEntity
    }

    /** 从缓存池中获取一个 Component */
    public static GetComponent<T extends Component>(componentType: ComponentConstructor<T>): Component {
      const component = componentPool.get(componentType.CompName)
      if (component?.length && component[0]) {
        return component.shift() as T
      }
      const newComponent = new componentType()
      return newComponent
    }

    /** 释放一个 Entity */
    public static ReleaseEntity(entity: Entity): void {
      const entities = entityPool.get((entity.constructor as EntityConstructor<Entity>).EntityName)
      if (entities) {
        entities.push(entity)
      } else {
        entityPool.set((entity.constructor as EntityConstructor<Entity>).EntityName, [entity])
      }
    }

    /** 释放一个 Component */
    public static ReleaseComponent(component: Component): void {
      const components = componentPool.get((component.constructor as ComponentConstructor<Component>).CompName)
      if (components) {
        components.push(component)
      } else {
        componentPool.set((component.constructor as ComponentConstructor<Component>).CompName, [component])
      }
    }
  }

}