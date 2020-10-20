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
var react_router_dom_1 = require("react-router-dom");
var react_core_1 = require("@patternfly/react-core");
var react_icons_1 = require("@patternfly/react-icons");
var account_service_1 = require("../../account-service/account.service");
var Msg_1 = require("../../widgets/Msg");
var ContentPage_1 = require("../ContentPage");
var RedirectUri_1 = require("../../util/RedirectUri");
/**
 * @author Stan Silvert
 */
var LinkedAccountsPage = /** @class */ (function (_super) {
    __extends(LinkedAccountsPage, _super);
    function LinkedAccountsPage(props) {
        var _this = _super.call(this, props) || this;
        _this.state = {
            linkedAccounts: [],
            unLinkedAccounts: []
        };
        _this.getLinkedAccounts();
        return _this;
    }
    LinkedAccountsPage.prototype.getLinkedAccounts = function () {
        var _this = this;
        account_service_1.AccountServiceClient.Instance.doGet("/linked-accounts")
            .then(function (response) {
            console.log({ response: response });
            var linkedAccounts = response.data.filter(function (account) { return account.connected; });
            var unLinkedAccounts = response.data.filter(function (account) { return !account.connected; });
            _this.setState({ linkedAccounts: linkedAccounts, unLinkedAccounts: unLinkedAccounts });
        });
    };
    LinkedAccountsPage.prototype.unLinkAccount = function (account) {
        var _this = this;
        var url = '/linked-accounts/' + account.providerName;
        account_service_1.AccountServiceClient.Instance.doDelete(url)
            .then(function (response) {
            console.log({ response: response });
            _this.getLinkedAccounts();
        });
    };
    LinkedAccountsPage.prototype.linkAccount = function (account) {
        var url = '/linked-accounts/' + account.providerName;
        var redirectUri = RedirectUri_1.createRedirect(this.props.location.pathname);
        account_service_1.AccountServiceClient.Instance.doGet(url, { params: { providerId: account.providerName, redirectUri: redirectUri } })
            .then(function (response) {
            console.log({ response: response });
            window.location.href = response.data.accountLinkUri;
        });
    };
    LinkedAccountsPage.prototype.render = function () {
        return (React.createElement(ContentPage_1.ContentPage, { title: Msg_1.Msg.localize('linkedAccountsTitle'), introMessage: Msg_1.Msg.localize('linkedAccountsIntroMessage') },
            React.createElement(react_core_1.Stack, { gutter: 'md' },
                React.createElement(react_core_1.StackItem, { isFilled: true },
                    React.createElement(react_core_1.Title, { headingLevel: react_core_1.TitleLevel.h2, size: '2xl' },
                        React.createElement(Msg_1.Msg, { msgKey: 'linkedLoginProviders' })),
                    React.createElement(react_core_1.DataList, { id: "linked-idps", "aria-label": 'foo' }, this.makeRows(this.state.linkedAccounts, true))),
                React.createElement(react_core_1.StackItem, { isFilled: true }),
                React.createElement(react_core_1.StackItem, { isFilled: true },
                    React.createElement(react_core_1.Title, { headingLevel: react_core_1.TitleLevel.h2, size: '2xl' },
                        React.createElement(Msg_1.Msg, { msgKey: 'unlinkedLoginProviders' })),
                    React.createElement(react_core_1.DataList, { id: "unlinked-idps", "aria-label": 'foo' }, this.makeRows(this.state.unLinkedAccounts, false))))));
    };
    LinkedAccountsPage.prototype.emptyRow = function (isLinked) {
        var isEmptyMessage = '';
        if (isLinked) {
            isEmptyMessage = Msg_1.Msg.localize('linkedEmpty');
        }
        else {
            isEmptyMessage = Msg_1.Msg.localize('unlinkedEmpty');
        }
        return (React.createElement(react_core_1.DataListItem, { key: 'emptyItem', "aria-labelledby": "empty-item" },
            React.createElement(react_core_1.DataListItemRow, { key: 'emptyRow' },
                React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                        React.createElement(react_core_1.DataListCell, { key: 'empty' },
                            React.createElement("strong", null, isEmptyMessage))
                    ] }))));
    };
    LinkedAccountsPage.prototype.makeRows = function (accounts, isLinked) {
        var _this = this;
        if (accounts.length === 0) {
            return this.emptyRow(isLinked);
        }
        return (React.createElement(React.Fragment, null,
            " ",
            accounts.map(function (account) { return (React.createElement(react_core_1.DataListItem, { id: account.providerAlias + "-idp", key: account.providerName, "aria-labelledby": "simple-item1" },
                React.createElement(react_core_1.DataListItemRow, { key: account.providerName },
                    React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                            React.createElement(react_core_1.DataListCell, { key: 'idp' },
                                React.createElement(react_core_1.Stack, null,
                                    React.createElement(react_core_1.StackItem, { isFilled: true }, _this.findIcon(account)),
                                    React.createElement(react_core_1.StackItem, { id: account.providerAlias + "-idp-name", isFilled: true },
                                        React.createElement("h2", null,
                                            React.createElement("strong", null, account.displayName))))),
                            React.createElement(react_core_1.DataListCell, { key: 'badge' },
                                React.createElement(react_core_1.Stack, null,
                                    React.createElement(react_core_1.StackItem, { isFilled: true }),
                                    React.createElement(react_core_1.StackItem, { id: account.providerAlias + "-idp-badge", isFilled: true }, _this.badge(account)))),
                            React.createElement(react_core_1.DataListCell, { key: 'username' },
                                React.createElement(react_core_1.Stack, null,
                                    React.createElement(react_core_1.StackItem, { isFilled: true }),
                                    React.createElement(react_core_1.StackItem, { id: account.providerAlias + "-idp-username", isFilled: true }, account.linkedUsername))),
                        ] }),
                    React.createElement(react_core_1.DataListAction, { "aria-labelledby": 'foo', "aria-label": 'foo action', id: 'setPasswordAction' },
                        isLinked && React.createElement(react_core_1.Button, { id: account.providerAlias + "-idp-unlink", variant: 'link', onClick: function () { return _this.unLinkAccount(account); } },
                            React.createElement(react_icons_1.UnlinkIcon, { size: 'sm' }),
                            " ",
                            React.createElement(Msg_1.Msg, { msgKey: 'unLink' })),
                        !isLinked && React.createElement(react_core_1.Button, { id: account.providerAlias + "-idp-link", variant: 'link', onClick: function () { return _this.linkAccount(account); } },
                            React.createElement(react_icons_1.LinkIcon, { size: 'sm' }),
                            " ",
                            React.createElement(Msg_1.Msg, { msgKey: 'link' })))))); }),
            " "));
    };
    LinkedAccountsPage.prototype.badge = function (account) {
        if (account.social) {
            return (React.createElement(react_core_1.Badge, null,
                React.createElement(Msg_1.Msg, { msgKey: 'socialLogin' })));
        }
        return (React.createElement(react_core_1.Badge, { style: { backgroundColor: "green" } },
            React.createElement(Msg_1.Msg, { msgKey: 'systemDefined' })));
    };
    LinkedAccountsPage.prototype.findIcon = function (account) {
        var socialIconId = account.providerAlias + "-idp-icon-social";
        if (account.providerName.toLowerCase().includes('github'))
            return (React.createElement(react_icons_1.GithubIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('linkedin'))
            return (React.createElement(react_icons_1.LinkedinIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('facebook'))
            return (React.createElement(react_icons_1.FacebookIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('google'))
            return (React.createElement(react_icons_1.GoogleIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('instagram'))
            return (React.createElement(react_icons_1.InstagramIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('microsoft'))
            return (React.createElement(react_icons_1.MicrosoftIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('bitbucket'))
            return (React.createElement(react_icons_1.BitbucketIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('twitter'))
            return (React.createElement(react_icons_1.TwitterIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('openshift'))
            return (React.createElement(react_icons_1.OpenshiftIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('gitlab'))
            return (React.createElement(react_icons_1.GitlabIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('paypal'))
            return (React.createElement(react_icons_1.PaypalIcon, { id: socialIconId, size: 'xl' }));
        if (account.providerName.toLowerCase().includes('stackoverflow'))
            return (React.createElement(react_icons_1.StackOverflowIcon, { id: socialIconId, size: 'xl' }));
        return (React.createElement(react_icons_1.CubeIcon, { id: account.providerAlias + "-idp-icon-default", size: 'xl' }));
    };
    return LinkedAccountsPage;
}(React.Component));
;
var LinkedAccountsPagewithRouter = react_router_dom_1.withRouter(LinkedAccountsPage);
exports.LinkedAccountsPage = LinkedAccountsPagewithRouter;
//# sourceMappingURL=LinkedAccountsPage.js.map