/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * PatternFly inline notice: an Alert with isInline and isPlain.
 *
 * @file InlineNotice.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Alert} from '@patternfly/react-core/dist/esm/components/Alert';

/** @typedef {import('../../types/notice.js').NoticeVariant} NoticeVariant */

/**
 * Turns a title or an error into the alert title text.
 *
 * @param {string|Error} title The title or the error.
 * @returns {string} The title text.
 */
function noticeTitle(title) {
    if (typeof title === 'string') { return title }
    return title.message || String(title);
}

/**
 * Shows a PatternFly Alert with isInline and isPlain. An Error title uses
 * its message, or String(error) when the message is empty.
 *
 * @param {object} props Component props.
 * @param {NoticeVariant} props.variant Alert variant.
 * @param {string|Error} props.title Title text, or an Error to show as text.
 * @param {React.ReactNode} [props.children] Optional body of the alert.
 * @param {React.ReactNode} [props.actionLinks] Optional action links, for example Refresh.
 * @returns {React.ReactElement} The alert.
 */
export function InlineNotice({variant, title, children, actionLinks}) {
    return (
        <Alert
            variant={variant}
            isInline
            isPlain
            title={noticeTitle(title)}
            actionLinks={actionLinks}
        >
            {children}
        </Alert>
    );
}
