const Category = require('../models/Category');

class CategoryController {
  // Get all categories
  static async getCategories(req, res, next) {
    try {
      const categories = Category.findAll();
      res.json({
        success: true,
        categories: categories.map(c => c.toJSON())
      });
    } catch (err) {
      next(err);
    }
  }

  // Get category by ID or slug
  static async getCategory(req, res, next) {
    try {
      const { idOrSlug } = req.params;
      let category = null;

      if (/^\d+$/.test(idOrSlug)) {
        category = Category.findById(parseInt(idOrSlug, 10));
      } else {
        category = Category.findBySlug(idOrSlug);
      }

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }

      res.json({
        success: true,
        category: category.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Create category (Admin)
  static async createCategory(req, res, next) {
    try {
      const { name, slug, description, imageUrl } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, message: 'Category name is required.' });
      }

      const category = Category.create({ name, slug, description, imageUrl });
      res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        category: category.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Update category (Admin)
  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const category = Category.findById(id);

      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found.' });
      }

      const { name, slug, description, imageUrl } = req.body;
      category.update({
        name: name || category.name,
        slug: slug || category.slug,
        description: description !== undefined ? description : category.description,
        imageUrl: imageUrl !== undefined ? imageUrl : category.imageUrl
      });

      res.json({
        success: true,
        message: 'Category updated successfully.',
        category: category.toJSON()
      });
    } catch (err) {
      next(err);
    }
  }

  // Delete category (Admin)
  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;
      Category.delete(id);

      res.json({
        success: true,
        message: 'Category deleted successfully.'
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = CategoryController;
