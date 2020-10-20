"use strict";
/*
 * Copyright 2018 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_core_1 = require("@patternfly/react-core");
var account_service_1 = require("../../account-service/account.service");
var Msg_1 = require("../../widgets/Msg");
var ContentPage_1 = require("../ContentPage");
var ContentAlert_1 = require("../ContentAlert");
/**
 * @author Stan Silvert ssilvert@redhat.com (C) 2018 Red Hat Inc.
 */
var AccountPage = /** @class */ (function (_super) {
    __extends(AccountPage, _super);
    function AccountPage(props) {
        var _this = _super.call(this, props) || this;
        _this.isRegistrationEmailAsUsername = features.isRegistrationEmailAsUsername;
        _this.isEditUserNameAllowed = features.isEditUserNameAllowed;
        _this.DEFAULT_STATE = {
            errors: {
                username: '',
                firstName: '',
                lastName: '',
                email: ''
            },
            formFields: {
                username: '',
                firstName: '',
                lastName: '',
                email: ''
            }
        };
        _this.state = _this.DEFAULT_STATE;
        _this.handleCancel = function () {
            _this.fetchPersonalInfo();
        };
        _this.handleChange = function (value, event) {
            var _a, _b;
            var target = event.currentTarget;
            var name = target.name;
            _this.setState({
                errors: __assign({}, _this.state.errors, (_a = {}, _a[name] = target.validationMessage, _a)),
                formFields: __assign({}, _this.state.formFields, (_b = {}, _b[name] = value, _b))
            });
        };
        _this.handleSubmit = function (event) {
            event.preventDefault();
            var form = event.target;
            var isValid = form.checkValidity();
            if (isValid) {
                var reqData = __assign({}, _this.state.formFields);
                account_service_1.AccountServiceClient.Instance.doPost("/", { data: reqData })
                    .then(function () {
                    ContentAlert_1.ContentAlert.success('accountUpdatedMessage');
                });
            }
            else {
                var formData = new FormData(form);
                var validationMessages = Array.from(formData.keys()).reduce(function (acc, key) {
                    acc[key] = form.elements[key].validationMessage;
                    return acc;
                }, {});
                _this.setState({
                    errors: __assign({}, validationMessages),
                    formFields: _this.state.formFields
                });
            }
        };
        _this.UsernameInput = function () { return (React.createElement(react_core_1.TextInput, { isRequired: true, type: "text", id: "user-name", name: "username", value: _this.state.formFields.username, onChange: _this.handleChange, isValid: _this.state.errors.username === '' })); };
        _this.RestrictedUsernameInput = function () { return (React.createElement(react_core_1.TextInput, { isDisabled: true, type: "text", id: "user-name", name: "username", value: _this.state.formFields.username })); };
        _this.fetchPersonalInfo();
        return _this;
    }
    AccountPage.prototype.fetchPersonalInfo = function () {
        var _this = this;
        account_service_1.AccountServiceClient.Instance.doGet("/")
            .then(function (response) {
            _this.setState(_this.DEFAULT_STATE);
            _this.setState(__assign({ formFields: response.data }));
        });
    };
    AccountPage.prototype.render = function () {
        var _this = this;
        var fields = this.state.formFields;
        return (React.createElement(ContentPage_1.ContentPage, { title: "personalInfoHtmlTitle", introMessage: "personalSubMessage" },
            React.createElement(react_core_1.Form, { isHorizontal: true, onSubmit: function (event) { return _this.handleSubmit(event); } },
                !this.isRegistrationEmailAsUsername &&
                    React.createElement(react_core_1.FormGroup, { label: Msg_1.Msg.localize('username'), isRequired: true, fieldId: "user-name", helperTextInvalid: this.state.errors.username, isValid: this.state.errors.username === '' },
                        this.isEditUserNameAllowed && React.createElement(this.UsernameInput, null),
                        !this.isEditUserNameAllowed && React.createElement(this.RestrictedUsernameInput, null)),
                React.createElement(react_core_1.FormGroup, { label: Msg_1.Msg.localize('email'), isRequired: true, fieldId: "email-address", helperTextInvalid: this.state.errors.email, isValid: this.state.errors.email === '' },
                    React.createElement(react_core_1.TextInput, { isRequired: true, type: "email", id: "email-address", name: "email", value: fields.email, onChange: this.handleChange, isValid: this.state.errors.email === '' })),
                React.createElement(react_core_1.FormGroup, { label: Msg_1.Msg.localize('firstName'), isRequired: true, fieldId: "first-name", helperTextInvalid: this.state.errors.firstName, isValid: this.state.errors.firstName === '' },
                    React.createElement(react_core_1.TextInput, { isRequired: true, type: "text", id: "first-name", name: "firstName", value: fields.firstName, onChange: this.handleChange, isValid: this.state.errors.firstName === '' })),
                React.createElement(react_core_1.FormGroup, { label: Msg_1.Msg.localize('lastName'), isRequired: true, fieldId: "last-name", helperTextInvalid: this.state.errors.lastName, isValid: this.state.errors.lastName === '' },
                    React.createElement(react_core_1.TextInput, { isRequired: true, type: "text", id: "last-name", name: "lastName", value: fields.lastName, onChange: this.handleChange, isValid: this.state.errors.lastName === '' })),
                React.createElement(react_core_1.ActionGroup, null,
                    React.createElement(react_core_1.Button, { type: "submit", id: "save-btn", variant: "primary", isDisabled: Object.values(this.state.errors).filter(function (e) { return e !== ''; }).length !== 0 },
                        React.createElement(Msg_1.Msg, { msgKey: "doSave" })),
                    React.createElement(react_core_1.Button, { id: "cancel-btn", variant: "secondary", onClick: this.handleCancel },
                        React.createElement(Msg_1.Msg, { msgKey: "doCancel" }))))));
    };
    return AccountPage;
}(React.Component));
exports.AccountPage = AccountPage;
;
//# sourceMappingURL=AccountPage.js.map