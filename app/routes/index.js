import { Router } from "express";
import chistes from "./chistes.js"
import matematica from "./matematica.js"
import combinados from "./combinados.js"

const router = Router()

router.use("/chistes", chistes)
router.use("/matematica", matematica)
router.use("/combinados", combinados)

export default router 