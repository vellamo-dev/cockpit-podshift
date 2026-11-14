# api

All calls to the PodShift Cockpit API go here. This is the only place that talks to PodShift.

Access checks and handler calls are in `PodShiftApi.js` (`PodShiftApi.callAction()`, `PodShiftApi.resolveAccess()`, and the other static methods).
`InspectResource.js` calls the `inspect` action for one container, image, volume or network and returns
the result: the object, `found: false` when podman has no such resource, or `tooLarge` with the byte size when the
object does not fit in the response. `InspectResource.downloadInspect()` asks for `mode: file`, so the handler writes a 0600 file of
the podshift user under `/run/user/<uid>/podshift/`, then offers it as a download through a cockpit-ws external
channel (`ChannelDownload.downloadFile()` in `../utils/ChannelDownload.js`, also used by the unit view Download): a same-origin `/cockpit/channel/<csrf token>?<options>` link with
`fsread1`, `superuser: "require"` and an attachment Content-Disposition, like cockpit-files. It runs as root on the
same host as the handler, so the file stays private. The file is removed 10 seconds later with `cockpit.file()`.
