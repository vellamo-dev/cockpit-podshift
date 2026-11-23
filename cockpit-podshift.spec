Name: cockpit-podshift
Version: 0.19.0
Release: 1%{?dist}
Summary: Cockpit UI for PodShift
License: AGPL-3.0-or-later AND LGPL-2.1-or-later
URL: https://github.com/vellamo-dev/cockpit-podshift
BuildArch: noarch
%global branch stable
Source0: https://github.com/vellamo-dev/cockpit-podshift/archive/refs/heads/%{branch}.tar.gz

# The UI is pre-built: dist/ comes from the source tarball, so no Node is needed here.
BuildRequires: gettext libappstream-glib

# cockpit 137 is the floor set in dist/manifest.json.
Requires: cockpit >= 137

%description
Cockpit UI for PodShift. View PodShift containers, volumes, networks,
images, secrets, services and Quadlets in Cockpit.

%prep
%autosetup -n %{name}-%{branch}

%build
# Nothing to build: the package uses the pre-built dist/ from the source tarball.

%install
install -d %{buildroot}%{_datadir}/cockpit/podshift
cp -a dist/. %{buildroot}%{_datadir}/cockpit/podshift/
# Translated metainfo, the same way as make install.
ls src/po/*.po | sed 's|.*/||; s|\.po$||' > src/po/LINGUAS
install -d %{buildroot}%{_metainfodir}
msgfmt --xml -d src/po \
    --template fyi.vellamo.cockpit_podshift.metainfo.xml \
    -o %{buildroot}%{_metainfodir}/fyi.vellamo.cockpit_podshift.metainfo.xml

%check
appstream-util validate-relax --nonet %{buildroot}%{_metainfodir}/fyi.vellamo.cockpit_podshift.metainfo.xml
test -f %{buildroot}%{_datadir}/cockpit/podshift/manifest.json
test -f %{buildroot}%{_datadir}/cockpit/podshift/index.js

%files
%doc readme.md
%license LICENSE docs/licenses/LGPL-2.1.txt
%{_datadir}/cockpit/podshift/
%{_metainfodir}/fyi.vellamo.cockpit_podshift.metainfo.xml

%changelog
* Mon Nov 23 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.19.0
- Containers, Volumes, Networks and Quadlets: the Auto refresh toggle, off by default; Refresh only reloads
- A queued Uninstall turns auto refresh on: every 1 s, then every 2 s from 15 s and every 5 s from 30 s
- It turns off when the item is gone from the list, after 2 minutes, or when the tab or browser tab is left
- Turned on with the toggle, these tabs reload every 10 seconds for 4 minutes
- Tests: QUnit tests for the Uninstall poll schedule, the gone check and the shorter countdown

* Mon Nov 23 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.18.0
- Header: an Auto refresh toggle left of Refresh on Overview and Drop Quadlet; a sleeping icon shows it is off
- Auto refresh turns on when the tab opens or is shown again, on Refresh and on a drop, and off after 4 minutes
- Auto refresh also turns off when you leave the tab or hide the browser tab; while it is off nothing polls
- A click on the toggle turns it off, or on again with one reload and a fresh 4 minutes, like Refresh
- Drop Quadlet: history and log poll on their own; after a tab open or Refresh from 1 s down to 5 s and 15 s
- Drop Quadlet: after a drop, here or in a terminal, both poll from every 300 ms to every 2 s for 2 minutes
- Drop Quadlet: while an item is in progress both poll at least every second and the auto refresh countdown waits
- Translations: Finnish and German for the auto refresh texts
- Tests: QUnit tests for the auto refresh countdown and the Drop Quadlet poll schedules

* Sat Nov 21 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.17.1
- Drop zone: locked after a drop until the drop shows in the Drop History, for at most 5 seconds; it looks greyed out
- A refused or failed upload unlocks the drop zone at once
- Install log: Copy log in its menu copies the shown lines as text; the title reads "Copied" for 2 seconds
- Uninstall dialogue: "Also remove volumes" is now "Also delete volume data", with a note that it cannot be undone
- Uninstall of the same file or app is disabled for 60 seconds after it is queued, so it is not queued twice
- Translations: Finnish and German for the Uninstall and Copy log texts
- Tests: QUnit tests for the Uninstall guard and the copied log text

* Sat Nov 21 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.17.0
- Quadlets: every card has Uninstall in its menu; it removes the Quadlet file, or the whole app it belongs to
- Containers, Volumes and Networks: Uninstall is in the menu of items made by an installed Quadlet file
- Uninstall needs the quadlet-remove action and the quadlet field of PodShift 0.25.3 for the resource tabs
- The confirm dialogue names what goes, such as "Uninstall boy.container" or "Uninstall app shop"
- "Also remove volumes" is offered for an app and a .volume file; images are always kept
- After the uninstall is queued, a notice shows and the tab loads its list now and again after 5 seconds
- The unused remove dialogue of the drop history is replaced by the shared Uninstall dialogue
