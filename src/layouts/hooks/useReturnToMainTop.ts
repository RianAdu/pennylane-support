import { useEffect, useRef } from "react";

export const MAIN_ID = "main";

/**
 * When `key` changes from one value to another, shows the top of the main area and moves focus there, so a new page
 * of a list is read from its start by eyes and by a screen reader alike. A first value is not a change.
 */
export const useReturnToMainTop = (key: string | number | undefined): void => {
  const previous = useRef(key);

  useEffect(() => {
    const changed = previous.current !== undefined && key !== undefined && previous.current !== key;
    previous.current = key;
    if (changed) {
      const main = document.getElementById(MAIN_ID);
      main?.focus({ preventScroll: true });
      main?.scrollIntoView();
    }
  }, [key]);
};
