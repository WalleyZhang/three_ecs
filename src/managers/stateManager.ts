import { State } from "../types/state";

/** World state manager singleton */
export class StateManager {
  private static instance: StateManager;
  public static GetInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private state: State = State.CONFIG;
  public get State(): State {
    return this.state;
  }

  public set State(state: State) {
    if (this.state === state) {
      return;
    }
    this.state = state;
  }

  private constructor() {
  }


}