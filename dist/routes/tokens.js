"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const token_controller_1 = require("../controllers/token-controller");
const router = (0, express_1.Router)();
exports.router = router;
// whether the session has tokens
router.get('/has-tokens', token_controller_1.tokenCtrl.hasTokens);
router.put('/refresh-token', token_controller_1.tokenCtrl.refreshTokens);
router.put('/clear-tokens', token_controller_1.tokenCtrl.clearTokens);
// expecting /retrieve_tokens?code=XXXX
router.get('/obtain-tokens', token_controller_1.tokenCtrl.obtainTokens);
router.get('/get-access-token', token_controller_1.tokenCtrl.getAccessToken);
//# sourceMappingURL=tokens.js.map