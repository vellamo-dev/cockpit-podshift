# Support

PodShift UI is free software, maintained with limited time. It follows the same support rules as [PodShift](https://github.com/vellamo-dev/podshift/blob/main/docs/support.md); this page covers what is specific to the UI.

## What is welcome

- **Bug reports** against the official build.
- **Feature ideas** that fit the scope. See [scope.md](scope.md).

## Where to report

- **UI problems** (pages, cards, buttons, translations): [cockpit-podshift issues](https://github.com/vellamo-dev/cockpit-podshift/issues).
- **Server problems** (the PodShift CLI, the Cockpit API under `/opt/podshift/cockpit/api`, wrong data from the server): [PodShift issues](https://github.com/vellamo-dev/podshift/issues).
- **Sponsored support**: [vellamo.fyi](https://vellamo.fyi).

If you are not sure which one it is, report it to cockpit-podshift.

## What makes a report useful

- reproduce it on the official build, installed from Cockpit Applications or the `vellamo/cockpit-podshift` Copr repository;
- state the `cockpit-podshift`, PodShift and Cockpit versions (`rpm -q cockpit-podshift podshift cockpit`) and the operating system version; for a UI that is not installed from the RPM, the version is in `manifest.json` (`grep version /usr/share/cockpit/podshift/manifest.json`, or the `/usr/local/share/cockpit/podshift` copy);
- say which page or tab, what you did, what you expected and what happened;
- include errors from the browser console, and relevant server log lines from `journalctl -t podshift -t podshift-api`;
- a screenshot helps for layout problems.

## What is not promised

There is no obligation to fix, no priority by demand and no warranty, as described in the [PodShift support rules](https://github.com/vellamo-dev/podshift/blob/main/docs/support.md#what-is-not-promised).

## Security

The security policy, including what is in scope and how to report a problem, is in [security.md](../security.md).

## Sponsored support

Fixes or features on a timeline are possible as sponsored work, on the same terms as for PodShift: agreed up front in writing, and the result is always released as open source. See [PodShift sponsored support](https://github.com/vellamo-dev/podshift/blob/main/docs/support.md#sponsored-support).
