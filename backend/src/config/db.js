import mongoose from "mongoose";
import config from "./config.js"
const connectDB=async()=>{
    try{
        const connection=await mongoose.connect(config.MONGO_URI);
        console.log(`MongoDB connected: ${connection.connection.host}`);   
    }
    catch(error){
        console.error(`Error: ${error}`);
    }
}
export default connectDB;