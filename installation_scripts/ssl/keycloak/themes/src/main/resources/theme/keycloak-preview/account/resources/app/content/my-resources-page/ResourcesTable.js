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
var account_service_1 = require("../../account-service/account.service");
var ShareTheResource_1 = require("./ShareTheResource");
var Msg_1 = require("../../widgets/Msg");
var ResourcesTable = /** @class */ (function (_super) {
    __extends(ResourcesTable, _super);
    function ResourcesTable(props) {
        var _this = _super.call(this, props) || this;
        _this.onToggle = function (row) {
            var newIsRowOpen = _this.state.isRowOpen;
            newIsRowOpen[row] = !newIsRowOpen[row];
            if (newIsRowOpen[row])
                _this.fetchPermissions(_this.props.resources.data[row], row);
            _this.setState({ isRowOpen: newIsRowOpen });
        };
        _this.state = {
            isRowOpen: new Array(props.resources.data.length).fill(false),
            permissions: new Map()
        };
        return _this;
    }
    ResourcesTable.prototype.fetchPermissions = function (resource, row) {
        var _this = this;
        console.log('**** fetchPermissions');
        account_service_1.AccountServiceClient.Instance.doGet('resources/' + resource._id + '/permissions')
            .then(function (response) {
            console.log('Fetching Permissions row: ' + row);
            console.log({ response: response });
            var newPermissions = new Map(_this.state.permissions);
            newPermissions.set(row, response.data);
            _this.setState({ permissions: newPermissions });
        });
    };
    ResourcesTable.prototype.hasPermissions = function (row) {
        return (this.state.permissions.has(row)) && (this.state.permissions.get(row).length > 0);
    };
    ResourcesTable.prototype.firstUser = function (row) {
        if (!this.hasPermissions(row))
            return 'ERROR!!!!'; // should never happen
        return this.state.permissions.get(row)[0].username;
    };
    ResourcesTable.prototype.numOthers = function (row) {
        if (!this.hasPermissions(row))
            return -1; // should never happen
        return this.state.permissions.get(row).length - 1;
    };
    ResourcesTable.prototype.sharedWithUsersMessage = function (row) {
        if (!this.hasPermissions(row))
            return (React.createElement(React.Fragment, null,
                React.createElement(Msg_1.Msg, { msgKey: 'resourceNotShared' })));
        // TODO: Not using a parameterized message because I want to use <strong> tag.  Need to figure out a good solution to this.
        if (this.numOthers(row) > 0) {
            return (React.createElement(React.Fragment, null,
                React.createElement(Msg_1.Msg, { msgKey: 'resourceSharedWith' }),
                " ",
                React.createElement("strong", null, this.firstUser(row)),
                " ",
                React.createElement(Msg_1.Msg, { msgKey: 'and' }),
                " ",
                React.createElement("strong", null, this.numOthers(row)),
                " ",
                React.createElement(Msg_1.Msg, { msgKey: 'otherUsers' }),
                "."));
        }
        else {
            return (React.createElement(React.Fragment, null,
                React.createElement(Msg_1.Msg, { msgKey: 'resourceSharedWith' }),
                " ",
                React.createElement("strong", null, this.firstUser(row)),
                "."));
        }
    };
    ResourcesTable.prototype.render = function () {
        var _this = this;
        return (React.createElement(react_core_1.DataList, { "aria-label": Msg_1.Msg.localize('resources') },
            React.createElement(react_core_1.DataListItem, { key: 'resource-header', "aria-labelledby": 'resource-header' },
                React.createElement(react_core_1.DataListItemRow, null,
                    "// invisible toggle allows headings to line up properly",
                    React.createElement("span", { style: { visibility: 'hidden' } },
                        React.createElement(react_core_1.DataListToggle, { isExpanded: false, id: 'resource-header-invisible-toggle', "aria-controls": "ex-expand1" })),
                    React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                            React.createElement(react_core_1.DataListCell, { key: 'resource-name-header', width: 5 },
                                React.createElement("strong", null,
                                    React.createElement(Msg_1.Msg, { msgKey: 'resourceName' }))),
                            React.createElement(react_core_1.DataListCell, { key: 'application-name-header', width: 5 },
                                React.createElement("strong", null,
                                    React.createElement(Msg_1.Msg, { msgKey: 'application' }))),
                            React.createElement(react_core_1.DataListCell, { key: 'permission-request-header', width: 5 },
                                React.createElement("strong", null,
                                    React.createElement(Msg_1.Msg, { msgKey: 'permissionRequests' }))),
                        ] }))),
            (this.props.resources.data.length === 0) && React.createElement(Msg_1.Msg, { msgKey: this.props.noResourcesMessage }),
            this.props.resources.data.map(function (resource, row) {
                return (React.createElement(react_core_1.DataListItem, { key: 'resource-' + row, "aria-labelledby": resource.name, isExpanded: _this.state.isRowOpen[row] },
                    React.createElement(react_core_1.DataListItemRow, null,
                        React.createElement(react_core_1.DataListToggle, { onClick: function () { return _this.onToggle(row); }, isExpanded: _this.state.isRowOpen[row], id: 'resourceToggle-' + row, "aria-controls": "ex-expand1" }),
                        React.createElement(react_core_1.DataListItemCells, { dataListCells: [
                                React.createElement(react_core_1.DataListCell, { key: 'resourceName-' + row, width: 5 },
                                    React.createElement(Msg_1.Msg, { msgKey: resource.name })),
                                React.createElement(react_core_1.DataListCell, { key: 'resourceClient-' + row, width: 5 },
                                    React.createElement("a", { href: resource.client.baseUrl }, _this.getClientName(resource.client))),
                                React.createElement(react_core_1.DataListCell, { key: 'permissionRequests-' + row, width: 5 }, resource.shareRequests.length > 0 && React.createElement("a", { href: resource.client.baseUrl },
                                    React.createElement(react_icons_1.UserCheckIcon, { size: 'lg' }),
                                    React.createElement(react_core_1.Badge, null, resource.shareRequests.length)))
                            ] })),
                    React.createElement(react_core_1.DataListContent, { noPadding: false, "aria-label": "Session Details", id: "ex-expand1", isHidden: !_this.state.isRowOpen[row] },
                        React.createElement(react_core_1.Stack, { gutter: 'md' },
                            React.createElement(react_core_1.StackItem, { isFilled: true },
                                React.createElement(react_core_1.Level, { gutter: 'md' },
                                    React.createElement(react_core_1.LevelItem, null,
                                        React.createElement("span", null)),
                                    React.createElement(react_core_1.LevelItem, null, _this.sharedWithUsersMessage(row)),
                                    React.createElement(react_core_1.LevelItem, null,
                                        React.createElement("span", null)))),
                            React.createElement(react_core_1.StackItem, { isFilled: true },
                                React.createElement(react_core_1.Level, { gutter: 'md' },
                                    React.createElement(react_core_1.LevelItem, null,
                                        React.createElement("span", null)),
                                    React.createElement(react_core_1.LevelItem, null,
                                        React.createElement(ShareTheResource_1.ShareTheResource, { resource: resource, permissions: _this.state.permissions.get(row), sharedWithUsersMsg: _this.sharedWithUsersMessage(row), onClose: _this.fetchPermissions.bind(_this), row: row })),
                                    React.createElement(react_core_1.LevelItem, null,
                                        React.createElement(react_icons_1.EditAltIcon, null),
                                        " Edit"),
                                    React.createElement(react_core_1.LevelItem, null,
                                        React.createElement(react_icons_1.Remove2Icon, null),
                                        " Remove"),
                                    React.createElement(react_core_1.LevelItem, null,
                                        React.createElement("span", null))))))));
            })));
    };
    ResourcesTable.prototype.getClientName = function (client) {
        if (client.hasOwnProperty('name') && client.name !== null && client.name !== '') {
            return Msg_1.Msg.localize(client.name);
        }
        else {
            return client.clientId;
        }
    };
    return ResourcesTable;
}(React.Component));
exports.ResourcesTable = ResourcesTable;
//# sourceMappingURL=ResourcesTable.js.map