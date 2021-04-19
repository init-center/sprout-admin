import marked, { Renderer } from "marked";
import emojiExtension from "./extensions/emojiExtension/emojiExtension";
import { addLazyLoadAttrToMdImg } from "../lazyLoad/lazyLoad";
import { getLanguage, highlight, highlightAuto } from "highlight.js";
import striptags from "striptags";
import katexExtension from "./extensions/katexExtension/katexExtension";
import mdStyles from "../../styles/mdStyle.module.scss";

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type Title = {
  level: TitleLevel;
  text: string;
  id: string;
  children: Title[];
};

export type Resolve = {
  htmlContent: string;
  titles: Title[];
  titleIds: string[];
  titleChildrenIdMap: TitleChildrenIdMap;
};

export type TitleChildrenIdMap = { [id: string]: string[] };

//封装解析标题的函数
function pushTitle(
  level: TitleLevel,
  text: string,
  index: number,
  id: string,
  titles: Title[]
): void {
  //如果数组内没有内容，则直接插入
  if (titles.length === 0) {
    titles.push({
      level: level,
      text: text,
      id: id,
      children: [],
    });
    return;
  }
  //如果数组不为空，则与数组的最后一个对象中的level比较
  //如果比最后一个大
  if (level > titles[titles.length - 1].level) {
    //如果比子节点对象的level只大一，那么就直接插入它的子数组
    if (level - titles[titles.length - 1].level === 1) {
      titles[titles.length - 1].children.push({
        level: level,
        text: text,
        id: id,
        children: [],
      });
    } else {
      //如果不止大一，则递归，直到找到一个空的子数组或者刚好比它小一的子对象
      pushTitle(level, text, index, id, titles[titles.length - 1].children);
    }
  } else {
    //比最后一个小或者一样大，那么说明这个标题是和这个数组中的标题一样大的标题或者比它更大，
    //这时不管是不是输入错误都直接push一个与之并列的即可
    titles.push({
      level: level,
      text: text,
      id: id,
      children: [],
    });
  }
}

function pushChildToChildrenArr(
  titleChildrenIdMap: TitleChildrenIdMap,
  title: Title
) {
  if (title.children.length === 0) {
    return [];
  }
  let titleChildren: string[] = [];
  const id = title.id;
  for (let i = 0; i < title.children.length; i++) {
    titleChildren.push(title.children[i].id);
    const children = pushChildToChildrenArr(
      titleChildrenIdMap,
      title.children[i]
    );
    titleChildren = [...titleChildren, ...children];
  }
  titleChildrenIdMap[id] = titleChildren;
  return titleChildren;
}

function genTitleChildrenIdMap(titles: Title[]) {
  const titleChildrenIdMap: TitleChildrenIdMap = {};
  for (let i = 0; i < titles.length; i++) {
    pushChildToChildrenArr(titleChildrenIdMap, titles[i]);
  }
  return titleChildrenIdMap;
}

export default function md2html(
  mdString: string,
  getTitle = false,
  lazyLoad = true
): Resolve {
  const renderer = new Renderer();

  const titleArr: Title[] = [];
  const titleIds: string[] = [];

  if (getTitle) {
    let index = 0;
    renderer.heading = function (text, level): string {
      const stripTagsHeader = striptags(text);
      const id = `${level}_${stripTagsHeader}_${index}`;
      //使用上面定义的分析标题函数
      pushTitle(level, stripTagsHeader, index, id, titleArr);
      titleIds.push(id);

      //返回标题格式
      return `<h${level} id="${level}_${stripTagsHeader}_${index++}">${text}</h${level}>`;
    };
  }

  renderer.code = function (code, language) {
    if (language === "mermaid") {
      return `<div class="mermaid ${mdStyles.mermaid}">${code}</div>`;
    } else {
      if (!language) {
        return `<pre><code class="hljs">${code}</code></pre>`;
      }
      return `<pre><code class="hljs-${language}">${
        getLanguage(language)
          ? highlight(language, code).value
          : highlightAuto
          ? highlightAuto(code).value
          : code
      }</code></pre>`;
    }
  };

  const supportFootnote = (mdString: string) => {
    const footnoteRefReg = /\[\^ *?([^\[^\]^\n^\s]{1}[^\[^\]^\n]*?)\]/gi;

    const footnoteReg = /^\[\^ *?([^\[^\]^\n^\s]{1}[^\[^\]^\n]*?)\]: *?(.+)$/gim;

    interface Footnote {
      index: number;
      name: string;
    }
    const footnotes: Footnote[] = [];
    let footnoteIndex = 1;
    mdString = mdString.replace(footnoteReg, (_substring, p1, p2) => {
      const index = footnoteIndex++;
      if (!footnotes.includes(p1)) {
        footnotes.push({
          index,
          name: p1,
        });
      }
      return `<p id="fn${index}" class="${mdStyles["footnote-item"]}">
    <span class="${mdStyles["footnote-index"]}">[${index}]</span>${p2}<a class="${mdStyles["fn-ref"]}" href="#fnref${index}">↩︎</a>
    </p>`;
    });

    mdString = mdString.replace(footnoteRefReg, (substring, p1) => {
      const footnote = footnotes.find((f) => f.name === p1);
      if (footnote) {
        return `<sup id="fnref${footnote.index}" class="${mdStyles.sup}"><a href="#fn${footnote.index}">[${footnote.index}]</a></sup>`;
      } else {
        return substring;
      }
    });

    return mdString;
  };

  mdString = supportFootnote(mdString);

  marked.setOptions({
    gfm: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    smartypants: false,
  });

  return {
    htmlContent: lazyLoad
      ? addLazyLoadAttrToMdImg(
          katexExtension(
            emojiExtension(marked(mdString, { renderer: renderer }))
          )
        )
      : katexExtension(
          emojiExtension(marked(mdString, { renderer: renderer }))
        ),
    titles: titleArr,
    titleIds: Array.from(new Set(titleIds)),
    titleChildrenIdMap: getTitle ? genTitleChildrenIdMap(titleArr) : {},
  };
}
