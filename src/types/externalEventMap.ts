/**
 * External events — available to consumers of the engine.
 */

import type { World } from "../world";

export enum ExternalEvent {
  TEST = "test",
  WORLD_STARTED = "world_started",
  WORLD_STOPPED = "world_stopped",
  WORLD_PAUSED = "world_paused",
  WORLD_RESUMED = "world_resumed",
  WORLD_DESTROYED = "world_destroyed",
  CLEAR_SCENE = "clear_scene",
}

type Test = {
  msg: string;
  time: number;
};

type WorldEvent = {
  world: World;
};

export type ExternalEventPayload = {
  [ExternalEvent.TEST]: Test;
  [ExternalEvent.WORLD_STARTED]: WorldEvent;
  [ExternalEvent.WORLD_STOPPED]: WorldEvent;
  [ExternalEvent.WORLD_PAUSED]: WorldEvent;
  [ExternalEvent.WORLD_RESUMED]: WorldEvent;
  [ExternalEvent.WORLD_DESTROYED]: WorldEvent;
  [ExternalEvent.CLEAR_SCENE]: null
};
