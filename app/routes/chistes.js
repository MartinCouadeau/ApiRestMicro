import { Router } from "express";
import {
    getChiste,
    deleteChiste,
    postChiste,
    updateChiste
} from "../controllers/index.js"

const router = Router()

router.get("/", getChiste)
router.get("/:type", getChiste)
router.delete("/:id", deleteChiste)
router.post("/", postChiste)
router.put("/:id", updateChiste)

export default router 