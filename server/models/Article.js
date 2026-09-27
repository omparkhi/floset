const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  summary: { type: String },
  content: { type: String },
  tag: { type: String },
  image: { type: String },
  readTime: { type: String },
  sourceName: { type: String },
  sourceUrl: { type: String },
  sourcePublishedAt: { type: Date },
  publishedAt: { type: Date, default: Date.now },
  featured: { type: Boolean, default: false },
});

module.exports = mongoose.model("Article", ArticleSchema);
