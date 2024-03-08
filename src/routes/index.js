import { Router } from "express";
import paymentRoutes from "./paymet.route.js"
const router = Router()

router.use('/phonepay', paymentRoutes)

export default router