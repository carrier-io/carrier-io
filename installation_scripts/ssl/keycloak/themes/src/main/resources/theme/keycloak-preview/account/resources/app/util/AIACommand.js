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
/**
 * @author Stan Silvert
 */
var AIACommand = /** @class */ (function () {
    function AIACommand(action, redirectPath) {
        this.action = action;
        this.redirectPath = redirectPath;
    }
    AIACommand.prototype.execute = function () {
        var redirectURI = baseUrl;
        if (typeof referrer !== 'undefined') {
            // '_hash_' is a workaround for when uri encoding is not
            // sufficient to escape the # character properly.
            // The problem is that both the redirect and the application URL contain a hash.
            // The browser will consider anything after the first hash to be client-side.  So
            // it sees the hash in the redirect param and stops.
            redirectURI += "?referrer=" + referrer + "&referrer_uri=" + referrerUri.replace('#', '_hash_');
        }
        redirectURI = encodeURIComponent(redirectURI);
        var href = "/auth/realms/" + realm +
            "/protocol/openid-connect/auth/" +
            "?response_type=code" +
            "&client_id=account&scope=openid" +
            "&kc_action=" + this.action +
            "&redirect_uri=" + redirectURI +
            encodeURIComponent("/#" + this.redirectPath); // return to this page
        window.location.href = href;
    };
    return AIACommand;
}());
exports.AIACommand = AIACommand;
//# sourceMappingURL=AIACommand.js.map