const Plant = require('../models/plant');
const Disease = require('../models/disease');
const Fertilizer = require('../models/fertilizer');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// 1. Get All Plants (Pagination & Optimized Populate)
exports.getAllPlants = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const plants = await Plant.find()
        .populate("fertilizers", "name image")
        .populate("diseases", "name image")
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        status: "success",
        results: plants.length,
        data: { plants }
    });
});

// 2. Get Plant By ID
exports.getPlantById = catchAsync(async (req, res, next) => {
    const plant = await Plant.findById(req.params.id)
        .populate("fertilizers", "name image")
        .populate("diseases", "name image");

    if (!plant) {
        return next(new AppError("No plant found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { plant }
    });
});

// 3. Create Plant (With Mutual Relationship Sync)
exports.createPlant = catchAsync(async (req, res, next) => {
    const savedPlant = await Plant.create(req.body);

    if (req.body.diseases?.length) {
        await Disease.updateMany(
            { _id: { $in: req.body.diseases } },
            { $addToSet: { affectedPlants: savedPlant._id } }
        );
    }

    if (req.body.fertilizers?.length) {
        await Fertilizer.updateMany(
            { _id: { $in: req.body.fertilizers } },
            { $addToSet: { suitablePlants: savedPlant._id } }
        );
    }

    res.status(201).json({
        status: "success",
        data: { plant: savedPlant }
    });
});

// 4. Update Plant
exports.updatePlant = catchAsync(async (req, res, next) => {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!plant) {
        return next(new AppError("No plant found with that ID", 404));
    }

    if (req.body.diseases) {
        await Disease.updateMany(
            { _id: { $in: req.body.diseases } },
            { $addToSet: { affectedPlants: plant._id } }
        );
    }

    if (req.body.fertilizers) {
        await Fertilizer.updateMany(
            { _id: { $in: req.body.fertilizers } },
            { $addToSet: { suitablePlants: plant._id } }
        );
    }

    res.status(200).json({
        status: "success",
        data: { plant }
    });
});

// 5. Delete Plant (With Relationship Cleanup)
exports.deletePlant = catchAsync(async (req, res, next) => {
    const plant = await Plant.findByIdAndDelete(req.params.id);

    if (!plant) {
        return next(new AppError("No plant found with that ID", 404));
    }

    
    await Disease.updateMany(
        { affectedPlants: plant._id },
        { $pull: { affectedPlants: plant._id } }
    );

    
    await Fertilizer.updateMany(
        { suitablePlants: plant._id },
        { $pull: { suitablePlants: plant._id } }
    );

    res.status(204).json({
        status: "success",
        data: null
    });
});