import { Router } from "express";

import {
    insertRoot,
    insertNode,
    loadData,
    updateNode,
    deleteNode
} from "../controllers/tree.controller.js";

import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/root").post(insertRoot)
router.route("/node").post(insertNode)
router.route("/load").get(loadData)
router.route("/node/:id").put(updateNode)
router.route("/node/:id").delete(deleteNode)

export default router;