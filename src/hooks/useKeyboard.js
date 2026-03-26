import { useEffect } from 'react';

/**
 * useKeyboard: handles game keyboard controls.
 * Ignores key events when focus is inside an input/textarea.
 */
export function useKeyboard({ onLeft, onRight, onDown, onSpace, onEscape, enabled = true }) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Check if user is typing in an input field
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isTyping = tag === 'input' || tag === 'textarea';

      switch (e.key) {
        case 'ArrowLeft':
          if (!isTyping) {
            e.preventDefault();
            onLeft?.();
          }
          break;
        case 'ArrowRight':
          if (!isTyping) {
            e.preventDefault();
            onRight?.();
          }
          break;
        case 'ArrowDown':
          if (!isTyping) {
            e.preventDefault();
            onDown?.();
          }
          break;
        case ' ':
          if (!isTyping) {
            e.preventDefault();
            onSpace?.();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onEscape?.();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, onLeft, onRight, onDown, onSpace, onEscape]);
}
