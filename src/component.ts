namespace ECS {
  /** 组件：原则上只有数据，不包含逻辑 */
  export abstract class Component {

    /** 组件类型的 ID , -1 表示未分配 */
    public static TypeId: number = -1

    /** 组件的名称 */
    public static CompName: string = "Component"

    /** 组件实例所属的实体 */
    public entity: Entity | null = null
  }
}