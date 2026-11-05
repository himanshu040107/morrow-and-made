import bcrypt from "bcrypt";
import mongoose from "mongoose";
import config from "./config/config.js";
import Product from "./models/Product.model.js";
import User from "./models/user.model.js";

// Demo credentials for these seeded seller accounts: MakerDemo123!
const sellers = [
  { name: "Clay House Studio", email: "clayhouse@example.com", role: "seller" },
  { name: "Fieldwork Goods", email: "fieldwork@example.com", role: "seller" },
  { name: "Mara Ellis Studio", email: "mara@example.com", role: "seller" },
  { name: "Sunday Loom", email: "sundayloom@example.com", role: "seller" },
];

const products = [
  {
    productName: "Hand-thrown stoneware mug",
    productDescription: "A quietly beautiful, hand-thrown stoneware mug with a soft speckled glaze. Made in small batches and finished by hand.",
    productPrice: 38,
    productImage: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=85",
    stock: 18,
    sellerEmail: "clayhouse@example.com",
  },
  {
    productName: "Breakfast bowl in oat",
    productDescription: "A versatile ceramic bowl for slow breakfasts, late-night snacks, and everything in between. Each piece has its own glaze variations.",
    productPrice: 44,
    productImage: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=900&q=85",
    stock: 12,
    sellerEmail: "clayhouse@example.com",
  },
  {
    productName: "The everyday leather tote",
    productDescription: "A roomy everyday carryall cut from responsibly sourced leather, with sturdy handles and a simple, timeless shape.",
    productPrice: 124,
    productImage: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=85",
    stock: 9,
    sellerEmail: "fieldwork@example.com",
  },
  {
    productName: "Hand-stitched card wallet",
    productDescription: "A slim pocket wallet, cut and stitched by hand. Natural leather develops a warm, personal patina with everyday use.",
    productPrice: 58,
    productImage: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=85",
    stock: 15,
    sellerEmail: "fieldwork@example.com",
  },
  {
    productName: "Quiet morning print, no. 04",
    productDescription: "An archival-quality art print inspired by the gentle light of early morning. Printed in a numbered, limited run.",
    productPrice: 56,
    productImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=900&q=85",
    stock: 25,
    sellerEmail: "mara@example.com",
  },
  {
    productName: "Still life study, no. 12",
    productDescription: "A signed art print celebrating everyday forms and color. Printed on textured, FSC-certified paper in a small studio.",
    productPrice: 68,
    productImage: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=900&q=85",
    stock: 14,
    sellerEmail: "mara@example.com",
  },
  {
    productName: "Linen table set · natural",
    productDescription: "A set of naturally dyed linen napkins, woven from European flax. Softens beautifully over time and washes with ease.",
    productPrice: 72,
    productImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
    stock: 20,
    sellerEmail: "sundayloom@example.com",
  },
  {
    productName: "Everyday linen tea towel",
    productDescription: "A lightweight, absorbent tea towel woven from pure linen. Finished with a hanging loop and made for daily use.",
    productPrice: 28,
    productImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85",
    stock: 30,
    sellerEmail: "sundayloom@example.com",
  },
];

async function seed() {
  if (!config.MONGO_URI) throw new Error("MONGO_URI is missing. Set it in backend/.env before seeding.");
  await mongoose.connect(config.MONGO_URI);

  const passwordHash = await bcrypt.hash("MakerDemo123!", 10);
  const sellerByEmail = new Map();

  for (const seller of sellers) {
    const savedSeller = await User.findOneAndUpdate(
      { email: seller.email },
      { $set: { role: seller.role }, $setOnInsert: { name: seller.name, passwordHash } },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    );
    sellerByEmail.set(seller.email, savedSeller._id);
  }

  for (const { sellerEmail, ...product } of products) {
    await Product.updateOne(
      { productName: product.productName, seller: sellerByEmail.get(sellerEmail) },
      { $set: { ...product, seller: sellerByEmail.get(sellerEmail) } },
      { upsert: true },
    );
  }

  console.log(`Seed complete: ${sellers.length} sellers and ${products.length} products are available.`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
