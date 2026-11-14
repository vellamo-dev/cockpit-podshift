# Security

PodShift UI follows the same security principles as [PodShift](https://github.com/vellamo-dev/podshift/blob/main/security.md). This page covers what is specific to the UI.

The UI only views data and does not change anything. It has no backend, ports or login of its own. It uses Cockpit's login and administrative access, and all data comes through PodShift's API handler.

## In scope and out of scope

In scope: the UI code and the `cockpit-podshift` package.

Out of scope: Cockpit itself, and the PodShift backend (report those to their own projects).

## Who is responsible

PodShift UI is provided as is, as the [licence](LICENSE) states. Whoever owns and runs the system is responsible for its security and for anything that happens on it. The developers of PodShift UI are not responsible for security breaches on systems where it is used.

## Reporting a problem

Please report a security problem privately via [vellamo.fyi](https://vellamo.fyi), not in a public issue. Only the latest version gets fixes. For other support questions, see [support.md](docs/support.md).
