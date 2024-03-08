import { Router } from "express";
import { payment,validatePaymentStatus } from "../controllers/payment.controller.js";

const router = Router();

router.post("/initiate-payment", payment);
router.get("/validate-payment/:merchantTransactionId", validatePaymentStatus);

export default router;