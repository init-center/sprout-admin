import { useEffect, useCallback } from "react";
import throttle from "../throttle/throttle";
import { defaultImg, errorImg } from "./imgUrl";

function isElementInViewport(el: HTMLImageElement) {
  const rect = el.getBoundingClientRect();

  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.top < (window.innerHeight || document.documentElement.clientHeight)
  );
}

function loadImage(el: HTMLImageElement, errorUrl = errorImg) {
  const dataSrc = el.getAttribute("data-src");
  el.removeAttribute("data-src");
  const img = new Image();
  img.onload = () => {
    el.src = dataSrc ?? errorUrl;
  };
  img.onerror = () => {
    el.src = errorUrl;
  };
  img.src = dataSrc ?? errorUrl;
  el.onerror = () => {
    el.src = errorUrl;
  };
  el.onload = () => {
    img.remove();
  };
}

function filterImgToLoad(errorUrl = errorImg) {
  const lazyLoadImages = document.querySelectorAll("img[data-src]");
  for (let i = 0; i < lazyLoadImages.length; i++) {
    if (isElementInViewport(lazyLoadImages[i] as HTMLImageElement)) {
      loadImage(lazyLoadImages[i] as HTMLImageElement, errorUrl);
    }
  }
}

// Used to manually trigger lazy loading when there is tab switching but no scrolling
export const lazyLoadTrigger = (): void => {
  setTimeout(() => {
    filterImgToLoad();
  });
};

export function useImgLazyLoad(
  triggerWrapperElements: (Element | Document | null)[] = [],
  errorUrl = errorImg
) {
  const lazyLoad = throttle(() => {
    filterImgToLoad(errorUrl);
  });

  if (typeof window !== "undefined" && window?.document) {
    triggerWrapperElements.push(document);
  }
  triggerWrapperElements = Array.from(new Set(triggerWrapperElements));

  const unBindTriggerEvents = useCallback(
    (triggerWrapperElements: (Element | Document | null)[] = []) => {
      for (let i = 0; i < triggerWrapperElements.length; i++) {
        const triggerElement = triggerWrapperElements[i];
        triggerElement?.addEventListener("scroll", lazyLoad, false);
        triggerElement?.addEventListener("resize", lazyLoad, false);
        triggerElement?.addEventListener("orientationChange", lazyLoad, false);
      }
    },
    [lazyLoad]
  );

  const bindTriggerEvents = useCallback(
    (triggerWrapperElements) => {
      filterImgToLoad(errorUrl);
      // unBind before bind
      unBindTriggerEvents(triggerWrapperElements);
      for (let i = 0; i < triggerWrapperElements.length; i++) {
        const triggerElement = triggerWrapperElements[i];
        triggerElement?.addEventListener("scroll", lazyLoad, false);
        triggerElement?.addEventListener("resize", lazyLoad, false);
        triggerElement?.addEventListener("orientationChange", lazyLoad, false);
      }
    },
    [lazyLoad, unBindTriggerEvents, errorUrl]
  );

  useEffect(() => {
    // Load once even if there is no scroll on first entry
    filterImgToLoad(errorUrl);

    bindTriggerEvents(triggerWrapperElements);
    return () => {
      unBindTriggerEvents(triggerWrapperElements);
    };
  }, [
    errorUrl,
    bindTriggerEvents,
    unBindTriggerEvents,
    triggerWrapperElements,
  ]);

  return [bindTriggerEvents, unBindTriggerEvents];
}

export function addLazyLoadAttrToMdImg(
  md: string,
  placeholder = defaultImg
): string {
  const imgRegex = /<img\s(.*?)src="(.*?)"(.*?)>/gi;
  return md.replace(imgRegex, function (str, _p1, p2) {
    if (/data-src/gi.test(str)) {
      return str;
    }
    if (/src="data:image(.*?)"/gi.test(str)) {
      return str;
    }
    if (/no-lazy/gi.test(str)) {
      return str;
    }
    return str.replace(p2, `${placeholder}" data-src="${p2}`);
  });
}
