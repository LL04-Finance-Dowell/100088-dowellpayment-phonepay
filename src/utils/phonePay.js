import axios from "axios";
import sha256 from "sha256";
import CustomError from '../utils/CustomError.js'
import config from '../config/index.js'

const createPaymentRequest = (userId, merchantTransactionId, amount, mobileNumber, redirect_url) => {
    let payload = {
        merchantId: config.MERCHANT_ID,
        merchantTransactionId: merchantTransactionId,
        merchantUserId: userId,
        amount: amount * 100,
        redirectUrl: redirect_url,
        redirectMode: "REDIRECT",
        mobileNumber: mobileNumber,
        paymentInstrument: {
            type: "PAY_PAGE",
        }
    };

    let bufferObj = Buffer.from(JSON.stringify(payload), "utf8");
    let base64EncodedPayload = bufferObj.toString("base64");

    let string = base64EncodedPayload + "/pg/v1/pay" + config.SALT_KEY;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + config.SALT_INDEX;

    return new Promise((resolve, reject) => {
        axios
            .post(
                `${config.PHONE_PE_HOST_URL}/pg/v1/pay`,
                {
                    request: base64EncodedPayload,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "X-VERIFY": xVerifyChecksum,
                        accept: "application/json",
                    },
                }
            )
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                reject(new CustomError(error.message, 404));
            });
    });
};

const validatePayment = async (merchantTransactionId) => {
    if (!merchantTransactionId) {
        throw new CustomError("Merchant transaction ID is required", 400)
    }

    let statusUrl = `${config.PHONE_PE_HOST_URL}/pg/v1/status/${config.MERCHANT_ID}/${merchantTransactionId}`;

    let string = `/pg/v1/status/${config.MERCHANT_ID}/${merchantTransactionId}${config.SALT_KEY}`;
    let sha256_val = sha256(string);
    let xVerifyChecksum = sha256_val + "###" + config.SALT_INDEX;

    try {
        const response = await axios.get(statusUrl, {
            headers: {
                "Content-Type": "application/json",
                "X-VERIFY": xVerifyChecksum,
                "X-MERCHANT-ID": merchantTransactionId,
                accept: "application/json",
            },
        });

        console.log("response->", response.data);

        if (response.data && response.data.code === "PAYMENT_SUCCESS") {
            return response.data;
        } else {
            return response.data;
        }
    } catch (error) {
        throw new CustomError(error.message, 404);
    }
};

export {
    createPaymentRequest,
    validatePayment
}
