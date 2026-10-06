const mongoose = require("mongoose");

const deathReportSchema = new mongoose.Schema(
  {
    reportReference: {
      type: String,
      trim: true,
      default: "",
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nic: {
      type: String,
      trim: true,
      default: "",
    },
    dateOfDeath: {
      type: String,
      required: true,
      trim: true,
    },
    placeOfDeath: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    age: {
      type: Number,
      required: true,
    },
    informantName: {
      type: String,
      required: true,
      trim: true,
    },
    informantNic: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
    },
    informantPhone: {
      type: String,
      required: true,
      trim: true,
    },
    division: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      default: "sent_to_district_registrar",
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
  },
  { collection: "DeathReport" }
);

module.exports = mongoose.model("DeathReport", deathReportSchema);
