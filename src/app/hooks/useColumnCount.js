/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Hook that counts how many columns of a minimum width fit in an element.
 *
 * @file useColumnCount.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import {useLayoutEffect, useState} from 'react';

/**
 * Returns how many columns fit in the element, like CSS `columns: <max> <minWidth>`: as many
 * columns of at least minRem as fit with the element's column gap between them, from 1 to max.
 * It follows the element's own width with a ResizeObserver, so it reacts to the content width,
 * not the window. It measures before paint, so the first frame already has the right count.
 *
 * @param {import('react').RefObject<HTMLElement|null>} ref The element, for example the grid.
 * @param {number} minRem Minimum column width in rem.
 * @param {number} max Most columns.
 * @returns {number} The column count, 1 until the element is measured.
 */
export function useColumnCount(ref, minRem, max) {
    const [count, setCount] = useState(1);

    useLayoutEffect(function followWidth() {
        const element = ref.current;
        if (!element) { return undefined }

        /**
         * Measures the element and stores the column count.
         */
        function measure() {
            const rem = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
            const gap = parseFloat(window.getComputedStyle(element).columnGap) || 0;
            const fit = Math.floor((element.clientWidth + gap) / (minRem * rem + gap));
            setCount(Math.max(1, Math.min(max, fit)));
        }

        measure();
        const observer = new ResizeObserver(() => measure());
        observer.observe(element);
        return function stopFollowing() {
            observer.disconnect();
        };
    }, [ref, minRem, max]);

    return count;
}
