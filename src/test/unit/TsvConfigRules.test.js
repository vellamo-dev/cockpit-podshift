/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Unit tests for TsvConfigRules, the client-side copy of PodShift's variable and tag rules.
 * The cases follow PodShift's own bats tests, so both sides accept and refuse the same entries.
 *
 * @file TsvConfigRules.test.js
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import QUnit from 'qunit';

import {TsvConfigRules} from '../../app/utils/TsvConfigRules.js';

QUnit.module('TsvConfigRules', () => {
    QUnit.test('normaliseName upper-cases and strips one leading TSV_', assert => {
        assert.strictEqual(TsvConfigRules.normaliseName('app_domain'), 'APP_DOMAIN');
        assert.strictEqual(TsvConfigRules.normaliseName('TSV_APP'), 'APP');
        assert.strictEqual(TsvConfigRules.normaliseName('tsv_app'), 'APP');
        assert.strictEqual(TsvConfigRules.normaliseName('  TSV_APP  '), 'APP');
        assert.strictEqual(TsvConfigRules.normaliseName('TSV_TSV_APP'), 'TSV_APP');
        assert.strictEqual(TsvConfigRules.normaliseName('TSV'), 'TSV');
        assert.strictEqual(TsvConfigRules.normaliseName(''), '');
    });

    QUnit.test('checkName accepts TSV_ followed by a capital letter, then capitals, digits or _', assert => {
        for (const key of ['TSV_A', 'TSV_APP_DOMAIN', 'TSV_PG16', 'TSV_A__B', 'TSV_A_']) {
            assert.strictEqual(TsvConfigRules.checkName(key), null, key);
        }
    });

    QUnit.test('checkName refuses other forms as INVALID_NAME', assert => {
        for (const key of ['TSV_', 'TSV_app', 'TSV_1A', 'TSV__A', 'TSV_A-B', 'TSV_A.B', 'TSV_Ä', 'APP_NAME', 'tsv_A', 'TSV_A B', '']) {
            assert.strictEqual(TsvConfigRules.checkName(key), 'INVALID_NAME', key);
        }
    });

    QUnit.test('checkName refuses names starting with TSV_NW or TSV_ENV as RESERVED_NAME', assert => {
        for (const key of ['TSV_NW1', 'TSV_NW9', 'TSV_NWORDER', 'TSV_ENV', 'TSV_ENV2', 'TSV_ENVIRONMENT']) {
            assert.strictEqual(TsvConfigRules.checkName(key), 'RESERVED_NAME', key);
        }
        assert.strictEqual(TsvConfigRules.checkName('TSV_N'), null);
        assert.strictEqual(TsvConfigRules.checkName('TSV_EN'), null);
    });

    QUnit.test('isNameSensitive finds secret words only as whole words', assert => {
        for (const key of ['TSV_DB_PASSWORD', 'TSV_PASSWD', 'TSV_PSW', 'TSV_PSWD', 'TSV_PWD', 'TSV_PASS', 'TSV_SECRET', 'TSV_SECRETS',
            'TSV_API_TOKEN', 'TSV_APIKEY', 'TSV_CREDENTIAL', 'TSV_CREDENTIALS', 'TSV_API_KEY', 'TSV_PRIVATE_KEY', 'TSV_API__KEY',
            'TSV_TOKEN_', 'TSV_A_SECRET_B']) {
            assert.true(TsvConfigRules.isNameSensitive(key), key);
        }
        for (const key of ['TSV_PASSAGE', 'TSV_KEYBOARD', 'TSV_TOKENIZER_MODEL', 'TSV_KEY', 'TSV_SSH_KEY', 'TSV_KEY_API',
            'TSV_APIS_KEY', 'TSV_PUBLIC_KEY', 'TSV_COMPASS', 'TSV_PWDX']) {
            assert.false(TsvConfigRules.isNameSensitive(key), key);
        }
    });

    QUnit.test('checkValue accepts ordinary values', assert => {
        // A literal ${TSV_X} value, not a template: PodShift must keep it as text.
        // eslint-disable-next-line no-template-curly-in-string -- the text is meant literally
        for (const value of ['16', 'example.com', 'a b', 'https://example.com/a?b=1&c=2', '50%', '$HOME', '${TSV_X}', 'a\\b', 'quay.io/app:1.2', 'x=y', 'Ä', ' lead']) {
            assert.strictEqual(TsvConfigRules.checkValue(value), null, value);
        }
    });

    QUnit.test('checkValue refuses an empty value, quotes, control characters and a trailing backslash', assert => {
        assert.strictEqual(TsvConfigRules.checkValue(''), 'EMPTY_VALUE');
        for (const value of ['a"b', '"', "it's", "'", 'a\nb', 'a\tb', '\r', 'a\u0001', 'a\u007f', 'a\u001b[0m', 'end\\', '\\']) {
            assert.strictEqual(TsvConfigRules.checkValue(value), 'INVALID_VALUE', JSON.stringify(value));
        }
    });

    QUnit.test('isValueSensitive finds the known secret formats', assert => {
        const values = [
            '-----BEGIN ' + 'PRIVATE KEY-----',
            '-----BEGIN RSA ' + 'PRIVATE KEY-----',
            '-----BEGIN OPENSSH ' + 'PRIVATE KEY-----',
            'gh' + 'p_abcdefghijABCDEFGHIJ0123456789abcdef',
            'token=gh' + 'o_abcdefghijABCDEFGHIJ0123456789abcdef',
            'github' + '_pat_11ABCDEFG0abcdefghijkl_mnopqrstuvwxyz',
            'glpat' + '-abcdefghij0123456789',
            'xox' + 'b-123456789012-abcDEF123',
            'xox' + 'p-1-2-3-abc',
            'AKIA' + 'ABCDEFGHIJKLMNOP',
            'key AKIA' + 'ABCDEFGHIJKLMNOP end',
            'ey' + 'JhbGciOiJIUzI1NiJ9.ey' + 'JzdWIiOiIxMjM0NTY3ODkwIn0.abc'
        ];
        for (const value of values) {
            assert.true(TsvConfigRules.isValueSensitive(value), value);
        }
    });

    QUnit.test('isValueSensitive leaves near misses alone', assert => {
        const values = [
            '550e8400-e29b-41d4-a716-446655440000',
            'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            'quay.io/app@sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            'deadbeefdeadbeefdeadbeefdeadbeef',
            'SGVsbG8gV29ybGQhIFRoaXMgaXMgYmFzZTY0Lg==',
            'ghp_short',
            'xgh' + 'p_abcdefghijABCDEFGHIJ0123456789abcdef',
            'gh' + 'p_abcdefghijABCDEFGHIJ0123456789abcdefg',
            'AKIA' + 'ABCDEFGHIJKLMNO',
            'XAKIA' + 'ABCDEFGHIJKLMNOP',
            'AKIA' + 'ABCDEFGHIJKLMNOPQ',
            'ey' + 'JhbGci.ey' + 'JzdWIi.abc',
            '-----BEGIN PUBLIC KEY-----',
            'glpat' + '-short',
            'xox' + 'a-1-abc'
        ];
        for (const value of values) {
            assert.false(TsvConfigRules.isValueSensitive(value), value);
        }
    });

    QUnit.test('checkEntry checks name, secret name, value and secret value in that order', assert => {
        assert.strictEqual(TsvConfigRules.checkEntry('TSV_APP_DOMAIN', 'example.com'), null);
        assert.strictEqual(TsvConfigRules.checkEntry('TSV_app', ''), 'INVALID_NAME');
        assert.strictEqual(TsvConfigRules.checkEntry('TSV_NW1', ''), 'RESERVED_NAME');
        assert.strictEqual(TsvConfigRules.checkEntry('TSV_DB_PASSWORD', ''), 'SENSITIVE_NAME');
        assert.strictEqual(TsvConfigRules.checkEntry('TSV_APP', ''), 'EMPTY_VALUE');
        assert.strictEqual(TsvConfigRules.checkEntry('TSV_APP', "it's"), 'INVALID_VALUE');
        assert.strictEqual(TsvConfigRules.checkEntry('TSV_APP', 'gh' + 'p_abcdefghijABCDEFGHIJ0123456789abcdef'), 'SENSITIVE_VALUE');
    });

    QUnit.test('isValidEnvTag follows is-valid-env-tag', assert => {
        for (const tag of ['dev', 'prod', 'Prod-1', 'a.b_c', '_x', '0', 'a'.repeat(128)]) {
            assert.true(TsvConfigRules.isValidEnvTag(tag), tag);
        }
        for (const tag of ['', '.dev', '-dev', 'a b', 'dev!', 'ä', 'a'.repeat(129), 'dev\n']) {
            assert.false(TsvConfigRules.isValidEnvTag(tag), JSON.stringify(tag));
        }
    });
});
