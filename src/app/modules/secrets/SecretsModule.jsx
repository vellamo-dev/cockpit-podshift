/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * Secrets module: settings, usage filter, row helpers and the secret resource card.
 * The cards come from the secrets-list action; secret values are never loaded or shown.
 * Secrets have no source: they are not created by Quadlet or systemd.
 *
 * @file SecretsModule.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React from 'react';
import {KeyIcon} from '@patternfly/react-icons/dist/esm/icons/key-icon';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {translateResourceRow} from '../../utils/translateResourceRow.js';
import {ResourceTone} from '../../utils/ResourceTone.js';

import {ResourceCard} from '../../components/resource/ResourceCard.jsx';

import {BaseModule} from '../BaseModule.jsx';
import {UsageFilter} from '../filters/UsageFilter.js';

/** @typedef {import('../../types/card.js').CardStatusVariant} CardStatusVariant */
/** @typedef {import('../../types/card.js').MenuDivider} MenuDivider */
/** @typedef {import('../../types/card.js').MenuItem} MenuItem */
/** @typedef {import('../../types/card.js').PropertyRow} PropertyRow */
/** @typedef {import('../../types/module.js').ModulePageState} ModulePageState */
/** @typedef {import('../../types/resource.js').ResourceItem} ResourceItem */
/** @typedef {import('../../types/resource.js').ResourceRow} ResourceRow */
/** @typedef {import('../../types/secret.js').SecretItem} SecretItem */
/** @typedef {import('../../types/secret.js').SecretUse} SecretUse */
/** @typedef {import('../../types/module.js').ModulePageState<SecretItem>} SecretsPageState */

/**
 * Secrets resource module: settings, usage filter, row helpers and the secret card.
 * The cards have no source label and no Show Quadlet item, so the page has no unit view.
 * i18n() in the constructor runs at module load, the same as the module list in index.js.
 *
 * @augments {BaseModule<SecretItem>}
 */
export class SecretsModule extends BaseModule {
    /**
     * Builds the secrets module with its list action, usage filter and card settings.
     */
    constructor() {
        super({
            id: 'secrets',
            label: i18n("Secrets"),
            action: 'secrets-list',
            kind: 'secret',
            filter: new UsageFilter({idPrefix: 'podshift-secret-usage-'}),
            emptyTitle: i18n("No secrets"),
            emptyBody: i18n("No matching secrets."),
            idPrefix: 'podshift-secret-',
            icon: KeyIcon,
            quadletView: false,
        });
    }

    /**
     * PatternFly Label status for each status text.
     *
     * @type {Record<string, CardStatusVariant>}
     */
    static STATUS_VARIANTS = {
        'In use': 'success',
    };

    /**
     * Translated status labels, so the words are in the translation template.
     *
     * @type {Record<string, function(): string>}
     */
    static STATUS_LABELS = {
        'In use': () => i18n("In use"),
        Unused: () => i18n("Unused"),
    };

    /**
     * Translated row labels, so the words are in the translation template.
     *
     * @type {Record<string, function(): string>}
     */
    static ROW_LABELS = {
        driver: () => i18n("Driver"),
        created: () => i18n("Created"),
        updated: () => i18n("Updated"),
        'used-by': () => i18n("Used by"),
    };

    /**
     * Returns the translated status text of a secret.
     *
     * @param {string} status Status from the API, 'In use' or 'Unused'.
     * @returns {string} The translated status.
     */
    static statusText(status) {
        const label = this.STATUS_LABELS[status];
        return label ? label() : i18n(status);
    }

    /**
     * Checks whether a secret matches the filter text.
     *
     * @param {ResourceItem} item The secret.
     * @param {string} query Lowercase filter text; empty matches all.
     * @returns {boolean} True when the name, short ID, full ID, driver or used-by text contains the text.
     */
    static matchesFilter(item, query) {
        if (!query) { return true }
        const haystack = `${item.title} ${item.subtitle || ''} ${item.id} ${this.rowText(item, 'driver')} ${this.rowText(item, 'used-by')}`.toLowerCase();
        return haystack.includes(query);
    }

    /**
     * Builds the kebab action list of a secret card: Inspect only, since
     * secrets have no Quadlet file.
     *
     * @param {ResourceItem} item The secret.
     * @param {ModulePageState} state Page state, for the hook action builders.
     * @returns {(MenuItem|MenuDivider)[]} The menu items.
     */
    static cardActions(item, state) {
        return this.viewActions(item, state);
    }

    /**
     * Formats one use of a secret: the container, then the file path or the variable name.
     *
     * @param {SecretUse} use The use.
     * @returns {string} For example "db (env DB_PASSWORD)" or "web (file at /run/secrets/token)", translated.
     */
    static useText(use) {
        if (use.type === 'env') { return cockpit.format(i18n("$0 (env $1)"), use.container, use.target) }
        return cockpit.format(i18n("$0 (file at $1)"), use.container, use.target);
    }

    /**
     * Prepares a secret row for display: translated label, formatted times, and the
     * Used by value built from usedBy so its words are translated.
     *
     * @param {ResourceRow} row The row from the API.
     * @param {SecretItem} item The secret the row belongs to.
     * @returns {PropertyRow} The row ready for display.
     */
    static translateRow(row, item) {
        const translated = translateResourceRow(row);
        const label = this.ROW_LABELS[row.id];
        const ready = label ? {...translated, label: label()} : translated;
        if (row.id === 'used-by' && Array.isArray(item.usedBy) && item.usedBy.length > 0) { return {...ready, value: item.usedBy.map(use => this.useText(use)).join(', ')} }
        return ready;
    }

    /**
     * Returns the toolbar count text for the number of visible secrets.
     *
     * @param {number} count Number of visible items.
     * @returns {string} The translated count text, for example "3 secrets".
     */
    static countText(count) {
        return cockpit.format(cockpit.ngettext("$0 secret", "$0 secrets", count), count);
    }

    /**
     * Builds a resource card for one secret. Inspect opens the inspect action for the secret's full ID.
     *
     * @param {SecretItem} item The secret.
     * @param {SecretsPageState} state Page state, for the card menu actions.
     * @returns {React.ReactElement} The card, with key={item.id}.
     */
    card(item, state) {
        const Icon = this.icon;
        return (
            <ResourceCard
                key={item.id}
                id={this.cardDomId(item)}
                title={item.title}
                subtitle={item.subtitle}
                icon={<Icon/>}
                status={SecretsModule.statusText(item.status)}
                statusVariant={SecretsModule.STATUS_VARIANTS[item.status]}
                tone={ResourceTone.usageTone(item)}
                rows={(item.rows || []).map(row => SecretsModule.translateRow(row, item))}
                actions={SecretsModule.cardActions(item, state)}
            />
        );
    }
}

/**
 * Shared secrets module instance used by SecretsPage and the module list.
 *
 * @type {SecretsModule}
 */
export const secretsModule = new SecretsModule();
