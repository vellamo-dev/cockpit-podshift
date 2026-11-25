/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for commandCatalogue, the container command templates, placeholder filling
 * and the Markdown export.
 *
 * @file commandCatalogue.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {commandCatalogue, commandCatalogueMarkdown} from '../../app/utils/commandCatalogue.js';

QUnit.module('commandCatalogue', () => {
    QUnit.test('fills {as} with sudo -u podshift -i and {name} in admin mode', assert => {
        const sections = commandCatalogue('web', 'admin');
        assert.deepEqual(sections.map(section => section.id), ['terminal', 'logs', 'processes', 'system-info']);

        const terminal = sections[0].commands;
        assert.strictEqual(terminal[0].command, 'sudo -u podshift -i podman exec -it --user 0 web sh');
        assert.strictEqual(terminal[1].command, 'sudo -u podshift -i podman exec -it --user 0 web bash');
        assert.false(terminal[0].host);
        assert.false(terminal[1].host);

        const logs = sections[1].commands;
        assert.deepEqual(logs.map(entry => entry.command), [
            'sudo -u podshift -i podman logs --tail 100 web',
            'sudo -u podshift -i podman logs -f web',
            'sudo -u podshift -i podman logs --since 10m web',
        ]);
        assert.true(logs.every(entry => entry.host));

        const processes = sections[2].commands;
        assert.strictEqual(processes[0].command, 'sudo -u podshift -i podman top web pid ppid user args');
        assert.strictEqual(processes[1].command, 'sudo -u podshift -i podman stats --no-stream web');
        assert.strictEqual(processes[2].command, 'sudo -u podshift -i podman exec web pstree -p');
        assert.strictEqual(processes[3].command, 'sudo -u podshift -i podman exec web ps -ef --forest');
        assert.strictEqual(processes[4].command, 'sudo -u podshift -i podman exec web ps');
        assert.strictEqual(
            processes[5].command,
            'sudo -u podshift -i podman exec web sh -c \'grep -E "^(Name|Pid|PPid):" /proc/[0-9]*/status\''
        );

        const sysinfo = sections[3].commands;
        assert.deepEqual(sysinfo.map(entry => entry.command), [
            'sudo -u podshift -i podman exec web cat /etc/os-release',
            'sudo -u podshift -i podman exec web cat /proc/meminfo',
            'sudo -u podshift -i podman exec web df -h',
            'sudo -u podshift -i podman exec web id',
            'sudo -u podshift -i podman exec web cat /etc/resolv.conf',
            'sudo -u podshift -i podman exec web env',
        ]);
        assert.true(sysinfo.every(entry => !entry.host));
    });

    QUnit.test('leaves {as} empty in podshift mode', assert => {
        const sections = commandCatalogue('shop-api', 'podshift');
        assert.strictEqual(sections[0].commands[0].command, 'podman exec -it --user 0 shop-api sh');
        assert.strictEqual(sections[1].commands[0].command, 'podman logs --tail 100 shop-api');
        assert.strictEqual(sections[2].commands[0].command, 'podman top shop-api pid ppid user args');
        assert.strictEqual(sections[2].commands[2].command, 'podman exec shop-api pstree -p');
        assert.strictEqual(sections[3].commands[0].command, 'podman exec shop-api cat /etc/os-release');
    });

    QUnit.test('lists host commands before in-container commands in every section', assert => {
        const sections = commandCatalogue('db', 'admin');
        sections.forEach(section => {
            let seenNonHost = false;
            section.commands.forEach(entry => {
                if (!entry.host) {
                    seenNonHost = true;
                } else {
                    assert.false(seenNonHost, `${section.id} puts host command ${entry.id} first`);
                }
            });
        });
    });

    QUnit.test('defaults mode to admin and leaves no unfilled placeholders', assert => {
        const sections = commandCatalogue('cache');
        assert.strictEqual(sections[0].commands[0].command, 'sudo -u podshift -i podman exec -it --user 0 cache sh');
        sections.forEach(section => {
            section.commands.forEach(entry => {
                assert.false(entry.command.includes('{as}'), `${entry.id} has no {as}`);
                assert.false(entry.command.includes('{name}'), `${entry.id} has no {name}`);
            });
        });
    });

    QUnit.test('generated commands contain no $ characters', assert => {
        ['admin', 'podshift'].forEach(mode => {
            commandCatalogue('web', mode).forEach(section => {
                section.commands.forEach(entry => {
                    assert.false(entry.command.includes('$'), `${mode} ${entry.id} has no $`);
                });
            });
        });
    });
});

QUnit.module('commandCatalogueMarkdown', () => {
    QUnit.test('builds a Markdown page with heading, caution, sections and bash fences', assert => {
        const text = commandCatalogueMarkdown('web', 'admin');
        assert.true(text.startsWith('# Commands for container: `web`\n'), 'title');
        assert.true(text.includes('> Commands inside the container depend on its installed tools and current state, so some may not work in minimal or stopped containers. Commands marked `host` work without tools in the image.\n'), 'caution');
        assert.true(text.includes('## Terminal\n'), 'Terminal heading');
        assert.true(text.includes('## Logs\n'), 'Logs heading');
        assert.true(text.includes('## Processes\n'), 'Processes heading');
        assert.true(text.includes('## System info\n'), 'System info heading');
        assert.true(text.endsWith('\n'), 'ends with a newline');

        assert.true(text.includes('Open a root shell (container root maps to the podshift user on the host).\n\n```bash\nsudo -u podshift -i podman exec -it --user 0 web sh\n```\n'), 'terminal sh fence');
        assert.true(text.includes('Show the last 100 log lines. `(host)`\n\n```bash\nsudo -u podshift -i podman logs --tail 100 web\n```\n'), 'host description and fence');
        assert.true(text.includes('Show the process tree (needs psmisc).\n\n```bash\nsudo -u podshift -i podman exec web pstree -p\n```\n'), 'in-container fence has no host suffix');
        assert.true(text.includes('List each process\'s name, PID and parent PID from /proc (works without ps).\n\n```bash\nsudo -u podshift -i podman exec web sh -c \'grep -E "^(Name|Pid|PPid):" /proc/[0-9]*/status\'\n```\n'), 'proc-loop fence');
        assert.false(text.includes('pstree -p. `(host)`'), 'non-host descriptions do not append `(host)`');
    });

    QUnit.test('fills commands in podshift mode without the sudo prefix', assert => {
        const text = commandCatalogueMarkdown('shop-api', 'podshift');
        assert.true(text.startsWith('# Commands for container: `shop-api`\n'), 'title');
        assert.true(text.includes('```bash\npodman exec -it --user 0 shop-api sh\n```\n'), 'exec without sudo');
        assert.true(text.includes('```bash\npodman logs --tail 100 shop-api\n```\n'), 'logs without sudo');
        assert.false(text.includes('sudo -u podshift'), 'no sudo prefix');
    });
});
