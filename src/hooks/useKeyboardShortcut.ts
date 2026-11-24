import { useEffect } from 'react';

interface ShortcutOptions {
  ctrlOrCmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook to listen for keyboard shortcuts (e.g. Cmd+K, Esc)
 */
export function useKeyboardShortcut(
  key: string,
  callback: (event: KeyboardEvent) => void,
  options: ShortcutOptions = {}
): void {
  const { ctrlOrCmd = false, shift = false, alt = false, preventDefault = true } = options;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isKeyMatch = event.key.toLowerCase() === key.toLowerCase();
      const isCtrlCmdMatch = !ctrlOrCmd || (event.ctrlKey || event.metaKey);
      const isShiftMatch = !shift || event.shiftKey;
      const isAltMatch = !alt || event.altKey;

      if (isKeyMatch && isCtrlCmdMatch && isShiftMatch && isAltMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, ctrlOrCmd, shift, alt, preventDefault]);
}
