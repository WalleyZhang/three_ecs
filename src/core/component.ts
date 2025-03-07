namespace ECS {
  /** 组件构造函数 */
  export interface ComponentConstructor<T extends Component> {
    new(...args: any[]): T
    CompName: string
  }

  /** 组件：仿照 Unity 的 MonoBehaviour 的生命周期设计 */
  export abstract class Component {

    /** 组件的名称，需要确保全局唯一，默认值为 "Component" */
    public static CompName: string = "Component"

    /** 组件实例所属的实体 */
    public entity: Entity | null = null
    /** 组件是否启用 */
    public set enable(value: boolean) {
      this._enable = value
      if (value) {
        this.OnEnable()
      } else {
        this.OnDisable()
      }
    }
    public get enable(): boolean {
      return this._enable
    }

    private _enable: boolean = true

    /** 组件挂载到实体后调用，无法获取到其它组件 */
    public Awake(): void { }
    /** 首次渲染之前调用，可以获取到其它实体或组件 */
    public Start(): void { }

    /** 组件更新时调用 */
    public Update(deltaTime: number): void { }
    /** Update 之后调用，适用于需要依赖其它组件 Update 结果的情况  */
    public LateUpdate(deltaTime: number): void { }

    /** 启用组件时调用 */
    public OnEnable(): void { }
    /** 禁用组件时调用 */
    public OnDisable(): void { }

    /** 组件被销毁时调用 */
    public OnDestroy(): void {
      // 获取实例的所有可枚举属性
      const instanceProperties = Object.keys(this);

      // 遍历属性并删除值
      for (const key of instanceProperties) {
        if (this.hasOwnProperty(key)) {
          (this as any)[key] = undefined
        }
      }
    }
  }

}