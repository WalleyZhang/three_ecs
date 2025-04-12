/** 
 * 引擎外部的事件主题
 */



export enum ExternalEvent {
  TEST = "test"
}


type Test = {
  msg: string;
  time: number;
};

export type ExternalEventPayload = {
  [ExternalEvent.TEST]: Test;
};