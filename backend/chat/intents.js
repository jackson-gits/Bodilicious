export const matchIntent = (message, products) => {
    const text = message.toLowerCase().trim();

    // Helper to format recommendations
    const recommend = (productsList, messageText) => {
        return {
            success: true,
            isRuleBased: true,
            reply: messageText,
            products: productsList.slice(0, 3)
        };
    };

    const pureText = (messageText) => {
        return {
            success: true,
            isRuleBased: true,
            reply: messageText
        };
    };

    // --- SKIN TYPE & ROUTINE DISCOVERY ---

    const rules = [
        {
            patterns: [/best (product |skincare )?(for )?(oily|dry|combination|normal|sensitive|acne-prone|acne prone) skin/i, /i have (oily|dry|combination|normal|sensitive|acne-prone|acne prone) skin/i],
            handler: (match) => {
                let type = match[match.length - 1].replace("-", "_").replace(" ", "_").toLowerCase();
                if (type === "acne_prone") type = "acne_prone";
                const filtered = products.filter(p => (p.skin_type_suitable || []).includes(type));
                return recommend(filtered, `For ${type.replace("_", "-")} skin, we have some excellent options tailored perfectly for you. Check these out:`);
            }
        },
        {
            patterns: [/morning (skincare )?routine/i, /am routine/i],
            handler: () => {
                const amProducts = products.filter(p => p.usage?.time?.includes("AM") || p.usage?.time?.includes("AM & PM"));
                return recommend(amProducts, "A simple morning routine is: Cleanser → Serum (like Vitamin C) → Moisturizer → Sunscreen. Here are some top picks for your AM routine:");
            }
        },
        {
            patterns: [/night (skincare )?routine/i, /pm routine/i],
            handler: () => {
                const pmProducts = products.filter(p => p.usage?.time?.includes("PM") || p.usage?.time?.includes("AM & PM"));
                return recommend(pmProducts, "At night, your skin recovers. A good routine is: Cleanser → Treatment Serum (like Retinol or AHA/BHA) → Moisturizer. Here are some great PM products:");
            }
        },
        {
            patterns: [/(new to skincare|skincare beginners?|what products do i actually need)/i],
            handler: () => {
                const basics = products.filter(p => ["cleanser", "moisturizer", "sunscreen"].includes(p.sub_category));
                return recommend(basics, "If you're new to skincare, keep it simple! All you really need is C-M-S: Cleanser, Moisturizer, and Sunscreen. Start with these basics:");
            }
        },
        {
            patterns: [/skip moisturizer( if i use a serum)?/i],
            handler: () => pureText("It's highly recommended NOT to skip moisturizer. Serums deliver active ingredients, but moisturizers lock them directly into your skin while repairing the barrier.")
        },

        // --- CONCERN-BASED QUESTIONS ---

        {
            patterns: [/(dark spots|pigmentation)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).some(c => c.includes("pigmentation") || c.includes("dark_spots")));
                return recommend(treats, "To fade dark spots and pigmentation, look for ingredients like Vitamin C, Niacinamide, or Azelaic Acid, and ALWAYs use sunscreen. Here are the best matches:");
            }
        },
        {
            patterns: [/(acne|blackheads|pimples)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).some(c => c.includes("acne") || c.includes("blackheads")));
                return recommend(treats, "For acne and blackheads, Salicylic Acid (BHA) is your best friend as it unclogs pores deeply. These products can help:");
            }
        },
        {
            patterns: [/(oiliness|excess oil|oily face)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).includes("oil_control"));
                return recommend(treats, "To control excess oil without drying out your skin, Salicylic Acid and Niacinamide are incredible. Check out these options:");
            }
        },
        {
            patterns: [/(dull skin|dullness|glowing skin)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).includes("dullness"));
                return recommend(treats, "For a brighter, glowing complexion, Vitamin C or exfoliating acids (AHA/BHA) are exactly what you need. These can help revive dull skin:");
            }
        },
        {
            patterns: [/(anti-aging|anti aging|fine lines|wrinkles)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).some(c => c.includes("aging") || c.includes("fine_lines")));
                return recommend(treats, "Retinol and Peptides are the gold standards for targeting fine lines and anti-aging. Here are our top anti-aging products:");
            }
        },
        {
            patterns: [/(damaged barrier|skin barrier)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).includes("barrier_damage"));
                return recommend(treats, "A damaged barrier needs ceramides, peptides, and deep hydration. Skip active serums (like acids/retinol) until your skin feels normal. Here is our best barrier repair product:");
            }
        },

        // --- INGREDIENT-FOCUSED QUESTIONS ---

        {
            patterns: [/niacinamide.*acne/i, /acne.*niacinamide/i],
            handler: () => pureText("Yes! Niacinamide is excellent for acne-prone skin. It regulates sebum (oil) production, reduces inflammation, and helps fade the dark marks left behind by pimples.")
        },
        {
            patterns: [/(vitamin c daily|daily.*vitamin c)/i],
            handler: () => pureText("Absolutely! Vitamin C is best used daily in your morning routine. It provides antioxidant protection against free radicals and makes your sunscreen even more effective.")
        },
        {
            patterns: [/retinol do/i],
            handler: () => pureText("Retinol increases cell turnover and boosts collagen production. It's the most proven ingredient for reducing fine lines, improving texture, and treating acne marks!")
        },
        {
            patterns: [/(salicylic acid safe.*daily|daily.*salicylic acid)/i],
            handler: () => pureText("Yes, salicylic acid is safe for daily use, especially in a face wash or a gentle serum. However, if your skin feels dry, reduce usage to 2–3 times a week.")
        },
        {
            patterns: [/(aha.*bha together|bha.*aha together)/i],
            handler: () => pureText("Yes, they work beautifully together! AHA exfoliates the surface for glowing skin, while BHA penetrates deep into pores to clear oil. Our AHA BHA Serum combines them perfectly.")
        },
        {
            patterns: [/azelaic acid used for/i],
            handler: () => pureText("Azelaic acid is a multi-tasker! It's famously used for reducing redness, fading stubborn pigmentation (like melasma or acne marks), and treating mild acne/rosacea.")
        },
        {
            patterns: [/hyaluronic acid.*oily skin/i],
            handler: () => pureText("Yes! Oily skin needs hydration too, otherwise it produces even MORE oil to compensate. Hyaluronic acid is perfect because it's lightweight and water-based, not greasy.")
        },

        // --- MIXING & LAYERING QUESTIONS ---

        {
            patterns: [/(vitamin c.*retinol|retinol.*vitamin c)/i],
            handler: () => pureText("It's best NOT to layer them at the exact same time. Use Vitamin C in the morning (AM) for protection, and Retinol at night (PM) for repair.")
        },
        {
            patterns: [/(niacinamide.*salicylic|salicylic.*niacinamide)/i],
            handler: () => pureText("Yes, they are a great combo! Salicylic acid clears the pores, and Niacinamide soothes the skin and controls oil. You can layer them safely.")
        },
        {
            patterns: [/(serum.*apply first|apply first.*serum)/i],
            handler: () => pureText("The golden rule of layering is: Thinnest to Thickest. Apply watery/light serums first, let them absorb, and then apply thicker or creamier serums.")
        },
        {
            patterns: [/(more than one serum.*night|multiple serums.*night)/i],
            handler: () => pureText("Yes, you can! However, avoid mixing too many strong actives (like Retinol + AHA/BHA). A good rule is one active serum paired with one hydrating/soothing serum (like Hyaluronic Acid).")
        },
        {
            patterns: [/(not mix.*retinol|retinol.*not mix)/i],
            handler: () => pureText("Do NOT mix Retinol with strong exfoliating acids (AHA/BHA) or Vitamin C in the same routine, as this can severely irritate and damage your skin barrier.")
        },
        {
            patterns: [/(exfoliating serum daily|daily.*exfoliating serum)/i],
            handler: () => pureText("No, we do not recommend using strong chemical exfoliants (like 10%+ AHA/BHA peeling serums) daily. 1-2 times a week at night is plenty to avoid over-exfoliation.")
        },

        // --- SUNSCREEN & AM ROUTINE ---

        {
            patterns: [/(sunscreen if.*serum has spf|serum has spf.*sunscreen)/i],
            handler: () => pureText("If your SPF serum provides complete coverage (like SPF 30+ used generously), you can skip extra sunscreen. But relying on a few drops of serum usually isn't enough protection.")
        },
        {
            patterns: [/(which sunscreen is best for acne|sunscreen.*acne.prone)/i],
            handler: () => {
                const spf = products.filter(p => p.sub_category === "sunscreen" && p.skin_type_suitable?.includes("acne_prone"));
                return recommend(spf, "For acne-prone skin, a lightweight, non-comedogenic liquid sunscreen is best so it doesn't clog your pores.");
            }
        },
        {
            patterns: [/(reapply sunscreen)/i],
            handler: () => pureText("You should reapply sunscreen every 2–3 hours if you are outdoors, sweating, or swimming. If you are indoors away from windows, once a day is generally fine.")
        },
        {
            patterns: [/(skip sunscreen indoors)/i],
            handler: () => pureText("Nope! UVA rays (which cause aging and pigmentation) can easily penetrate glass windows. If you have daylight in your room, you need sunscreen.")
        },
        {
            patterns: [/(sunscreen cause breakouts)/i],
            handler: () => pureText("Only if it's thick, pore-clogging, or if it isn't washed off properly at night! Always double cleanse (use a face wash thoroughly) at night to remove sunscreen.")
        },

        // --- SAFETY & USAGE ---

        {
            patterns: [/(safe for sensitive skin)/i],
            handler: () => pureText("Many of our products are suitable for sensitive skin (like our Hyaluronic Serum and Rose Wash). However, always check the 'skin type not suitable' label and do a patch test first.")
        },
        {
            patterns: [/(patch test)/i],
            handler: () => pureText("To patch test: Apply a tiny amount of the product behind your ear or on your inner forearm. Wait 24 hours to see if any redness or irritation occurs before applying to your face.")
        },
        {
            patterns: [/(how long.*see results|when.*results)/i],
            handler: () => pureText("Skincare requires patience! Hydration is instant, but changes in pigmentation, acne, and fine lines usually take 4 to 8 weeks of consistent use, as your skin needs time to renew.")
        },
        {
            patterns: [/(pregnant women|pregnancy)/i],
            handler: () => pureText("While many hydrators are safe, pregnant women should strictly AVOID Retinol and Salicylic Acid (BHA) above 2%. Please consult your OB-GYN before starting any active skincare.")
        },
        {
            patterns: [/(skin purging|purging.*after using)/i],
            handler: () => pureText("Purging happens when accelerating cell turnover (with Retinol or AHA/BHA). It brings hidden clogs to the surface as tiny whiteheads. It's normal and typically clears up in 4-6 weeks!")
        },
        {
            patterns: [/(tingles or burns)/i],
            handler: () => pureText("Slight tingling for a few seconds is normal with Vitamin C or AHA/BHA. However, if it BURNS, turns extremely red, or hurts, wash it off immediately with cold water. Your barrier might be compromised.")
        },

        // --- HAIR & SCALP DIAGNOSIS ---

        {
            patterns: [/(hair fall|hair loss)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).includes("hair_fall"));
                return recommend(treats, "To combat hair fall, strengthening your roots and nourishing the scalp is crucial. Here are some excellent choices:");
            }
        },
        {
            patterns: [/(oily scalp.*dry hair|oily roots.*dry ends)/i],
            handler: () => pureText("This is a common issue! The trick is to apply shampoo ONLY to your scalp to cut the grease, and apply a rich conditioner or serum ONLY to the mid-lengths and ends of your hair.")
        },
        {
            patterns: [/(dandruff|flake|flaky scalp)/i],
            handler: () => pureText("For dandruff, look for clarifying ingredients or anti-fungal agents. Ensuring your scalp is clean but not overly dry is key. (We are expanding our specific dandruff line soon!)")
        },
        {
            patterns: [/(weak hair roots|weak roots)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).includes("weak_roots"));
                return recommend(treats, "Weak roots need deep nourishment and blood circulation. A good herbal oil massage followed by a strengthening protein shampoo helps massively.");
            }
        },
        {
            patterns: [/(frizz control|frizz)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).includes("frizz"));
                return recommend(treats, "Frizz is usually a sign of dehydration in the hair cuticle. A smoothing serum applied to damp hair works wonders.");
            }
        },

        // --- PRODUCT SELECTION (HAIR) ---

        {
            patterns: [/(shampoo.*daily use|daily shampoo)/i],
            handler: () => pureText("For daily washing, strictly avoid harsh sulfates. You need a very mild, gentle cleanser like our everyday shampoo bar or milk protein shampoo so you don't strip your scalp's natural oils.")
        },
        {
            patterns: [/(shampoo bar.*liquid|liquid.*shampoo bar)/i],
            handler: () => pureText("Shampoo bars are eco-friendly, highly concentrated, and great for travel! Liquid shampoos are more traditional and often easier to lather. Both cleanse effectively depending on your preference.")
        },
        {
            patterns: [/(really need a hair serum|do i need a hair serum)/i],
            handler: () => pureText("If your hair is easily tangled, frizzy, or if you use heat styling, a hair serum is excellent for sealing the hair cuticle, adding shine, and providing a protective coat.")
        },
        {
            patterns: [/(oil.*hair growth)/i],
            handler: () => {
                const treats = products.filter(p => (p.sub_category || "") === "hair_oil");
                return recommend(treats, "Ayurvedic herbs like Bhringraj, Amla, and Rosemary are legendary for hair growth. Our Organic Herbal Hair Oil is packed with these!");
            }
        },
        {
            patterns: [/(hair oil daily|use hair oil daily)/i],
            handler: () => pureText("We don't recommend oiling daily as it can attract dirt and clog scalp follicles. Oiling 2-3 times a week before washing is perfect.")
        },

        // --- USAGE & ROUTINE (HAIR) ---

        {
            patterns: [/(how often.*oil my hair)/i],
            handler: () => pureText("Oiling 1 to 3 times a week is ideal. Massage it gently into your scalp to stimulate blood flow and leave it for at least 30-60 minutes before washing.")
        },
        {
            patterns: [/(how many times.*shampoo|shampoo.*how often)/i],
            handler: () => pureText("For most hair types, washing 2-3 times a week is sufficient. If you work out daily or have a very oily scalp, you can wash more frequently using a mild shampoo.")
        },
        {
            patterns: [/(serum on wet.*dry hair)/i],
            handler: () => pureText("Hair serum is almost always best applied to damp, towel-dried hair. It locks in the moisture and spreads much easier before the hair dries frizzy.")
        },
        {
            patterns: [/(leave oil overnight)/i],
            handler: () => pureText("Yes, you absolutely can! Leaving oil overnight acts as a deep conditioning treatment. Just ensure you protect your pillowcase.")
        },
        {
            patterns: [/(conditioner after shampoo)/i],
            handler: () => pureText("Yes! Shampoo opens the hair cuticle to clean out dirt, and conditioner seals it back up, locking in moisture to prevent breakage and frizz.")
        },

        // --- INGREDIENT QUESTIONS (HAIR) ---

        {
            patterns: [/(bhringraj do)/i],
            handler: () => pureText("Bhringraj is an ancient Ayurvedic herb colloquially known as the 'king of herbs' for hair. It stimulates hair follicles, promotes growth, and helps prevent premature graying and hair fall.")
        },
        {
            patterns: [/(milk protein.*damaged hair)/i],
            handler: () => pureText("Absolutely. Hair is made of a protein called keratin. When damaged by heat or colors, it breaks. Milk protein helps patch and strengthen these damaged bonds, reducing hair fall and breakage.")
        },
        {
            patterns: [/(keratin treatment damage hair)/i],
            handler: () => pureText("Salon keratin treatments involving high heat and strong chemicals (like formaldehyde) can sometimes weaken hair over time. Using natural protein-infused products long-term is much safer.")
        },
        {
            patterns: [/(herbal products safe.*regular)/i],
            handler: () => pureText("Yes, herbal products are typically much gentler than synthetic chemical alternatives and are perfect for regular, long-term use for scalp and hair health.")
        },
        {
            patterns: [/(chemically treated hair)/i],
            handler: () => pureText("Chemically treated hair (colored, rebonded, bleached) needs massive amounts of moisture and protein, and sulfate-free shampoos to prevent color fading and excessive drying.")
        },

        // --- BABY & SENSITIVE ---

        {
            patterns: [/(safe for babies)/i, /(children use this)/i],
            handler: () => pureText("For babies and young children, always opt for our gentlest, fragrance-free products like our Organic Goat Milk Soap. Their skin barriers are very delicate!")
        },
        {
            patterns: [/(okay for sensitive scalp)/i],
            handler: () => pureText("Yes, for a sensitive scalp, we recommend avoiding harsh sulfates and artificial fragrances. Opt for our milk protein or herbal shampoo bar for the gentlest cleanse.")
        },
        {
            patterns: [/(any harsh chemicals)/i],
            handler: () => pureText("At Bodilicious, we consciously formulate our products to avoid harsh synthetic chemicals, parabens, and stripping sulfates. We prioritize safe, effective, and organic ingredients.")
        },

        // --- MAKEUP & LIP CARE ---

        {
            patterns: [/(lip balm.*lip pigmentation)/i, /(lip pigmentation.*lip balm)/i],
            handler: () => {
                const treats = products.filter(p => (p.concerns_targeted || []).includes("lip_pigmentation"));
                return recommend(treats, "To help reduce lip pigmentation, we recommend our naturally tinted options enriched with botanical extracts:");
            }
        },
        {
            patterns: [/(lip balm have spf)/i],
            handler: () => {
                const spfLip = products.filter(p => p.id === "BD-LIP-SUN");
                return recommend(spfLip, "Yes! We specifically have a Sunscreen Lip Balm designed to protect your lips from UV darkening.");
            }
        },
        {
            patterns: [/(lipstick transfer-proof|transfer-proof)/i],
            handler: () => {
                const lipsticks = products.filter(p => (p.sub_category || []).includes("lipstick"));
                return recommend(lipsticks, "Yes, our Liquid Matt and Solid Matt lipsticks are formulated to be long-wearing and transfer-proof!");
            }
        },
        {
            patterns: [/(foundation suit dry skin)/i],
            handler: () => {
                const foundation = products.filter(p => p.sub_category === "foundation");
                return recommend(foundation, "Our Fresh Look Foundation features botanical extracts like Ashwagandha and offers a hydrating, natural finish that works beautifully for dry to combination skin.");
            }
        },
        {
            patterns: [/(makeup safe for daily use)/i],
            handler: () => pureText("Yes! Our makeup is formulated to be lightweight and skin-care infused, so it won’t clog your pores during daily wear. Just remember to double-cleanse at night!")
        }
    ];

    for (let rule of rules) {
        for (let pattern of rule.patterns) {
            if (pattern.test(text)) {
                return rule.handler(text.match(pattern));
            }
        }
    }

    return null; // Return null if nothing matched to let the AI take over
};