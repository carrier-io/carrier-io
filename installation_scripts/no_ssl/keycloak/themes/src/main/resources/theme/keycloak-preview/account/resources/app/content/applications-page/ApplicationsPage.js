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
var react_core_1 = require("@patternfly/react-core");
var react_icons_1 = require("@patternfly/react-icons");
var ContentPage_1 = require("../ContentPage");
var ContinueCancelModal_1 = require("../../widgets/ContinueCancelModal");
var account_service_1 = require("../../account-service/account.service");
var Msg_1 = require("../../widgets/Msg");
var ApplicationsPage = /** @class */ (function (_super) {
    __extends(ApplicationsPage, _super);
    function ApplicationsPage(props) {
        var _this = _super.call(this, props) || this;
        _this.removeConsent = function (clientId) {
            account_service_1.AccountServiceClient.Instance.doDelete("/applications/" + clientId + "/consent")
                .then(function () {
                _this.fetchApplications();
            });
        };
        _this.onToggle = function (row) {
            var newIsRowOpen = _this.state.isRowOpen;
            newIsRowOpen[row] = !newIsRowOpen[row];
            _this.setState({ isRowOpen: newIsRowOpen });
        };
        _this.state = {
            isRowOpen: [],
            applications: []
        };
        _this.fetchApplications();
        return _this;
    }
    ApplicationsPage.prototype.fetchApplications = function () {
        var _this = this;
        account_service_1.AccountServiceClient.Instance.doGet("/applications")
            .then(function (response) {
            var applications = response.data;
            _this.setState({
                isRowOpen: new Array(applications.length).fill(false),
                applications: applications
            });
        });
    };
    ApplicationsPage.prototype.elementId = function (item, application) {
        return "application-" + item + "-" + application.clientId;
    };
    ApplicationsPage.prototype.render = function () {
        var _this = this;
        return (React.createElement(ContentPage_1.ContentPage, { title: Msg_1.Msg.localize('applicationsPageTitle') },
            React.createElement(react_core_1.DataList, { id: "applications-list", "aria-label": Msg_1.Msg.localize('applicationsPageTitle') }, this.state.applications.map(function (application, appIndex) {
                var appUrl = application.userConsentRequired ? application.baseUrl : '/auth' + application.baseUrl;
                return (React.createElement(react_core_1.DataListItem, { id: _this.elementId("client-id", application), key: 'application-' + appIndex, "aria-labelledby": "applications-list", isExpanded: _this.state.isRowOpen[appIndex] },
                    React.createElement(react_core_1.DataListItemRow, null,
                        React.createElement(react_core_1.DataListToggle, { onClick: function () { return _this.onToggle(appIndex); }, isExpanded: _this.state.isRowOpen[appIndex], id: _this.elementId('toggle', application), "aria-controls": _this.elementId("expandable", application) }),
                        React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                                React.createElement(react_core_1.DataListCell, { id: _this.elementId('name', application), width: 2, key: 'app-' + appIndex },
                                    React.createElement(react_icons_1.BuilderImageIcon, { size: 'sm' }),
                                    " ",
                                    application.clientName ? application.clientName : application.clientId),
                                React.createElement(react_core_1.DataListCell, { id: _this.elementId('internal', application), width: 2, key: 'internal-' + appIndex },
                                    application.userConsentRequired ? Msg_1.Msg.localize('thirdPartyApp') : Msg_1.Msg.localize('internalApp'),
                                    application.offlineAccess ? ', ' + Msg_1.Msg.localize('offlineAccess') : ''),
                                React.createElement(react_core_1.DataListCell, { id: _this.elementId('status', application), width: 2, key: 'status-' + appIndex }, application.inUse ? Msg_1.Msg.localize('inUse') : Msg_1.Msg.localize('notInUse')),
                                React.createElement(react_core_1.DataListCell, { id: _this.elementId('baseurl', application), width: 4, key: 'baseUrl-' + appIndex },
                                    React.createElement("button", { className: "pf-c-button pf-m-link", type: "button", onClick: function () { return window.open(appUrl); } },
                                        React.createElement("span", { className: "pf-c-button__icon" },
                                            React.createElement("i", { className: "fas fa-link", "aria-hidden": "true" })),
                                        application.baseUrl)),
                            ] })),
                    React.createElement(react_core_1.DataListContent, { noPadding: false, "aria-label": Msg_1.Msg.localize('applicationDetails'), id: _this.elementId("expandable", application), isHidden: !_this.state.isRowOpen[appIndex] },
                        React.createElement(react_core_1.Grid, { sm: 12, md: 12, lg: 12 },
                            React.createElement("div", { className: 'pf-c-content' },
                                React.createElement(react_core_1.GridItem, null,
                                    React.createElement("strong", null, Msg_1.Msg.localize('client') + ': '),
                                    " ",
                                    application.clientId),
                                application.description &&
                                    React.createElement(react_core_1.GridItem, null,
                                        React.createElement("strong", null, Msg_1.Msg.localize('description') + ': '),
                                        " ",
                                        application.description),
                                React.createElement(react_core_1.GridItem, null,
                                    React.createElement("strong", null, Msg_1.Msg.localize('baseUrl') + ': '),
                                    " ",
                                    application.baseUrl),
                                application.consent &&
                                    React.createElement(React.Fragment, null,
                                        React.createElement(react_core_1.GridItem, { span: 12 },
                                            React.createElement("strong", null, "Has access to:")),
                                        application.consent.grantedScopes.map(function (scope, scopeIndex) {
                                            return (React.createElement(React.Fragment, { key: 'scope-' + scopeIndex },
                                                React.createElement(react_core_1.GridItem, { offset: 1 },
                                                    React.createElement(react_icons_1.CheckIcon, null),
                                                    " ",
                                                    scope.name)));
                                        }),
                                        React.createElement(react_core_1.GridItem, null,
                                            React.createElement("strong", null, Msg_1.Msg.localize('accessGrantedOn') + ': '),
                                            new Intl.DateTimeFormat(locale, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                second: 'numeric'
                                            }).format(application.consent.createDate))))),
                        React.createElement(react_core_1.Grid, { gutter: 'sm' },
                            React.createElement("hr", null),
                            application.consent &&
                                React.createElement(react_core_1.GridItem, null,
                                    React.createElement(React.Fragment, null,
                                        React.createElement(ContinueCancelModal_1.ContinueCancelModal, { buttonTitle: Msg_1.Msg.localize('removeButton'), buttonVariant: 'secondary' // defaults to 'primary'
                                            , modalTitle: Msg_1.Msg.localize('removeModalTitle'), modalMessage: Msg_1.Msg.localize('removeModalMessage', [application.clientId]), modalContinueButtonLabel: Msg_1.Msg.localize('confirmButton'), onContinue: function () { return _this.removeConsent(application.clientId); } }))),
                            React.createElement(react_core_1.GridItem, null,
                                React.createElement(react_icons_1.InfoAltIcon, null),
                                " ",
                                Msg_1.Msg.localize('infoMessage'))))));
            }))));
    };
    return ApplicationsPage;
}(React.Component));
exports.ApplicationsPage = ApplicationsPage;
;
//# sourceMappingURL=ApplicationsPage.js.map