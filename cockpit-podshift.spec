Name: cockpit-podshift
Version: 0.20.1
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
Cockpit UI for PodShift. View and maintain PodShift containers, volumes,
networks, images, secrets, services and Quadlets in Cockpit.

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
* Wed Nov 25 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.20.1
- Documentation: Features chapter in the readme, and the Pages table now includes Drop Quadlet in tab order

* Wed Nov 25 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.20.0
- Containers: Commands item in each card menu opens ready-to-copy Terminal, Logs, Processes and System info commands
- Commands: Markdown-style page in the dialog; host commands are marked (host) first; admin uses sudo -u podshift -i
- Commands: Copy copies the page as Markdown; Download saves commands-<name>.md through a cockpit-ws channel
- Commands: process commands (pstree, ps, /proc) run with podman exec from the host, like other in-container commands
- Menus: kebab items on resource cards and the Overview, Health and Drop views show PatternFly icons
- Translations: Finnish and German for the Commands modal texts
- Tests: QUnit unit tests for the command catalogue, placeholders and Markdown export
- Documentation: security.md covers changing actions through the API, confirmation for removals, and Commands downloads
- Documentation: readme, scope, roadmap and the package description cover monitoring and some maintenance
- Documentation: the spec %changelog keeps the 3 latest entries; older ones move to changelog.md

* Mon Nov 23 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.19.0
- Containers, Volumes, Networks and Quadlets: the Auto refresh toggle, off by default; Refresh only reloads
- A queued Uninstall turns auto refresh on: every 1 s, then every 2 s from 15 s and every 5 s from 30 s
- It turns off when the item is gone from the list, after 2 minutes, or when the tab or browser tab is left
- Turned on with the toggle, these tabs reload every 10 seconds for 4 minutes
- Tests: QUnit tests for the Uninstall poll schedule, the gone check and the shorter countdown