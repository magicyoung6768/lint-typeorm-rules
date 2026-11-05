# lint-typeorm-rules

一套 **oxlint JS 插件**，把《阿里巴巴 Java 开发手册》的 ORM 映射规约落到 TypeORM 代码里

> 基于 oxlint 的 **JS 插件 API**（与 ESLint 插件 API 完全兼容，无需 Rust）。同一份规则在 ESLint 里也能直接用。


插件实现位于 `src/` 目录（`index.js` + `shared.js` + `rules/`），根目录的 `typeorm-rule-plugin.js` 是供 oxlint / ESLint 引用的稳定入口。

## 规则清单

| 规则 | 对应阿里规约 | 级别 | 拦截的写法 |
|------|------------|------|-----------|
| `typeorm-rule/no-find-without-select` | 禁止 SELECT \* | warn | `repo.findAndCount()` / `repo.findBy()` 等默认返回全字段 |
| `typeorm-rule/no-getmany-first` | 取一条必须 LIMIT 1 | error | `(await qb.getMany())[0]` 应改 `findOne()` |
| `typeorm-rule/no-raw-string-sql` | SQL 必须参数化（防注入） | error | 含 `${}` 插值的 `dataSource.query(\`...\`)` |
| `typeorm-rule/no-deep-skip` | 深分页改游标 | warn | `.skip(100000)` / `skip: 100000`（默认阈值 1000） |
| `typeorm-rule/no-n-plus-one` | 规避 N+1 | error | 循环 / `forEach` / `map` 回调内逐条查库 |
| `typeorm-rule/no-excessive-join` | JOIN 不超 3 表 | warn | 单查询 `leftJoinAndSelect` + `innerJoinAndSelect` 超过 3 次 |

## 快速开始

```bash
npm install          # 安装 oxlint
npm run lint         # 按 .oxlintrc.json 扫描项目
npm run lint:fix     # 自动修复可修复的问题
npm run lint:ci      # CI 模式：警告也视为失败
```

`src/samples/` 中的示例默认不参与 `npm run lint`，避免故意违规的 `bad.ts` 阻塞日常检查。需要验证规则效果时执行：

```bash
npm run lint:samples # 扫描示例；bad.ts 会按预期报错，pass.ts 不应报错
```

## 配置

`.oxlintrc.json`

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "env": {
    "node": true,
    "es2024": true
  },
  "jsPlugins": ["./typeorm-rule-plugin.js"],
  "rules": {
    "typeorm-rule/no-find-without-select": "warn",
    "typeorm-rule/no-getmany-first": "error",
    "typeorm-rule/no-raw-string-sql": "error",
    "typeorm-rule/no-deep-skip": "warn",
    "typeorm-rule/no-n-plus-one": "error",
    "typeorm-rule/no-excessive-join": "warn"
  }
}
```

- `env` 预置 Node.js 与 ES2024 全局变量，避免 `process`、`Buffer` 等被误报为未定义。
- `jsPlugins` 路径相对于配置文件所在目录解析。
- 需要忽略目录时使用 `ignorePatterns`（默认已忽略 `node_modules`、`dist`、`coverage` 和 `src/samples`）。

### 可配置项

```json
{
  "jsPlugins": ["./typeorm-rule-plugin.js"],
  "rules": {
    "typeorm-rule/no-deep-skip": ["warn", { "threshold": 500 }],
    "typeorm-rule/no-excessive-join": ["warn", { "max": 2 }]
  }
}
```


