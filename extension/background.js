const DEFAULTS = {
  target: 5,
  profileUrl: 'https://leetcode.com/u/uddhav6/',
  blockingEnabled: true,
  seenSubmissions: {}, // map id -> timestamp
  lastReportTs: 0 // timestamp of last time new submissions were added
};

let state = { ...DEFAULTS };

// Load stored settings
chrome.storage.local.get(Object.keys(DEFAULTS), (res) => {
  state = { ...state, ...res };
  // make sure seenSubmissions exists
  if (!state.seenSubmissions) state.seenSubmissions = {};
});

function saveState() {
  chrome.storage.local.set(state);
}

// Helper: determine today's count based on seenSubmissions timestamps
function countSolvedToday(now = Date.now()) {
  const startOfDay = new Date();
  startOfDay.setHours(0,0,0,0);
  const s = startOfDay.getTime();
  let count = 0;
  for (const id in state.seenSubmissions) {
    const ts = state.seenSubmissions[id];
    if (ts >= s && ts <= now) count++;
  }
  return count;
}

// Message handling
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'report_submissions') {
    // msg.submissions: array of {id, timestamp, title}
    let added = 0;
    for (const sub of msg.submissions) {
      // dedupe by unique id
      if (!state.seenSubmissions[sub.id]) {
        state.seenSubmissions[sub.id] = sub.timestamp;
        added++;
      }
    }
    if (added > 0) {
      state.lastReportTs = Date.now();
      saveState();
    }
    sendResponse({ added, totalToday: countSolvedToday(), lastReportTs: state.lastReportTs });
    return true;
  }

  if (msg.type === 'get_state') {
    sendResponse({ state: { ...state, today: countSolvedToday() } });
    return true;
  }

  if (msg.type === 'set_state') {
    Object.assign(state, msg.updates);
    // sanitize seenSubmissions
    if (!state.seenSubmissions) state.seenSubmissions = {};
    saveState();
    sendResponse({ ok: true });
    return true;
  }
});

// Periodic cleanup: remove seen submissions older than 30 days
chrome.alarms.create('cleanup', { periodInMinutes: 60 * 24 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'cleanup') {
    const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 30;
    let removed = 0;
    for (const id in state.seenSubmissions) {
      if (state.seenSubmissions[id] < cutoff) {
        delete state.seenSubmissions[id];
        removed++;
      }
    }
    if (removed) saveState();
  }
});
