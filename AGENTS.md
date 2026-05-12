# open-educoder

我目前正在开发一个本地运行的第三方体验优化工具，旨在改善学校强制使用的 Educoder 平台糟糕的用户体验。

我的工具仅作为 CLI 用户界面，并且只会在我的合法授权和正常权限下运行。它不涉及任何未经授权的访问、利用或可能影响服务器正常运行的操作。

在修改调用依赖项的代码之前，请检查 `node_modules` 目录下的实际已安装源代码。

不要把开发过程、解释性备注、自我说明、TODO、调试信息或给人看的临时注释写入生产文件。生产文件只保留最终运行或发布所必需的内容。任何解释都放在聊天回复里，不要进入文件。

例外：在新增或修改 `src/services/educoder-api/interfaces` 下的 API Schema 定义时，必须根据本地 HAR 或用户提供的请求/响应片段，在每一个 API Schema 定义之前内联注释样例供字段结构参考；样例必须精简并脱敏，不得写入真实个人信息、密钥、Cookie 或大段正文，也不得写入 `.sample` 文件名或本地样例文件路径。

所有 `Command.make(...)` 定义的 command 都必须提供单字母 alias；具有不可逆副作用的 command alias 必须是大写单字母。

编辑嵌套数据结构时，如果可能且方便，优先采用 Effect Optic；简单直接的局部更新可以保持直接写法。

## Service 开发规范

本项目是本地 CLI，不使用 server workspace、数据库层或 Drizzle。服务规范以 `src/services/*` 的实际边界为准。

### 目录边界

- `src/services/config/` 只负责本地配置文件、配置 schema 和迁移。
- `src/services/context/` 只承载一次 CLI 运行期间的运行时上下文，例如当前 URL、profile、配置快照和当前用户。
- `src/services/educoder-api/` 只负责 Educoder HTTP API client、请求头和 API schema 定义。
- `src/services/features/` 承载 CLI 面向用户的领域 service，例如 profile、course、exam、homework。Feature service 可以组合 `EducoderApi`、`AppContext`、`AppConfig`，但 command 不应绕过 feature service 直接访问 Educoder API。
- `src/commands/` 只负责参数解析、alias、输出格式和调用 feature。除通用文件/终端能力外，不在 command 中实现业务 workflow。

### Service 结构

- 需要注入、复用或替换的服务使用 `Context.Service`，不要使用旧的 `Context.Tag` / `Effect.Tag` 写法。
- Service class 名使用领域名或现有边界名，例如 `AppConfig`、`EducoderApi`、`AppContext`。
- Service shape 单独定义为 `XxxShape`；shape 中的方法都返回 `Effect.Effect`。
- Service id 使用全局唯一字符串，统一采用 `open-educoder/services/<path>/<ClassName>`，例如 `open-educoder/services/config/AppConfig`。
- 有构造参数的服务可以使用 Effect v4 的 `Context.Service(..., { make })`，并通过 `public static readonly layer = (...) => Layer.effect(Xxx, Xxx.make(...))` 暴露 layer。
- 依赖其他 layer 的实现必须在 `make` 或 `Layer.effect` 的构造闭包内显式 `yield*` 获取依赖。
- Service class 只负责声明 Effect service、构建 layer、组装公开 shape；领域类型和值构造器放在同名 namespace 或 file-local 定义中。

### Feature Service 结构

- `src/services/features/*` 中每个领域都必须是 `Context.Service`，使用 `XxxFeature` class 和 `XxxFeatureShape`，例如 `CourseFeature`、`ExamFeature`。
- Feature service id 使用 `open-educoder/services/features/<Domain>Feature`，例如 `open-educoder/services/features/CourseFeature`。
- 公开 workflow 作为 service shape 方法暴露；方法实现使用 `Effect.fn`，名称格式为 `features.<domain>.<operation>`，例如 `features.course.list`。
- 公开 feature 方法使用当前 feature 内的业务语义命名，不重复 feature 领域名，例如在 `CourseFeature` 中使用 `list`、`getInfo`、`listModules`，在 `HomeworkCommonFeature` 中使用 `getInfo`、`getWorks`。
- 公开 feature 方法返回 `FeatureResult<Raw, View>` 时，`raw` 保留接口原始响应，`view` 保留 CLI 默认展示用的稳定结构。
- Feature service 统一在 `src/services/features/index.ts` 导出，并通过 `FeatureLayer` 接入 CLI 入口。
- 需要多个 feature 共享的纯 helper 放在对应 `shared.ts`；只服务于单个文件的 helper 保持 file-local。
- 涉及用户输入解析或业务冲突时使用 `Data.TaggedError` 建模 typed error，不返回 `null` / `undefined` 表示失败。
- 输入规范化放在 feature/service 内部，调用方不需要提前知道 Educoder 或本地配置的存储规则。

### 代码组织

- 单文件 service/feature 按固定顺序组织：imports、公开常量/类型、公开错误、file-local helper、公开 workflow/service class。
- namespace 只放该领域对外有意义的类型和值构造器，不作为内部工具函数容器。
- 文件变大时再拆分；拆分后仍由该领域入口作为唯一公共出口，调用方不要从深层实现文件导入。
- `Effect.fn` 的 tracing 名称必须稳定、可搜索，并与模块领域一致；不要留下匿名 effect。

### API Schema

- `src/services/educoder-api/interfaces` 下的 schema 必须根据本地 HAR 或用户提供的请求/响应片段建模。
- 每一个 API Schema 定义之前必须保留精简、脱敏的内联样例注释，方便校对字段结构；注释使用 `Sample: METHOD /api/...` 这样的接口描述，不写 `.sample` 文件名或本地样例文件路径。
- 不准新增或继续依赖 `Schema.Json`、`Schema.Array(Schema.Json)`、`Schema.Record(..., Schema.Json)` 或开放 rest JSON 来回避建模；如果现有样例不足以定义 schema，必须向用户索要 HAR、响应片段或字段参考后再继续，不得打无类型的仗。
- 不得写入真实个人信息、密钥、Cookie 或大段正文。

### Layer 接入

- 新增 `Context.Service` 后，需要在 CLI 入口或调用它的上层 layer 中接入。
- `EducoderApi`、`AppContext`、`AppConfig` 由 `src/index.ts` 的 `Command.provide` 建立；feature service 的 layer 需要这些依赖时通过 Effect context 获取。
- API handler/command 只依赖 feature service，不重复组装 Educoder 请求细节。

### 验证要求

- 修改 TypeScript 代码后至少运行 `yarn check`。
- 修改构建、入口或跨模块类型后运行 `yarn build`。
- 格式化使用 `yarn prettier --write <files>`，不要引入与现有 Prettier 配置冲突的格式。
