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
      type,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10,
    } = req.query;

    const query = { isActive: true };

    if (name) {
      query.name = { $regex: name, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      data: products,
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
