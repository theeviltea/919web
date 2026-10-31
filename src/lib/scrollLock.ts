// Page scroll lock shared by every overlay (modal, drawer, app sheet).
// A counter, not "save and restore the previous value": with two overlays open, or one re-rendering,
// restoring a saved value could leave the page stuck on overflow: hidden after everything closed.
let locks = 0;

export function lockScroll(): () => void {
  locks += 1;
  document.documentElement.style.overflow = 'hidden';
  let done = false;
  return () => {
    if (done) return;
    done = true;
    locks = Math.max(0, locks - 1);
    if (locks === 0) document.documentElement.style.overflow = '';
  };
}

/** Safety net for route changes: if no overlay is open, the page must scroll. */
export function releaseIfIdle() {
  if (locks === 0) {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
}
