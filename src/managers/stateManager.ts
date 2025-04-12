import { State } from "../types/state";
/** word 的状态管理器，用于切换其状态 */
export class StateManager {
  private static instance: StateManager;
  public static GetInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private state: State = State.CONFIG;
  public set State(state: State) {
    if (this.state == state) {
      console.log("[StateManager] 状态切换无效：当前已经处于 " + state + " 状态");
      return;
    }
  }

  private constructor() {
  }


}