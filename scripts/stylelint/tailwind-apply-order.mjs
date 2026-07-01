import stylelint from "stylelint";
import { profiles } from "./tailwind-apply-order.profiles.mjs";

const ruleName = "custom/tailwind-apply-order";

const messages = stylelint.utils.ruleMessages(ruleName, {
  expected: "Expected @apply utilities to follow the AGENTS.md order and one-concern-per-line structure.",
  unmatched: (tokens) => `Unmatched ${tokens.length > 1 ? "utilities" : "utility"} in @apply: ${tokens.join(", ")}`,
});

function parseApplyParams(params) {
  return params.split(/\s+/).map((token) => token.trim()).filter(Boolean);
}

function classifyToken(token) {
  const profileIndex = profiles.findIndex((profile) => profile.match(token));

  return profileIndex === -1 ? { matched: false, token } : { matched: true, token, profileIndex };
}

function analyzeTokens(nodes) {
  const currentTokens = nodes.flatMap((node) => parseApplyParams(node.params));
  const currentBlocks = nodes.map((node) => parseApplyParams(node.params));
  const classifications = currentTokens.map(classifyToken);
  const unmatchedTokens = classifications.filter((classification) => !classification.matched).map((classification) => classification.token);
  const groupedTokens = profiles.map(() => []);

  classifications.forEach((classification) => {
    if (classification.matched) {
      groupedTokens[classification.profileIndex].push(classification.token);
    }
  });

  return {
    currentTokens,
    currentBlocks,
    groupedTokens: groupedTokens.filter((tokens) => tokens.length > 0),
    unmatchedTokens,
  };
}

function blocksAreEqual(left, right) {
  return left.length === right.length && left.every((token, index) => token === right[index]);
}

function needsRewrite(currentBlocks, groupedBlocks) {
  return currentBlocks.length !== groupedBlocks.length || !currentBlocks.every((block, index) => blocksAreEqual(block, groupedBlocks[index]));
}

function indentFrom(before = "") {
  return `\n${before.match(/\n(\s*)$/)?.[1] ?? "  "}`;
}

function cloneApplyNode(node, params, before) {
  return node.clone({
    params,
    raws: {
      ...node.raws,
      before,
    },
  });
}

function replaceApplyNodes(nodes, groupedTokens) {
  if (nodes.length === 0) {
    return;
  }

  const [firstNode, ...restNodes] = nodes;
  const before = indentFrom(firstNode.raws.before);
  const replacementNodes = groupedTokens.map((tokens) => cloneApplyNode(firstNode, tokens.join(" "), before));

  firstNode.replaceWith(...replacementNodes);
  restNodes.forEach((node) => node.remove());
}

function reportUnmatched(node, result, tokens) {
  if (tokens.length === 0) {
    return;
  }

  stylelint.utils.report({
    message: messages.unmatched(tokens),
    node,
    result,
    ruleName,
    severity: "warning",
  });
}

function rule(primaryOption, _secondaryOptions, context) {
  return (root, result) => {
    if (!stylelint.utils.validateOptions(result, ruleName, { actual: primaryOption, possible: [true] })) {
      return;
    }

    root.walkRules((ruleNode) => {
      const applyNodes = [];

      ruleNode.walkAtRules("apply", (atRule) => {
        applyNodes.push(atRule);
      });

      if (applyNodes.length === 0) {
        return;
      }

      const { currentBlocks, groupedTokens, unmatchedTokens } = analyzeTokens(applyNodes);

      if (unmatchedTokens.length > 0) {
        reportUnmatched(applyNodes[0], result, unmatchedTokens);
        return;
      }

      if (!needsRewrite(currentBlocks, groupedTokens)) {
        return;
      }

      if (context.fix) {
        replaceApplyNodes(applyNodes, groupedTokens);
        return;
      }

      stylelint.utils.report({
        message: messages.expected,
        node: applyNodes[0],
        result,
        ruleName,
      });
    });
  };
}

export default stylelint.createPlugin(ruleName, rule);
export { messages, ruleName };
