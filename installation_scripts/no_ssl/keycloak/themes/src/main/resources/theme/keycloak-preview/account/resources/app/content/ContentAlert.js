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
var react_core_1 = require("@patternfly/react-core");
var Msg_1 = require("../widgets/Msg");
var ContentAlert = /** @class */ (function (_super) {
    __extends(ContentAlert, _super);
    function ContentAlert(props) {
        var _this = _super.call(this, props) || this;
        _this.hideAlert = function () {
            _this.setState({ isVisible: false });
        };
        _this.postAlert = function (variant, message, params) {
            _this.setState({ isVisible: true,
                message: Msg_1.Msg.localize(message, params),
                variant: variant });
            if (variant !== 'danger') {
                setTimeout(function () { return _this.setState({ isVisible: false }); }, 5000);
            }
        };
        _this.state = { isVisible: false, message: '', variant: 'success' };
        ContentAlert.instance = _this;
        return _this;
    }
    /**
     * @param message A literal text message or localization key.
     */
    ContentAlert.success = function (message, params) {
        ContentAlert.instance.postAlert('success', message, params);
    };
    /**
     * @param message A literal text message or localization key.
     */
    ContentAlert.danger = function (message, params) {
        ContentAlert.instance.postAlert('danger', message, params);
    };
    /**
     * @param message A literal text message or localization key.
     */
    ContentAlert.warning = function (message, params) {
        ContentAlert.instance.postAlert('warning', message, params);
    };
    /**
     * @param message A literal text message or localization key.
     */
    ContentAlert.info = function (message, params) {
        ContentAlert.instance.postAlert('info', message, params);
    };
    ContentAlert.prototype.render = function () {
        return (React.createElement(React.Fragment, null, this.state.isVisible &&
            React.createElement("section", { className: "pf-c-page__main-section pf-m-light" },
                React.createElement(react_core_1.Alert, { id: "content-alert", title: '', variant: this.state.variant, variantLabel: '', "aria-label": '', action: React.createElement(react_core_1.AlertActionCloseButton, { id: "content-alert-close", onClose: this.hideAlert }) }, this.state.message))));
    };
    return ContentAlert;
}(React.Component));
exports.ContentAlert = ContentAlert;
//# sourceMappingURL=ContentAlert.js.map