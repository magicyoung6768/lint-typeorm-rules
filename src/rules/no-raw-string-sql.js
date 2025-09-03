import { getPropName } from "../shared.js";

// 规约：SQL 必须参数化，禁止字符串拼接（防注入 + 执行计划缓存）。
export default {
  meta: {
    type: "problem",
    docs: { description: "禁止字符串拼接 SQL（含 ${} 插值），防止 SQL 注入", recommended: true },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        const name = getPropName(node.callee);
        if (name !== "query") return;
        const arg = node.arguments[0];
        if (arg && arg.type === "TemplateLiteral" && arg.quasis.length > 1) {
          context.report({
            node,
            message:
              "检测到字符串拼接 SQL（含 ${} 插值），存在 SQL 注入风险。使用参数化：query('... WHERE id = ?', [id]) 或 QueryBuilder.where('id = :id', { id })。",
          });
        }
      },
    };
  },
};
