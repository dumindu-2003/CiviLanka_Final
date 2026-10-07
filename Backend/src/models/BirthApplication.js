const mongoose = require("mongoose");

const birthApplicationSchema = new mongoose.Schema(
  {
    applicationReference: { type: String, required: true, unique: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    motherName: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    birthName: { type: String, required: true, trim: true },
    birthDate: { type: String, required: true, trim: true },
    birthTime: { type: String, required: true, trim: true },
    hospitalName: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["open", "approved", "rejected"],
      default: "open",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
  },
  { collection: "BirthApplication" }
);

module.exports = mongoose.model("BirthApplication", birthApplicationSchema);
