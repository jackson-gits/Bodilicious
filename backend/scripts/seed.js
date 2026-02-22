import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../products/models.js';

dotenv.config();

const sampleProducts = [
    {
        pid: "bp-001",
        name: "Kumkumadi Radiance Face Oil",
        images: [
            "https://images.pexels.com/photos/5980590/pexels-photo-5980590.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/5980588/pexels-photo-5980588.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        description: "An authentic Ayurvedic formulation combining 21 potent herbs including saffron, sandalwood, and licorice. This nighttime miracle oil naturally illuminates the complexion, diminishes fine lines, and perfectly balances uneven skin tone. Sourced directly from Kerala's tradition of beauty.",
        uses: [
            "Massage 2-3 drops onto cleansed face and neck",
            "Use as the final step in nighttime routine",
            "Can be mixed with moisturizer for a daytime glow",
        ],
        symptomsCured: ["Dullness", "Pigmentation", "Uneven Texture", "Fine Lines"],
        ingredients: ["Kashmiri Saffron", "Sandalwood", "Manjistha", "Licorice", "Sesame Oil"],
        type: "skin",
        rating: 4.9,
        ratingCount: 412,
        reviews: [
            { user: "Priya M.", rating: 5, comment: "It literally smells like a temple, and my skin has never looked more alive. My dark spots faded in 3 weeks.", createdAt: "2 days ago" },
            { user: "Anjali S.", rating: 5, comment: "The holy grail of my skincare routine. Just 2 drops is enough, so the bottle lasts a long time.", createdAt: "1 week ago" }
        ],
        price: 1899,
        stock: 45,
    },
    {
        pid: "bp-002",
        name: "Bhringraj Scalp Revival Oil",
        images: [
            "https://images.pexels.com/photos/3993444/pexels-photo-3993444.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        description: "The 'King of Herbs' for hair, Bhringraj is slowly infused in a base of cold-pressed coconut and sesame oils for 48 hours. This intensive treatment deeply nourishes hair roots, promotes robust growth, and prevents premature greying naturally.",
        uses: [
            "Warm oil slightly before application",
            "Massage into scalp and leave overnight",
            "Wash with a mild herbal cleanser the next morning",
        ],
        symptomsCured: ["Hair Fall", "Premature Greying", "Dry Scalp", "Thinning"],
        ingredients: ["Bhringraj", "Amla", "Brahmi", "Coconut Oil", "Sesame Oil"],
        type: "hair",
        rating: 4.8,
        ratingCount: 567,
        reviews: [
            { user: "Divya K.", rating: 5, comment: "I've struggled with postpartum hair loss, and this is the only thing that worked. My baby hair is finally growing back.", createdAt: "3 days ago" },
            { user: "Rohan V.", rating: 4, comment: "Strong herbal smell, but the results on my thinning crown are undeniable.", createdAt: "2 weeks ago" }
        ],
        price: 899,
        stock: 120,
    },
    {
        pid: "bp-003",
        name: "Rose Hip Glow Serum",
        images: [
            "https://images.pexels.com/photos/5217935/pexels-photo-5217935.jpeg?auto=compress&cs=tinysrgb&w=800",
            "https://images.pexels.com/photos/5217933/pexels-photo-5217933.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        description: "A lightweight, fast-absorbing elixir packed with natural Vitamin C and essential fatty acids. Designed to deeply hydrate while promoting collagen synthesis, leaving skin with a bouncy, dewy finish without any greasy residue.",
        uses: [
            "Apply 4-5 drops to damp skin morning and night",
            "Press gently until fully absorbed",
            "Follow with sunscreen in the morning",
        ],
        symptomsCured: ["Dryness", "Loss of Firmness", "Dullness"],
        ingredients: ["Cold-Pressed Rose Hip Seed Oil", "Vitamin E", "Geranium Extract"],
        type: "skin",
        rating: 4.7,
        ratingCount: 238,
        reviews: [
            { user: "Neha C.", rating: 5, comment: "Finally, an oil that doesn't break me out! My skin looks like glass.", createdAt: "5 days ago" }
        ],
        price: 1299,
        stock: 0,
    },
    {
        pid: "bp-004",
        name: "Turmeric & Saffron Body Butter",
        images: [
            "https://images.pexels.com/photos/6621461/pexels-photo-6621461.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        description: "An incredibly rich, deeply moisturizing body balm that harnesses the anti-inflammatory power of Kasturi Turmeric and the brightening properties of Saffron. Whipped to perfection with raw Shea butter to melt instantly into dry skin.",
        uses: [
            "Massage generously into body after bathing",
            "Focus on dry areas like elbows, knees, and heels",
        ],
        symptomsCured: ["Rough Patches", "Extreme Dryness", "Body Pigmentation"],
        ingredients: ["Raw Shea Butter", "Kasturi Turmeric", "Saffron Extract", "Almond Oil"],
        type: "other",
        rating: 4.6,
        ratingCount: 189,
        reviews: [
            { user: "Sneha W.", rating: 5, comment: "Cured my winter eczema completely. The texture is whipped perfection.", createdAt: "1 month ago" },
            { user: "Kriti B.", rating: 4, comment: "Very heavy, best used at night.", createdAt: "1 month ago" }
        ],
        price: 949,
        stock: 65,
    },
    {
        pid: "bp-005",
        name: "Onion & Keratin Hair Serum",
        images: [
            "https://images.pexels.com/photos/3735657/pexels-photo-3735657.jpeg?auto=compress&cs=tinysrgb&w=800",
        ],
        description: "A powerful daily serum that tackles frizz and controls breakage. The sulfur-rich Red Onion extract strengthens hair strands while plant-derived Keratin smoothes the cuticle for a brilliant, silky shine.",
        uses: [
            "Apply 2 pumps to damp, towel-dried hair",
            "Distribute evenly through mid-lengths to ends",
            "Do not rinse",
        ],
        symptomsCured: ["Frizz", "Split Ends", "Breakage"],
        ingredients: ["Red Onion Extract", "Plant Keratin", "Argan Oil", "Jojoba Oil"],
        type: "hair",
        rating: 4.6,
        ratingCount: 304,
        reviews: [
            { user: "Pooja R.", rating: 5, comment: "The only thing that tames my frizzy curls in the humidity. Doesn't weigh my hair down at all.", createdAt: "2 days ago" }
        ],
        price: 749,
        stock: 8,
    }
];

mongoose
    .connect(process.env.MONGO_URI, {
        dbName: process.env.DB_NAME,
    })
    .then(async () => {
        console.log("MongoDB connected");
        await Product.deleteMany({});

        // We must bypass user validation inside reviewSchema as the mock users aren't seeded.
        const rawProducts = sampleProducts.map(p => {
            // Strip reviews to avoid `required` Object ID failures if needed, or bypass.
            // Easiest is to bypass reviews for the quick seed, or seed them differently.
            return { ...p, reviews: [] };
        });

        await Product.insertMany(rawProducts);
        console.log("Seeded database with fallback products!");
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
