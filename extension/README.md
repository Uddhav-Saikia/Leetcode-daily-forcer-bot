# LeetCode Daily Forcer - Chrome Extension (unpacked)

What it does
- Redirects you to your LeetCode profile until you solve a configurable number of problems in a day.
- Scrapes the profile's "Recent AC" area to detect recently accepted submissions and reports them to the extension.
- Deduplicates submissions by a generated id to avoid double count

Files
- `manifest.json` - extension manifest
- `background.js` - service worker storing state and merging reports
- `content_all.js` - redirects non-LeetCode pages when blocking is active
- `content_profile.js` - scrapes the profile page and reports submissions
- `popup.html`/`popup.js` - quick status and toggle
- `options.html`/`options.js` - configure target, profile URL and enable/disable

Installation (developer mode)
1. Open Chrome and go to chrome://extensions
2. Enable Developer mode
3. Click "Load unpacked" and select this `extension/` directory

How it determines solves
- The profile content script looks for a heading containing "Recent AC" and then finds links to problems nearby.
- It parses relative time text like "5 seconds ago", "10 minutes ago", or "3 hours ago" to compute a timestamp.
- Each reported submission gets an id formed from the problem link and the minute-rounded timestamp to avoid tiny duplicates.
- The background deduplicates by id and stores `seenSubmissions` in local storage.

Limitations & notes
- LeetCode markup can change; the scraper uses heuristic DOM lookups and may need adjustments if the profile UI changes.
- The content script runs on `https://leetcode.com/u/*` but may need to be widened if you use a different profile path.
- The redirect is simple: it redirects any non-LeetCode host to your profile while blocking is active and target not met.
- The extension uses local storage and keeps seen submissions for 30 days (auto cleanup).

Privacy
- All data stays in your browser local storage. No external servers are contacted.

Next steps / improvements
- Better resilient scraping (use GraphQL API if possible) and authentication handling.
- Option to whitelist domains or schedule blocking times.
