const Fertilizer = require("../models/fertilizer");
const Plant = require("../models/plant");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

// 1. Get All Fertilizers
exports.getAllFertilizers = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const fertilizers = await Fertilizer.find()
        .populate("suitablePlants", "name image") 
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        status: "success",
        results: fertilizers.length,
        data: { fertilizers }
    });
});

// 2. Get Fertilizer By ID
exports.getFertilizerById = catchAsync(async (req, res, next) => {
    const fertilizer = await Fertilizer.findById(req.params.id)
        .populate("suitablePlants", "name image");

    if (!fertilizer) {
        return next(new AppError("No fertilizer found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { fertilizer }
    });
});

// 3. Create Fertilizer 
exports.createFertilizer = catchAsync(async (req, res, next) => {
    const fertilizer = await Fertilizer.create(req.body);

    
    if (req.body.suitablePlants?.length) {
        await Plant.updateMany(
            { _id: { $in: req.body.suitablePlants } },
            { $addToSet: { fertilizers: fertilizer._id } }
        );
    }

    res.status(201).json({
        status: "success",
        data: { fertilizer }
    });
});

// 4. Update Fertilizer
exports.updateFertilizer = catchAsync(async (req, res, next) => {
    const fertilizer = await Fertilizer.findByIdAndUpdate(
        req.params.id,
        req.body,
        { 
            new: true, 
            runValidators: true 
        }
    );

    if (!fertilizer) {
        return next(new AppError("No fertilizer found with that ID", 404));
    }

    res.status(200).json({
        status: "success",
        data: { fertilizer }
    });
});

// 5. Delete Fertilizer 
exports.deleteFertilizer = catchAsync(async (req, res, next) => {
    const fertilizer = await Fertilizer.findByIdAndDelete(req.params.id);

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