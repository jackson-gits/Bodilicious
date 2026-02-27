import Fuse from "fuse.js";
import rateLimit from "express-rate-limit";
import { GoogleGenAI } from "@google/genai";
import { getProducts } from "./products.js";
import { matchIntent } from "./intents.js";

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
function extractContext(messages) {
  const context = {
    domain: null,
    skinType: null,
    concern: null,
    productType: null
  };

  for (const msg of messages) {
    if (!msg) continue;
    const lower = msg.toLowerCase();

    if (!context.domain) {
      if (lower.match(/\b(skin|acne|oily|dry|pigment|face|dark spot|spots)\b/)) context.domain = "skin";
      else if (lower.match(/\b(hair|dandruff|scalp|shampoo)\b/)) context.domain = "hair";
      else if (lower.match(/\b(body|soap|bath|wash)\b/)) context.domain = "body";
    }

    if (!context.skinType) {
      if (lower.match(/\b(oily)\b/)) context.skinType = "oily";
      else if (lower.match(/\b(dry)\b/)) context.skinType = "dry";
      else if (lower.match(/\b(combination)\b/)) context.skinType = "combination";
      else if (lower.match(/\b(normal)\b/)) context.skinType = "normal";
      else if (lower.match(/\b(sensitive)\b/)) context.skinType = "sensitive";
      else if (lower.match(/\b(acne[\s-]prone)\b/)) context.skinType = "acne_prone";
    }

    if (!context.concern) {
      if (lower.match(/\b(acne|pimples|breakouts)\b/)) context.concern = "acne";
      else if (lower.match(/\b(pigmentation|dark spots|marks)\b/)) context.concern = "pigmentation";
      else if (lower.match(/\b(dull|dullness|glow)\b/)) context.concern = "dullness";
      else if (lower.match(/\b(aging|wrinkles|fine lines)\b/)) context.concern = "aging";
      else if (lower.match(/\b(barrier|redness|irritated)\b/)) context.concern = "barrier_damage";
      else if (lower.match(/\b(dandruff|flakes|flaky)\b/)) context.concern = "dandruff";
      else if (lower.match(/\b(hair fall|hair loss|weak roots)\b/)) context.concern = "hair_fall";
      else if (lower.match(/\b(frizz|dry hair)\b/)) context.concern = "frizz";
    }

    if (!context.productType) {
      if (lower.match(/\b(serum)\b/)) context.productType = "serum";
      else if (lower.match(/\b(moisturizer|cream|lotion)\b/)) context.productType = "moisturizer";
      else if (lower.match(/\b(sunscreen|spf)\b/)) context.productType = "sunscreen";
      else if (lower.match(/\b(face wash|cleanser|soap)\b/)) context.productType = "cleanser";
      else if (lower.match(/\b(shampoo)\b/)) context.productType = "shampoo";
      else if (lower.match(/\b(conditioner)\b/)) context.productType = "conditioner";
      else if (lower.match(/\b(oil)\b/)) context.productType = "oil";
      else if (lower.match(/\b(lip balm)\b/)) context.productType = "lip_balm";
      else if (lower.match(/\b(foundation)\b/)) context.productType = "foundation";
      else if (lower.match(/\b(lipstick)\b/)) context.productType = "lipstick";
      else if (lower.match(/\b(eye cream)\b/)) context.productType = "eye_care";
    }
  }
  return context;
}

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
    const { message, history = [] } = req.body;

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

    /* ---------- STEP 1.5: RULE-BASED INTENTS ---------- */
    const intentReply = matchIntent(lower, products);
    if (intentReply) {
      return res.json(intentReply);
    }

    /* ---------- STEP 2: CONTEXT-BASED MATCH ---------- */
    // Parse context from newest to oldest message
    const orderedMessages = [message, ...[...history].reverse()];
    const context = extractContext(orderedMessages);

    let intentProducts = [];

    // Apply filters based on context IF we found actionable context beyond just domain
    if (context.skinType || context.concern || context.productType) {
      intentProducts = products;

      if (context.domain) {
        intentProducts = intentProducts.filter(p => !p.category || p.category === context.domain || p.category === "mixed");
      }

      if (context.skinType) {
        intentProducts = intentProducts.filter(p =>
          !p.skin_type_not_suitable?.includes(context.skinType) &&
          (!p.skin_type_suitable || p.skin_type_suitable.length === 0 || p.skin_type_suitable.includes(context.skinType) || p.skin_type_suitable.includes("all"))
        );
      }

      if (context.concern) {
        intentProducts = intentProducts.filter(p =>
          p.concerns_targeted && p.concerns_targeted.some(c => c.includes(context.concern) || context.concern.includes(c))
        );
      }

      if (context.productType) {
        intentProducts = intentProducts.filter(p =>
          p.sub_category === context.productType ||
          (p.product_type && p.product_type.toLowerCase().includes(context.productType.replace("_", " ")))
        );
      }

      if (intentProducts.length > 0) {
        return res.json({
          success: true,
          isProduct: true,
          domain: context.domain || "mixed",
          reply: "Based on what you've told me, here are some products that match your needs:",
          products: intentProducts.slice(0, 3)
        });
      }
    }

    /* ---------- STEP 3: FUZZY SEARCH WITH CONTEXT ---------- */
    const cleaned = cleanQuery(lower);

    // Create an enhanced search query using context if available
    const contextWords = [];
    if (context.skinType) contextWords.push(context.skinType.replace("_", " "));
    if (context.concern) contextWords.push(context.concern.replace("_", " "));
    if (context.productType) contextWords.push(context.productType.replace("_", " "));

    // Fall back to original message if no context
    const searchQuery = contextWords.length > 0 ? contextWords.join(" ") : (cleaned || message);

    const fuseResults = fuse.search(searchQuery);

    if (fuseResults.length > 0) {
      return res.json({
        success: true,
        isProduct: true,
        reply: "Here are some products that may match what you're looking for:",
        products: fuseResults.map(r => r.item).slice(0, 3)
      });
    }

    /* ---------- STEP 4: FALLBACK (NO MORE AI) ---------- */
    return res.json({
      success: true,
      reply: "I'm having trouble finding a specific product for that. Could you tell me more about your skin type or concern (e.g., 'I have dry skin' or 'I want a serum')?"
    });

  } catch (err) {
    console.error("Chat Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};