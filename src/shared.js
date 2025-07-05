// 共享 AST 工具与 TypeORM 方法名集合（ESTree 标准，oxlint JS 插件与 ESLint 兼容）

// 数据库读操作相关方法（含 Array.find 也会命中，规则里另行区分）
export const DB_READ_METHODS = new Set([
  "find", "findOne", "findMany", "findAndCount", "findAndCountBy",
  "findBy", "findOneBy", "findOneOrFail", "findByIds",
  "createQueryBuilder", "query", "getMany", "getOne", "count",
]);

// 仅 TypeORM 拥有、不会与 Array/Object 内置方法冲突的“直接全字段查询”方法。
// 注意：createQueryBuilder/getMany/getOne 是构建器或执行器，是否 SELECT * 取决于链式是否 .select()，
// 为避免误报不在此列（由 no-getmany-first 等规则单独处理）。
export const TYPEORM_ONLY_METHODS = new Set([
  "findAndCount", "findAndCountBy", "findBy", "findOneBy", "findOneOrFail",
  "findByIds", "findMany",
]);

export const JOIN_METHODS = new Set(["leftJoinAndSelect", "innerJoinAndSelect"]);

// 取 MemberExpression 的属性名，如 repo.find -> "find"
export function getPropName(callee) {
  if (callee && callee.type === "MemberExpression" && callee.property.type === "Identifier") {
    return callee.property.name;
  }
  return null;
}

// 判断一个 CallExpression 是否是数据库读调用
export function isDbReadCall(node) {
  if (!node || node.type !== "CallExpression") return false;
  const name = getPropName(node.callee);
  return name ? DB_READ_METHODS.has(name) : false;
}

// 通用 AST 遍历（防环，跳过 parent 引用避免回退）
export function walk(node, visit, visited = new Set()) {
  if (!node || typeof node !== "object" || visited.has(node)) return;
  visited.add(node);
  if (Array.isArray(node)) {
    for (const child of node) walk(child, visit, visited);
    return;
  }
  if (typeof node.type === "string") visit(node);
  for (const key of Object.keys(node)) {
    if (key === "parent") continue;
    walk(node[key], visit, visited);
  }
}
