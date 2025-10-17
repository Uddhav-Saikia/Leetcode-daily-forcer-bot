// Use LeetCode GraphQL endpoint to fetch recent accepted submissions for the profile.
// This runs on the profile page and uses same-origin requests (credentials included)
// so the browser's LeetCode cookies/auth are used.

(function() {
  const GRAPHQL_PATH = '/graphql/';
  const POLL_INTERVAL_MS = 30 * 1000; // poll every 30s while on profile

  function extractUsernameFromPath() {
    try {
      const m = location.pathname.match(/\/u\/(?:@)?([^\/\?]+)/i);
      if (m && m[1]) return m[1].replace(/\/+$/,'');
      // fallback: sometimes profile path is just /username
      const m2 = location.pathname.match(/^\/([^\/]+)\/?$/);
      if (m2 && m2[1] && m2[1] !== 'u') return m2[1];
    } catch (e) {
      // ignore
    }
    return null;
  }

  const QUERY = `query recentAcSubmissionList($username: String!) {\n  recentAcSubmissionList(username: $username) {\n    id\n    title\n    titleSlug\n    timestamp\n    lang\n  }\n}`;

  async function fetchRecent(username) {
    try {
      const resp = await fetch(GRAPHQL_PATH, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: QUERY, variables: { username } })
      });
      if (!resp.ok) {
        // non-200 (could be blocked, unauthenticated, or rate-limited)
        return [];
      }
      const data = await resp.json();
      const list = data && data.data && data.data.recentAcSubmissionList;
      if (!Array.isArray(list)) return [];
      const now = Date.now();
      return list.map(item => {
        // LeetCode's timestamp is in seconds; convert to ms
        const ts = (item.timestamp ? Number(item.timestamp) : Math.floor(now/1000)) * 1000;
        const id = item.id || `${item.titleSlug}::${Math.floor(ts/60000)}`;
        return { id, timestamp: ts, title: item.title || item.titleSlug, url: `https://leetcode.com/problems/${item.titleSlug}/` };
      });
    } catch (e) {
      return [];
    }
  }

  async function reportRecentIfAny() {
    const username = extractUsernameFromPath();
    if (!username) return;
    const submissions = await fetchRecent(username);
    if (submissions.length) {
      chrome.runtime.sendMessage({ type: 'report_submissions', submissions }, (resp) => {
        // optional: could display a small UI or console log
      });
    }
  }

  // Initial fetch and periodic polling while on profile page
  reportRecentIfAny();
  const intervalId = setInterval(() => {
    // only run if still on a profile-like path
    if (!/\/u\//i.test(location.pathname)) return;
    reportRecentIfAny();
  }, POLL_INTERVAL_MS);

  // Clean up on unload
  window.addEventListener('beforeunload', () => clearInterval(intervalId));

})();
