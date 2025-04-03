import { sm, TestSystem1, TestSystem2 } from "./testData";

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

describe("SystemsManager 功能测试", () => {
  test("测试系统注册、更新、注销", async () => {
    const system1 = new TestSystem1();
    const system2 = new TestSystem2();
    sm.registerSystem(system1);
    sm.registerSystem(system2);
    // 首次更新会初始化数据不执行
    sm.Update();
    await delay(100);
    sm.Update();
    const system1RunTime = system1.runTime;
    const system2RunTime = system2.runTime;

    // 由于代码执行本身需要时间，所以无法直接判断 系统1 和 系统2 的运行时间，只能判断两者之间的差值
    expect(system2RunTime - system1RunTime).toBe(1);
    sm.unregisterSystem(system1);
    await delay(100);
    sm.Update();
    // 系统1注销后，运行时间不再更新
    expect(system1.runTime).toBe(system1RunTime);
    // 系统2运行时间更新
    expect(system2.runTime).toBeGreaterThan(system2RunTime);
  });
});
