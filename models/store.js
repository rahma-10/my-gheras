const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    description: { type: String, required: true },

    category: {
      type: String,
      enum: ["أسمدة", "تربة", "بذور", "أدوات", "علاجات"],
      required: true,
    },

    price: { type: Number, required: true, min: 0 },

    discount: {
      type: discountSchema,
      default: () => ({ type: "none", value: 0 }),
    },

    stock: { type: Number, default: 0, min: 0 },

    images: [{ type: String }],

    relatedPlants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Plant",
      },
    ],

    relatedFertilizers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fertilizer",
      },
    ],

    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);


module.exports = mongoose.model("Store", storeSchema);