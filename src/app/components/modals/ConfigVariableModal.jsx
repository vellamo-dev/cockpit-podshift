/*
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

/**
 * The shared modal of the Configuration card to add, edit and remove one custom TSV_* variable.
 *
 * @file ConfigVariableModal.jsx
 * @license AGPL-3.0-or-later
 * @author Vellamo.fyi
 */

import React, {useState} from 'react';
import {Alert} from '@patternfly/react-core/dist/esm/components/Alert';
import {Button} from '@patternfly/react-core/dist/esm/components/Button';
import {Form, FormGroup, FormHelperText} from '@patternfly/react-core/dist/esm/components/Form';
import {HelperText, HelperTextItem} from '@patternfly/react-core/dist/esm/components/HelperText';
import {InputGroup, InputGroupItem, InputGroupText} from '@patternfly/react-core/dist/esm/components/InputGroup';
import {Modal, ModalBody, ModalFooter, ModalHeader} from '@patternfly/react-core/dist/esm/components/Modal';
import {Stack, StackItem} from '@patternfly/react-core/dist/esm/layouts/Stack';
import {TextInput} from '@patternfly/react-core/dist/esm/components/TextInput';

import cockpit from '../../utils/cockpitTyped.js';
import {i18n} from '../../utils/i18n.js';
import {PodShiftApi} from '../../api/PodShiftApi.js';
import {ConfigModalView} from '../../utils/ConfigModalView.js';
import {TsvConfigRules} from '../../utils/TsvConfigRules.js';
import {configProblemText} from '../../utils/configProblemText.js';

import './ConfigVariableModal.scss';

/** @typedef {import('../../types/api.js').ConfigProblem} ConfigProblem */
/** @typedef {import('../../types/api.js').ConfigResult} ConfigResult */
/** @typedef {import('../../types/card.js').ConfigModalMode} ConfigModalMode */

/**
 * Shows a field hint as error helper text, or nothing.
 *
 * @param {object} props Component props.
 * @param {string|null} props.text Translated hint, or null.
 * @returns {React.ReactElement|null} The helper text, or null.
 */
function FieldProblem({text}) {
    if (!text) {
        return null;
    }
    return (
        <FormHelperText>
            <HelperText>
                <HelperTextItem variant="error">{text}</HelperTextItem>
            </HelperText>
        </FormHelperText>
    );
}

/**
 * Adds, edits or removes one custom variable. Add has an open name after a fixed TSV_;
 * edit locks the name and adds Remove, which asks for confirmation in the same modal.
 * The checks of TsvConfigRules disable Save early; PodShift checks again and its message
 * is shown here when it refuses.
 *
 * @param {object} props Component props.
 * @param {ConfigModalMode} props.mode 'add' or 'edit'.
 * @param {string} [props.initialKey] Full name of the edited variable, for example TSV_APP_DOMAIN.
 * @param {string} [props.initialValue] Current value of the edited variable.
 * @param {() => void} props.onClose Called when the modal is closed without a change.
 * @param {() => void} props.onSaved Called after a successful save or remove.
 * @returns {React.ReactElement} The modal.
 */
export function ConfigVariableModal({mode, initialKey = '', initialValue = '', onClose, onSaved}) {
    const [name, setName] = useState(TsvConfigRules.normaliseName(initialKey));
    const [value, setValue] = useState(initialValue);
    const [valueTouched, setValueTouched] = useState(mode === 'edit');
    const [confirming, setConfirming] = useState(false);
    const [busy, setBusy] = useState(false);
    const [failure, setFailure] = useState(/** @type {string|null} */ (null));

    const layout = ConfigModalView.layout(mode, confirming);
    const key = mode === 'edit' ? initialKey : TsvConfigRules.PREFIX + name;

    /** @type {ConfigProblem|null} */
    let nameProblem = null;
    if (name !== '') {
        nameProblem = TsvConfigRules.checkName(key);
        if (!nameProblem && TsvConfigRules.isNameSensitive(key)) {
            nameProblem = 'SENSITIVE_NAME';
        }
    }
    /** @type {ConfigProblem|null} */
    let valueProblem = TsvConfigRules.checkValue(value);
    if (!valueProblem && TsvConfigRules.isValueSensitive(value)) {
        valueProblem = 'SENSITIVE_VALUE';
    }
    const canSave = !busy && (layout.nameLocked || name !== '') && TsvConfigRules.checkEntry(key, value) === null;
    const valueHint = (valueTouched || value !== '') ? configProblemText(valueProblem) : null;

    let title = i18n("Add variable");
    if (layout.title === 'edit') {
        title = cockpit.format(i18n("Edit $0"), key);
    } else if (layout.title === 'remove') {
        title = cockpit.format(i18n("Remove $0?"), key);
    }

    /**
     * Runs one config action and closes on success, or shows PodShift's refusal or the error.
     *
     * @param {'config-set'|'config-unset'} action The action to run.
     * @param {object} args The action arguments.
     */
    async function run(action, args) {
        setBusy(true);
        setFailure(null);
        try {
            /** @type {ConfigResult} */
            const result = await PodShiftApi.callAction(action, args);
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

    /**
     * Saves the variable, when the checks allow it.
     *
     * @param {React.FormEvent} [event] The form submit event, when Enter was pressed.
     */
    function save(event) {
        if (event) {
            event.preventDefault();
        }
        if (!canSave) {
            return;
        }
        run('config-set', {key, value}).catch(() => {});
    }

    /**
     * Removes the variable after the confirmation.
     */
    function remove() {
        run('config-unset', {key}).catch(() => {});
    }

    return (
        <Modal
            variant="medium"
            isOpen
            onClose={onClose}
            aria-labelledby="podshift-config-variable-title"
        >
            <ModalHeader labelId="podshift-config-variable-title" title={title} titleIconVariant={layout.showConfirm ? 'warning' : undefined}/>
            <ModalBody>
                <Stack hasGutter>
                    {!layout.showConfirm && (
                        <StackItem>
                            <Alert variant="warning" isInline title={i18n("Do not use these variables for passwords, tokens and other sensitive data. Use Podman secrets for that purpose.")}>
                                {i18n("Values are stored in plain text in tsv.conf.")}
                            </Alert>
                        </StackItem>
                    )}
                    {failure && (
                        <StackItem>
                            <Alert variant="danger" isInline title={failure}/>
                        </StackItem>
                    )}
                    {layout.showConfirm && (
                        <StackItem>
                            {cockpit.format(i18n("$0 is removed from tsv.conf. Running Quadlets keep their values until they are installed again."), key)}
                        </StackItem>
                    )}
                    {layout.showForm && (
                        <StackItem>
                            <Form id="podshift-config-variable-form" onSubmit={event => save(event)}>
                                <FormGroup label={i18n("Name")} fieldId="podshift-config-variable-name" isRequired={!layout.nameLocked}>
                                    <InputGroup>
                                        <InputGroupText>{TsvConfigRules.PREFIX}</InputGroupText>
                                        <InputGroupItem isFill>
                                            <TextInput
                                                id="podshift-config-variable-name"
                                                value={name}
                                                isDisabled={layout.nameLocked}
                                                maxLength={124}
                                                validated={nameProblem ? 'error' : 'default'}
                                                onChange={(_event, text) => setName(TsvConfigRules.normaliseName(text))}
                                            />
                                        </InputGroupItem>
                                    </InputGroup>
                                    <FieldProblem text={configProblemText(nameProblem)}/>
                                </FormGroup>
                                <FormGroup label={i18n("Value")} fieldId="podshift-config-variable-value" isRequired>
                                    <TextInput
                                        id="podshift-config-variable-value"
                                        value={value}
                                        maxLength={4096}
                                        validated={valueHint ? 'error' : 'default'}
                                        onChange={(_event, text) => setValue(text)}
                                        onBlur={() => setValueTouched(true)}
                                    />
                                    <FieldProblem text={valueHint}/>
                                </FormGroup>
                            </Form>
                        </StackItem>
                    )}
                </Stack>
            </ModalBody>
            <ModalFooter>
                {layout.showSave && (
                    <Button variant="primary" isDisabled={!canSave} isLoading={busy} onClick={() => save()}>
                        {i18n("Save")}
                    </Button>
                )}
                {layout.showConfirm && (
                    <Button variant="danger" isDisabled={busy} isLoading={busy} onClick={() => remove()}>
                        {i18n("Remove")}
                    </Button>
                )}
                <Button
                    variant="link"
                    isDisabled={busy}
                    onClick={() => {
                        if (layout.showConfirm) {
                            setConfirming(false);
                            setFailure(null);
                        } else {
                            onClose();
                        }
                    }}
                >
                    {i18n("Cancel")}
                </Button>
                {layout.showRemove && (
                    <Button
                        className="podshift-config-variable-remove"
                        variant="danger"
                        isDisabled={busy}
                        onClick={() => {
                            setConfirming(true);
                            setFailure(null);
                        }}
                    >
                        {i18n("Remove")}
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}
