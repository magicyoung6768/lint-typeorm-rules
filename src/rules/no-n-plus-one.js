import { walk, isDbReadCall } from "../shared.js";

const LOOP_SELECTORS = ["ForOfStatement", "ForStatement", "ForInStatement", "WhileStatement"];
const ARRAY_ITER = ["forEach", "map", "filter", "reduce", "some", "every"];

// 规约：规避 N+1。禁止循环内逐条查询数据库。
export default {
  meta: {
    type: "problem",
    docs: { description: "禁止循环内逐条查询数据库（N+1 风险）", recommended: true },
    schema: [],
  },
  create(context) {
    function checkBody(body) {
      let hit = null;
      walk(body, (n) => {
        if (hit) return;
        if (isDbReadCall(n)) hit = n;
      });
      if (hit) {
        context.report({
          node: hit,
          message:
            "检测到循环/回调内逐条数据库查询（N+1）。改为一次 IN(...) 批量查询或 JOIN，将 N 次 RTT 降为 1 次。",
        });
      }
    }

    return {
      [LOOP_SELECTORS[0]]: (node) => checkBody(node.body),
      [LOOP_SELECTORS[1]]: (node) => checkBody(node.body),
      [LOOP_SELECTORS[2]]: (node) => checkBody(node.body),
      [LOOP_SELECTORS[3]]: (node) => checkBody(node.body),
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression" || callee.property.type !== "Identifier") return;
        if (!ARRAY_ITER.includes(callee.property.name)) return;
        const cb = node.arguments[0];
        if (cb && (cb.type === "FunctionExpression" || cb.type === "ArrowFunctionExpression")) {
          checkBody(cb.body);
        }
      },
    };
  },
};
