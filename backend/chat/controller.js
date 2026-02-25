import Fuse from "fuse.js";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { getProducts } from "./products.js";

/* ===================================================
   RATE LIMITING
=================================================== */
export const burstLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: false,
  legacyHeaders: false
});

export const chatLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Daily chat limit reached. Please try again tomorrow."
  }
});

/* ===================================================
   GEMINI SETUP
=================================================== */
let ai = null;

if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  } catch (err) {
    console.error("Failed to initialize Gemini:", err);
  }
}

const GEMINI_FALLBACK_REPLY =
  "I’m currently handling many requests. Please try again in a few minutes or browse products directly.";

/* ===================================================
   PRODUCT DATA
=================================================== */
const products = getProducts();

/* ===================================================
   FUSE SEARCH CONFIG (SCHEMA CORRECT)
=================================================== */
const fuse = new Fuse(products, {
  keys: [
    "name",
    "product_type",
    "description",
    "benefits",
    "concerns_targeted",
    "skin_type_suitable",
    "ingredients.key_actives",
    "ingredients.botanical_extracts"
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 3
});

/* ===================================================
   FAQ ANSWERS
=================================================== */
const FAQ_ANSWERS = {
  shipping:
    "We offer free shipping on most orders. Delivery usually takes 3–5 business days.",
  delivery:
    "Delivery usually takes 3–5 business days depending on your location.",
  return:
    "We accept returns within 7 days of delivery for unused products in original packaging.",
  refund:
    "Refunds are processed within 5–7 business days after receiving the returned item.",
  cod:
    "Cash on Delivery (COD) is available for orders under ₹2000 in most pin codes.",
  cancellation:
    "Orders can be cancelled before dispatch from our warehouse.",
  contact:
    "You can reach support at support@bodilicious.in or via WhatsApp at +91-XXXXXXXXXX",
  support:
    "You can reach support at support@bodilicious.in or via WhatsApp at +91-XXXXXXXXXX"
};

/* ===================================================
   SYSTEM PROMPT (STRICT)
=================================================== */
const SYSTEM_PROMPT = `
You are Bodilicious Product Assistant.

Your ONLY knowledge about products comes from the PRODUCT_DATA provided.
Do NOT use external knowledge.
Do NOT invent ingredients, prices, benefits, or usage instructions.

PRIMARY GOAL:
Help users understand Bodilicious products and choose suitable products
based ONLY on:
- skin type
- concern
- product type
- price (INR)

STRICT RULES:
1. Never recommend more than 3 products.
2. Never say a product cures anything.
3. If information is missing, say it is not listed.
4. Always mention price when recommending.
5. Be short, factual, non-medical, brand-safe.
`;

/* ===================================================
   HELPERS
=================================================== */
function matchFAQ(message) {
  for (const [key, answer] of Object.entries(FAQ_ANSWERS)) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    if (regex.test(message)) return answer;
  }
  return null;
}

function cleanQuery(text) {
  return text
    .toLowerCase()
    .replace(/(please|help me|can you)/g, "")
    .trim();
}

function formatProductReply(items) {
  let reply = "Here are some products that may match your needs:\n\n";

  items.forEach(p => {
    let suitableText = "";

    if (p.category === "hair") {
      suitableText =
        p.hair_type_suitable?.length
          ? `Suitable for: ${p.hair_type_suitable.join(", ")}`
          : "Suitable for: All hair types";
    } else {
      suitableText =
        p.skin_type_suitable?.length
          ? `Suitable for: ${p.skin_type_suitable.join(", ")}`
          : "";
    }

    reply += `• ${p.name} – ₹${p.price_inr}
${p.description}
${suitableText}\n\n`;
  });

  return reply.trim();
}

/* ===================================================
   MAIN CHAT HANDLER
=================================================== */
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        success: false,
        message: "Message is required."
      });
    }

    const lower = message.toLowerCase();

    /* ---------- STEP 1: FAQ ---------- */
    const faqReply = matchFAQ(lower);
    if (faqReply) {
      return res.json({
        success: true,
        isFaq: true,
        reply: faqReply
      });
    }

    /* ---------- STEP 2: DOMAIN + INTENT DETECTION ---------- */

    let domain = "mixed"; // skin | hair | body | mixed
    let intentProducts = [];

    // ---- SKIN ----
    if (
      lower.includes("skin") ||
      lower.includes("acne") ||
      lower.includes("oily") ||
      lower.includes("dry") ||
      lower.includes("pigment") ||
      lower.includes("dark spot") ||
      lower.includes("face")
    ) {
      domain = "skin";
      intentProducts = products.filter(p =>
        p.product_type.toLowerCase().includes("serum") ||
        p.product_type.toLowerCase().includes("face") ||
        p.product_type.toLowerCase().includes("moisturizer") ||
        p.product_type.toLowerCase().includes("sunscreen")
      );
    }

    // ---- HAIR ----
    if (
      lower.includes("hair") ||
      lower.includes("dandruff") ||
      lower.includes("hair fall") ||
      lower.includes("scalp")
    ) {
      domain = "hair";
      intentProducts = products.filter(p =>
        p.product_type.toLowerCase().includes("hair") ||
        p.product_type.toLowerCase().includes("shampoo") ||
        p.product_type.toLowerCase().includes("conditioner")
      );
    }

    // ---- BODY ----
    if (
      lower.includes("body") ||
      lower.includes("soap") ||
      lower.includes("bath") ||
      lower.includes("wash")
    ) {
      domain = "body";
      intentProducts = products.filter(p =>
        p.product_type.toLowerCase().includes("soap") ||
        p.product_type.toLowerCase().includes("body")
      );
    }

    // If we found clear domain products → return directly
    if (intentProducts.length > 0) {
      return res.json({
        success: true,
        isProduct: true,
        domain,
        reply: formatProductReply(intentProducts.slice(0, 3))
      });
    }

    /* ---------- STEP 3: FUZZY MATCH (NAME / DESCRIPTION) ---------- */
    const cleaned = cleanQuery(lower);
    const fuseResults = fuse.search(cleaned || message);

    if (fuseResults.length > 0) {
      return res.json({
        success: true,
        isProduct: true,
        reply: formatProductReply(
          fuseResults.map(r => r.item).slice(0, 3)
        )
      });
    }

    /* ---------- STEP 4: AI SEARCHES DATABASE (NEVER EMPTY) ---------- */

    if (!ai) {
      return res.json({
        success: true,
        reply:
          "I can help you choose products if you tell me your concern like skin, hair, or body care."
      });
    }

    // 🔑 IMPORTANT: AI gets FULL PRODUCT DB (trimmed)
    const aiContextProducts = products.slice(0, 10);

    let aiReply;

    try {
      const payload = `
PRODUCT_DATA:
${JSON.stringify(aiContextProducts, null, 2)}

USER_QUERY:
${message}

TASK:
Search the product data and recommend suitable products.
Follow system rules strictly.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: payload,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.2,
          maxOutputTokens: 400
        }
      });

      aiReply =
        response.text ||
        response.candidates?.[0]?.content?.parts?.[0]?.text;

    } catch (err) {
      console.error("Gemini error:", err);
    }

    if (!aiReply) {
      return res.json({
        success: true,
        reply:
          "I’m currently handling many requests. Please try again or browse our products."
      });
    }

    return res.json({
      success: true,
      isAi: true,
      reply: aiReply.split("\n").slice(0, 10).join("\n")
    });

  } catch (err) {
    console.error("Chat Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};