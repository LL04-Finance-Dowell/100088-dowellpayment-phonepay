import { Router } from "express";
import { payment,validatePaymentStatus } from "../controllers/payment.controller.js";

const router = Router();

router.post("/initiate-payment", payment);
router.get("/validate-payment/:merchantTransactionId/:date/:workspace_id/:qrcode_id/:seat_number", validatePaymentStatus);

export default router;