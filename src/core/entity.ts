namespace ECS {
  /** 实体构造函数 */
  export interface EntityConstructor<T extends Entity> {
    new(...args: any[]): T
    EntityName: string
  }

  /** 实体：一个实体是一个容器，可以容纳组件 */
  export abstract class Entity {
    /** 实体名称，默认为"Entity"，需要确保唯一 */
    public static EntityName: string = "Entity"
    /** 实体实例的ID，未指定时默认为-1 */
    public id: number = -1

    /** 实体的组件信息 */
    private components: Map<string, Component> = new Map()

    /** 添加组件到实体，同一类的组件重复添加会被忽略 */
    public AddComponent<T extends Component>(componentType: ComponentConstructor<T>): void {

      if (!this.components.has(componentType.CompName)) {
        const component = Pool.GetComponent(componentType)
        component.entity = this
        this.components.set(componentType.CompName, component)

        component.Awake()
      } else {
        const compN = componentType.CompName
        const entN = (this.constructor as typeof Entity).EntityName
        console.warn(`[${entN}]: Component ${compN} already exists, ignore adding.`)
        return
      }
    }
    /** 从实体中移除组件 */
    public RemoveComponent<T extends Component>(componentType: ComponentConstructor<T>): void {
      const component = this.components.get(componentType.CompName)
      if (component) {
        component.OnDestroy()
        this.components.delete(componentType.CompName)
      } else {
        const compN = componentType.CompName
        const entN = (this.constructor as typeof Entity).EntityName
        console.warn(`[${entN}]: Component ${compN} not exists, ignore removing.`)
        return
      }
    }
    /** 获取实体上的指定类型的组件 */
    public GetComponent<T extends Component>(componentType: ComponentConstructor<T>): T | null {
      return this.components.get(componentType.CompName) as T | null
    }

    /** 销毁实体，默认不回收，若回收则会将实体的所有组件都置为禁用状态，并放回对象池 */
    public Destroy(recycle: boolean = false): void {
      if (recycle) {
        this.components.forEach((component) => {
          component.OnDisable()
        })
        this.components.clear()
        Pool.ReleaseEntity(this)
      } else {
        this.components.forEach((component) => { component.OnDestroy() })
        this.components.clear()
      }
    }
  }
}