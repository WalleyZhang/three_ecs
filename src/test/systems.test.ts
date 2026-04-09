import { sm, TestSystem1, TestSystem2 } from "./testData";

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

describe("SystemsManager", () => {
  test("register, update, and unregister systems", async () => {
    const system1 = new TestSystem1();
    const system2 = new TestSystem2();
    sm.registerSystem(system1);
    sm.registerSystem(system2);
    // First update initialises internal state; no system tick
    sm.Update();
    await delay(100);
    sm.Update();
    const system1RunTime = system1.runTime;
    const system2RunTime = system2.runTime;

    // Exact execution time varies, so compare the offset which should stay constant
    expect(system2RunTime - system1RunTime).toBe(1);
    sm.unregisterSystem(system1);
    await delay(100);
    sm.Update();
    // After unregistering, system1 runtime should not change
    expect(system1.runTime).toBe(system1RunTime);
    // system2 should have advanced
    expect(system2.runTime).toBeGreaterThan(system2RunTime);
  });
});
