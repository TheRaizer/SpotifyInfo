import { Router } from "express";
export const router = Router();
import tokenCtrl from "../controllers/token-controller.js";

// whether the session has tokens
router.get("/has-tokens", tokenCtrl.hasTokens);

router.put("/refresh-token", tokenCtrl.refreshTokens);

router.put("/clear-tokens", tokenCtrl.clearTokens);

// expecting /retrieve_tokens?code=XXXX
router.get("/retrieve-tokens", tokenCtrl.retrieveTokens);
