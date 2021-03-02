import emojiMap from "./emojiMap";
import mdStyles from "../styles/mdStyle.module.scss";
const emojiRegex = /\[::([A-Za-z0-9\p{sc=Han}]+)_([A-Za-z0-9\p{sc=Han}]+)::\]/giu;

const emojiExtension = (content: string): string => {
  content = content.replace(
    emojiRegex,
    (substring: string, emojiClass: string, emojiName: string): string => {
      const emojiUrl = emojiMap[emojiClass]?.data[emojiName];
      return emojiUrl
        ? `<img  class="${mdStyles["emoji-img"]}" src="${emojiUrl}" alt="${emojiName}" title="${emojiName}"/>`
        : substring;
    }
  );
  return content;
};

export const genEmojiRuleName = (emojiClass: string, emojiName: string) => {
  return `[::${emojiClass}_${emojiName}::]`;
};

export default emojiExtension;
