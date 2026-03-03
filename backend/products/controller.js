import Product from "./models.js";

/**
 * CREATE PRODUCT
 * POST /api/products
 * (admin only – assumed)
 */
export const createProduct = async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      isActive: true, // force default, don’t trust client
    });

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET ALL PRODUCTS
 * GET /api/products
 * supports search, filter, pagination
 */
export const getAllProducts = async (req, res) => {
  try {
    const {
      search,
      name,
      category,
      sub_category,
      concern,
      type,
      ingredient,
      priceMax,
      inStock,
      sort = "best_selling",
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };
    const andConditions = [];

    if (search) {
      const s = String(search);
      andConditions.push({
        $or: [
          { name: { $regex: s, $options: "i" } },
          { description: { $regex: s, $options: "i" } },
          { brand: { $regex: s, $options: "i" } },
        ]
      });
    }

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (category && category !== 'all') {
      const cats = category.split(',').map(c => c.trim().toLowerCase());
      query.category = { $in: cats };
    }

    if (sub_category) {
      const subCats = sub_category.split(',').map(c => c.trim().toLowerCase());
      const regexSubCats = subCats.map(c => new RegExp(`^${c}$`, "i"));
      query.sub_category = { $in: regexSubCats };
    }

    if (concern) {
      const concernsArray = concern.split(',').map(c => c.trim());
      const regexConcerns = concernsArray.map(c => new RegExp(`^${c}$`, "i"));
      query.concerns_targeted = { $in: regexConcerns };
    }

    if (type) {
      const typesArray = type.split(',').map(t => t.trim());
      const regexTypes = typesArray.map(t => new RegExp(`^${t}$`, "i"));
      query.product_type = { $in: regexTypes };
    }

    if (ingredient) {
      const ingredientsArray = ingredient.split(',').map(i => i.trim());
      const regexIngredients = ingredientsArray.map(i => new RegExp(`^${i}$`, "i"));
      andConditions.push({
        $or: [
          { "ingredients.key_actives": { $in: regexIngredients } },
          { "ingredients.botanical_extracts": { $in: regexIngredients } },
          { "ingredients.others": { $in: regexIngredients } }
        ]
      });
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    if (priceMax) {
      query.price = { ...(query.price || {}), $lte: Number(priceMax) };
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const sortMap = {
      best_selling: { ratingCount: -1, rating: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      newest: { createdAt: -1 },
    };

    const sortObj = sortMap[sort] || sortMap.best_selling;

    const numLimit = Number(limit);
    const numPage = Number(page);
    const skip = numLimit ? (numPage - 1) * numLimit : 0;

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(numLimit)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: numPage,
      totalPages: numLimit ? Math.ceil(total / numLimit) : 1,
      products: products,
      data: products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * GET PRODUCT BY PID
 * GET /api/products/:pid
 */
export const getProductByPid = async (req, res) => {
  try {
    const product = await Product.findOne({
      pid: req.params.pid,
      isActive: true,
    })
      .populate("reviews.user", "name")
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Map populated user object to just the name string for the frontend
    if (product.reviews && product.reviews.length > 0) {
      product.reviews = product.reviews.map(r => ({
        ...r,
        user: r.user?.name || "Verified Buyer"
      }));
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * UPDATE PRODUCT BY PID
 * PATCH /api/products/:pid
 */
export const updateProductByPid = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { pid: req.params.pid, isActive: true },
      req.body, // safe ONLY because Zod blocks forbidden fields
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * DELETE PRODUCT BY PID (SOFT DELETE)
 * DELETE /api/products/:pid
 */
export const deleteProductByPid = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { pid: req.params.pid, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      message: "Product deactivated",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * ADD REVIEW TO PRODUCT
 * POST /api/products/:pid/reviews
 */
export const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findOne({ pid: req.params.pid, isActive: true });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: "Product already reviewed" });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment: comment || "",
    };

    product.reviews.push(review);
    product.ratingCount = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: "Review added" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
