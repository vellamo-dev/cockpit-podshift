/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Builds the container diagnostic and shell command sections with placeholders filled,
 * and the Markdown form of the same page.
 *
 * @file commandCatalogue.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

/** @typedef {import('../types/api.js').AccessMode} AccessMode */
/** @typedef {import('../types/container.js').CommandSection} CommandSection */

/**
 * Returns the host command prefix for the given access mode: sudo into the podshift user
 * in admin mode, or empty in podshift-user mode.
 *
 * @param {AccessMode} [mode] Access mode of the user.
 * @returns {string} The prefix including its trailing space when non-empty.
 */
function hostPrefix(mode) {
    return mode === 'admin' ? 'sudo -u podshift -i ' : '';
}

/**
 * Builds the command sections for one container, with {as} and {name} filled.
 * Host commands appear first in each section.
 *
 * @param {string} name Container name.
 * @param {AccessMode} [mode] Access mode of the user; defaults to 'admin'.
 * @returns {CommandSection[]} Sections with filled commands.
 */
export function commandCatalogue(name, mode = 'admin') {
    const prefix = hostPrefix(mode);
    const target = String(name || '');
    return [
        {
            id: 'terminal',
            commands: [
                {id: 'exec-sh', host: false, command: `${prefix}podman exec -it --user 0 ${target} sh`},
                {id: 'exec-bash', host: false, command: `${prefix}podman exec -it --user 0 ${target} bash`},
            ],
        },
        {
            id: 'logs',
            commands: [
                {id: 'logs-tail', host: true, command: `${prefix}podman logs --tail 100 ${target}`},
                {id: 'logs-follow', host: true, command: `${prefix}podman logs -f ${target}`},
                {id: 'logs-since', host: true, command: `${prefix}podman logs --since 10m ${target}`},
            ],
        },
        {
            id: 'processes',
            commands: [
                {id: 'top', host: true, command: `${prefix}podman top ${target} pid ppid user args`},
                {id: 'stats', host: true, command: `${prefix}podman stats --no-stream ${target}`},
                {id: 'pstree', host: false, command: `${prefix}podman exec ${target} pstree -p`},
                {id: 'ps-forest', host: false, command: `${prefix}podman exec ${target} ps -ef --forest`},
                {id: 'ps', host: false, command: `${prefix}podman exec ${target} ps`},
                {id: 'proc-loop', host: false, command: `${prefix}podman exec ${target} sh -c 'grep -E "^(Name|Pid|PPid):" /proc/[0-9]*/status'`},
            ],
        },
        {
            id: 'system-info',
            commands: [
                {id: 'os-release', host: false, command: `${prefix}podman exec ${target} cat /etc/os-release`},
                {id: 'meminfo', host: false, command: `${prefix}podman exec ${target} cat /proc/meminfo`},
                {id: 'df', host: false, command: `${prefix}podman exec ${target} df -h`},
                {id: 'id', host: false, command: `${prefix}podman exec ${target} id`},
                {id: 'resolv', host: false, command: `${prefix}podman exec ${target} cat /etc/resolv.conf`},
                {id: 'env', host: false, command: `${prefix}podman exec ${target} env`},
            ],
        },
    ];
}

/**
 * English section headings used in the Markdown export. The UI translates the same words
 * with literal i18n() calls in CommandsModal.
 *
 * @type {Record<import('../types/container.js').CommandSectionId, string>}
 */
const SECTION_TITLES = {
    terminal: 'Terminal',
    logs: 'Logs',
    processes: 'Processes',
    'system-info': 'System info',
};

/**
 * English one-line descriptions used in the Markdown export. The UI translates the same
 * words with literal i18n() calls in CommandsModal.
 *
 * @type {Record<import('../types/container.js').ContainerCommandId, string>}
 */
const COMMAND_DESCRIPTIONS = {
    'exec-sh': 'Open a root shell (container root maps to the podshift user on the host).',
    'exec-bash': 'Open a root bash shell (works if the image has bash).',
    'logs-tail': 'Show the last 100 log lines.',
    'logs-follow': 'Follow the log output live.',
    'logs-since': 'Show logs from the last 10 minutes.',
    top: 'List running processes in the container.',
    stats: 'Show one snapshot of CPU, memory and I/O usage.',
    pstree: 'Show the process tree (needs psmisc).',
    'ps-forest': 'Show processes as a tree (needs procps).',
    ps: 'List processes (works in BusyBox images too).',
    'proc-loop': 'List each process\'s name, PID and parent PID from /proc (works without ps).',
    'os-release': 'Show the container OS name and version.',
    meminfo: 'Show memory figures visible inside the container.',
    df: 'Show filesystem disk space usage inside the container.',
    id: 'Show the user and group IDs inside the container.',
    resolv: 'Show DNS resolver settings inside the container.',
    env: 'Show environment variables in the container (can show secret values when run).',
};

/**
 * Builds the Markdown form of the commands page for one container, with placeholders filled.
 * Headings, the caution and the descriptions stay in English; host commands append " `(host)`".
 *
 * @param {string} name Container name.
 * @param {AccessMode} [mode] Access mode of the user; defaults to 'admin'.
 * @returns {string} The Markdown text, ending with a newline.
 */
export function commandCatalogueMarkdown(name, mode = 'admin') {
    const target = String(name || '');
    const lines = [
        `# Commands for container: \`${target}\``,
        '',
        '> Commands inside the container depend on its installed tools and current state, so some may not work in minimal or stopped containers. Commands marked `host` work without tools in the image.',
        '',
    ];
    commandCatalogue(target, mode).forEach(section => {
        lines.push(`## ${SECTION_TITLES[section.id] || section.id}`, '');
        section.commands.forEach(entry => {
            let description = COMMAND_DESCRIPTIONS[entry.id] || entry.id;
            if (entry.host) {
                description += ' `(host)`';
            }
            lines.push(description, '', '```bash', entry.command, '```', '');
        });
    });
    return lines.join('\n');
}
