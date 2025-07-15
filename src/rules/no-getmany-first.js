import { getPropName } from "../shared.js";

// 规约：取一条必须 LIMIT 1。getMany()[0] 会扫描所有匹配行再截断。
export default {
  meta: {
    type: "problem",
    docs: { description: "禁止用 getMany()[0] 取单条，应使用 findOne/getOne", recommended: true },
    schema: [],
  },
  create(context) {
    return {
      MemberExpression(node) {
        if (!node.computed) return;
        const isZero =
          node.property.type === "Literal" &&
          (node.property.value === 0 || node.property.value === "0");
        if (!isZero) return;

        let obj = node.object;
        if (obj.type === "AwaitExpression") obj = obj.argument; // 剥掉 await 包裹
        if (obj.type === "CallExpression" && getPropName(obj.callee) === "getMany") {
          context.report({
            node,
            message: "不要用 getMany()[0] 取单条，会扫描所有匹配行再截断。改用 findOne()/getOne()（自动 LIMIT 1）。",
          });
        }
      },
    };
  },
};
