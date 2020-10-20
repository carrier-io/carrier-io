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
var account_service_1 = require("../../account-service/account.service");
var react_core_1 = require("@patternfly/react-core");
var react_icons_1 = require("@patternfly/react-icons");
var Msg_1 = require("../../widgets/Msg");
var ContinueCancelModal_1 = require("../../widgets/ContinueCancelModal");
var keycloak_service_1 = require("../../keycloak-service/keycloak.service");
var ContentPage_1 = require("../ContentPage");
var ContentAlert_1 = require("../ContentAlert");
/**
 * @author Stan Silvert ssilvert@redhat.com (C) 2019 Red Hat Inc.
 */
var DeviceActivityPage = /** @class */ (function (_super) {
    __extends(DeviceActivityPage, _super);
    function DeviceActivityPage(props) {
        var _this = _super.call(this, props) || this;
        _this.signOutAll = function () {
            account_service_1.AccountServiceClient.Instance.doDelete("/sessions")
                .then(function () {
                keycloak_service_1.KeycloakService.Instance.logout(baseUrl);
            });
        };
        _this.signOutSession = function (device, session) {
            account_service_1.AccountServiceClient.Instance.doDelete("/sessions/" + session.id)
                .then(function () {
                _this.fetchDevices();
                ContentAlert_1.ContentAlert.success(Msg_1.Msg.localize('signedOutSession', [session.browser, device.os]));
            });
        };
        _this.state = {
            devices: []
        };
        _this.fetchDevices();
        return _this;
    }
    DeviceActivityPage.prototype.fetchDevices = function () {
        var _this = this;
        account_service_1.AccountServiceClient.Instance.doGet("/sessions/devices")
            .then(function (response) {
            console.log({ response: response });
            var devices = _this.moveCurrentToTop(response.data);
            _this.setState({
                devices: devices
            });
        });
    };
    // current device and session should display at the top of their respective lists
    DeviceActivityPage.prototype.moveCurrentToTop = function (devices) {
        var currentDevice = devices[0];
        devices.forEach(function (device, index) {
            if (device.current) {
                currentDevice = device;
                devices.splice(index, 1);
                devices.unshift(device);
            }
        });
        currentDevice.sessions.forEach(function (session, index) {
            if (session.current) {
                var currentSession = currentDevice.sessions.splice(index, 1);
                currentDevice.sessions.unshift(currentSession[0]);
            }
        });
        return devices;
    };
    DeviceActivityPage.prototype.time = function (time) {
        return moment(time * 1000).format('LLLL');
    };
    DeviceActivityPage.prototype.elementId = function (item, session) {
        return "session-" + session.id.substring(0, 7) + "-" + item;
    };
    DeviceActivityPage.prototype.findBrowserIcon = function (session) {
        var browserName = session.browser.toLowerCase();
        if (browserName.includes("chrom"))
            return (React.createElement(react_icons_1.ChromeIcon, { id: this.elementId('icon-chrome', session), size: 'lg' })); // chrome or chromium
        if (browserName.includes("firefox"))
            return (React.createElement(react_icons_1.FirefoxIcon, { id: this.elementId('icon-firefox', session), size: 'lg' }));
        if (browserName.includes("edge"))
            return (React.createElement(react_icons_1.EdgeIcon, { id: this.elementId('icon-edge', session), size: 'lg' }));
        if (browserName.startsWith("ie/"))
            return (React.createElement(react_icons_1.InternetExplorerIcon, { id: this.elementId('icon-ie', session), size: 'lg' }));
        if (browserName.includes("safari"))
            return (React.createElement(react_icons_1.SafariIcon, { id: this.elementId('icon-safari', session), size: 'lg' }));
        if (browserName.includes("opera"))
            return (React.createElement(react_icons_1.OperaIcon, { id: this.elementId('icon-opera', session), size: 'lg' }));
        if (browserName.includes("yandex"))
            return (React.createElement(react_icons_1.YandexInternationalIcon, { id: this.elementId('icon-yandex', session), size: 'lg' }));
        if (browserName.includes("amazon"))
            return (React.createElement(react_icons_1.AmazonIcon, { id: this.elementId('icon-amazon', session), size: 'lg' }));
        return (React.createElement(react_icons_1.GlobeIcon, { id: this.elementId('icon-default', session), size: 'lg' }));
    };
    DeviceActivityPage.prototype.findOS = function (device) {
        if (device.os.toLowerCase().includes('unknown'))
            return Msg_1.Msg.localize('unknownOperatingSystem');
        return device.os;
    };
    DeviceActivityPage.prototype.findOSVersion = function (device) {
        if (device.osVersion.toLowerCase().includes('unknown'))
            return '';
        return device.osVersion;
    };
    DeviceActivityPage.prototype.makeClientsString = function (clients) {
        var clientsString = "";
        clients.forEach(function (client, index) {
            var clientName;
            if (client.hasOwnProperty('clientName') && (client.clientName !== undefined) && (client.clientName !== '')) {
                clientName = Msg_1.Msg.localize(client.clientName);
            }
            else {
                clientName = client.clientId;
            }
            clientsString += clientName;
            if (clients.length > index + 1)
                clientsString += ', ';
        });
        return clientsString;
    };
    DeviceActivityPage.prototype.isShowSignOutAll = function (devices) {
        if (devices.length === 0)
            return false;
        if (devices.length > 1)
            return true;
        if (devices[0].sessions.length > 1)
            return true;
        return false;
    };
    DeviceActivityPage.prototype.render = function () {
        var _this = this;
        return (React.createElement(ContentPage_1.ContentPage, { title: "device-activity", onRefresh: this.fetchDevices.bind(this) },
            React.createElement(react_core_1.Stack, { gutter: "md" },
                React.createElement(react_core_1.StackItem, { isFilled: true },
                    React.createElement(react_core_1.DataList, { "aria-label": Msg_1.Msg.localize('signedInDevices') },
                        React.createElement(react_core_1.DataListItem, { key: "SignedInDevicesHeader", "aria-labelledby": "signedInDevicesTitle", isExpanded: false },
                            React.createElement(react_core_1.DataListItemRow, null,
                                React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                                        React.createElement(react_core_1.DataListCell, { key: 'signedInDevicesTitle', width: 4 },
                                            React.createElement("div", { id: "signedInDevicesTitle", className: "pf-c-content" },
                                                React.createElement("h2", null,
                                                    React.createElement(Msg_1.Msg, { msgKey: "signedInDevices" })),
                                                React.createElement("p", null,
                                                    React.createElement(Msg_1.Msg, { msgKey: "signedInDevicesExplanation" })))),
                                        React.createElement(react_core_1.DataListCell, { key: 'signOutAllButton', width: 1 }, this.isShowSignOutAll(this.state.devices) &&
                                            React.createElement(ContinueCancelModal_1.ContinueCancelModal, { buttonTitle: 'signOutAllDevices', buttonId: 'sign-out-all', modalTitle: 'signOutAllDevices', modalMessage: 'signOutAllDevicesWarning', onContinue: this.signOutAll }))
                                    ] }))),
                        React.createElement(react_core_1.DataListItem, { "aria-labelledby": 'sessions' },
                            React.createElement(react_core_1.Grid, { gutter: 'sm' },
                                React.createElement(react_core_1.GridItem, { span: 12 }),
                                " ",
                                this.state.devices.map(function (device, deviceIndex) {
                                    return (React.createElement(React.Fragment, null, device.sessions.map(function (session, sessionIndex) {
                                        return (React.createElement(React.Fragment, { key: 'device-' + deviceIndex + '-session-' + sessionIndex },
                                            React.createElement(react_core_1.GridItem, { span: 3 },
                                                React.createElement(react_core_1.Stack, null,
                                                    React.createElement(react_core_1.StackItem, { isFilled: false },
                                                        React.createElement(react_core_1.Bullseye, null, _this.findBrowserIcon(session))),
                                                    !_this.state.devices[0].mobile &&
                                                        React.createElement(react_core_1.StackItem, { isFilled: false },
                                                            React.createElement(react_core_1.Bullseye, { id: _this.elementId('ip', session) }, session.ipAddress)),
                                                    session.current &&
                                                        React.createElement(react_core_1.StackItem, { isFilled: false },
                                                            React.createElement(react_core_1.Bullseye, { id: _this.elementId('current-badge', session) },
                                                                React.createElement("strong", { className: 'pf-c-badge pf-m-read' },
                                                                    React.createElement(Msg_1.Msg, { msgKey: "currentSession" })))))),
                                            React.createElement(react_core_1.GridItem, { span: 9 },
                                                !session.browser.toLowerCase().includes('unknown') &&
                                                    React.createElement("p", { id: _this.elementId('browser', session) },
                                                        React.createElement("strong", null,
                                                            session.browser,
                                                            " / ",
                                                            _this.findOS(device),
                                                            " ",
                                                            _this.findOSVersion(device))),
                                                _this.state.devices[0].mobile &&
                                                    React.createElement("p", { id: _this.elementId('ip', session) },
                                                        React.createElement("strong", null,
                                                            Msg_1.Msg.localize('ipAddress'),
                                                            " "),
                                                        " ",
                                                        session.ipAddress),
                                                React.createElement("p", { id: _this.elementId('last-access', session) },
                                                    React.createElement("strong", null, Msg_1.Msg.localize('lastAccessedOn')),
                                                    " ",
                                                    _this.time(session.lastAccess)),
                                                React.createElement("p", { id: _this.elementId('clients', session) },
                                                    React.createElement("strong", null, Msg_1.Msg.localize('clients')),
                                                    " ",
                                                    _this.makeClientsString(session.clients)),
                                                React.createElement("p", { id: _this.elementId('started', session) },
                                                    React.createElement("strong", null, Msg_1.Msg.localize('startedAt')),
                                                    " ",
                                                    _this.time(session.started)),
                                                React.createElement("p", { id: _this.elementId('expires', session) },
                                                    React.createElement("strong", null, Msg_1.Msg.localize('expiresAt')),
                                                    " ",
                                                    _this.time(session.expires)),
                                                !session.current &&
                                                    React.createElement(ContinueCancelModal_1.ContinueCancelModal, { buttonTitle: 'doSignOut', buttonId: _this.elementId('sign-out', session), modalTitle: 'doSignOut', buttonVariant: 'secondary', modalMessage: 'signOutWarning', onContinue: function () { return _this.signOutSession(device, session); } }))));
                                    })));
                                }),
                                React.createElement(react_core_1.GridItem, { span: 12 }),
                                " ")))))));
    };
    return DeviceActivityPage;
}(React.Component));
exports.DeviceActivityPage = DeviceActivityPage;
;
//# sourceMappingURL=DeviceActivityPage.js.map