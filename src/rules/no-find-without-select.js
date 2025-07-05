import { TYPEORM_ONLY_METHODS, getPropName } from "../shared.js";

// 规约：禁止 SELECT *。TypeORM 的 find/findAndCount 等默认返回全字段，等价 SELECT *。
export default {
  meta: {
    type: "problem",
    docs: { description: "禁止使用 TypeORM 等价 SELECT * 的查询方法", recommended: true },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") return;
        const name = getPropName(callee);
        if (!name) return;

        // 仅匹配 TypeORM 专属的“直接全字段查询”方法，避免与 Array.find 等内置冲突
        if (TYPEORM_ONLY_METHODS.has(name)) {
          context.report({
            node,
            message:
              "疑似 SELECT * 等价查询（" + name + "）。请使用 createQueryBuilder().select([...]) 显式列，或 DTO 投影，减少网络传输并命中覆盖索引。",
          });
        }
      },
    };
  },
};
