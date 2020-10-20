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
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var react_router_dom_1 = require("react-router-dom");
var react_core_1 = require("@patternfly/react-core");
var Msg_1 = require("./widgets/Msg");
var PageNotFound_1 = require("./content/page-not-found/PageNotFound");
;
function isModulePageDef(item) {
    return item.modulePath !== undefined;
}
exports.isModulePageDef = isModulePageDef;
function isExpansion(contentItem) {
    return contentItem.content !== undefined;
}
exports.isExpansion = isExpansion;
function groupId(group) {
    return 'grp-' + group;
}
function itemId(group, item) {
    return 'grp-' + group + '_itm-' + item;
}
function isChildOf(parent, child) {
    for (var _i = 0, _a = parent.content; _i < _a.length; _i++) {
        var item = _a[_i];
        if (isExpansion(item) && isChildOf(item, child))
            return true;
        if (parent.groupId === child.groupId)
            return true;
    }
    return false;
}
function createNavItems(activePage, contentParam, groupNum) {
    if (typeof content === 'undefined')
        return (React.createElement(React.Fragment, null));
    var links = contentParam.map(function (item) {
        var navLinkId = "nav-link-" + item.id;
        if (isExpansion(item)) {
            return React.createElement(react_core_1.NavExpandable, { id: navLinkId, groupId: item.groupId, key: item.groupId, title: Msg_1.Msg.localize(item.label, item.labelParams), isExpanded: isChildOf(item, activePage) }, createNavItems(activePage, item.content, groupNum + 1));
        }
        else {
            var page = item;
            return React.createElement(react_core_1.NavItem, { id: navLinkId, groupId: item.groupId, itemId: item.itemId, key: item.itemId, to: '#/app/' + page.path, isActive: activePage.itemId === item.itemId, type: "button" }, Msg_1.Msg.localize(page.label, page.labelParams));
        }
    });
    return (React.createElement(React.Fragment, null, links));
}
function makeNavItems(activePage) {
    console.log({ activePage: activePage });
    return createNavItems(activePage, content, 0);
}
exports.makeNavItems = makeNavItems;
function setIds(contentParam, groupNum) {
    if (typeof contentParam === 'undefined')
        return groupNum;
    var expansionGroupNum = groupNum;
    for (var i = 0; i < contentParam.length; i++) {
        var item = contentParam[i];
        if (isExpansion(item)) {
            item.itemId = itemId(groupNum, i);
            expansionGroupNum = expansionGroupNum + 1;
            item.groupId = groupId(expansionGroupNum);
            expansionGroupNum = setIds(item.content, expansionGroupNum);
            console.log('currentGroup=' + (expansionGroupNum));
        }
        else {
            item.groupId = groupId(groupNum);
            item.itemId = itemId(groupNum, i);
        }
    }
    ;
    return expansionGroupNum;
}
function initGroupAndItemIds() {
    setIds(content, 0);
    console.log({ content: content });
}
exports.initGroupAndItemIds = initGroupAndItemIds;
// get rid of Expansions and put all PageDef items into a single array
function flattenContent(pageDefs) {
    var flat = [];
    for (var _i = 0, pageDefs_1 = pageDefs; _i < pageDefs_1.length; _i++) {
        var item = pageDefs_1[_i];
        if (isExpansion(item)) {
            flat.push.apply(flat, flattenContent(item.content));
        }
        else {
            flat.push(item);
        }
    }
    return flat;
}
exports.flattenContent = flattenContent;
function makeRoutes() {
    if (typeof content === 'undefined')
        return (React.createElement("span", null));
    var pageDefs = flattenContent(content);
    var routes = pageDefs.map(function (page) {
        if (isModulePageDef(page)) {
            var node_1 = React.createElement(page.module[page.componentName], { 'pageDef': page });
            return React.createElement(react_router_dom_1.Route, { key: page.itemId, path: '/app/' + page.path, exact: true, render: function () { return node_1; } });
        }
        else {
            var pageDef = page;
            return React.createElement(react_router_dom_1.Route, { key: page.itemId, path: '/app/' + page.path, exact: true, component: pageDef.component });
        }
    });
    return (React.createElement(react_router_dom_1.Switch, null,
        routes,
        React.createElement(react_router_dom_1.Route, { component: PageNotFound_1.PageNotFound })));
}
exports.makeRoutes = makeRoutes;
//# sourceMappingURL=ContentPages.js.map