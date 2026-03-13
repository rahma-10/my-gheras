const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "العنوان مطلوب"],
        trim: true
    },

    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },

    content: {
        type: String,
        required: [true, "محتوى المقال مطلوب"]
    },

    image: {
        type: String
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    tags: [String],

    category: {
        type: String,
        required: true
    },

    isPublished: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

blogSchema.pre("save", function (next) {

    if (!this.isModified("title")) return next();

    this.slug = this.title
        .toLowerCase()
        .replace(/[^\w\u0621-\u064A\s]/g, "")
        .replace(/\s+/g, "-");

    next();
});

module.exports = mongoose.model("Blog", blogSchema);