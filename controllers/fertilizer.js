const Fertilizer = require("../models/fertilizer");
const Plant = require("../models/plant");

exports.getAllFertilizers = async (req, res) => {
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const fertilizers = await Fertilizer.find()
        .select("name type image")
        .populate("suitablePlants", "commonName")
        .skip(skip)
        .limit(limit);

    const total = await Fertilizer.countDocuments();

    res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: fertilizers
    });
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
};

// 2. Get Fertilizer By ID
exports.getFertilizerById = catchAsync(async (req, res, next) => {
    const fertilizer = await Fertilizer.findById(req.params.id)
        .populate("suitablePlants", "name image");

    if (!fertilizer) {
        return res.status(404).json({ message: "Fertilizer not found" });
    }

    res.json(fertilizer);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }

exports.createFertilizer = async (req, res) => {
    try {
    if (req.file) {
        req.body.image = "uploads/" + req.file.filename;
    }
    const fertilizer = new Fertilizer(req.body);
    const saved = await fertilizer.save();

    if (saved.suitablePlants && saved.suitablePlants.length > 0) {
        await Plant.updateMany(
            { _id: { $in: saved.suitablePlants } },
            { $addToSet: { fertilizers: saved._id } }
        );
    }

    res.status(201).json(saved);
    } catch (error) {
    res.status(400).json({ message: error.message });
    }

exports.updateFertilizer = async (req, res) => {
    try {
    if (req.file) {
        req.body.image = "uploads/" + req.file.filename;
    }
    const fertilizer = await Fertilizer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
            new: true, 
            runValidators: true 
        }
    );

    if (!fertilizer) {
        return res.status(404).json({ message: "Fertilizer not found" });
    }

    res.json(fertilizer);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }

exports.deleteFertilizer = async (req, res) => {
    try {
    const deletedFertilizer = await Fertilizer.findByIdAndDelete(req.params.id);

    if (!deletedFertilizer) {
        return res.status(404).json({ message: "Fertilizer not found" });
    }

    await Plant.updateMany(
        { fertilizers: deletedFertilizer._id },
        { $pull: { fertilizers: deletedFertilizer._id } }
    );

    if (!fertilizer) {
        return next(new AppError("No fertilizer found with that ID", 404));
    }

    await Plant.updateMany(
        { fertilizers: fertilizer._id },
        { $pull: { fertilizers: fertilizer._id } }
    );

    res.status(204).json({
        status: "success",
        message: "Fertilizer deleted and references removed"
    });
});