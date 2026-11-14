/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Downloads through a cockpit-ws external channel, the way Cockpit's own pages do it
 * (cockpit-files download.tsx): a same-origin GET on /cockpit/channel/<csrf token>?<open options>.
 * cockpit-ws opens the channel on the bridge and sends its data as the response body, with the
 * Content-Disposition and Content-Type headers given in the "external" option. No blob: URL is
 * involved, so the page's default Content Security Policy ('self') allows it.
 *
 * @file ChannelDownload.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import cockpit from './cockpitTyped.js';

/**
 * External channel downloads. All members are static; this class is not constructed.
 */
export class ChannelDownload {
    /**
     * Builds the URL of an external channel.
     *
     * @param {Record<string, any>} open Channel open options, for example payload, path, superuser and external.
     * @returns {string} The same-origin URL, a path with the encoded options as query.
     */
    static channelUrl(open) {
        const bytes = new TextEncoder().encode(JSON.stringify(open));
        const binary = Array.from(bytes, byte => String.fromCodePoint(byte)).join('');
        const transport = /** @type {import('cockpit').Transport} */ (cockpit.transport);
        const prefix = new URL(transport.uri('channel/' + transport.csrf_token)).pathname;
        return `${prefix}?${window.btoa(binary)}`;
    }

    /**
     * Starts the download of a same-origin URL through a hidden anchor with a download attribute.
     * The response is an attachment, so the page itself does not navigate.
     *
     * @param {string} url Same-origin URL, from channelUrl.
     * @param {string} fileName Suggested file name.
     */
    static startDownload(url, fileName) {
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        anchor.rel = 'noopener';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
    }

    /**
     * Downloads one file of the host as root: a fsread1 external channel with superuser
     * 'require' on the same host, so files of the podshift user that the signed-in admin cannot
     * read directly are offered too. The file is sent as is, as an attachment with the given name.
     *
     * @param {string} path Absolute path of the file.
     * @param {string} fileName Suggested file name.
     * @param {string} contentType Content-Type of the response, for example application/json.
     */
    static downloadFile(path, fileName, contentType) {
        const url = ChannelDownload.channelUrl({
            payload: 'fsread1',
            binary: 'raw',
            path,
            superuser: 'require',
            host: cockpit.transport.host,
            // The bridge has no "unlimited" value; this is what cockpit-files passes.
            max_read_size: Number.MAX_SAFE_INTEGER,
            external: {
                'content-disposition': `attachment; filename="${fileName}"`,
                'content-type': contentType,
            },
        });
        ChannelDownload.startDownload(url, fileName);
    }
}
