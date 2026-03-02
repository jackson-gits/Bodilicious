import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from '../products/models.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
    .connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME,
    })
    .then(async () => {
        console.log("MongoDB connected");

        // 1. Clear database
        await Product.deleteMany({});
        console.log("Cleared existing products from database.");

        // 2. Read products.json
        const productsPath = path.join(__dirname, '..', 'chat', 'products.json');
        const rawJson = fs.readFileSync(productsPath, 'utf-8');
        const sampleProducts = JSON.parse(rawJson);

        // 3. Map products to the correct format and seed fake images
        const formattedProducts = sampleProducts.map(p => {
            // Give them some default fake images if missing
            const fallbackImages = [
                "https://images.pexels.com/photos/5980590/pexels-photo-5980590.jpeg?auto=compress&cs=tinysrgb&w=800",
                "https://images.pexels.com/photos/5980588/pexels-photo-5980588.jpeg?auto=compress&cs=tinysrgb&w=800"
            ];

            return {
                pid: p.id,
                name: p.name,
                brand: p.brand || "Bodilicious",
                images: p.images || fallbackImages,
                description: p.description,
                category: p.category,
                sub_category: p.sub_category,
                product_type: p.product_type,
                item_form: p.item_form,
                ingredients: p.ingredients,
                benefits: p.benefits,
                concerns_targeted: p.concerns_targeted || [],
                usage: p.usage,
                price: p.price_inr,
                stock: p.availability === "In Stock" ? 100 : 0,
                isActive: true,
                reviews: []
            };
        });

        // 4. Insert all mapped products
        const result = await Product.insertMany(formattedProducts);
        console.log(`Successfully seeded ${result.length} products to database!`);
        process.exit(0);
    })
    .catch((err) => {
        console.error("Database Seeding Failed!", err);
        process.exit(1);
    });
