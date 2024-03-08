import asyncHandler from "../utils/asyncHandler.js";
import CustomError from "../utils/CustomError.js";
import { createPaymentRequest,validatePayment } from "../utils/phonePay.js";
import { z } from "zod";

const paymentPayload = z.object({
    userId: z.string(),
    amount: z.number(),
    redirect_url: z.string(),
    merchantId: z.string(),
});

const payment = asyncHandler(async (req, res) => {
    const { userId, merchantId, amount, redirect_url } = req.body;

    const dataValidation = paymentPayload.safeParse({
        userId: userId,
        amount: amount,
        redirect_url: redirect_url,
        merchantId: merchantId,
    });

    if (!dataValidation.success) {
        throw new CustomError("Invalid payload", 404);
    }

    const response = await createPaymentRequest(
        userId,
        merchantId,
        amount,
        redirect_url
    );


    if (!response.success) {
        throw new CustomError("Failed to create a payment", 404);
    }

    return res.status(200).json({
        success: true,
        message: "Payment initiated successfully",
        response: response.data.instrumentResponse.redirectInfo.url
    });
});

const validatePaymentStatus = asyncHandler(async (req,res)=>{
    const { merchantTransactionId } = req.params;

    if (!merchantTransactionId) {
        throw new CustomError("Merchant Merchant transaction ID is required",404)
    }

    const response = await validatePayment(merchantTransactionId)

    if (!response.success) {
        throw new CustomError("Payment failed", 404)
    }

    return res.status(200).json({
        success: true,
        message: "Payment is successfully"
    });
})
export { payment , validatePaymentStatus};
