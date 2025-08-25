import { getPropName } from "../shared.js";

const DEFAULT_THRESHOLD = 1000;

// 规约：深分页（LIMIT m, n）应改游标分页，避免DB 扫描并丢弃前 m 行。
export default {
  meta: {
    type: "problem",
    docs: { description: "禁止深分页大 skip，建议游标分页", recommended: true },
    schema: [{ type: "object", properties: { threshold: { type: "number" } }, additionalProperties: false }],
  },
  create(context) {
    const opts = context.options && context.options[0];
    const threshold = (opts && opts.threshold) || DEFAULT_THRESHOLD;

    function checkLiteral(lit) {
      if (lit && lit.type === "Literal" && typeof lit.value === "number" && lit.value > threshold) {
        context.report({
          node: lit,
          message:
            "深分页 skip=" + lit.value + " 超过阈值 " + threshold +
            "，DB 会扫描并丢弃前 N 行。改用游标分页（where id < lastId）。",
        });
      }
    }

    return {
      CallExpression(node) {
        if (getPropName(node.callee) === "skip") checkLiteral(node.arguments[0]);
      },
      ObjectExpression(node) {
        for (const p of node.properties) {
          if (
            p.type === "Property" &&
            p.key &&
            p.key.type === "Identifier" &&
            p.key.name === "skip"
          ) {
            checkLiteral(p.value);
          }
        }
      },
    };
  },
};
