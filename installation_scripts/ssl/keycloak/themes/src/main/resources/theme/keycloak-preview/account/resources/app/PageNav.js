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
var ContentPages_1 = require("./ContentPages");
var PageNavigation = /** @class */ (function (_super) {
    __extends(PageNavigation, _super);
    function PageNavigation(props) {
        return _super.call(this, props) || this;
    }
    PageNavigation.prototype.findActiveItem = function () {
        var currentPath = this.props.location.pathname;
        var items = ContentPages_1.flattenContent(content);
        var firstItem = items[0];
        for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
            var item = items_1[_i];
            var itemPath = '/app/' + item.path;
            if (itemPath === currentPath) {
                return item;
            }
        }
        ;
        return firstItem;
    };
    PageNavigation.prototype.render = function () {
        var activeItem = this.findActiveItem();
        return (React.createElement(react_core_1.Nav, { "aria-label": "Nav" },
            React.createElement(react_core_1.NavList, null, ContentPages_1.makeNavItems(activeItem))));
    };
    return PageNavigation;
}(React.Component));
exports.PageNav = react_router_dom_1.withRouter(PageNavigation);
//# sourceMappingURL=PageNav.js.map