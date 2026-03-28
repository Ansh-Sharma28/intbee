const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: true,
      index: true
    },

    integrand: {
      type: String,
      required: true,
      trim: true,
      index: true,
      set: (v) =>
        v
          .replace(/\s+/g, "")
          .replace(/\\left|\\right/g, "")
          .replace(/\\,/g, "")
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.length === 4;
        },
        message: "Options must contain exactly 4 items"
      }
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          return this.options.includes(value);
        },
        message: "correctAnswer must be one of the options"
      }
    },

    verified: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

/*
Indexes for fast queries
*/
QuestionSchema.index({ difficulty: 1, createdAt: 1 });
QuestionSchema.index({ difficulty: 1, verified: 1 });

/*
Prevent duplicate integrands
*/
QuestionSchema.index(
  { difficulty: 1, integrand: 1 },
  { unique: true, name: "unique_integral_per_difficulty" }
);

module.exports = mongoose.model("Question", QuestionSchema);