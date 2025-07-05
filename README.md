# lint-typeorm-rules

一套 **oxlint JS 插件**，把《阿里巴巴 Java 开发手册》的 ORM 映射规约落到 TypeORM 代码里

> 基于 oxlint 的 **JS 插件 API**（与 ESLint 插件 API 完全兼容，无需 Rust）。同一份规则在 ESLint 里也能直接用。


标准插件结构在 `plugin/` 目录（`index.js` + `shared.js` + `rules/`），便于维护/拆分。

## 规则清单

| 规则 | 对应阿里规约 | 级别 | 拦截的写法 |
|------|------------|------|-----------|
| `typeorm-ali/no-find-without-select` | 禁止 SELECT \* | warn | `repo.findAndCount()` / `repo.findBy()` 等默认返回全字段 |
| `typeorm-ali/no-getmany-first` | 取一条必须 LIMIT 1 | error | `(await qb.getMany())[0]` 应改 `findOne()` |
| `typeorm-ali/no-raw-string-sql` | SQL 必须参数化（防注入） | error | 含 `${}` 插值的 `dataSource.query(\`...\`)` |
| `typeorm-ali/no-deep-skip` | 深分页改游标 | warn | `.skip(100000)` / `skip: 100000`（默认阈值 1000） |
| `typeorm-ali/no-n-plus-one` | 规避 N+1 | error | 循环 / `forEach` / `map` 回调内逐条查库 |
| `typeorm-ali/no-excessive-join` | JOIN 不超 3 表 | warn | 单查询 `leftJoinAndSelect` + `innerJoinAndSelect` 超过 3 次 |

## 快速开始

```bash
npm install          # 安装 oxlint
npx oxlint           # 按 .oxlintrc.json 扫描项目
```

## 配置

`.oxlintrc.json`

```json
{
  "jsPlugins": ["./typeorm-ali-plugin.js"],
  "rules": {
    "typeorm-ali/no-find-without-select": "warn",
    "typeorm-ali/no-getmany-first": "error",
    "typeorm-ali/no-raw-string-sql": "error",
    "typeorm-ali/no-deep-skip": "warn",
    "typeorm-ali/no-n-plus-one": "error",
    "typeorm-ali/no-excessive-join": "warn"
  }
}
```

### 可配置项

```json
{
  "jsPlugins": ["./typeorm-ali-plugin.js"],
  "rules": {
    "typeorm-ali/no-deep-skip": ["warn", { "threshold": 500 }],
    "typeorm-ali/no-excessive-join": ["warn", { "max": 2 }]
  }
}
```


