# 信创工业综合治理平台 - 开发规范与最佳实践 (Development Guidelines)

为保证代码质量、可维护性与团队协作效率，特制定以下开发规范。在开发过程中必须严格遵守。

## 1. 模块化与高复用原则 (Modularity & Reusability)
- **公共组件/方法优先**：在编写新功能前，先检查 `src/components` (前端) 或 `libs/common` (后端) 中是否已有可复用的组件或方法。能公共使用的功能必须抽取为公共代码，严禁复制粘贴相同的业务逻辑。
- **建立公共组件库**：前端必须维护统一的业务组件库（如公共的表格封装、公共分页容器、公共弹窗组件、字典下拉框组件等）。

## 2. 代码拆分与细粒度控制 (Code Splitting)
- **前端组件拆分**：当单个 Vue 组件代码量过多（如超过 300 行），或包含多个独立的视图区域（如顶部搜索表单区、数据表格区、新增/编辑弹窗区）时，**必须**将其拆分为多个子组件（如 `SearchForm.vue`, `DataTable.vue`, `EditDialog.vue`），并在父页面中引入拼装。
- **后端方法拆分**：当单个 Controller 或 Service 方法代码量过大（如超过 80 行）或包含复杂的业务流转时，**必须**提取成多个具有“单一职责”的私有方法或独立的 Helper/Utility 类。

## 3. 命名规范 (Naming Conventions)
- **前端**：
  - 组件文件及 Class 名称使用大驼峰 `PascalCase`（如 `UserProfile.vue`）。
  - 变量与函数名使用小驼峰 `camelCase`（如 `fetchDataList`）。
  - 常量使用全大写加下划线 `UPPER_SNAKE_CASE`。
- **后端**：
  - 实体类、DTO、Service 名称使用大驼峰 `PascalCase`。
  - 路由地址与数据库表名/字段名使用下划线 `snake_case` 或连字符 `kebab-case`。

## 4. 类型安全与 TypeScript (Type Safety)
- **严格约束**：前后端必须严格使用 TypeScript 类型定义接口与参数，**严禁滥用 `any`**。
- **模型同步**：前后端交互的 API 请求体与响应结构必须定义明确的 `interface` 或 `type`，保持字段对齐。

## 5. 错误处理与异常日志 (Error Handling)
- **前端全局捕获**：统一在 Axios 拦截器中处理 Token 过期、无权限及网络异常提示，组件内只处理特定的业务分支。
- **后端全局拦截**：使用统一的全局异常过滤器 (Global Exception Filter) 捕获错误，并返回标准化的数据结构（如 `{ code: 200, data: null, message: "success" }`）。

## 6. 注释与文档说明 (Comments & Documentation)
- **复杂逻辑注释**：对于复杂的业务算法、正则表达式、或为解决特定 Bug 而写的“反直觉代码”，必须加上详细注释说明原因。
- **API 接口说明**：后端接口必须使用 Swagger 等注解生成实时在线文档，标明必填项与字段含义。
