"use strict";
/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
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
var react_router_dom_1 = require("react-router-dom");
var Msg_1 = require("../../widgets/Msg");
var PgNotFound = /** @class */ (function (_super) {
    __extends(PgNotFound, _super);
    function PgNotFound(props) {
        return _super.call(this, props) || this;
    }
    PgNotFound.prototype.render = function () {
        return (React.createElement(react_core_1.EmptyState, { variant: 'full' },
            React.createElement(react_core_1.EmptyStateIcon, { icon: react_icons_1.WarningTriangleIcon }),
            React.createElement(react_core_1.Title, { headingLevel: react_core_1.TitleLevel.h5, size: "lg" },
                React.createElement(Msg_1.Msg, { msgKey: 'pageNotFound' })),
            React.createElement(react_core_1.EmptyStateBody, null,
                React.createElement(Msg_1.Msg, { msgKey: 'invalidRoute', params: [this.props.location.pathname] }))));
    };
    return PgNotFound;
}(React.Component));
;
exports.PageNotFound = react_router_dom_1.withRouter(PgNotFound);
//# sourceMappingURL=PageNotFound.js.map