/**
 * tabState — lightweight per-tab UI-state persistence.
 *
 * Each workspace tab (Reels / Podcast / Studio) lives on its own Next.js
 * route, so switching tabs unmounts the page. To keep the user's place we
 * snapshot a tab's UI state to localStorage on change and rehydrate it on
 * mount. In-flight API calls are NOT resumed (that would need a single-shell
 * refactor) — any "running" status is sanitised back to idle on restore.
 *
 * The same snapshots drive the nav multitask dot: a tab is "busy" when its
 * persisted stage has advanced past 1 (or an explicit busy flag is set).
 */

export const TAB_STATE_KEYS = {
  reels:   "ms_reels_uistate",
  podcast: "ms_podcast_uistate",
};

export function saveTabState(key, snapshot) {
  if (typeof window === "undefined" || !key) return;
  try {
    localStorage.setItem(key, JSON.stringify(snapshot));
  } catch {
    /* quota exceeded or serialisation failure — persistence is best-effort */
  }
}

export function loadTabState(key) {
  if (typeof window === "undefined" || !key) return null;
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

/** True when a tab has work worth flagging on its inactive nav icon. */
export function tabHasActivity(key) {
  const s = loadTabState(key);
  if (!s) return false;
  return (s.currentStage ?? 1) > 1 || !!s.busy;
}
