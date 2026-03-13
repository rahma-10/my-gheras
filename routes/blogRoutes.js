const express = require("express");
const router = express.Router();

const blogController = require("../controllers/blogController");
const upload = require("../Middlewares/upload"); // multer

// Create Blog (POST /api/blogs)
// image: input name "image"
router.post("/blogs", upload.single("image"), blogController.createBlog);

// Get All Blogs (GET /api/blogs)
router.get("/blogs", blogController.getBlogs);

// Get Blog by Slug (GET /api/blogs/:slug)
router.get("/blogs/:slug", blogController.getBlogBySlug);

// Update Blog (PUT /api/blogs/:id)
// image: input name "image" (optional)
router.put("/blogs/:id", upload.single("image"), blogController.updateBlog);

// Delete Blog (DELETE /api/blogs/:id)
router.delete("/blogs/:id", blogController.deleteBlog);

module.exports = router;