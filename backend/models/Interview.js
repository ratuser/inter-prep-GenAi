const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: [true, 'Interview title is required'],
        trim: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['technical', 'behavioral', 'system-design', 'communication'],
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    questionsCount: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model('Interview', interviewSchema);
