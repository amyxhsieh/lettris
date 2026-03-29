import { useEffect } from 'react';

/**
 * useKeyboard: handles game keyboard controls.
 * Ignores key events when focus is inside an input/textarea.
 */
export function useKeyboard({ onLeft, onRight, onDown, onSpace, onEscape, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowLeft':  e.preventDefault(); onLeft?.();   break;
        case 'ArrowRight': e.preventDefault(); onRight?.();  break;
        case 'ArrowDown':  e.preventDefault(); onDown?.();   break;
        case ' ':          e.preventDefault(); onSpace?.();  break;
        case 'Escape':     e.preventDefault(); onEscape?.(); break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onLeft, onRight, onDown, onSpace, onEscape]);
}
