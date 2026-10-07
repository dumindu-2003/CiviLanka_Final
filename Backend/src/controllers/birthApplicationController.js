const BirthApplication = require("../models/BirthApplication");

const GENDERS = ["Male", "Female", "Other"];
const STATUSES = ["open", "approved", "rejected"];

function clean(value) {
  return String(value || "").trim();
}

function validBirthDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(clean(value));
  if (!match) {
    return false;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    year >= 1900 &&
    date <= today
  );
}

function applicationErrors(body) {
  const errors = {};
  const requiredFields = {
    fatherName: "father's name",
    motherName: "mother's name",
    address: "address",
    birthName: "child's name",
    hospitalName: "hospital name",
  };
  for (const [field, label] of Object.entries(requiredFields)) {
    if (clean(body[field]).length < 2) {
      errors[field] = `Enter the ${label}.`;
    }
  }
  if (!GENDERS.includes(body.gender)) {
    errors.gender = "Select a gender.";
  }
  if (!validBirthDate(body.birthDate)) {
    errors.birthDate = "Enter a valid date of birth as DD/MM/YYYY.";
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(clean(body.birthTime))) {
    errors.birthTime = "Select a valid time of birth.";
  }
  return errors;
}

function publicApplication(application) {
  return {
    id: application._id,
    applicationReference: application.applicationReference,
    fatherName: application.fatherName,
    motherName: application.motherName,
    address: application.address,
    gender: application.gender,
    birthName: application.birthName,
    birthDate: application.birthDate,
    birthTime: application.birthTime,
    hospitalName: application.hospitalName,
    status: application.status,
    statusCode: application.status,
    submittedAt: application.submittedAt,
    reviewedAt: application.reviewedAt,
  };
}

function districtRegistrarOnly(req, res) {
  if (req.user.role === "district_registrar") {
    return true;
  }
  res.status(403).json({
    success: false,
    message: "Only a district registrar can manage birth applications.",
  });
  return false;
}

async function listBirthApplications(req, res) {
  try {
    if (!districtRegistrarOnly(req, res)) {
      return;
    }
    const applications = await BirthApplication.find({})
      .sort({ submittedAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      applications: applications.map(publicApplication),
    });
  } catch (error) {
    console.error("Could not load birth applications:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load birth applications.",
    });
  }
}

async function createBirthApplication(req, res) {
  try {
    if (!districtRegistrarOnly(req, res)) {
      return;
    }
    const errors = applicationErrors(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const application = new BirthApplication({
      applicationReference: "",
      fatherName: clean(req.body.fatherName),
      motherName: clean(req.body.motherName),
      address: clean(req.body.address),
      gender: req.body.gender,
      birthName: clean(req.body.birthName),
      birthDate: clean(req.body.birthDate),
      birthTime: clean(req.body.birthTime),
      hospitalName: clean(req.body.hospitalName),
      status: "open",
      createdBy: req.user._id,
    });
    application.applicationReference = `BAP-${new Date().getFullYear()}-${application._id
      .toString()
      .toUpperCase()}`;
    await application.save();

    return res.status(201).json({
      success: true,
      message: "Birth application created.",
      application: publicApplication(application),
    });
  } catch (error) {
    console.error("Could not create birth application:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not create the birth application.",
    });
  }
}

async function updateBirthApplicationStatus(req, res) {
  try {
    if (!districtRegistrarOnly(req, res)) {
      return;
    }
    const status = clean(req.body.status).toLowerCase();
    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Choose open, approved, or rejected.",
        errors: { status: "Select a valid application status." },
      });
    }

    const application = await BirthApplication.findByIdAndUpdate(
      req.params.id,
      { status, reviewedAt: status === "open" ? null : new Date() },
      { new: true, runValidators: true }
    );
    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Birth application not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Birth application status updated.",
      application: publicApplication(application),
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid birth application.",
      });
    }
    console.error("Could not update birth application status:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update the birth application status.",
    });
  }
}

module.exports = {
  createBirthApplication,
  listBirthApplications,
  updateBirthApplicationStatus,
};
