# Change Log

Changelog history. To see the latest changes, please check the [cockpit-podshift.spec](./cockpit-podshift.spec)

## Sat Nov 21 2026 - 0.17.1
- Drop zone: locked after a drop until the drop shows in the Drop History, for at most 5 seconds; it looks greyed out
- A refused or failed upload unlocks the drop zone at once
- Install log: Copy log in its menu copies the shown lines as text; the title reads "Copied" for 2 seconds
- Uninstall dialogue: "Also remove volumes" is now "Also delete volume data", with a note that it cannot be undone
- Uninstall of the same file or app is disabled for 60 seconds after it is queued, so it is not queued twice
- Translations: Finnish and German for the Uninstall and Copy log texts
- Tests: QUnit tests for the Uninstall guard and the copied log text


## Sat Nov 21 2026 - 0.17.0
- Quadlets: every card has Uninstall in its menu; it removes the Quadlet file, or the whole app it belongs to
- Containers, Volumes and Networks: Uninstall is in the menu of items made by an installed Quadlet file
- Uninstall needs the quadlet-remove action and the quadlet field of PodShift 0.25.3 for the resource tabs
- The confirm dialogue names what goes, such as "Uninstall boy.container" or "Uninstall app shop"
- "Also remove volumes" is offered for an app and a .volume file; images are always kept
- After the uninstall is queued, a notice shows and the tab loads its list now and again after 5 seconds
- The unused remove dialogue of the drop history is replaced by the shared Uninstall dialogue

## Sat Nov 21 2026 - 0.16.3
- The Health tab runs a new health check each time it opens
- The last result stays on screen while the check runs
- The Overview Health card keeps the cached result

## Sat Nov 21 2026 - 0.16.2
- A successful drop now says PodShift verifies and processes the file, not that it will install it
- The success message hides after 10 seconds, or sooner when the drop shows in the Drop History
- A failed upload message stays until the next upload

## Sat Nov 21 2026 - 0.16.1
- Drop History shows Unchanged with an orange attention bell, not the green Installed icon
- Its tooltip explains that the file was already installed with the same content

## Sat Nov 21 2026 - 0.16.0
- Drop Quadlet works with PodShift 0.25.0: the Drop History shows one row per drop, keyed by drop ID
- The same file dropped twice shows twice
- The statuses Uploaded, Removing and Removed are gone from the Drop History; removals show only in the install log
- Tests: QUnit unit tests updated for the new statuses

## Sat Nov 21 2026 - 0.15.3
- The install log has a menu in its header to show the newest or the oldest lines first; newest first is the default
- The choice is kept in the browser (localStorage), so it stays after a reload
- With newest first, new lines appear at the top and the log keeps your scroll position
- Tests: QUnit unit tests for the log order

## Sat Nov 21 2026 - 0.15.2
- Drop History and the install log refresh much faster, so installs made in a terminal show up too
- Refresh timing: every 300 ms for 15 seconds after a drop, then every 500 ms until 30 seconds
- After that: every 500 ms while an item is in progress, otherwise every second
- Refreshing pauses while the page is hidden or another tab is open, and loads once when you come back
- A refresh never starts before the previous one has finished
- A refresh that brings no new data changes nothing on screen
- Tests: QUnit unit tests for the new refresh timing

## Sat Nov 21 2026 - 0.15.1
- The tab and Refresh tooltips always open below their button, so they no longer cover the buttons to the right

## Sat Nov 21 2026 - 0.15.0
- Drop Quadlet works with PodShift 0.24.0: new Drop History statuses Unchanged, Removing and Removed
- Unchanged shows as installed, and Removing shows as in progress
- The history and the install log reload every 5 seconds while an item is being removed
- The remove dialog is prepared for the Quadlets tab: it asks "Remove <name>?"
- It has an "Also remove volumes" option (off by default) and queues the removal with quadlet-remove
- A .zip bundle is removed as its app
- A refused removal is explained in plain words
- Reasons: not installed any more, still in use by another Quadlet, already waiting, remove queue missing
- Tests: QUnit unit tests for the new statuses and the remove helpers

## Fri Nov 20 2026 - 0.14.0
- Drop Quadlet works with PodShift 0.23.0: dropped or chosen files are uploaded with quadlet-drop
- Accepted files: .container, .volume, .network, .image or .zip, at most 50 KB
- Each file is checked in the browser with PodShift's rules, with a clear message for each refusal
- The Drop History card shows the latest status of each dropped file, with the reason for a failure or refusal
- The Install log card shows the last 100 lines of the drop, validate and install steps
- While a file is processed, the history and the log reload every 5 seconds until it has settled
- The header Refresh button reloads them too
- The history and log cards are hidden when PodShift does not offer their action
- They show a warning when the journal cannot be read
- The mockup data and its label are gone
- Tests: QUnit unit tests for the drop rules, the base64 encoding and the status helpers

## Fri Nov 20 2026 - 0.13.0
- Tabs follow the capabilities action: a tab shows only when PodShift offers the actions it needs
- Features such as Inspect, Show log or Add variable are hidden without their action
- While capabilities first load, a spinner stands in for the tabs, so hidden tabs never appear
- If capabilities cannot be read, all tabs are shown with a warning
- Without administrative access, a single notice asks to turn it on instead of the tabs
- The Drop Quadlet mockup is hidden until PodShift offers the quadlet-drop action
- Tests: QUnit unit tests for the capabilities helpers

## Fri Nov 20 2026 - 0.12.0
- Mockup of the drop-quadlet tab with dummy data: drop zone, history and install log
- Nothing is uploaded or installed yet
- Tests: QUnit unit tests for the drop file name rules

## Fri Nov 20 2026 - 0.11.1
- User feedback improvement: the header Refresh button shows progress and is disabled while the visible tab refreshes
- Tests: QUnit unit tests for the running-load counter behind the refresh progress

## Fri Nov 20 2026 - 0.11.0
- Overview: the Configuration card adds, edits and removes custom TSV_## variables (needs PodShift 0.22.0)
- Overview: an unset TSV_ENV can be set once from the Configuration card, with suggested tags
- Overview: the variable modal checks names and values with PodShift's rules and warns against storing secrets
- Tests: QUnit unit tests for the variable rules and the modal modes (npm test)

## Mon Nov 16 2026 - 0.10.0
- Overview: Info card shows the install type
- Tabs menu: active tab is underlined like in new Cockpit UI.
- Services: names are shown without the .service suffix

## Sat Nov 14 2026 - 0.9.10
- Docs: agents.md starts with Purpose first

## Sat Nov 14 2026 - 0.9.9
- npm run rebuild forces a build

## Sat Nov 14 2026 - 0.9.8
- fi.po (Finish translation) added

## Sat Nov 14 2026 - 0.9.7
- The build writes the version into manifest.json

## Sat Nov 14 2026 - 0.9.6
- de.po (German translation) updated

## Sat Nov 14 2026 - 0.9.5
- Documentation: Finnish readme (readme.fi.md)

## Sat Nov 14 2026 - 0.9.4
- npm run updateTranslations refreshes the template and all translations

## Sat Nov 14 2026 - 0.9.3
- Documentation: security policy (security.md)

## Sat Nov 14 2026 - 0.9.2
- Tabs menu uses a small border radius

## Fri Nov 13 2026 - 0.9.1
- UI polishing

## Fri Nov 13 2026 - 0.9.0
- Refactored the initial MVP codebase into a scalable, production-ready product.
- Package for Copr: fixed source directory, metainfo for Cockpit Applications
- Overview, Health, Containers, Volumes, Networks, Images, Secrets, Services and Quadlets pages
