import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Button } from "antd";
import { SmileOutlined, FileSearchOutlined } from "@ant-design/icons";
import IconFont from "../IconFont/IconFont";
import emojiMap from "../../utils/emojiMap";
import { genEmojiRuleName } from "../../utils/emojiExtension";
import md2html, { Resolve } from "../../utils/md2html";
import combineClassNames from "../../utils/combineClassNames";
import { defaultImg } from "../../utils/lazyLoad/imgUrl";
import { useImgLazyLoad } from "../../utils/lazyLoad/lazyLoad";
import "highlight.js/styles/monokai-sublime.css";
import styles from "./Editor.module.scss";
import mdStyles from "../../styles/mdStyle.module.scss";

interface EditorProps {
  getInputValue?: (resolve: Resolve, md: string) => unknown;
  placeholder?: string;
  content?: string;
  submitHandle?: (...args: unknown[]) => unknown;
  showSubmitButton?: boolean;
}

export interface EditorRef {
  focusHandle: () => void;
  clearValue: () => void;
  getContent: () => [resolve: Resolve, md: string];
}

// forwardRef 可以将父组件的ref传递下来
// 个人理解就是给函数组件增加了一个ref属性，以可以接收传递下来的ref
const Editor = forwardRef<EditorRef, EditorProps>(
  (
    {
      getInputValue,
      placeholder = "请在此输入...",
      content = "",
      submitHandle,
      showSubmitButton = true,
    },
    ref
  ) => {
    const [activeEmojiClass, setActiveEmojiClass] = useState(() => {
      return Object.keys(emojiMap)[0];
    });

    const focusHandle = () => {
      textAreaRef.current?.focus();
    };

    const clearValue = () => {
      setTextAreaContent("");
    };

    const getContent = (getTitle = false): [Resolve, string] => {
      return [md2html(textAreaContent, getTitle), textAreaContent];
    };

    // 此hooks可以将组件内的函数传递到父组件中
    // 个人理解：就是将第二个参数返回的整个对象赋值给传递下来的ref
    // 因为整个ref是父组件传递下来的，这样父组件自然可以直接使用这个被改变的ref
    useImperativeHandle(ref, () => ({
      focusHandle,
      clearValue,
      getContent,
    }));

    const [isEmojiShow, setIsEmojiShow] = useState(false);
    const [isPreviewShow, setIsPreviewShow] = useState(false);

    const [textAreaContent, setTextAreaContent] = useState(content);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
      setTextAreaContent(content);
    }, [content]);

    const toggleEmojiShow = () => {
      setIsPreviewShow(false);
      setIsEmojiShow(!isEmojiShow);
    };

    const togglePreviewShow = () => {
      if (!isPreviewShow && textAreaContent.length <= 0) {
        return;
      }
      setIsEmojiShow(false);
      setIsPreviewShow(!isPreviewShow);
    };

    const selectEmojiClass = (emojiClass: string) => {
      setActiveEmojiClass(emojiClass);
    };

    const getStartPartText = (fullText: string, selectionStart: number) => {
      return fullText.substring(0, selectionStart);
    };

    const getEndPartText = (fullText: string, selectionEnd: number) => {
      return fullText.substring(selectionEnd, fullText.length);
    };

    const getSelect = (): [selectStart: number, selectEnd: number] => {
      const textArea = textAreaRef.current;
      if (!textArea) {
        return [0, 0];
      }
      const selectStart = textArea.selectionStart;
      const selectEnd = textArea.selectionEnd;
      return [selectStart, selectEnd];
    };

    const selectEmoji = (emojiRuleName: string) => {
      const [selectStart, selectEnd] = getSelect();
      const textArea = textAreaRef.current;
      if (!textArea) return;
      setTextAreaContent(
        `${getStartPartText(
          textAreaContent,
          selectStart
        )}${emojiRuleName}${getEndPartText(textAreaContent, selectEnd)}`
      );
      textArea.focus();

      setTimeout(() => {
        textArea.selectionStart = selectStart + emojiRuleName.length;
        textArea.selectionEnd = selectEnd + emojiRuleName.length;
        getInputValue && getInputValue(md2html(textArea.value), textArea.value);
      });
    };

    useImgLazyLoad();

    return (
      <div className={styles.wrapper}>
        <textarea
          className={styles.input}
          placeholder={placeholder}
          value={textAreaContent}
          ref={textAreaRef}
          onChange={(e) => {
            setTextAreaContent(e.target.value);
            if (e.target.value.length <= 0) {
              setIsPreviewShow(false);
            }
            getInputValue &&
              getInputValue(md2html(e.target.value), e.target.value);
          }}
        ></textarea>
        <div className={styles.toolbar}>
          <div
            className={combineClassNames(
              styles.icon,
              isPreviewShow ? styles["tool-active"] : ""
            )}
            onClick={togglePreviewShow}
          >
            <FileSearchOutlined />
          </div>
          <div
            className={combineClassNames(
              styles.icon,
              isEmojiShow ? styles["tool-active"] : ""
            )}
            onClick={toggleEmojiShow}
          >
            <SmileOutlined />
          </div>
        </div>
        <div className={styles["submit-bar"]}>
          <div className={styles.icon}>
            <IconFont
              type="icon-markdown"
              alt="Markdown is supported"
              title="Markdown is supported"
            ></IconFont>
          </div>
          {showSubmitButton && (
            <Button type="default" onClick={submitHandle}>
              提交
            </Button>
          )}
        </div>
        <div
          className={combineClassNames(
            styles["emoji-box"],
            isEmojiShow ? "" : styles.hide
          )}
        >
          <div className={styles["emoji-title"]}>{activeEmojiClass}</div>
          <div className={styles["emoji-list"]}>
            {(Object.keys(emojiMap[activeEmojiClass].data) ?? []).map(
              (emojiName) => {
                return (
                  <img
                    className={styles["emoji-item"]}
                    src={defaultImg}
                    data-src={emojiMap[activeEmojiClass].data[emojiName]}
                    alt={emojiName}
                    title={emojiName}
                    key={genEmojiRuleName(activeEmojiClass, emojiName)}
                    onClick={() => {
                      selectEmoji(
                        genEmojiRuleName(activeEmojiClass, emojiName)
                      );
                    }}
                  />
                );
              }
            )}
          </div>
          <div className={styles["emoji-tab"]}>
            {(Object.keys(emojiMap) ?? []).map((emojiClass) => {
              return (
                <div
                  className={combineClassNames(
                    styles["emoji-tab-item"],
                    activeEmojiClass === emojiClass
                      ? styles["emoji-tab-active"]
                      : ""
                  )}
                  key={emojiClass}
                  onClick={() => {
                    selectEmojiClass(emojiClass);
                  }}
                >
                  <img
                    className={styles["emoji-tab-item-cover"]}
                    src={defaultImg}
                    data-src={emojiMap[emojiClass].cover}
                    alt={emojiClass}
                    title={emojiClass}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div
          className={combineClassNames(
            styles["preview-box"],
            mdStyles["md-box"],
            isPreviewShow ? "" : styles.hide
          )}
          dangerouslySetInnerHTML={{
            __html: md2html(textAreaContent).htmlContent,
          }}
        ></div>
      </div>
    );
  }
);

export default Editor;
