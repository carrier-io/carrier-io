"use strict";
/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_core_1 = require("@patternfly/react-core");
var react_icons_1 = require("@patternfly/react-icons");
var account_service_1 = require("../../account-service/account.service");
var Msg_1 = require("../../widgets/Msg");
var ContentAlert_1 = require("../ContentAlert");
/**
 * @author Stan Silvert ssilvert@redhat.com (C) 2019 Red Hat Inc.
 */
var ShareTheResource = /** @class */ (function (_super) {
    __extends(ShareTheResource, _super);
    function ShareTheResource(props) {
        var _this = _super.call(this, props) || this;
        _this.handleAddPermission = function () {
            var rscId = _this.props.resource._id;
            var newPermissions = [];
            for (var _i = 0, _a = _this.state.permissionsSelected; _i < _a.length; _i++) {
                var permission = _a[_i];
                newPermissions.push(permission.name);
            }
            var permissions = [];
            for (var _b = 0, _c = _this.state.usernames; _b < _c.length; _b++) {
                var username = _c[_b];
                permissions.push({ username: username, scopes: newPermissions });
            }
            _this.handleToggleDialog();
            account_service_1.AccountServiceClient.Instance.doPut('/resources/' + rscId + '/permissions', { data: permissions })
                .then(function () {
                ContentAlert_1.ContentAlert.success(Msg_1.Msg.localize('shareSuccess'));
                _this.props.onClose(_this.props.resource, _this.props.row);
            });
        };
        _this.handleToggleDialog = function () {
            if (_this.state.isOpen) {
                _this.setState({ isOpen: false });
            }
            else {
                _this.clearState();
                _this.setState({ isOpen: true });
            }
        };
        _this.handleUsernameChange = function (username) {
            _this.setState({ usernameInput: username });
        };
        _this.handleAddUsername = function () {
            if ((_this.state.usernameInput !== '') && (!_this.state.usernames.includes(_this.state.usernameInput))) {
                _this.state.usernames.push(_this.state.usernameInput);
                _this.setState({ usernameInput: '', usernames: _this.state.usernames });
            }
        };
        _this.handleEnterKeyInAddField = function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                _this.handleAddUsername();
            }
        };
        _this.handleDeleteUsername = function (username) {
            var newUsernames = _this.state.usernames.filter(function (user) { return user !== username; });
            _this.setState({ usernames: newUsernames });
        };
        _this.handleSelectPermission = function (selectedPermission) {
            var newPermissionsSelected = _this.state.permissionsSelected;
            var newPermissionsUnSelected = _this.state.permissionsUnSelected;
            if (newPermissionsSelected.includes(selectedPermission)) {
                newPermissionsSelected = newPermissionsSelected.filter(function (permission) { return permission !== selectedPermission; });
                newPermissionsUnSelected.push(selectedPermission);
            }
            else {
                newPermissionsUnSelected = newPermissionsUnSelected.filter(function (permission) { return permission !== selectedPermission; });
                newPermissionsSelected.push(selectedPermission);
            }
            _this.setState({ permissionsSelected: newPermissionsSelected, permissionsUnSelected: newPermissionsUnSelected });
        };
        _this.state = {
            isOpen: false,
            permissionsSelected: [],
            permissionsUnSelected: _this.props.resource.scopes,
            usernames: [],
            usernameInput: ''
        };
        return _this;
    }
    ShareTheResource.prototype.clearState = function () {
        this.setState({
            permissionsSelected: [],
            permissionsUnSelected: this.props.resource.scopes,
            usernames: [],
            usernameInput: ''
        });
    };
    ShareTheResource.prototype.isAddDisabled = function () {
        return this.state.usernameInput === '' || this.isAlreadyShared();
    };
    ShareTheResource.prototype.isAlreadyShared = function () {
        for (var _i = 0, _a = this.props.permissions; _i < _a.length; _i++) {
            var permission = _a[_i];
            if (permission.username === this.state.usernameInput)
                return true;
        }
        return false;
    };
    ShareTheResource.prototype.isFormInvalid = function () {
        return (this.state.usernames.length === 0) || (this.state.permissionsSelected.length === 0);
    };
    ShareTheResource.prototype.render = function () {
        var _this = this;
        return (React.createElement(React.Fragment, null,
            React.createElement(react_core_1.Button, { variant: "link", onClick: this.handleToggleDialog },
                React.createElement(react_icons_1.ShareAltIcon, null),
                " Share"),
            React.createElement(react_core_1.Modal, { title: 'Share the resource - ' + this.props.resource.name, isLarge: true, width: '45%', isOpen: this.state.isOpen, onClose: this.handleToggleDialog, actions: [
                    React.createElement(react_core_1.Button, { key: "cancel", variant: "link", onClick: this.handleToggleDialog },
                        React.createElement(Msg_1.Msg, { msgKey: 'cancel' })),
                    React.createElement(react_core_1.Button, { key: "confirm", variant: "primary", onClick: this.handleAddPermission, isDisabled: this.isFormInvalid() },
                        React.createElement(Msg_1.Msg, { msgKey: 'done' }))
                ] },
                React.createElement(react_core_1.Stack, { gutter: 'md' },
                    React.createElement(react_core_1.StackItem, { isFilled: true },
                        React.createElement(react_core_1.Form, null,
                            React.createElement(react_core_1.FormGroup, { label: "Add users to share your resource with", type: "string", helperTextInvalid: Msg_1.Msg.localize('resourceAlreadyShared'), fieldId: "username", isRequired: true, isValid: !this.isAlreadyShared() },
                                React.createElement(react_core_1.Gallery, { gutter: 'sm' },
                                    React.createElement(react_core_1.GalleryItem, null,
                                        React.createElement(react_core_1.TextInput, { value: this.state.usernameInput, isValid: !this.isAlreadyShared(), id: "username", "aria-describedby": "username-helper", placeholder: "username or email", onChange: this.handleUsernameChange, onKeyPress: this.handleEnterKeyInAddField })),
                                    React.createElement(react_core_1.GalleryItem, null,
                                        React.createElement(react_core_1.Button, { key: "add-user", variant: "primary", onClick: this.handleAddUsername, isDisabled: this.isAddDisabled() },
                                            React.createElement(Msg_1.Msg, { msgKey: "add" })))),
                                React.createElement(react_core_1.ChipGroup, null,
                                    React.createElement(react_core_1.ChipGroupToolbarItem, { key: 'users-selected', categoryName: 'Share with ' }, this.state.usernames.map(function (currentChip) { return (React.createElement(react_core_1.Chip, { key: currentChip, onClick: function () { return _this.handleDeleteUsername(currentChip); } }, currentChip)); })))),
                            React.createElement(react_core_1.FormGroup, { label: "", fieldId: "permissions-selected" },
                                this.state.permissionsSelected.length < 1 && React.createElement("strong", null, "Select permissions below:"),
                                React.createElement(react_core_1.ChipGroup, null,
                                    React.createElement(react_core_1.ChipGroupToolbarItem, { key: 'permissions-selected', categoryName: 'Grant Permissions ' }, this.state.permissionsSelected.map(function (currentChip) { return (React.createElement(react_core_1.Chip, { key: currentChip.toString(), onClick: function () { return _this.handleSelectPermission(currentChip); } }, currentChip.toString())); })))),
                            React.createElement(react_core_1.FormGroup, { label: "", fieldId: "permissions-not-selected" },
                                React.createElement(react_core_1.ChipGroup, null,
                                    React.createElement(react_core_1.ChipGroupToolbarItem, { key: 'permissions-unselected', categoryName: 'Not Selected ' }, this.state.permissionsUnSelected.map(function (currentChip) { return (React.createElement(react_core_1.Chip, { key: currentChip.toString(), onClick: function () { return _this.handleSelectPermission(currentChip); } }, currentChip.toString())); })))))),
                    React.createElement(react_core_1.StackItem, { isFilled: true },
                        React.createElement("br", null)),
                    React.createElement(react_core_1.StackItem, { isFilled: true }, this.props.sharedWithUsersMsg)))));
    };
    ShareTheResource.defaultProps = { permissions: [], row: 0 };
    return ShareTheResource;
}(React.Component));
exports.ShareTheResource = ShareTheResource;
//# sourceMappingURL=ShareTheResource.js.map