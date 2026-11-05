import mongoose from "mongoose";
const productSchema=new mongoose.Schema({
    productName:{
        type:String,
        required:true
    },
    productDescription:{
        type:String,
        required:true
    },
    productPrice:{
        type:Number,
        required:true
    },
    productImage:{
        type:String,
        required:true
    },
    stock:{
        type:Number,
        default:0
    },
    seller:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true
    },
})
const ProductModel=new mongoose.model("Product",productSchema);
export default ProductModel;