# 贡献指南

欢迎为 ThreeECS 项目做出贡献！我们非常欢迎各种形式的贡献，包括但不限于代码改进、文档编写、问题报告和功能建议。

## 快速开始

### 开发环境设置

1. **克隆仓库**
   ```bash
   git clone https://github.com/WalleyZhang/three_ecs.git
   cd three_ecs
   ```

2. **安装依赖**
   ```bash
   npm install
   # 或者
   yarn install
   ```

3. **启动示例**
   ```bash
   npm run example
   ```

### 项目结构

```
three_ecs/
├── src/                          # 源代码
│   ├── core/                     # 核心 ECS 实现
│   ├── base/                     # 基础组件和系统
│   ├── managers/                 # 管理器类
│   ├── types/                    # 类型定义
│   └── world.ts                  # 世界入口
├── engine_example/               # 示例应用
├── docs/                         # 文档
├── openspec/                     # 规范文档
└── tests/                        # 测试文件
```

## 贡献类型

### 🐛 错误修复

1. 在 [Issues](../../issues) 中查找或创建错误报告
2. 编写测试用例重现问题
3. 修复问题并确保测试通过
4. 更新相关文档

### ✨ 新功能

1. 在 [Issues](../../issues) 中讨论功能需求
2. 使用 OpenSpec 流程创建变更提案
3. 实现功能并编写测试
4. 更新文档和示例

### 📚 文档改进

1. 修复拼写错误或格式问题
2. 改进现有文档的清晰度
3. 添加新的使用指南或教程
4. 翻译文档到其他语言

### 🧪 测试

1. 为现有代码添加测试用例
2. 改进测试覆盖率
3. 重构测试使其更易维护

## 开发工作流程

### 1. 选择任务

从 [Issues](../../issues) 中选择一个任务，或创建新的 Issue：

- 🐛 `bug` - 错误修复
- ✨ `enhancement` - 新功能
- 📚 `documentation` - 文档改进
- 🧪 `testing` - 测试相关

### 2. 创建分支

```bash
# 从 main 分支创建功能分支
git checkout -b feature/your-feature-name
# 或者
git checkout -b bugfix/issue-number-description
```

### 3. 编写代码

遵循项目的代码规范：

#### TypeScript 规范

```typescript
// ✅ 推荐写法
export class ComponentName extends Component {
  public static CompName = "ComponentName";

  public propertyName: PropertyType;

  constructor(param: ParamType) {
    super();
    this.propertyName = param;
  }
}

// ❌ 避免的写法
export class componentName extends Component {  // 错误的命名约定
  static compName = "componentName";          // 错误的常量命名
  propertyname: PropertyType;                  // 错误的属性命名
}
```

#### 组件和系统设计

- **组件**: 只包含数据，不包含逻辑
- **系统**: 包含逻辑，操作具有特定组件的实体
- **单一职责**: 每个组件和系统只负责一个明确的功能

### 4. 编写测试

```typescript
describe("ComponentName", () => {
  test("should initialize correctly", () => {
    const component = new ComponentName(testData);
    expect(component.property).toBe(expectedValue);
  });
});
```

运行测试：
```bash
npm test
```

### 5. 提交代码

#### 提交信息格式

```
type(scope): description

[optional body]

[optional footer]
```

**类型**:
- `feat`: 新功能
- `fix`: 错误修复
- `docs`: 文档变更
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或工具配置

**示例**:
```
feat(components): add velocity component

Add VelocityComponent to handle entity movement with x, y, z velocity properties.

Closes #123
```

#### 提交步骤

```bash
# 查看变更
git status
git diff

# 添加文件
git add .

# 提交
git commit -m "feat: add new component

- Add ComponentName class
- Implement required methods
- Add unit tests"

# 推送
git push origin your-branch-name
```

### 6. 创建 Pull Request

1. 访问 [Pull Requests](../../pulls) 页面
2. 点击 "New pull request"
3. 选择你的分支作为 compare 分支
4. 填写 PR 描述：
   - 描述变更内容
   - 引用相关 Issue
   - 说明测试方法
5. 请求审查

## 代码规范

### TypeScript

- 使用 TypeScript 严格模式
- 提供完整的类型注解
- 使用接口定义契约
- 避免使用 `any` 类型

### 命名约定

```typescript
// 类名: PascalCase
export class MyComponent extends Component

// 方法名: camelCase
public myMethod(): void

// 属性名: camelCase
public myProperty: string;

// 常量: UPPER_SNAKE_CASE
public static readonly MY_CONSTANT = "value";

// 组件名称: PascalCase + "Component"
export class VelocityComponent extends Component

// 系统名称: PascalCase + "System"
export class MoveSystem extends System
```

### 导入顺序

```typescript
// 1. 第三方库
import { Vector3 } from "three";

// 2. 本地模块 - 相对路径
import { Component } from "../core";
import { TransformComponent } from "./components";

// 3. 类型导入
import type { System } from "../core";
```

## 测试规范

### 单元测试

```typescript
describe("VelocityComponent", () => {
  let component: VelocityComponent;

  beforeEach(() => {
    component = new VelocityComponent(1, 2, 3);
  });

  test("should initialize with correct values", () => {
    expect(component.x).toBe(1);
    expect(component.y).toBe(2);
    expect(component.z).toBe(3);
  });

  test("should update velocity", () => {
    component.x = 5;
    expect(component.x).toBe(5);
  });
});
```

### 集成测试

```typescript
describe("MoveSystem integration", () => {
  let world: World;
  let entity: Entity;

  beforeEach(() => {
    world = new World(document.createElement('div'));
    world.start();
    entity = world.createVisibleEntity();
  });

  afterEach(() => {
    world.destroy();
  });

  test("should move entity with velocity", () => {
    entity.addComponents([
      new VelocityComponent(1, 0, 0)
    ]);

    // 等待一帧
    world.systemsManager.Update(16); // 模拟 16ms

    const transform = entity.components.get(TransformComponent.CompName);
    expect(transform.position.x).toBeGreaterThan(0);
  });
});
```

## OpenSpec 流程

对于重大变更，请使用 OpenSpec 流程：

1. **创建提案**: `openspec/changes/[change-id]/proposal.md`
2. **定义任务**: `openspec/changes/[change-id]/tasks.md`
3. **编写规范**: `openspec/changes/[change-id]/specs/[capability]/spec.md`
4. **验证**: `openspec validate [change-id] --strict`
5. **实施**: 按照任务逐步实现
6. **归档**: `openspec archive [change-id]`

## 审查指南

### PR 审查清单

**代码质量**:
- [ ] 遵循代码规范
- [ ] 有完整的类型注解
- [ ] 通过所有测试
- [ ] 有适当的错误处理

**功能完整性**:
- [ ] 实现所有需求
- [ ] 有完整的测试覆盖
- [ ] 更新相关文档
- [ ] 不破坏现有功能

**性能考虑**:
- [ ] 不引入性能回归
- [ ] 使用合适的数据结构
- [ ] 考虑内存使用

### 审查意见

**需要改进**:
```markdown
🔧 **Suggested Changes**
- Consider using a more efficient data structure
- Add input validation for edge cases
```

**批准**:
```markdown
✅ **Approved**
- Code looks good
- Tests are comprehensive
- Documentation is updated
```

## 行为准则

### 我们的承诺

在 ThreeECS 社区，我们致力于为所有参与者提供一个无骚扰的环境。所有参与者均应遵守以下行为准则：

- 尊重不同的观点和经验
- 提供和接受建设性的反馈
- 专注于对项目有益的内容
- 展现同理心对待其他社区成员

### 不被接受的行为

- 骚扰、侮辱或贬损性言论
- 发布不适当内容
- 故意恐吓或跟踪
- 未经同意发布私人信息

### 报告问题

如果您遇到违反行为准则的情况，请通过以下方式报告：

- 发送邮件至: maintainer@example.com
- 在相关 Issue 或 PR 中提及维护者
- 使用 GitHub 的报告功能

## 许可证

通过贡献代码，您同意您的贡献将根据项目的 MIT 许可证进行许可。

## 致谢

感谢您对 ThreeECS 项目的贡献！您的努力帮助我们构建更好的 ECS 框架。

---

🎉 **开始贡献吧！**

有问题？随时在 [Discussions](../../discussions) 中提问。
