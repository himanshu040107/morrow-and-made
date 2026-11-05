import jwt from "jsonwebtoken";
import Blacklist from "../models/blacklist.model.js";
import config from "../config/config.js";

// Middleware to authenticate access token
export const authenticate=async (req,res,next)=>{
    const authorization = req.headers.authorization;
    if (!authorization?.startsWith("Bearer ")) {
        return res.status(401).json({message:"Access Token is required"});
    }
    const accessToken=authorization.split(" ")[1];
    if(!accessToken){
        return res.status(401).json({message:"Access Token is required"});
    }
    try{
        const blacklistToken=await Blacklist.findOne({token:accessToken});
        if(blacklistToken){
            return res.status(401).json({message:"Access Token is blacklisted"});
        }
        const decoded=jwt.verify(accessToken,config.ACCESS_TOKEN_SECRET);
        req.user=decoded;
        next();
    }catch(error){
        console.error("Error in authenticate middleware:",error);
        res.status(401).json({message:"Invalid Access Token"});
    }
}
