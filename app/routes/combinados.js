import { Router } from "express";
import {
    chistesCombinados
} from "../controllers/index.js"

const router = Router()

router.get("/", chistesCombinados)

export default router 