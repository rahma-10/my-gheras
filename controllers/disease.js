const Disease = require("../models/disease");
const Plant = require("../models/plant");

exports.getAllDiseases = async (req, res) => {
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const diseases = await Disease.find()
        .select("name scientificName image")
        .populate("affectedPlants", "commonName")
        .skip(skip)
        .limit(limit);

    const total = await Disease.countDocuments();

    res.json({
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        data: diseases
    });
    } catch (error) {
    res.status(500).json({ message: error.message });
    }
};

// 2. Get Disease By ID
exports.getDiseaseById = catchAsync(async (req, res, next) => {
    const disease = await Disease.findById(req.params.id)
        .populate("affectedPlants", "name image");

    if (!disease) {
        return res.status(404).json({ message: "Disease not found" });
    }

    res.json(disease);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }

exports.createDisease = async (req, res) => {
    try {
    if (req.file) {
        req.body.image = "uploads/" + req.file.filename;
    }
    const disease = new Disease(req.body);
    const saved = await disease.save();

    if (saved.affectedPlants && saved.affectedPlants.length > 0) {
        await Plant.updateMany(
            { _id: { $in: saved.affectedPlants } },
            { $addToSet: { diseases: saved._id } }
        );
    }

    res.status(201).json(saved);
    } catch (error) {
    res.status(400).json({ message: error.message });
    }

exports.updateDisease = async (req, res) => {
    try {
    if (req.file) {
        req.body.image = "uploads/" + req.file.filename;
    }
    const disease = await Disease.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {
            new: true,
            runValidators: true 
        }
    );

    if (!disease) {
        return res.status(404).json({ message: "Disease not found" });
    }

    res.json(disease);
    } catch (error) {
    res.status(500).json({ message: error.message });
    }

exports.deleteDisease = async (req, res) => {
    try {
    const deletedDisease = await Disease.findByIdAndDelete(req.params.id);

    if (!deletedDisease) {
        return res.status(404).json({ message: "Disease not found" });
    }

    await Plant.updateMany(
        { diseases: deletedDisease._id },
        { $pull: { diseases: deletedDisease._id } }
    );

    if (!disease) {
        return next(new AppError("No disease found with that ID", 404));
    }

    
    await Plant.updateMany(
        { diseases: disease._id },
        { $pull: { diseases: disease._id } }
    );

    res.status(204).json({
        status: "success",
        data: null
    });
});