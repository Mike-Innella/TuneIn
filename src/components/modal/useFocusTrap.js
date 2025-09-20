import { useEffect } from "react";

export default function useFocusTrap(containerRef, isActive = false) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const selectors = [
      'a[href]', 'button:not([disabled])', 'textarea:not([disabled])',
      'input:not([disabled])', 'select:not([disabled])', '[tabindex]:not([tabindex="-1"])'
    ];
    const getFocusables = () =>
      Array.from(container.querySelectorAll(selectors.join(',')))
        .filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

    const focusables = getFocusables();
    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    // Move focus into the modal
    const previouslyFocused = document.activeElement;
    first?.focus();

    function onKeyDown(e) {
      if (e.key !== 'Tab') return;
      if (focusables.length === 0) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', onKeyDown);
    return () => {
      container.removeEventListener('keydown', onKeyDown);
      previouslyFocused && previouslyFocused.focus?.();
    };
  }, [containerRef, isActive]);
}