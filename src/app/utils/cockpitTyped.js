/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The cockpit object, typed for the IDE.
 * artifacts/cockpit-lib/cockpit.js builds the object at runtime, so the IDE can't see its
 * members. The JSDoc cast points it at artifacts/cockpit-lib/cockpit.d.ts instead.
 * Import this module instead of 'cockpit' in app code.
 *
 * @file cockpitTyped.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import cockpitRuntime from 'cockpit';

const cockpit = /** @type {typeof import('cockpit')} */ (cockpitRuntime);

export default cockpit;
