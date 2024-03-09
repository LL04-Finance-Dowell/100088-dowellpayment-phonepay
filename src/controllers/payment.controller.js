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
    let url = new URL(redirect_url);
    let searchParams = new URLSearchParams(url.search);
    let payment_receipt_id = searchParams.get('payment_receipt_id');
    let date = searchParams.get('date');
    let workspace_id = searchParams.get('workspace_id');
    let qrcode_id = searchParams.get('qrcode_id');
    let seat_number = searchParams.get('seat_number');

    // url = `http://localhost:5000/api/v1/phonepay/validate-payment/${payment_receipt_id}/${date}/${workspace_id}/${qrcode_id}/${seat_number}`;
    url = `https://www.q.uxlivinglab.online/dowellpayment/phonepay/api/v1/phonepay/validate-payment/${payment_receipt_id}/${date}/${workspace_id}/${qrcode_id}/${seat_number}`;

    console.log(url);
    
    const response = await createPaymentRequest(
        userId,
        merchantId,
        amount,
        url
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

const validatePaymentStatus = asyncHandler(async (req, res) => {
    const { merchantTransactionId, date, workspace_id, qrcode_id, seat_number } = req.params;
    console.log(merchantTransactionId);

    if (!merchantTransactionId || !date || !workspace_id || !qrcode_id || !seat_number) {
        throw new CustomError("Incomplete parameters", 400);
    }

    const response = await validatePayment(merchantTransactionId);
    console.log(response);

    if (!response.success) {
        throw new CustomError("Payment failed", 404);
    }

    const payment_receipt_id = merchantTransactionId;
    const successUrl = `https://www.q.uxlivinglab.online/success/?view=success&payment_receipt_id=${payment_receipt_id}&date=${date}&workspace_id=${workspace_id}&qrcode_id=${qrcode_id}&seat_number=${seat_number}`;
    // const successUrl = "https://www.q.uxlivinglab.online/"
    res.redirect(successUrl);
});



export { payment , validatePaymentStatus};

