const Article = require("../models/Article");

const getTopArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({})
      .sort({ featured: -1, publishedAt: -1 })
      .limit(6)
      .lean();
    res.json({ success: true, articles });
  } catch (error) {
    next(error);
  }
};

const getAllArticles = async (req, res, next) => {
  try {
    const articles = await Article.find({}).sort({ publishedAt: -1 }).lean();
    res.json({ success: true, articles });
  } catch (error) {
    next(error);
  }
};

const getArticleBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const article = await Article.findOne({ slug }).lean();
    if (!article)
      return res
        .status(404)
        .json({ success: false, message: "Article not found" });
    res.json({ success: true, article });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTopArticles, getAllArticles, getArticleBySlug };
