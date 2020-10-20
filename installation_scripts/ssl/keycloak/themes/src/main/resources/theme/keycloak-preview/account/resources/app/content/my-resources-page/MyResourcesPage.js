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
var parse = require("parse-link-header");
var react_core_1 = require("@patternfly/react-core");
var account_service_1 = require("../../account-service/account.service");
var ResourcesTable_1 = require("./ResourcesTable");
var ContentPage_1 = require("../ContentPage");
var Msg_1 = require("../../widgets/Msg");
var Scope = /** @class */ (function () {
    function Scope(name, displayName) {
        this.name = name;
        this.displayName = displayName;
    }
    Scope.prototype.toString = function () {
        if (this.hasOwnProperty('displayName') && (this.displayName)) {
            return this.displayName;
        }
        else {
            return this.name;
        }
    };
    return Scope;
}());
exports.Scope = Scope;
var MY_RESOURCES_TAB = 0;
var SHARED_WITH_ME_TAB = 1;
var MyResourcesPage = /** @class */ (function (_super) {
    __extends(MyResourcesPage, _super);
    function MyResourcesPage(props) {
        var _this = _super.call(this, props) || this;
        _this.first = 0;
        _this.max = 5;
        _this.makeScopeObj = function (scope) {
            return new Scope(scope.name, scope.displayName);
        };
        _this.fetchPermissionRequests = function () {
            console.log('fetch permission requests');
            _this.state.myResources.data.forEach(function (resource) {
                _this.fetchShareRequests(resource);
            });
        };
        _this.handleFilterRequest = function (value) {
            _this.setState({ nameFilter: value });
            _this.fetchFilteredResources({ name: value });
        };
        _this.handleFirstPageClick = function () {
            _this.fetchInitialResources();
        };
        _this.handleNextClick = function () {
            if (_this.isSharedWithMeTab()) {
                _this.fetchResources(_this.state.sharedWithMe.nextUrl);
            }
            else {
                _this.fetchResources(_this.state.myResources.nextUrl);
            }
        };
        _this.handlePreviousClick = function () {
            if (_this.isSharedWithMeTab()) {
                _this.fetchResources(_this.state.sharedWithMe.prevUrl);
            }
            else {
                _this.fetchResources(_this.state.myResources.prevUrl);
            }
        };
        _this.handleTabClick = function (event, tabIndex) {
            if (_this.state.activeTabKey === tabIndex)
                return;
            _this.setState({
                nameFilter: '',
                activeTabKey: tabIndex
            }, function () { _this.fetchInitialResources(); });
        };
        _this.state = {
            activeTabKey: MY_RESOURCES_TAB,
            nameFilter: '',
            isModalOpen: false,
            myResources: { nextUrl: '', prevUrl: '', data: [] },
            sharedWithMe: { nextUrl: '', prevUrl: '', data: [] }
        };
        _this.fetchInitialResources();
        return _this;
    }
    MyResourcesPage.prototype.isSharedWithMeTab = function () {
        return this.state.activeTabKey === SHARED_WITH_ME_TAB;
    };
    MyResourcesPage.prototype.hasNext = function () {
        if (this.isSharedWithMeTab()) {
            return (this.state.sharedWithMe.nextUrl !== null) && (this.state.sharedWithMe.nextUrl !== '');
        }
        else {
            return (this.state.myResources.nextUrl !== null) && (this.state.myResources.nextUrl !== '');
        }
    };
    MyResourcesPage.prototype.hasPrevious = function () {
        console.log('prev url=' + this.state.myResources.prevUrl);
        if (this.isSharedWithMeTab()) {
            return (this.state.sharedWithMe.prevUrl !== null) && (this.state.sharedWithMe.prevUrl !== '');
        }
        else {
            return (this.state.myResources.prevUrl !== null) && (this.state.myResources.prevUrl !== '');
        }
    };
    MyResourcesPage.prototype.fetchInitialResources = function () {
        if (this.isSharedWithMeTab()) {
            this.fetchResources("/resources/shared-with-me");
        }
        else {
            this.fetchResources("/resources", { first: this.first, max: this.max });
        }
    };
    MyResourcesPage.prototype.fetchFilteredResources = function (params) {
        if (this.isSharedWithMeTab()) {
            this.fetchResources("/resources/shared-with-me", params);
        }
        else {
            this.fetchResources("/resources", __assign({}, params, { first: this.first, max: this.max }));
        }
    };
    MyResourcesPage.prototype.fetchResources = function (url, extraParams) {
        var _this = this;
        account_service_1.AccountServiceClient.Instance.doGet(url, { params: extraParams })
            .then(function (response) {
            var resources = response.data;
            resources.forEach(function (resource) { return resource.shareRequests = []; });
            // serialize the Scope objects from JSON so that toString() will work.
            resources.forEach(function (resource) { return resource.scopes = resource.scopes.map(_this.makeScopeObj); });
            if (_this.isSharedWithMeTab()) {
                console.log('Shared With Me Resources: ');
                _this.setState({ sharedWithMe: _this.parseResourceResponse(response) });
            }
            else {
                console.log('MyResources: ');
                _this.setState({ myResources: _this.parseResourceResponse(response) }, _this.fetchPermissionRequests);
            }
            console.log({ response: response });
        });
    };
    MyResourcesPage.prototype.fetchShareRequests = function (resource) {
        var _this = this;
        account_service_1.AccountServiceClient.Instance.doGet('/resources/' + resource._id + '/permissions/requests')
            .then(function (response) {
            //console.log('Share requests for ' + resource.name);
            //console.log({response});
            resource.shareRequests = response.data;
            if (resource.shareRequests.length > 0) {
                //console.log('forcing update');
                _this.forceUpdate();
            }
        });
    };
    MyResourcesPage.prototype.parseResourceResponse = function (response) {
        var links = response.headers.link;
        var parsed = parse(links);
        var next = '';
        var prev = '';
        if (parsed !== null) {
            if (parsed.hasOwnProperty('next'))
                next = parsed.next.url;
            if (parsed.hasOwnProperty('prev'))
                prev = parsed.prev.url;
        }
        var resources = response.data;
        return { nextUrl: next, prevUrl: prev, data: resources };
    };
    MyResourcesPage.prototype.makeTab = function (eventKey, title, resources, noResourcesMessage) {
        return (React.createElement(react_core_1.Tab, { eventKey: eventKey, title: Msg_1.Msg.localize(title) },
            React.createElement(react_core_1.Stack, { gutter: "md" },
                React.createElement(react_core_1.StackItem, { isFilled: true },
                    React.createElement("span", null)),
                React.createElement(react_core_1.StackItem, { isFilled: true },
                    React.createElement(react_core_1.Level, { gutter: 'md' },
                        React.createElement(react_core_1.LevelItem, null,
                            React.createElement(react_core_1.TextInput, { value: this.state.nameFilter, onChange: this.handleFilterRequest, id: 'filter-' + title, type: "text", placeholder: Msg_1.Msg.localize('filterByName') })))),
                React.createElement(react_core_1.StackItem, { isFilled: true },
                    React.createElement(ResourcesTable_1.ResourcesTable, { resources: resources, noResourcesMessage: noResourcesMessage })))));
    };
    MyResourcesPage.prototype.render = function () {
        return (React.createElement(ContentPage_1.ContentPage, { title: "resources", onRefresh: this.fetchInitialResources.bind(this) },
            React.createElement(react_core_1.Tabs, { isFilled: true, activeKey: this.state.activeTabKey, onSelect: this.handleTabClick },
                this.makeTab(0, 'myResources', this.state.myResources, 'notHaveAnyResource'),
                this.makeTab(1, 'sharedwithMe', this.state.sharedWithMe, 'noResourcesSharedWithYou')),
            React.createElement(react_core_1.Level, { gutter: 'md' },
                React.createElement(react_core_1.LevelItem, null, this.hasPrevious() && React.createElement(react_core_1.Button, { onClick: this.handlePreviousClick },
                    "<",
                    React.createElement(Msg_1.Msg, { msgKey: 'previousPage' }))),
                React.createElement(react_core_1.LevelItem, null, this.hasPrevious() && React.createElement(react_core_1.Button, { onClick: this.handleFirstPageClick },
                    React.createElement(Msg_1.Msg, { msgKey: 'firstPage' }))),
                React.createElement(react_core_1.LevelItem, null, this.hasNext() && React.createElement(react_core_1.Button, { onClick: this.handleNextClick },
                    React.createElement(Msg_1.Msg, { msgKey: 'nextPage' }),
                    ">")))));
    };
    MyResourcesPage.prototype.clearNextPrev = function () {
        var newMyResources = this.state.myResources;
        newMyResources.nextUrl = '';
        newMyResources.prevUrl = '';
        this.setState({ myResources: newMyResources });
    };
    return MyResourcesPage;
}(React.Component));
exports.MyResourcesPage = MyResourcesPage;
;
//# sourceMappingURL=MyResourcesPage.js.map