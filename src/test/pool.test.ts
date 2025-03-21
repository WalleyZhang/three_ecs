import { TestEntity, TestComponent, pool } from "./testData";

describe("Pool 缓存池测试", () => {
  beforeEach(() => {
    // 每次测试前清空 Pool
    pool.clear();
  });

  test("获取 Entity 应该返回一个新的实例", () => {
    const entity1 = pool.getEntity(TestEntity);
    const entity2 = pool.getEntity(TestEntity);

    expect(entity1).toBeInstanceOf(TestEntity);
    expect(entity2).toBeInstanceOf(TestEntity);
    expect(entity1.destroyed).toBe(false);
    expect(entity2.destroyed).toBe(false);
    expect(entity1.id).not.toBe(entity2.id);
  });

  test("释放 Entity 后应该可以复用", () => {
    const entity1 = pool.getEntity(TestEntity);
    pool.releaseEntity(entity1);
    expect(entity1.destroyed).toBe(true);

    const entity2 = pool.getEntity(TestEntity);
    expect(entity2.destroyed).toBe(false);
    expect(entity2).toBe(entity1);
  });

  test("获取 Component 应该返回一个新的实例", () => {
    const component1 = pool.getComponent(TestComponent);
    const component2 = pool.getComponent(TestComponent);

    expect(component1).toBeInstanceOf(TestComponent);
    expect(component2).toBeInstanceOf(TestComponent);
    // 不是同一个对象
    expect(component1).not.toBe(component2);
  });

  test("释放 Component 后应该可以复用", () => {
    const component1 = pool.getComponent(TestComponent);
    pool.releaseComponent(component1);

    const component2 = pool.getComponent(TestComponent);
    // 复用相同实例
    expect(component2).toBe(component1);
  });
});
