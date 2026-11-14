# hooks

Shared React hooks. `useTab.js` keeps the selected tab in the page address.
`useAction.js` loads a PodShift API action for a card. `useModulePage.js` gathers the list, search, toggle filters and
view state of a BaseModule page (Containers, Volumes, Networks, Images, Secrets, Services, Quadlets), and `useServiceDialogs.js`
keeps the open status and log views of the Services page.
`useActionResult.js` loads one action with arguments while a view is open (`service-view`, `service-logs` and `quadlet-view`), with
a reload function; each load clears the last result and late results are dropped. `RefreshContext.js` is the header refresh counter.
`HealthContext.js` holds one shared health-check result for the Overview Health card and the Health tab.
`useColumnCount.js` counts how many columns of a minimum width fit in an element, following its width; ResourceGrid
uses it.
`useCopiedFlag.js` copies text and keeps a "Copied" flag that clears itself after 2 seconds, with one timer that a new
copy or unmounting clears; CodeViewModal and InspectNotice use it.
`useResourceView.js` keeps the one open Inspect or Variables view of a resource tab and builds the card menu items
that open it. `useInspect.js` loads the inspect object of that resource only while a view is open, and tells
whether the resource is gone (`notFound`) or its output too large to show (`tooLargeSize`).
`useUnitView.js` keeps the one open unit view of a tab (Quadlet file and generated unit, `UnitViewModal`) and builds the
Show Quadlet menu item, after a divider, of a resource card with the Quadlet source and a `.service` unit in its Systemd group.
