# SPDX-License-Identifier: AGPL-3.0-or-later
#
# extract name from package.json
PACKAGE_NAME := $(shell awk '/"name":/ {gsub(/[",]/, "", $$2); print $$2}' package.json)
# Version is read from the spec file (single source, no git required).
VERSION := $(shell awk '/^Version:/ {print $$2; exit}' cockpit-podshift.spec)
PREFIX ?= /usr/local
APPSTREAMFILE=fyi.vellamo.cockpit_podshift.metainfo.xml
# stamp file to check that container node_modules/ is installed
NODE_MODULES_TEST=node_modules/.package-lock.json
# build.js ran in non-watch mode
DIST_TEST=runtime-npm-modules.txt
# one example file in artifacts/cockpit-lib to check if it was already fetched
COCKPIT_REPO_STAMP=artifacts/cockpit-lib/cockpit-po-plugin.js
PO_DIR = src/po

# Build only inside the build container. Local Node is for the IDE.
# clean, print-version, and devel-uninstall may run on the host.
ifneq ($(COCKPIT_PODSHIFT_CONTAINER),1)
HOST_OK_GOALS := clean print-version devel-uninstall
ifneq ($(MAKECMDGOALS),)
NEED_CONTAINER := $(filter-out $(HOST_OK_GOALS),$(MAKECMDGOALS))
else
NEED_CONTAINER := all
endif
ifneq ($(NEED_CONTAINER),)
$(error Build must run in the container: ./src/dev/run make)
endif
endif

all: $(DIST_TEST)

# Fetch the Cockpit library from a pinned release tarball (no git required).
# tools/node-modules is not fetched: it is a git node-cache helper and conflicts
# with the container volume and pinned npm ci flow. artifacts/cockpit-lib is enough.
COCKPIT_REPO_FILES = \
	artifacts/cockpit-lib \
	$(NULL)

COCKPIT_REPO_URL = https://github.com/cockpit-project/cockpit
COCKPIT_REPO_COMMIT = aa7920c58b2d7be013705412991eca8fa8839597 # 371 + 1 commits
COCKPIT_COMMIT := $(strip $(COCKPIT_REPO_COMMIT))
COCKPIT_ARCHIVE_URL = $(COCKPIT_REPO_URL)/archive/$(COCKPIT_COMMIT).tar.gz
COCKPIT_ARCHIVE = artifacts/tmp/cockpit-$(COCKPIT_COMMIT).tar.gz

$(COCKPIT_REPO_FILES): $(COCKPIT_REPO_STAMP)
$(COCKPIT_REPO_STAMP): Makefile
	mkdir -p artifacts/tmp
	if [ ! -f $(COCKPIT_ARCHIVE) ]; then \
		curl -fsSL -o $(COCKPIT_ARCHIVE) $(COCKPIT_ARCHIVE_URL); \
	fi
	rm -rf artifacts/cockpit-lib
	mkdir -p artifacts/cockpit-lib && tar -xzf $(COCKPIT_ARCHIVE) --wildcards --strip-components=3 -C artifacts/cockpit-lib '*/pkg/lib'
	test -f $(COCKPIT_REPO_STAMP)
	touch $(COCKPIT_REPO_STAMP)

#
# i18n
#

LINGUAS=$(basename $(notdir $(wildcard $(PO_DIR)/*.po)))

$(PO_DIR)/$(PACKAGE_NAME).js.pot:
	xgettext --default-domain=$(PACKAGE_NAME) --output=- --language=C --keyword= \
		--add-comments=Translators: \
		--keyword=_:1,1t --keyword=_:1c,2,2t --keyword=C_:1c,2 \
		--keyword=i18n:1,1t --keyword=i18n:1c,2,2t \
		--keyword=N_ --keyword=NC_:1c,2 \
		--keyword=gettext:1,1t --keyword=gettext:1c,2,2t \
		--keyword=ngettext:1,2,3t --keyword=ngettext:1c,2,3,4t \
		--keyword=gettextCatalog.getString:1,3c --keyword=gettextCatalog.getPlural:2,3,4c \
		--from-code=UTF-8 $$(find src/app \( -name '*.js' -o -name '*.jsx' \)) | \
		sed '/^#/ s/, c-format//' > $@ && \
		sed -i 's/charset=CHARSET/charset=UTF-8/g' $@

$(PO_DIR)/$(PACKAGE_NAME).html.pot: $(NODE_MODULES_TEST) $(COCKPIT_REPO_STAMP)
	artifacts/cockpit-lib/html2po -o $@ $$(find src/app -name '*.html')

$(PO_DIR)/$(PACKAGE_NAME).manifest.pot: $(COCKPIT_REPO_STAMP)
	artifacts/cockpit-lib/manifest2po -o $@ src/app/manifest.json

$(PO_DIR)/$(PACKAGE_NAME).metainfo.pot: $(APPSTREAMFILE)
	xgettext --default-domain=$(PACKAGE_NAME) --output=$@ $< && \
	sed -i 's/charset=CHARSET/charset=UTF-8/g' $@

$(PO_DIR)/$(PACKAGE_NAME).pot: $(PO_DIR)/$(PACKAGE_NAME).html.pot $(PO_DIR)/$(PACKAGE_NAME).js.pot $(PO_DIR)/$(PACKAGE_NAME).manifest.pot $(PO_DIR)/$(PACKAGE_NAME).metainfo.pot
	xgettext --output=$@ $^

$(PO_DIR)/LINGUAS:
	echo $(LINGUAS) | tr ' ' '\n' > $@

#
# Build/Install
#

$(DIST_TEST): $(NODE_MODULES_TEST) $(COCKPIT_REPO_STAMP) $(shell find src/app/ -type f) package.json build.js cockpit-podshift.spec
	NODE_ENV=$(NODE_ENV) ./build.js

watch: $(NODE_MODULES_TEST) $(COCKPIT_REPO_STAMP)
	NODE_ENV=$(NODE_ENV) ./build.js --watch

clean:
	find dist -mindepth 1 -delete 2>/dev/null || true
	rm -f $(PO_DIR)/LINGUAS
	rm -f metafile.json runtime-npm-modules.txt

install: $(DIST_TEST) $(PO_DIR)/LINGUAS
	mkdir -p $(DESTDIR)$(PREFIX)/share/cockpit/$(PACKAGE_NAME)
	cp -r dist/* $(DESTDIR)$(PREFIX)/share/cockpit/$(PACKAGE_NAME)
	mkdir -p $(DESTDIR)$(PREFIX)/share/metainfo/
	msgfmt --xml -d $(PO_DIR) \
		--template $(APPSTREAMFILE) \
		-o $(DESTDIR)$(PREFIX)/share/metainfo/$(APPSTREAMFILE)

# this requires a built source tree and avoids having to install anything system-wide
devel-install: $(DIST_TEST)
	mkdir -p ~/.local/share/cockpit
	ln -s `pwd`/dist ~/.local/share/cockpit/$(PACKAGE_NAME)

# assumes that there was symlink set up using the above devel-install target,
# and removes it
devel-uninstall:
	rm -f ~/.local/share/cockpit/$(PACKAGE_NAME)

print-version:
	@echo "$(VERSION)"

# Pinned installs: npm ci from the committed package-lock.json.
# If the lockfile is missing, generate it once with npm install, then commit it.
$(NODE_MODULES_TEST): package.json $(wildcard package-lock.json)
	@if [ ! -f package-lock.json ]; then \
		echo "package-lock.json is missing; generating it with npm install." >&2; \
		env -u NODE_ENV npm install --ignore-scripts; \
		echo >&2; \
		echo "package-lock.json was generated. Commit it, then rerun ./src/dev/run make." >&2; \
		echo "Later installs use npm ci to get the pinned versions." >&2; \
	else \
		env -u NODE_ENV npm ci --ignore-scripts; \
	fi

.PHONY: all clean install devel-install devel-uninstall print-version watch
