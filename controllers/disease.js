const Disease = require("../models/disease");
const Plant = require("../models/plant");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// 1. Get All Diseases (Pagination & Limited Fields)
exports.getAllDiseases = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const diseases = await Disease.find()
        .populate("affectedPlants", "name image")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        status: "success",
        results: diseases.length,
        data: { diseases }
    });
});

// 2. Get Disease By ID
exports.getDiseaseById = catchAsync(async (req, res, next) => {
    const disease = await Disease.findById(req.params.id)
        .populate("affectedPlants", "name image");

    if (!disease) {
        return next(new AppError("No disease found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { disease }
    });
});

// 3. Create Disease (Sync with Plants)
exports.createDisease = catchAsync(async (req, res, next) => {
    
    const saved = await Disease.create(req.body);

    
    if (req.body.affectedPlants?.length) {
        await Plant.updateMany(
            { _id: { $in: req.body.affectedPlants } },
            { $addToSet: { diseases: saved._id } }
        );
    }

    res.status(201).json({
        status: "success",
        data: { disease: saved }
    });
});

// 4. Update Disease
exports.updateDisease = catchAsync(async (req, res, next) => {
    const disease = await Disease.findByIdAndUpdate(
        req.params.id, 
        req.body, 
        {
            new: true,
            runValidators: true 
        }
    );

    if (!disease) {
        return next(new AppError("No disease found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { disease }
    });
});

// 5. Delete Disease (Cleanup References)
exports.deleteDisease = catchAsync(async (req, res, next) => {
    const disease = await Disease.findByIdAndDelete(req.params.id);

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