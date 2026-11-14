/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Header of the unit view: the Quadlet and Unit view labels, the unit name and the path of the
 * file that is shown.
 *
 * @file UnitViewHeader.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {Label} from '@patternfly/react-core/dist/esm/components/Label';
import {CogIcon} from '@patternfly/react-icons/dist/esm/icons/cog-icon';
import {FileCodeIcon} from '@patternfly/react-icons/dist/esm/icons/file-code-icon';

import {i18n} from '../../utils/i18n.js';

/** @typedef {import('../../types/service.js').UnitViewKey} UnitViewKey */

/**
 * The views in switch order, Quadlet first, with the icons of the Quadlet and Unit source labels.
 *
 * @type {{ key: UnitViewKey, label: function(): string, Icon: import('react').ComponentType }[]}
 */
const VIEWS = [
    {key: 'quadlet', label: () => i18n("Quadlet"), Icon: FileCodeIcon},
    {key: 'unit', label: () => i18n("Unit"), Icon: CogIcon},
];

/**
 * Shows the title row and the path line of the unit view. With a Quadlet file the row starts
 * with two clickable labels, a pressed toggle each: the active view is filled blue, the other
 * outlined. Without one there is a single Unit label that is not clickable. The labels keep
 * their size; the name and the path end in an ellipsis when they do not fit, the path at its
 * start so the file name stays visible. Both show their full text on hover.
 *
 * @param {object} props Component props.
 * @param {string} props.titleId Id of the title element, for the modal's aria-labelledby.
 * @param {string} props.name Unit name, the title.
 * @param {string} props.path Path of the file that is shown; empty while unknown.
 * @param {UnitViewKey} props.active The view that is shown.
 * @param {boolean} props.hasQuadlet True when both views can be switched.
 * @param {(key: UnitViewKey) => void} props.onSelect Called with the view the user picks.
 * @returns {React.ReactElement} The header content.
 */
export function UnitViewHeader({titleId, name, path, active, hasQuadlet, onSelect}) {
    const views = hasQuadlet ? VIEWS : VIEWS.filter(view => view.key === 'unit');

    return (
        <>
            <div className="podshift-unit-view__title-row">
                <span
                    className="podshift-unit-view__switch"
                    role={hasQuadlet ? 'group' : undefined}
                    aria-label={hasQuadlet ? i18n("View") : undefined}
                >
                    {views.map(view => {
                        const pressed = view.key === active;
                        if (!hasQuadlet) {
                            return (
                                <Label key={view.key} color="blue" variant="filled" icon={<view.Icon/>}>
                                    {view.label()}
                                </Label>
                            );
                        }
                        return (
                            <Label
                                key={view.key}
                                color="blue"
                                variant={pressed ? 'filled' : 'outline'}
                                icon={<view.Icon/>}
                                isClickable
                                render={({className, content, componentRef}) => (
                                    <button
                                        type="button"
                                        ref={componentRef}
                                        id={"podshift-unit-view-" + view.key}
                                        className={className}
                                        aria-pressed={pressed}
                                        onClick={() => onSelect(view.key)}
                                    >
                                        {content}
                                    </button>
                                )}
                            >
                                {view.label()}
                            </Label>
                        );
                    })}
                </span>
                <h1 id={titleId} className="pf-v6-c-modal-box__title podshift-unit-view__name" title={name}>
                    {name}
                </h1>
            </div>
            <div className="pf-v6-c-modal-box__description podshift-unit-view__path" title={path || undefined}>
                <span className="podshift-unit-view__path-text">{path}</span>
            </div>
        </>
    );
}
