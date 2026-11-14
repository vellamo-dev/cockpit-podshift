/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Masonry-like grid for resource cards.
 *
 * @file ResourceGrid.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useRef} from 'react';

import {useColumnCount} from '../../hooks/useColumnCount.js';

import './ResourceGrid.scss';

/** Minimum column width in rem. With the large spacer gap: 2 columns from about 920px, 3 from about 1390px. */
const MIN_COLUMN_REM = 28;

/** Most columns. */
const MAX_COLUMNS = 3;

/**
 * Lays out cards in as many columns of at least 28rem as fit in the grid's width, from 1 to 3.
 * Cards are dealt to the columns in turn (first, second, third, first and so on), so reading
 * order stays row by row and a short last row fills from the left. Each column stacks its cards,
 * so a card is never split.
 *
 * @param {object} props Component props.
 * @param {React.ReactNode} props.children The cards.
 * @returns {React.ReactElement} The grid.
 */
export function ResourceGrid({children}) {
    const gridRef = useRef(/** @type {HTMLDivElement|null} */ (null));
    const count = useColumnCount(gridRef, MIN_COLUMN_REM, MAX_COLUMNS);
    const cards = React.Children.toArray(children);

    /** @type {React.ReactNode[][]} */
    const columns = Array.from({length: count}, () => []);
    cards.forEach((card, index) => columns[index % count].push(card));

    return (
        <div className="podshift-resource-grid" ref={gridRef}>
            {columns.map((column, index) => (
                <div className="podshift-resource-grid__column" key={index}>
                    {column}
                </div>
            ))}
        </div>
    );
}
