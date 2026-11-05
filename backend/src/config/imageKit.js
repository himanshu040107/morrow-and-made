import Imagekit from "imagekit";
import config from "./config.js";
const imageKit=new Imagekit({
    publicKey: config.IMAGE_KIT_PUBLIC_KEY,
    privateKey: config.IMAGE_KIT_PRIVATE_KEY,
    urlEndpoint: config.IMAGE_KIT_URL_ENDPOINT
})
export default imageKit;