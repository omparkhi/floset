const express = require("express");
const router = express.Router();
const {
  getTopArticles,
  getAllArticles,
  getArticleBySlug,
} = require("../controllers/journalController");

router.get("/top", getTopArticles);
router.get("/", getAllArticles);
router.get("/:slug", getArticleBySlug);

module.exports = router;
