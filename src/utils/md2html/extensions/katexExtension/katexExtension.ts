import { renderToString } from "katex";
import mdStyles from "../../../../styles/mdStyle.module.scss";
const inlineKatexRegex = /\$(.*?)\$/gi;
const blockKatexRegex = /\$\$(\s*.*\s*?)\$\$/gi;

const katexExtension = (content: string): string => {
  content = content.replace(
    blockKatexRegex,
    (_substring: string, formula: string): string => {
      const katexString = renderToString(formula, {
        throwOnError: false,
      });
      return `<div class="${mdStyles["block-katex"]}">${katexString}</div>`;
    }
  );

  content = content.replace(
    inlineKatexRegex,
    (_substring: string, formula: string): string => {
      const katexString = renderToString(formula, {
        throwOnError: false,
      });
      return `<span  class="${mdStyles["inline-katex"]}">${katexString}</span>`;
    }
  );

  return content;
};

export default katexExtension;
