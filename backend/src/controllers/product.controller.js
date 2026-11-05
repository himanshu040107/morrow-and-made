import ProductModel from "../models/Product.model.js";
import imageKit from "../config/imageKit.js";

// Create a new product
export const createProductController=async(req,res)=>{
    try{
        if (!req.file) return res.status(400).json({ message: "Product image is required" });
        const {productName,productDescription,productPrice,stock}=req.body;
        const result=await imageKit.upload({
            file:req.file.buffer,
            fileName:req.file.originalname,
            folder:"products"
        })
        const productImage=result.url;
        console.log("productImage",productImage);
        const newProduct=await ProductModel.create({
            productName,
            productDescription,
            productPrice,
            productImage,
            stock,
            seller:req.user.id
        })
        res.status(201).json({message:"Product created successfully",product:newProduct});
    }
    catch(error){
        console.log("error in createProductController",error);
        res.status(500).json({message:"Unable to create product"});
    }
};

// Get all products
export const getAllProductsController=async(req,res)=>{
    try{
        const products=await ProductModel.find().populate("seller","name email");
        res.status(200).json({products});
    }
    catch(error){
        console.log("error in getAllProductsController",error);
        res.status(500).json({message:"Internal server error"});
    }
}

// Get a single product
export const getSingleProductController=async(req,res)=>{
    try{
        const product=await ProductModel.findById(req.params.id).populate("seller","name email");
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        res.status(200).json({product});
    }
    catch(error){
        console.log("error in getSingleProductController",error);
        res.status(500).json({message:"Internal server error"});
    }
}

// Update a product
export const updateProductController=async(req,res)=>{
    try{
        const {productName,productDescription,productPrice,stock}=req.body;
        const product=await ProductModel.findById(req.params.id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(product.seller.toString()!==req.user.id){
            return res.status(403).json({message:"You are not authorized to update this product"});
        }
        let productImage=product.productImage;
        if(req.file){
            const result=await imageKit.upload({
                file:req.file.buffer,
                fileName:req.file.originalname,
                folder:"products"
            })
            productImage=result.url;
        }
        const updatedProduct=await ProductModel.findByIdAndUpdate(req.params.id,{
            productName,
            productDescription,
            productPrice,
            productImage,
            stock
        },{new:true});
        res.status(200).json({message:"Product updated successfully",product:updatedProduct});
    }
    catch(error){
        console.log("error in updateProductController",error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const deleteProductController=async(req,res)=>{
    try{
        const product=await ProductModel.findById(req.params.id);
        if(!product){
            return res.status(404).json({message:"Product not found"});
        }
        if(product.seller.toString()!==req.user.id){
            return res.status(403).json({message:"You are not authorized to delete this product"});
        }
        await ProductModel.findByIdAndDelete(req.params.id);
        res.status(200).json({message:"Product deleted successfully"});
    }
    catch(error){
        console.log("error in deleteProductController",error);
        res.status(500).json({message:"Internal server error"});
    }
}
