/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The modal of the Configuration card that sets the environment tag TSV_ENV once.
 *
 * @file EnvTagModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useState} from 'react';
import {Alert} from '@patternfly/react-core/dist/esm/components/Alert';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Form, FormGroup, FormHelperText} from '@patternfly/react-core/dist/esm/components/Form';
import {HelperText, HelperTextItem} from '@patternfly/react-core/dist/esm/components/HelperText';
import {Modal, ModalBody, ModalFooter, ModalHeader} from '@patternfly/react-core/dist/esm/components/Modal';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';

import {TypeaheadSelect} from 'cockpit-components-typeahead-select';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {PodShiftApi} from '../../api/PodShiftApi.js';
import {TsvConfigRules} from '../../utils/TsvConfigRules.js';
import {configProblemText} from '../../utils/configProblemText.js';

/** @typedef {import('../../types/api.js').ConfigResult} ConfigResult */

/**
 * Sets TSV_ENV with the env-set action. The tag can be picked from the suggestions or typed.
 * PodShift sets it only while it is unset; later changes need sudo podshift env --set.
 *
 * @param {object} props Component props.
 * @param {string[]} [props.suggestions] Suggested tags from PodShift's main.conf.
 * @param {() => void} props.onClose Called when the modal is closed without a change.
 * @param {() => void} props.onSaved Called after the tag was set.
 * @returns {React.ReactElement} The modal.
 */
export function EnvTagModal({suggestions = [], onClose, onSaved}) {
    const [tag, setTag] = useState('');
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState(/** @type {string|null} */ (null));

    const valid = TsvConfigRules.isValidEnvTag(tag);
    const hint = (tag !== '' && !valid) ? configProblemText('INVALID_TAG') : null;
    const options = suggestions.map(item => ({value: item, content: item}));

    /**
     * Sets the tag, or shows PodShift's refusal or the error.
     *
     * @param {React.FormEvent} [event] The form submit event, when Enter was pressed.
     */
    async function save(event) {
        if (event) {
            event.preventDefault();
        }
        if (!valid || busy) {
            return;
        }
        setBusy(true);
        setFailure(null);
        try {
            /** @type {ConfigResult} */
            const result = await PodShiftApi.callAction('env-set', {value: tag});
            if (result.ok) {
                onSaved();
                return;
            }
            setFailure(result.message || result.error || i18n("PodShift refused the change."));
        } catch (e) {
            setFailure(e.message || String(e));
        }
        setBusy(false);
    }

    return (
        <Modal
            variant="small"
            isOpen
            onClose={onClose}
            aria-labelledby="podshift-env-tag-title"
        >
            <ModalHeader labelId="podshift-env-tag-title" title={i18n("Set environment")}/>
            <ModalBody>
                <Stack hasGutter>
                    <StackItem>
                        {i18n("The environment tag, TSV_ENV, can be set here once. Change it later as root with")} <code>sudo podshift env --set &lt;tag&gt;</code>
                    </StackItem>
                    {failure && (
                        <StackItem>
                            <Alert variant="danger" isInline title={failure}/>
                        </StackItem>
                    )}
                    <StackItem>
                        <Form id="podshift-env-tag-form" onSubmit={event => { save(event).catch(() => {}) }}>
                            <FormGroup label={i18n("Environment tag")} fieldId="podshift-env-tag" isRequired>
                                <TypeaheadSelect
                                    id="podshift-env-tag"
                                    selectOptions={options}
                                    selected={tag}
                                    isCreatable
                                    createOptionMessage={text => cockpit.format(i18n("Use \"$0\""), text)}
                                    placeholder={i18n("Pick or type a tag")}
                                    noOptionsAvailableMessage={i18n("No suggested tags. Type a tag.")}
                                    isDisabled={busy}
                                    onInputChange={text => setTag(text.trim())}
                                    onSelect={(_event, selection) => setTag(String(selection))}
                                    onClearSelection={() => setTag('')}
                                />
                                {hint && (
                                    <FormHelperText>
                                        <HelperText>
                                            <HelperTextItem variant="error">{hint}</HelperTextItem>
                                        </HelperText>
                                    </FormHelperText>
                                )}
                            </FormGroup>
                        </Form>
                    </StackItem>
                </Stack>
            </ModalBody>
            <ModalFooter>
                <Button variant="primary" isDisabled={!valid || busy} isLoading={busy} onClick={() => { save().catch(() => {}) }}>
                    {i18n("Set")}
                </Button>
                <Button variant="link" isDisabled={busy} onClick={onClose}>
                    {i18n("Cancel")}
                </Button>
            </ModalFooter>
        </Modal>
    );
}
