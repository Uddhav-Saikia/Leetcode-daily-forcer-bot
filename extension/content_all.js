// Runs on all pages. If blocking is enabled and today's solved < target,
// redirect the tab to the LeetCode profile page unless already on leetcode.

(function() {
  const profileHost = 'leetcode.com';
  const GRACE_MS = 3000; // if a report was received within this window, skip redirect

  chrome.runtime.sendMessage({ type: 'get_state' }, (resp) => {
    if (!resp || !resp.state) return;
    const s = resp.state;
    if (!s.blockingEnabled) return;

    // If we just received a report within GRACE_MS, skip redirect to allow state to settle
    const now = Date.now();
    if (s.lastReportTs && (now - (s.lastReportTs || 0)) < GRACE_MS) return;

    if (s.today >= s.target) return;

    // If current location is already a leetcode page, skip
    try {
      const host = window.location.host || '';
      if (host.includes(profileHost)) return;
    } catch (e) {
      return;
    }

    // Redirect to profile URL
    const url = s.profileUrl || ('https://leetcode.com/u/uddhav6/');
    // Use replace so back doesn't go back to blocked page
    window.location.replace(url);
  });
})();
