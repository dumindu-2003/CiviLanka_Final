const mongoose = require("mongoose");

const nicFormSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["Male", "Female", "Other"],
    },
    placeOfBirth: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    religion: {
      type: String,
      required: true,
      trim: true,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    permanentAddress: {
      type: String,
      default: "",
      trim: true,
    },
    currentAddress: {
      type: String,
      default: "",
      trim: true,
    },
    sameAsPermanent: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    fatherFullName: {
      type: String,
      default: "",
      trim: true,
    },
    fatherNic: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    motherFullName: {
      type: String,
      default: "",
      trim: true,
    },
    motherNic: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    maritalStatus: {
      type: String,
      default: "",
      trim: true,
    },
    birthCertificateName: { type: String, default: "", trim: true },
    birthCertificateMime: { type: String, default: "", trim: true },
    birthCertificateSize: { type: Number, default: 0 },
    proofOfAddressName: { type: String, default: "", trim: true },
    proofOfAddressMime: { type: String, default: "", trim: true },
    proofOfAddressSize: { type: Number, default: 0 },
    passportPhotoName: { type: String, default: "", trim: true },
    passportPhotoMime: { type: String, default: "", trim: true },
    passportPhotoSize: { type: Number, default: 0 },
    previousNicName: { type: String, default: "", trim: true },
    previousNicMime: { type: String, default: "", trim: true },
    previousNicSize: { type: Number, default: 0 },
    applicationReference: { type: String, default: "", trim: true },
    authorizingOfficerName: { type: String, default: "", trim: true },
    authorizingOfficerService: { type: String, default: "", trim: true },
    submittedAt: { type: Date },
    approvedAt: { type: Date, default: null },
    status: {
      type: String,
      default: "draft",
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    collection: "NICForm",
    timestamps: true,
  }
);

module.exports = mongoose.model("NICForm", nicFormSchema);
