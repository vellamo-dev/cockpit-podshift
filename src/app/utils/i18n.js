/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Translation helper. xgettext extracts i18n(...) calls (see the Makefile keywords).
 *
 * @file i18n.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import cockpit from './cockpitTyped.js';

/**
 * Translates a text with Cockpit's gettext: i18n("Text") or i18n("context", "Text").
 */
export const i18n = cockpit.gettext;
