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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var moment = require("moment");
var react_router_dom_1 = require("react-router-dom");
var react_core_1 = require("@patternfly/react-core");
var AIACommand_1 = require("../../util/AIACommand");
var account_service_1 = require("../../account-service/account.service");
var ContinueCancelModal_1 = require("../../widgets/ContinueCancelModal");
var Msg_1 = require("../../widgets/Msg");
var ContentPage_1 = require("../ContentPage");
var ContentAlert_1 = require("../ContentAlert");
/**
 * @author Stan Silvert ssilvert@redhat.com (C) 2018 Red Hat Inc.
 */
var SigningInPage = /** @class */ (function (_super) {
    __extends(SigningInPage, _super);
    function SigningInPage(props) {
        var _this = _super.call(this, props) || this;
        _this.updatePassword = new AIACommand_1.AIACommand('UPDATE_PASSWORD', _this.props.location.pathname);
        _this.setUpTOTP = new AIACommand_1.AIACommand('CONFIGURE_TOTP', _this.props.location.pathname);
        _this.handleRemove = function (credentialId, userLabel) {
            account_service_1.AccountServiceClient.Instance.doDelete("/credentials/" + credentialId)
                .then(function () {
                _this.getCredentialContainers();
                ContentAlert_1.ContentAlert.success('successRemovedMessage', [userLabel]);
            });
        };
        _this.state = {
            credentialContainers: new Map()
        };
        _this.getCredentialContainers();
        return _this;
    }
    SigningInPage.prototype.getCredentialContainers = function () {
        var _this = this;
        account_service_1.AccountServiceClient.Instance.doGet("/credentials")
            .then(function (response) {
            var allContainers = new Map();
            response.data.forEach(function (container) {
                var categoryMap = allContainers.get(container.category);
                if (!categoryMap) {
                    categoryMap = new Map();
                    allContainers.set(container.category, categoryMap);
                }
                categoryMap.set(container.type, container);
            });
            _this.setState({ credentialContainers: allContainers });
            console.log({ allContainers: allContainers });
        });
    };
    SigningInPage.credElementId = function (credType, credId, item) {
        return credType + "-" + item + "-" + credId.substring(0, 8);
    };
    SigningInPage.prototype.render = function () {
        return (React.createElement(ContentPage_1.ContentPage, { title: "signingIn", introMessage: "signingInSubMessage" },
            React.createElement(react_core_1.Stack, { gutter: 'md' }, this.renderCategories())));
    };
    SigningInPage.prototype.renderCategories = function () {
        var _this = this;
        return (React.createElement(React.Fragment, null,
            " ",
            Array.from(this.state.credentialContainers.keys()).map(function (category) { return (React.createElement(react_core_1.StackItem, { key: category, isFilled: true },
                React.createElement(react_core_1.Title, { id: category + "-categ-title", headingLevel: react_core_1.TitleLevel.h2, size: '2xl' },
                    React.createElement("strong", null,
                        React.createElement(Msg_1.Msg, { msgKey: category }))),
                React.createElement(react_core_1.DataList, { "aria-label": 'foo' }, _this.renderTypes(_this.state.credentialContainers.get(category))))); })));
    };
    SigningInPage.prototype.renderTypes = function (credTypeMap) {
        var _this = this;
        return (React.createElement(React.Fragment, null,
            " ",
            Array.from(credTypeMap.keys()).map(function (credType, index, typeArray) { return ([
                _this.renderCredTypeTitle(credTypeMap.get(credType)),
                _this.renderUserCredentials(credTypeMap, credType),
                _this.renderEmptyRow(credTypeMap.get(credType).type, index === typeArray.length - 1)
            ]); })));
    };
    SigningInPage.prototype.renderEmptyRow = function (type, isLast) {
        if (isLast)
            return; // don't put empty row at the end
        return (React.createElement(react_core_1.DataListItem, { "aria-labelledby": 'empty-list-item-' + type },
            React.createElement(react_core_1.DataListItemRow, { key: 'empty-row-' + type },
                React.createElement(react_core_1.DataListItemCells, { dataListCells: [React.createElement(react_core_1.DataListCell, null)] }))));
    };
    SigningInPage.prototype.renderUserCredentials = function (credTypeMap, credType) {
        var _this = this;
        var credContainer = credTypeMap.get(credType);
        var userCredentials = credContainer.userCredentials;
        var removeable = credContainer.removeable;
        var type = credContainer.type;
        var displayName = credContainer.displayName;
        if (!userCredentials || userCredentials.length === 0) {
            var localizedDisplayName = Msg_1.Msg.localize(displayName);
            return (React.createElement(react_core_1.DataListItem, { key: 'no-credentials-list-item', "aria-labelledby": 'no-credentials-list-item' },
                React.createElement(react_core_1.DataListItemRow, { key: 'no-credentials-list-item-row' },
                    React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                            React.createElement(react_core_1.DataListCell, { key: 'no-credentials-cell-0' }),
                            React.createElement("strong", { id: type + "-not-set-up", key: 'no-credentials-cell-1' },
                                React.createElement(Msg_1.Msg, { msgKey: 'notSetUp', params: [localizedDisplayName] })),
                            React.createElement(react_core_1.DataListCell, { key: 'no-credentials-cell-2' })
                        ] }))));
        }
        userCredentials.forEach(function (credential) {
            if (!credential.userLabel)
                credential.userLabel = Msg_1.Msg.localize(credential.type);
            if (credential.hasOwnProperty('createdDate') && credential.createdDate > 0)
                credential.strCreatedDate = moment(credential.createdDate).format('LLL');
        });
        var updateAIA;
        if (credContainer.updateAction) {
            updateAIA = new AIACommand_1.AIACommand(credContainer.updateAction, this.props.location.pathname);
        }
        return (React.createElement(React.Fragment, { key: 'userCredentials' },
            " ",
            userCredentials.map(function (credential) { return (React.createElement(react_core_1.DataListItem, { id: "" + SigningInPage.credElementId(type, credential.id, 'row'), key: 'credential-list-item-' + credential.id, "aria-labelledby": 'credential-list-item-' + credential.userLabel },
                React.createElement(react_core_1.DataListItemRow, { key: 'userCredentialRow-' + credential.id },
                    React.createElement(react_core_1.DataListItemCells, { dataListCells: _this.credentialRowCells(credential, type) }),
                    React.createElement(CredentialAction, { credential: credential, removeable: removeable, updateAction: updateAIA, credRemover: _this.handleRemove })))); })));
    };
    SigningInPage.prototype.credentialRowCells = function (credential, type) {
        var credRowCells = [];
        credRowCells.push(React.createElement(react_core_1.DataListCell, { id: "" + SigningInPage.credElementId(type, credential.id, 'label'), key: 'userLabel-' + credential.id }, credential.userLabel));
        if (credential.strCreatedDate) {
            credRowCells.push(React.createElement(react_core_1.DataListCell, { id: "" + SigningInPage.credElementId(type, credential.id, 'created-at'), key: 'created-' + credential.id },
                React.createElement("strong", null,
                    React.createElement(Msg_1.Msg, { msgKey: 'credentialCreatedAt' }),
                    ": "),
                credential.strCreatedDate));
            credRowCells.push(React.createElement(react_core_1.DataListCell, { key: 'spacer-' + credential.id }));
        }
        return credRowCells;
    };
    SigningInPage.prototype.renderCredTypeTitle = function (credContainer) {
        if (!credContainer.hasOwnProperty('helptext') && !credContainer.hasOwnProperty('createAction'))
            return;
        var setupAction;
        if (credContainer.createAction) {
            setupAction = new AIACommand_1.AIACommand(credContainer.createAction, this.props.location.pathname);
        }
        var credContainerDisplayName = Msg_1.Msg.localize(credContainer.displayName);
        return (React.createElement(React.Fragment, { key: 'credTypeTitle-' + credContainer.type },
            React.createElement(react_core_1.DataListItem, { "aria-labelledby": 'type-datalistitem-' + credContainer.type },
                React.createElement(react_core_1.DataListItemRow, { key: 'credTitleRow-' + credContainer.type },
                    React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                            React.createElement(react_core_1.DataListCell, { width: 5, key: 'credTypeTitle-' + credContainer.type },
                                React.createElement(react_core_1.Title, { headingLevel: react_core_1.TitleLevel.h3, size: '2xl' },
                                    React.createElement("strong", { id: credContainer.type + "-cred-title" },
                                        React.createElement(Msg_1.Msg, { msgKey: credContainer.displayName }))),
                                React.createElement("span", { id: credContainer.type + "-cred-help" },
                                    React.createElement(Msg_1.Msg, { msgKey: credContainer.helptext }))),
                        ] }),
                    credContainer.createAction &&
                        React.createElement(react_core_1.DataListAction, { "aria-labelledby": 'foo', "aria-label": 'foo action', id: 'setUpAction-' + credContainer.type },
                            React.createElement("button", { id: credContainer.type + "-set-up", className: "pf-c-button pf-m-link", type: "button", onClick: function () { return setupAction.execute(); } },
                                React.createElement("span", { className: "pf-c-button__icon" },
                                    React.createElement("i", { className: "fas fa-plus-circle", "aria-hidden": "true" })),
                                React.createElement(Msg_1.Msg, { msgKey: 'setUpNew', params: [credContainerDisplayName] })))))));
    };
    return SigningInPage;
}(React.Component));
;
;
var CredentialAction = /** @class */ (function (_super) {
    __extends(CredentialAction, _super);
    function CredentialAction() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CredentialAction.prototype.render = function () {
        var _this = this;
        if (this.props.updateAction) {
            return (React.createElement(react_core_1.DataListAction, { "aria-labelledby": 'foo', "aria-label": 'foo action', id: 'updateAction-' + this.props.credential.id },
                React.createElement(react_core_1.Button, { id: "" + SigningInPage.credElementId(this.props.credential.type, this.props.credential.id, 'update'), variant: 'primary', onClick: function () { return _this.props.updateAction.execute(); } },
                    React.createElement(Msg_1.Msg, { msgKey: 'update' }))));
        }
        if (this.props.removeable) {
            var userLabel_1 = this.props.credential.userLabel;
            return (React.createElement(react_core_1.DataListAction, { "aria-labelledby": 'foo', "aria-label": 'foo action', id: 'removeAction-' + this.props.credential.id },
                React.createElement(ContinueCancelModal_1.ContinueCancelModal, { buttonTitle: 'remove', buttonId: "" + SigningInPage.credElementId(this.props.credential.type, this.props.credential.id, 'remove'), modalTitle: Msg_1.Msg.localize('removeCred', [userLabel_1]), modalMessage: Msg_1.Msg.localize('stopUsingCred', [userLabel_1]), onContinue: function () { return _this.props.credRemover(_this.props.credential.id, userLabel_1); } })));
        }
        return (React.createElement(React.Fragment, null));
    };
    return CredentialAction;
}(React.Component));
var SigningInPageWithRouter = react_router_dom_1.withRouter(SigningInPage);
exports.SigningInPage = SigningInPageWithRouter;
//# sourceMappingURL=SigningInPage.js.map