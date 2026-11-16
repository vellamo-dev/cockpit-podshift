Name: cockpit-podshift
Version: 0.9.10
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
* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.10
- Docs: agents.md starts with Purpose first

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.9
- npm run rebuild forces a build

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.8
- fi.po (Finish translation) added

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.7
- The build writes the version into manifest.json

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.6
- de.po (German translation) updated

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.5
- Documentation: Finnish readme (readme.fi.md)

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.4
- npm run updateTranslations refreshes the template and all translations

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.3
- Documentation: security policy (security.md)

* Sat Nov 14 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.2
- Tabs menu uses a small border radius

* Fri Nov 13 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.1
- UI polishing

* Fri Nov 13 2026 Vellamo Dev <no-email@vellamo.fyi> - 0.9.0
- Refactored the initial MVP codebase into a scalable, production-ready product.
- Package for Copr: fixed source directory, metainfo for Cockpit Applications
- Overview, Health, Containers, Volumes, Networks, Images, Secrets, Services and Quadlets pages
