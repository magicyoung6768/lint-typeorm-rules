import noFindWithoutSelect from "./rules/no-find-without-select.js";
import noGetmanyFirst from "./rules/no-getmany-first.js";
import noRawStringSql from "./rules/no-raw-string-sql.js";
import noDeepSkip from "./rules/no-deep-skip.js";
import noNPlusOne from "./rules/no-n-plus-one.js";
import noExcessiveJoin from "./rules/no-excessive-join.js";

// oxlint JS 插件入口（与 ESLint 插件 API 兼容）。
// 规则全名为 <meta.name>/<rule-key>，如 typeorm-rule/no-n-plus-one
const plugin = {
  meta: { name: "typeorm-rule" },
  rules: {
    "no-find-without-select": noFindWithoutSelect,
    "no-getmany-first": noGetmanyFirst,
    "no-raw-string-sql": noRawStringSql,
    "no-deep-skip": noDeepSkip,
    "no-n-plus-one": noNPlusOne,
    "no-excessive-join": noExcessiveJoin,
  },
};

export default plugin;
