const DeathReport = require("../models/DeathReport");

const GENDERS = ["Male", "Female", "Other"];
const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Relative", "Other"];

function isValidName(value) {
  return /^[A-Za-z][A-Za-z .'-]{1,}$/.test(String(value || "").trim());
}

function isValidNic(value) {
  return /^(\d{12}|\d{9}[VX])$/.test(String(value || "").replace(/\s/g, "").toUpperCase());
}

function isValidDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value || "").trim());
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

function isValidPhone(value) {
  const phone = String(value || "").replace(/[\s-]/g, "");
  return /^\+94\d{9}$/.test(phone) || /^0\d{9}$/.test(phone);
}

function reportErrors(body) {
  const errors = {};
  const nic = String(body.nic || "").replace(/\s/g, "").toUpperCase();
  const age = Number(String(body.age || "").trim());

  if (!isValidName(body.fullName)) {
    errors.fullName = "Enter the deceased person's full name.";
  }
  if (nic && !isValidNic(nic)) {
    errors.nic = "Enter 12 digits or 9 digits followed by V.";
  }
  if (!isValidDate(body.dateOfDeath)) {
    errors.dateOfDeath = "Enter a valid date of death as DD/MM/YYYY.";
  }
  if (String(body.placeOfDeath || "").trim().length < 2) {
    errors.placeOfDeath = "Enter the place of death.";
  }
  if (!GENDERS.includes(body.gender)) {
    errors.gender = "Select a gender.";
  }
  if (!Number.isInteger(age) || age < 0 || age > 120) {
    errors.age = "Enter an age from 0 to 120.";
  }
  if (!isValidName(body.informantName)) {
    errors.informantName = "Enter the informant's full name.";
  }
  if (!isValidNic(body.informantNic)) {
    errors.informantNic = "Enter 12 digits or 9 digits followed by V.";
  }
  if (!RELATIONSHIPS.includes(body.relationship)) {
    errors.relationship = "Select a relationship.";
  }
  if (!isValidPhone(body.informantPhone)) {
    errors.informantPhone = "Enter a Sri Lankan number like +94771234567 or 0771234567.";
  }
  if (String(body.division || "").trim().length < 2) {
    errors.division = "Enter the Grama Niladhari division.";
  }
  return errors;
}

function publicReport(report) {
  const officer = report.officer && report.officer.name ? report.officer : null;
  return {
    id: report._id,
    reportReference: report.reportReference,
    fullName: report.fullName,
    nic: report.nic,
    dateOfDeath: report.dateOfDeath,
    placeOfDeath: report.placeOfDeath,
    gender: report.gender,
    age: report.age,
    informantName: report.informantName,
    informantNic: report.informantNic,
    relationship: report.relationship,
    informantPhone: report.informantPhone,
    division: report.division,
    status: report.status === "approved" ? "Approved" : "Sent to District Registrar",
    statusCode: report.status === "approved" ? "approved" : "sent_to_district_registrar",
    officerName: officer ? officer.name : "",
    officerService: officer ? officer.serviceNumber : "",
    submittedAt: report.submittedAt,
  };
}

async function createDeathReport(req, res) {
  try {
    if (req.user.role !== "village_officer") {
      return res.status(403).json({
        success: false,
        message: "Only a village officer can report a death.",
      });
    }

    const errors = reportErrors(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const year = new Date().getFullYear();
    const count = await DeathReport.countDocuments({
      reportReference: new RegExp(`^DRP-${year}-`),
    });
    const report = await DeathReport.create({
      reportReference: `DRP-${year}-${String(count + 1).padStart(5, "0")}`,
      fullName: String(req.body.fullName).trim(),
      nic: String(req.body.nic || "").replace(/\s/g, "").toUpperCase(),
      dateOfDeath: String(req.body.dateOfDeath).trim(),
      placeOfDeath: String(req.body.placeOfDeath).trim(),
      gender: String(req.body.gender).trim(),
      age: Number(String(req.body.age).trim()),
      informantName: String(req.body.informantName).trim(),
      informantNic: String(req.body.informantNic).replace(/\s/g, "").toUpperCase(),
      relationship: String(req.body.relationship).trim(),
      informantPhone: String(req.body.informantPhone).replace(/[\s-]/g, ""),
      division: String(req.body.division).trim(),
      status: "sent_to_district_registrar",
      officer: req.user._id,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Death report sent to the District Registrar.",
      report: publicReport(report),
    });
  } catch (error) {
    console.error("Could not save death report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not send the death report.",
    });
  }
}

async function listMyDeathReports(req, res) {
  try {
    if (req.user.role !== "village_officer") {
      return res.status(403).json({
        success: false,
        message: "Only a village officer can view these death reports.",
      });
    }

    const reports = await DeathReport.find({ officer: req.user._id }).sort({ submittedAt: -1 });
    return res.status(200).json({
      success: true,
      reports: reports.map(publicReport),
    });
  } catch (error) {
    console.error("Could not list death reports:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load death reports.",
    });
  }
}

async function listIncomingDeathReports(req, res) {
  try {
    if (req.user.role !== "district_registrar") {
      return res.status(403).json({
        success: false,
        message: "Only a district registrar can review death reports.",
      });
    }

    const reports = await DeathReport.find({})
      .populate("officer", "name serviceNumber")
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      reports: reports.map(publicReport),
    });
  } catch (error) {
    console.error("Could not list incoming death reports:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load death reports.",
    });
  }
}

function savedDetails(body) {
  return {
    fullName: String(body.fullName).trim(),
    nic: String(body.nic || "").replace(/\s/g, "").toUpperCase(),
    dateOfDeath: String(body.dateOfDeath).trim(),
    placeOfDeath: String(body.placeOfDeath).trim(),
    gender: String(body.gender).trim(),
    age: Number(String(body.age).trim()),
    informantName: String(body.informantName).trim(),
    informantNic: String(body.informantNic).replace(/\s/g, "").toUpperCase(),
    relationship: String(body.relationship).trim(),
    informantPhone: String(body.informantPhone).replace(/[\s-]/g, ""),
    division: String(body.division).trim(),
  };
}

async function updateDeathReport(req, res) {
  try {
    if (req.user.role !== "village_officer") {
      return res.status(403).json({
        success: false,
        message: "Only a village officer can edit a death report.",
      });
    }

    const errors = reportErrors(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const report = await DeathReport.findOne({ _id: req.params.id, officer: req.user._id });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "This death report could not be found.",
      });
    }
    if (report.status === "approved") {
      return res.status(403).json({
        success: false,
        message: "An approved death report cannot be edited.",
      });
    }

    Object.assign(report, savedDetails(req.body));
    await report.save();

    return res.status(200).json({
      success: true,
      message: "Death report updated.",
      report: publicReport(report),
    });
  } catch (error) {
    console.error("Could not update death report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update the death report.",
    });
  }
}

async function approveDeathReport(req, res) {
  try {
    if (req.user.role !== "district_registrar") {
      return res.status(403).json({
        success: false,
        message: "Only a district registrar can approve a death report.",
      });
    }

    const report = await DeathReport.findById(req.params.id).populate("officer", "name serviceNumber");
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "This death report could not be found.",
      });
    }
    if (report.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This death report is already approved.",
      });
    }

    report.status = "approved";
    report.approvedAt = new Date();
    await report.save();

    return res.status(200).json({
      success: true,
      message: "Death report approved.",
      report: publicReport(report),
    });
  } catch (error) {
    console.error("Could not approve death report:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not approve the death report.",
    });
  }
}

module.exports = {
  createDeathReport,
  listMyDeathReports,
  listIncomingDeathReports,
  updateDeathReport,
  approveDeathReport,
};
