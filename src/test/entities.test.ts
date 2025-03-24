import { em, TestComponent1, TestComponent2, TestEntity1 } from "./testData";

describe("EntitiesManager 功能测试", () => {
  beforeEach(() => {
    em.reset();
  });

  test("测试新增实体、依据组件查询实体", () => {
    const e1_1 = em.addEntity(TestEntity1);
    const e1_2 = em.addEntity(TestEntity1);
    e1_1.addComponents([new TestComponent1()]);
    e1_2.addComponents([new TestComponent2(), new TestComponent1()]);
    const eWithC1 = em.getEntitiesWithComponent([TestComponent1.CompName]);
    const eWithC1AndC2 = em.getEntitiesWithComponent([
      TestComponent2.CompName,
      TestComponent1.CompName,
    ]);
    expect(eWithC1?.size).toBe(2);
    expect(eWithC1?.has(e1_1)).toBe(true);
    expect(eWithC1?.has(e1_2)).toBe(true);
    expect(eWithC1AndC2?.size).toBe(1);
    expect(eWithC1AndC2?.has(e1_2)).toBe(true);
  });
});
