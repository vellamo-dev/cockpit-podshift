# Using PodShift UI

## Requirements

- [PodShift](https://github.com/vellamo-dev/podshift) installed on the host.
- [Cockpit](https://cockpit-project.org/) 137 or later.

Installing PodShift UI does not install PodShift.

## Install

### From Cockpit

1. Log in to Cockpit with administrative access turned on.
2. Open **Applications**.
3. Find PodShift UI and choose **Install**.

The entry comes from the PodShift package, so it appears only once PodShift is installed.

### From a terminal

PodShift UI is published in the `vellamo/cockpit-podshift` Copr repository:

```
sudo dnf copr enable -y vellamo/cockpit-podshift && sudo dnf install -y cockpit-podshift
```

A PodShift install has already enabled that repository, so `sudo dnf install -y cockpit-podshift` is usually enough.

## Open

Reload Cockpit after installing, then choose **PodShift** in the menu. You need to be an administrator, or logged in as the `podshift` user. See [Access](readme.md#access).

## Update

The package updates with the rest of the system:

```
sudo dnf upgrade cockpit-podshift
```

## Remove

Remove it in **Applications**, or run:

```
sudo dnf remove cockpit-podshift
```

Removing the UI does not affect PodShift or your containers.
