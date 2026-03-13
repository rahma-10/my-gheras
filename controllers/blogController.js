const Blog = require("../models/blogsModel");
const cloudinary = require("../config/cloudinary");

// Create Blog
exports.createBlog = async (req, res) => {
    try {

        if (!req.body.title || !req.body.content || !req.body.category) {
            return res.status(400).json({
                message: "title, content, category مطلوبين"
            });
        }

        let imageUrl = "";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        const blog = await Blog.create({
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            tags: req.body.tags ? req.body.tags.split(",") : [],
            image: imageUrl,
            author: req.user ? req.user.id : null
        });

        res.status(201).json({
            message: "Blog created successfully",
            data: blog
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server Error",
            error: error.message
        });
    }
};

// Get All Blogs
exports.getBlogs = async (req, res) => {
    try {

        const blogs = await Blog.find()
            .populate("author", "name email");

        res.status(200).json({
            results: blogs.length,
            data: blogs
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Get Blog by Slug
exports.getBlogBySlug = async (req, res) => {
    try {

        const blog = await Blog.findOne({ slug: req.params.slug })
            .populate("author", "name email");

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.status(200).json(blog);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Update Blog
exports.updateBlog = async (req, res) => {
    try {

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            blog.image = result.secure_url;
        }

        blog.title = req.body.title || blog.title;
        blog.content = req.body.content || blog.content;
        blog.category = req.body.category || blog.category;
        blog.tags = req.body.tags ? req.body.tags.split(",") : blog.tags;

        if (req.body.isPublished !== undefined) {
            blog.isPublished = req.body.isPublished;
        }

        await blog.save();

        res.status(200).json({
            message: "Blog updated",
            data: blog
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
    try {

        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.status(200).json({
            message: "Blog deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};