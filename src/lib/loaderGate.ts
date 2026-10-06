/**
 * Loader gate — coordinates the initial loading cover with the intro
 * sequence.
 *
 * `InitialLoader` (bottom-left 1-100% + fullscreen cover) calls
 * `notifyLoaderDone()` the moment its counter reaches 100%. The legacy
 * preloader (`lib/fx/preloader.ts`) awaits `waitForLoaderDone()` before
 * playing any text/nav reveals, so no page content is shown or animated
 * until loading has completed.
 *
 * The gate resolves at most once and has a hard timeout fallback so a
 * misbehaving loader can never stall the page forever. Client-only.
 */

let done = false;
const waiters = new Set<() => void>();

export function notifyLoaderDone(): void {
  if (done) return;
  done = true;
  waiters.forEach((fn) => {
    try {
      fn();
    } catch {
      /* ignore */
    }
  });
  waiters.clear();
}

export function isLoaderDone(): boolean {
  return done;
}

export function waitForLoaderDone(timeoutMs = 15000): Promise<void> {
  if (done) return Promise.resolve();
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }
    const timer = window.setTimeout(() => {
      waiters.delete(onDone);
      resolve();
    }, timeoutMs);
    const onDone = () => {
      window.clearTimeout(timer);
      resolve();
    };
    waiters.add(onDone);
  });
}
