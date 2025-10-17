function $(id){return document.getElementById(id)}

function refresh() {
  chrome.runtime.sendMessage({ type: 'get_state' }, (resp) => {
    if (!resp || !resp.state) return;
    const s = resp.state;
    $('today').textContent = s.today || 0;
    $('target').textContent = s.target || 0;
    $('profileLink').href = s.profileUrl || '';
    $('toggle').textContent = s.blockingEnabled ? 'Disable' : 'Enable';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  refresh();
  $('toggle').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'get_state' }, (resp) => {
      if (!resp || !resp.state) return;
      const s = resp.state;
      chrome.runtime.sendMessage({ type: 'set_state', updates: { blockingEnabled: !s.blockingEnabled } }, () => {
        refresh();
      });
    });
  });
  $('openOptions').addEventListener('click', () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
    else window.open('options.html');
  });
});
