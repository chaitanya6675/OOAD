const Product = require('../models/Product');

class ProductController {
  // List products with search, category, price filtering, sorting, and pagination
  static async getProducts(req, res, next) {
    try {
      const {
        search,
        category,
        minPrice,
        maxPrice,
        inStockOnly,
        sortBy,
        page,
        limit
      } = req.query;

      const result = Product.findAll({
        search,
        categoryId: category ? parseInt(category, 10) : null,
        minPrice,
        maxPrice,
        inStockOnly: inStockOnly === 'true' || inStockOnly === true,
        sortBy: sortBy || 'newest',
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 12
      });

      res.json({
        success: true,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }

  // Get single product details
  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = Product.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.'
        });
      }

      res.json({
        success: true,
        product: product.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Create Product (Admin)
  static async createProduct(req, res, next) {
    try {
      const { productCode, name, description, categoryId, price, stockQuantity, imageUrl, isAvailable } = req.body;

      if (!name || !categoryId || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Product name, category, and price are required.'
        });
      }

      const product = Product.create({
        productCode,
        name,
        description,
        categoryId: parseInt(categoryId, 10),
        price: parseFloat(price),
        stockQuantity: parseInt(stockQuantity || 0, 10),
        imageUrl,
        isAvailable: isAvailable !== undefined ? (isAvailable ? 1 : 0) : 1
      });

      res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        product: product.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Update Product (Admin)
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = Product.findById(id);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      const { name, description, categoryId, price, imageUrl, isAvailable } = req.body;

      product.update({
        name: name || product.name,
        description: description !== undefined ? description : product.description,
        categoryId: categoryId ? parseInt(categoryId, 10) : product.categoryId,
        price: price !== undefined ? parseFloat(price) : product.price,
        imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl,
        isAvailable: isAvailable !== undefined ? isAvailable : product.isAvailable
      });

      res.json({
        success: true,
        message: 'Product updated successfully.',
        product: product.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete Product (Admin)
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = Product.findById(id);

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }

      Product.delete(id);

      res.json({
        success: true,
        message: 'Product deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ProductController;
