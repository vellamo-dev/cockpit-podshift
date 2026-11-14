/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Shared types for inline notices and loading states.
 *
 * @file notice.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/**
 * PatternFly alert variant used by InlineNotice.
 *
 * @typedef {'success'|'warning'|'danger'|'info'|'custom'} NoticeVariant
 */

/**
 * Where LoadingContent places a stale-data warning when a refresh fails
 * after data has already loaded.
 * before: the warning sits above the body, as on the overview cards.
 * stack: the warning and the body are each a StackItem, as on the resource tabs.
 * none: the parent places the warning itself, as on the Health tab.
 *
 * @typedef {'before'|'stack'|'none'} WarningPlacement
 */

export {};
