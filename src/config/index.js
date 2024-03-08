import dotenv from 'dotenv';

dotenv.config()

const config = {
    PORT : process.env.PORT || 5000,
    MERCHANT_ID : process.env.MERCHANT_ID,
    PHONE_PE_HOST_URL : process.env.PHONE_PE_HOST_URL,
    SALT_INDEX : process.env.SALT_INDEX,
    SALT_KEY : process.env.SALT_KEY
}

export default config