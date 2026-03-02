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
      name,
      category,
      concern,
      type,
      ingredient,
      step,
      priceMin,
      priceMax,
      inStock,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (category && category !== 'all') {
      const cats = category.split(',').map(c => c.trim().toLowerCase());
      query.category = { $in: cats };
    }

    if (concern) {
      const concernsArray = concern.split(',').map(c => c.trim());
      query.concerns_targeted = { $in: concernsArray };
    }

    if (type) {
      const typesArray = type.split(',').map(t => t.trim());
      query.product_type = { $in: typesArray };
    }

    if (ingredient) {
      const ingredientsArray = ingredient.split(',').map(i => i.trim());
      query.$or = [
        { "ingredients.key_actives": { $in: ingredientsArray } },
        { "ingredients.botanical_extracts": { $in: ingredientsArray } },
        { "ingredients.others": { $in: ingredientsArray } }
      ];
    }

    if (step) {
      const stepsArray = step.split(',').map(s => s.trim());
      query["usage.routine_step"] = { $in: stepsArray };
    }

    if (inStock === 'true') {
      query.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      query.stock = 0;
    }

    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = Number(priceMin);
      if (priceMax) query.price.$lte = Number(priceMax);
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'best_selling') sortObj = { ratingCount: -1 };

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
    }).lean();

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
