import dotenv from "dotenv";
dotenv.config();
const config={
    MONGO_URI:process.env.MONGO_URI,
    ACCESS_TOKEN_SECRET:process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET:process.env.REFRESH_TOKEN_SECRET,
    IMAGE_KIT_PUBLIC_KEY:process.env.IMAGE_KIT_PUBLIC_KEY,
    IMAGE_KIT_PRIVATE_KEY:process.env.IMAGE_KIT_PRIVATE_KEY,
    IMAGE_KIT_URL_ENDPOINT:process.env.IMAGE_KIT_URL_ENDPOINT
}
export default config;