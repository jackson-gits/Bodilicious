import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsPath = path.join(__dirname, "products.json");
const productsData = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

export const getProducts = () => productsData;