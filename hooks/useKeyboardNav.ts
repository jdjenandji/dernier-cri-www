import { useEffect } from "react";

interface KeyboardNavOptions {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onSpace?: () => void;
  enabled?: boolean;
}

export function useKeyboardNav({
  onArrowUp,
  onArrowDown,
  onSpace,
  enabled = true,
}: KeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          onArrowUp?.();
          break;
        case "ArrowDown":
          e.preventDefault();
          onArrowDown?.();
          break;
        case " ":
          e.preventDefault();
          onSpace?.();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onArrowUp, onArrowDown, onSpace, enabled]);
}
