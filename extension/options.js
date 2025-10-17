function $(id){return document.getElementById(id)}

function load() {
  chrome.runtime.sendMessage({ type: 'get_state' }, (resp) => {
    if (!resp || !resp.state) return;
    const s = resp.state;
    $('target').value = s.target || 5;
    $('profileUrl').value = s.profileUrl || 'https://leetcode.com/u/uddhav6/';
    $('blockingEnabled').checked = !!s.blockingEnabled;
  });
}

function save() {
  const updates = {
    target: parseInt($('target').value,10) || 0,
    profileUrl: $('profileUrl').value || 'https://leetcode.com/u/uddhav6/',
    blockingEnabled: !!$('blockingEnabled').checked
  };
  chrome.runtime.sendMessage({ type: 'set_state', updates }, (resp) => {
    $('status').textContent = 'Saved.';
    setTimeout(() => { $('status').textContent = ''; }, 1500);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  load();
  $('save').addEventListener('click', save);
  $('reset').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'set_state', updates: { target:5, profileUrl:'https://leetcode.com/u/uddhav6/', blockingEnabled:true, seenSubmissions:{} } }, () => load());
  });
});
