import { walk, getPropName, JOIN_METHODS } from "../shared.js";

const THRESHOLD = 3;

// 规约：JOIN 不超过 3 表
export default {
  meta: {
    type: "problem",
    docs: { description: "单条查询 JOIN 表数不应超过 3 个", recommended: true },
    schema: [{ type: "object", properties: { max: { type: "number" } }, additionalProperties: false }],
  },
  create(context) {
    const opts = context.options && context.options[0];
    const max = (opts && opts.max) || THRESHOLD;

    return {
      Program(node) {
        for (const stmt of node.body) {
          const joins = [];
          walk(stmt, (n) => {
            if (n.type === "CallExpression" && JOIN_METHODS.has(getPropName(n.callee))) {
              joins.push(n);
            }
          });
          if (joins.length > max) {
            context.report({
              node: joins[max],
              message:
                "单条查询 JOIN 表数 " + joins.length + " 超过建议上限 " + max +
                "。建议拆成多次查询在内存组装，或下沉读模型/ES。",
            });
          }
        }
      },
    };
  },
};
