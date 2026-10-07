const MarriageRegistration = require("../models/MarriageRegistration");

const RELIGIONS = ["Buddhist", "Hindu", "Christian", "Islam", "Other"];
const NATIONALITIES = ["Sri Lankan", "Other"];
const RELATIONSHIPS = ["Father", "Mother", "Uncle", "Aunt", "Brother", "Sister", "Relative", "Other"];
const GROOM_STATUS = ["Bachelor", "Widowed", "Divorced"];
const BRIDE_STATUS = ["Spinster", "Widowed", "Divorced"];

function clean(value) {
  return String(value || "").trim();
}

function isValidNic(value) {
  return /^(\d{12}|\d{9}[VX])$/i.test(clean(value).replace(/\s/g, ""));
}

function isValidPhone(value) {
  const phone = clean(value).replace(/[\s-]/g, "");
  return /^\+94\d{9}$/.test(phone) || /^0\d{9}$/.test(phone);
}

function parseDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(clean(value));
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || year < 1900) {
    return null;
  }
  return date;
}

function isPastOrToday(value) {
  const date = parseDate(value);
  if (!date) {
    return false;
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date <= today;
}

function ageFromDate(value) {
  const date = parseDate(value);
  if (!date) {
    return null;
  }
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
}

function requireText(errors, field, value, label) {
  if (clean(value).length < 2) {
    errors[field] = `Enter the ${label}.`;
  }
}

function requireNic(errors, field, value, label) {
  if (!isValidNic(value)) {
    errors[field] = `${label} must be 12 digits, or 9 digits followed by V or X.`;
  }
}

function requirePhone(errors, field, value, label) {
  if (!isValidPhone(value)) {
    errors[field] = `${label} must start with +94 or 0 and contain 9 more digits.`;
  }
}

function registrationErrors(body) {
  const errors = {};
  requireText(errors, "applicantName", body.applicantName, "applicant name");
  requireNic(errors, "applicantNic", body.applicantNic, "Applicant NIC");
  requirePhone(errors, "applicantMobile", body.applicantMobile, "Applicant mobile number");
  requireText(errors, "applicantAddress", body.applicantAddress, "applicant address");
  requireText(errors, "groomName", body.groomName, "groom's name");
  requireNic(errors, "groomNic", body.groomNic, "Groom NIC");
  if (!isPastOrToday(body.groomDob)) {
    errors.groomDob = "Select the groom's date of birth.";
  } else if (ageFromDate(body.groomDob) < 18) {
    errors.groomDob = "The groom must be 18 years or older.";
  }
  requireText(errors, "groomOccupation", body.groomOccupation, "groom's occupation");
  requireText(errors, "groomAddress", body.groomAddress, "groom's address");
  if (!RELIGIONS.includes(body.groomReligion)) {
    errors.groomReligion = "Select the groom's religion.";
  }
  if (!NATIONALITIES.includes(body.groomNationality)) {
    errors.groomNationality = "Select the groom's nationality.";
  }
  if (!GROOM_STATUS.includes(body.groomMaritalStatus)) {
    errors.groomMaritalStatus = "Select Bachelor, Widowed, or Divorced.";
  }
  requireText(errors, "brideName", body.brideName, "bride's name");
  requireNic(errors, "brideNic", body.brideNic, "Bride NIC");
  if (!isPastOrToday(body.brideDob)) {
    errors.brideDob = "Select the bride's date of birth.";
  } else if (ageFromDate(body.brideDob) < 18) {
    errors.brideDob = "The bride must be 18 years or older.";
  }
  requirePhone(errors, "brideMobile", body.brideMobile, "Bride mobile number");
  requireText(errors, "brideOccupation", body.brideOccupation, "bride's occupation");
  requireText(errors, "brideAddress", body.brideAddress, "bride's address");
  if (!RELIGIONS.includes(body.brideReligion)) {
    errors.brideReligion = "Select the bride's religion.";
  }
  if (!NATIONALITIES.includes(body.brideNationality)) {
    errors.brideNationality = "Select the bride's nationality.";
  }
  if (!BRIDE_STATUS.includes(body.brideMaritalStatus)) {
    errors.brideMaritalStatus = "Select Spinster, Widowed, or Divorced.";
  }
  if (!isPastOrToday(body.marriageDate)) {
    errors.marriageDate = "Select the date of marriage.";
  }
  requireText(errors, "marriagePlace", body.marriagePlace, "place of marriage");
  requireText(errors, "registrarName", body.registrarName, "registrar name");
  requireText(errors, "registrationNumber", body.registrationNumber, "registration number");
  requireText(errors, "femaleWitnessName", body.femaleWitnessName, "female witness name");
  requireNic(errors, "femaleWitnessNic", body.femaleWitnessNic, "Female witness NIC");
  if (!RELATIONSHIPS.includes(body.femaleWitnessRelationship)) {
    errors.femaleWitnessRelationship = "Select the female witness relationship.";
  }
  requireText(errors, "femaleWitnessAddress", body.femaleWitnessAddress, "female witness address");
  requirePhone(errors, "femaleWitnessPhone", body.femaleWitnessPhone, "Female witness phone");
  requireText(errors, "maleWitnessName", body.maleWitnessName, "male witness name");
  requireNic(errors, "maleWitnessNic", body.maleWitnessNic, "Male witness NIC");
  if (!RELATIONSHIPS.includes(body.maleWitnessRelationship)) {
    errors.maleWitnessRelationship = "Select the male witness relationship.";
  }
  requireText(errors, "maleWitnessAddress", body.maleWitnessAddress, "male witness address");
  requirePhone(errors, "maleWitnessPhone", body.maleWitnessPhone, "Male witness phone");
  if (body.declarationAccepted !== true) {
    errors.declarationAccepted = "Accept the legal declaration before submitting.";
  }
  requireText(errors, "officerName", body.officerName, "officer name");
  requireText(errors, "officerServiceNumber", body.officerServiceNumber, "officer service number");
  if (!/^\d{4,6}$/.test(clean(body.officerPin))) {
    errors.officerPin = "Enter the 4 to 6 digit authorization PIN.";
  }
  return errors;
}

function publicRegistration(record) {
  const officer = record.officer && record.officer.name ? record.officer : null;
  return {
    id: record._id,
    registrationReference: record.registrationReference,
    certificateNo: record.certificateNo,
    reference: record.registrationReference,
    applicantIsGroom: record.applicantIsGroom,
    applicantName: record.applicantName,
    applicantNic: record.applicantNic,
    applicantMobile: record.applicantMobile,
    applicantAddress: record.applicantAddress,
    applicantDob: record.applicantDob,
    groomName: record.groomName,
    groomNic: record.groomNic,
    groomDob: record.groomDob,
    groomAge: record.groomAge,
    groomOccupation: record.groomOccupation,
    groomAddress: record.groomAddress,
    groomReligion: record.groomReligion,
    groomNationality: record.groomNationality,
    groomMaritalStatus: record.groomMaritalStatus,
    brideName: record.brideName,
    brideNic: record.brideNic,
    brideDob: record.brideDob,
    brideAge: record.brideAge,
    brideMobile: record.brideMobile,
    brideOccupation: record.brideOccupation,
    brideAddress: record.brideAddress,
    brideReligion: record.brideReligion,
    brideNationality: record.brideNationality,
    brideMaritalStatus: record.brideMaritalStatus,
    marriageDate: record.marriageDate,
    marriagePlace: record.marriagePlace,
    registrarName: record.registrarName,
    registrationNumber: record.registrationNumber,
    femaleWitnessName: record.femaleWitnessName,
    femaleWitnessNic: record.femaleWitnessNic,
    femaleWitnessRelationship: record.femaleWitnessRelationship,
    femaleWitnessAddress: record.femaleWitnessAddress,
    femaleWitnessPhone: record.femaleWitnessPhone,
    maleWitnessName: record.maleWitnessName,
    maleWitnessNic: record.maleWitnessNic,
    maleWitnessRelationship: record.maleWitnessRelationship,
    maleWitnessAddress: record.maleWitnessAddress,
    maleWitnessPhone: record.maleWitnessPhone,
    declarationAccepted: record.declarationAccepted,
    officerName: record.officerName,
    officerServiceNumber: record.officerServiceNumber,
    status: "Sent to District Registrar",
    statusCode: record.status,
    couple: `${record.groomName} & ${record.brideName}`,
    date: record.marriageDate,
    submittedBy: officer ? officer.name : record.officerName,
    submittedAt: record.submittedAt,
    issuedAt: record.submittedAt,
  };
}

async function createMarriageRegistration(req, res) {
  try {
    if (req.user.role !== "marriage_registrar") {
      return res.status(403).json({
        success: false,
        message: "Only a marriage registrar can submit a marriage registration.",
      });
    }

    const errors = registrationErrors(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const year = new Date().getFullYear();
    const count = await MarriageRegistration.countDocuments({
      registrationReference: new RegExp(`^MR-${year}-`),
    });
    const registrationReference = `MR-${year}-${String(count + 1).padStart(4, "0")}`;
    const groomAge = ageFromDate(req.body.groomDob);
    const brideAge = ageFromDate(req.body.brideDob);
    const { officerPin, ...details } = req.body;
    const record = await MarriageRegistration.create({
      ...details,
      applicantNic: clean(req.body.applicantNic).toUpperCase(),
      groomNic: clean(req.body.groomNic).toUpperCase(),
      brideNic: clean(req.body.brideNic).toUpperCase(),
      femaleWitnessNic: clean(req.body.femaleWitnessNic).toUpperCase(),
      maleWitnessNic: clean(req.body.maleWitnessNic).toUpperCase(),
      applicantDob: clean(req.body.applicantDob) || (req.body.applicantIsGroom ? req.body.groomDob : ""),
      groomAge,
      brideAge,
      registrationReference,
      certificateNo: `CERT-${registrationReference}-LK`,
      status: "sent_to_district_registrar",
      officer: req.user._id,
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      registration: publicRegistration(record),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not save the marriage registration.",
    });
  }
}

async function listMyMarriageRegistrations(req, res) {
  try {
    if (req.user.role !== "marriage_registrar") {
      return res.status(403).json({
        success: false,
        message: "Only a marriage registrar can view these certificates.",
      });
    }
    const records = await MarriageRegistration.find({ officer: req.user._id }).sort({ submittedAt: -1 });
    return res.json({
      success: true,
      registrations: records.map(publicRegistration),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load marriage certificates.",
    });
  }
}

async function listIncomingMarriageRegistrations(req, res) {
  try {
    if (req.user.role !== "district_registrar") {
      return res.status(403).json({
        success: false,
        message: "Only a district registrar can view incoming marriage registrations.",
      });
    }
    const records = await MarriageRegistration.find()
      .populate("officer", "name serviceNumber")
      .sort({ submittedAt: -1 });
    return res.json({
      success: true,
      registrations: records.map(publicRegistration),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Could not load marriage registrations.",
    });
  }
}

module.exports = {
  createMarriageRegistration,
  listIncomingMarriageRegistrations,
  listMyMarriageRegistrations,
};
