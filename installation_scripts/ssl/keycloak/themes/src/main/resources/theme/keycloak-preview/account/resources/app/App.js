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
var keycloak_service_1 = require("./keycloak-service/keycloak.service");
var PageNav_1 = require("./PageNav");
var PageToolbar_1 = require("./PageToolbar");
var ContentPages_1 = require("./ContentPages");
var react_core_1 = require("@patternfly/react-core");
var pFlyImages = resourceUrl + '/node_modules/@patternfly/patternfly/assets/images/';
var brandImg = resourceUrl + '/public/logo.svg';
var avatarImg = pFlyImages + 'img_avatar.svg';
;
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    function App(props) {
        var _this = _super.call(this, props) || this;
        _this.kcSvc = keycloak_service_1.KeycloakService.Instance;
        toggleReact();
        return _this;
    }
    App.prototype.render = function () {
        toggleReact();
        // check login
        if (!this.kcSvc.authenticated() && !isWelcomePage()) {
            this.kcSvc.login();
        }
        // globally set up locale for date formatting
        moment.locale(locale);
        var Header = (React.createElement(react_core_1.PageHeader, { logo: React.createElement(react_core_1.Brand, { src: brandImg, alt: "Logo", className: "brand" }), toolbar: React.createElement(PageToolbar_1.PageToolbar, null), avatar: React.createElement(react_core_1.Avatar, { src: avatarImg, alt: "Avatar image" }), showNavToggle: true }));
        var Sidebar = React.createElement(react_core_1.PageSidebar, { nav: React.createElement(PageNav_1.PageNav, null) });
        return (React.createElement("span", { style: { height: '100%' } },
            React.createElement(react_core_1.Page, { header: Header, sidebar: Sidebar, isManagedSidebar: true },
                React.createElement(react_core_1.PageSection, null, ContentPages_1.makeRoutes()))));
    };
    return App;
}(React.Component));
exports.App = App;
;
//# sourceMappingURL=App.js.map