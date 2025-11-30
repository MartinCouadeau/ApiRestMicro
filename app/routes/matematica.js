import { Router } from "express";
import {
    getComunMultiplo,
    getMasUno
} from "../controllers/index.js"

const router = Router()

router.get("/mcm", getComunMultiplo)
router.get("/masUno", getMasUno)

export default router 