const bcrypt = require("bcryptjs");
const NICForm = require("../models/NICForm");

const GENDERS = ["Male", "Female", "Other"];

const DISTRICTS = [
  "Ampara",
  "Anuradhapura",
  "Badulla",
  "Batticaloa",
  "Colombo",
  "Galle",
  "Gampaha",
  "Hambantota",
  "Jaffna",
  "Kalutara",
  "Kandy",
  "Kegalle",
  "Kilinochchi",
  "Kurunegala",
  "Mannar",
  "Matale",
  "Matara",
  "Monaragala",
  "Mullaitivu",
  "Nuwara Eliya",
  "Polonnaruwa",
  "Puttalam",
  "Ratnapura",
  "Trincomalee",
  "Vavuniya",
];

const RELIGIONS = ["Buddhism", "Hinduism", "Islam", "Christianity", "Other"];

function isValidDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
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

function personalErrors(body) {
  const errors = {};
  const fullName = String(body.fullName || "").trim();
  const dateOfBirth = String(body.dateOfBirth || "").trim();
  const gender = String(body.gender || "").trim();
  const placeOfBirth = String(body.placeOfBirth || "").trim();
  const district = String(body.district || "").trim();
  const religion = String(body.religion || "").trim();
  const occupation = String(body.occupation || "").trim();

  if (!fullName) {
    errors.fullName = "Full name is required.";
  } else if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(fullName)) {
    errors.fullName = "Enter a valid full name.";
  }

  if (!dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required.";
  } else if (!isValidDate(dateOfBirth)) {
    errors.dateOfBirth = "Enter a valid date as DD/MM/YYYY.";
  }

  if (!GENDERS.includes(gender)) {
    errors.gender = "Select a gender.";
  }

  if (!placeOfBirth) {
    errors.placeOfBirth = "Place of birth is required.";
  }

  if (!DISTRICTS.includes(district)) {
    errors.district = "Select a district.";
  }

  if (!RELIGIONS.includes(religion)) {
    errors.religion = "Select a religion.";
  }

  if (!occupation) {
    errors.occupation = "Occupation is required.";
  }

  return errors;
}

const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];

function normalizePhone(value) {
  return String(value || "").replace(/[\s-]/g, "");
}

function isValidPhone(value) {
  const phone = normalizePhone(value);
  return /^\+94\d{9}$/.test(phone) || /^0\d{9}$/.test(phone);
}

function isValidNic(value) {
  return /^(\d{12}|\d{9}[VX])$/.test(String(value || "").replace(/\s/g, "").toUpperCase());
}

function isValidPersonName(value) {
  return /^[A-Za-z][A-Za-z .'-]{1,}$/.test(value);
}

function contactErrors(body) {
  const errors = {};
  const permanentAddress = String(body.permanentAddress || "").trim();
  const sameAsPermanent = Boolean(body.sameAsPermanent);
  const currentAddress = sameAsPermanent
    ? permanentAddress
    : String(body.currentAddress || "").trim();
  const phone = normalizePhone(body.phone);
  const email = String(body.email || "").trim().toLowerCase();
  const fatherFullName = String(body.fatherFullName || "").trim();
  const fatherNic = String(body.fatherNic || "").replace(/\s/g, "").toUpperCase();
  const motherFullName = String(body.motherFullName || "").trim();
  const motherNic = String(body.motherNic || "").replace(/\s/g, "").toUpperCase();
  const maritalStatus = String(body.maritalStatus || "").trim();

  if (!permanentAddress) {
    errors.permanentAddress = "Permanent address is required.";
  }

  if (!currentAddress) {
    errors.currentAddress = "Current address is required.";
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Enter a Sri Lankan number like +94771234567 or 0771234567.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!fatherFullName) {
    errors.fatherFullName = "Father's full name is required.";
  } else if (!isValidPersonName(fatherFullName)) {
    errors.fatherFullName = "Enter a valid father's full name.";
  }

  if (!fatherNic) {
    errors.fatherNic = "Father's NIC number is required.";
  } else if (!isValidNic(fatherNic)) {
    errors.fatherNic = "Enter 12 digits or 9 digits followed by V.";
  }

  if (!motherFullName) {
    errors.motherFullName = "Mother's full name is required.";
  } else if (!isValidPersonName(motherFullName)) {
    errors.motherFullName = "Enter a valid mother's full name.";
  }

  if (!motherNic) {
    errors.motherNic = "Mother's NIC number is required.";
  } else if (!isValidNic(motherNic)) {
    errors.motherNic = "Enter 12 digits or 9 digits followed by V.";
  }

  if (!MARITAL_STATUSES.includes(maritalStatus)) {
    errors.maritalStatus = "Select a marital status.";
  }

  return errors;
}

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

function documentFieldErrors(body, nameKey, mimeKey, sizeKey, label, required) {
  const errors = {};
  const name = String(body[nameKey] || "").trim();
  const mime = String(body[mimeKey] || "").trim().toLowerCase();
  const size = Number(body[sizeKey] || 0);

  if (!name) {
    if (required) {
      errors[nameKey] = `${label} is required.`;
    }
    return errors;
  }

  if (!DOCUMENT_TYPES.includes(mime)) {
    errors[nameKey] = `${label} must be a PDF or JPG file.`;
  } else if (size > MAX_DOCUMENT_BYTES) {
    errors[nameKey] = `${label} must be 5MB or smaller.`;
  }

  return errors;
}

function documentErrors(body) {
  return {
    ...documentFieldErrors(
      body,
      "birthCertificateName",
      "birthCertificateMime",
      "birthCertificateSize",
      "Birth certificate copy",
      true
    ),
    ...documentFieldErrors(
      body,
      "proofOfAddressName",
      "proofOfAddressMime",
      "proofOfAddressSize",
      "Proof of address",
      true
    ),
    ...documentFieldErrors(
      body,
      "passportPhotoName",
      "passportPhotoMime",
      "passportPhotoSize",
      "Passport size photo",
      true
    ),
    ...documentFieldErrors(
      body,
      "previousNicName",
      "previousNicMime",
      "previousNicSize",
      "Previous NIC copy",
      false
    ),
  };
}

function queueApplication(form) {
  return {
    ...publicForm(form),
    status: form.status === "approved" ? "Approved" : "Pending approval",
    statusCode: form.status,
    applicationReference: form.applicationReference,
    authorizingOfficerName: form.authorizingOfficerName,
    authorizingOfficerService: form.authorizingOfficerService,
    submittedAt: form.submittedAt,
  };
}

async function listNicForms(req, res) {
  try {
    if (req.user.role !== "district_registrar" && req.user.role !== "village_officer") {
      return res.status(403).json({
        success: false,
        message: "Only a district registrar can review NIC applications.",
      });
    }

    const forms = await NICForm.find({ status: { $in: ["pending_approval", "approved"] } }).sort({
      submittedAt: -1,
    });
    return res.status(200).json({
      success: true,
      applications: forms.map(queueApplication),
    });
  } catch (error) {
    console.error("Could not list NIC forms:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load NIC applications.",
    });
  }
}

function publicForm(form) {
  return {
    id: form._id,
    fullName: form.fullName,
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    placeOfBirth: form.placeOfBirth,
    district: form.district,
    religion: form.religion,
    occupation: form.occupation,
    permanentAddress: form.permanentAddress,
    currentAddress: form.currentAddress,
    sameAsPermanent: form.sameAsPermanent,
    phone: form.phone,
    email: form.email,
    fatherFullName: form.fatherFullName,
    fatherNic: form.fatherNic,
    motherFullName: form.motherFullName,
    motherNic: form.motherNic,
    maritalStatus: form.maritalStatus,
    birthCertificateName: form.birthCertificateName,
    proofOfAddressName: form.proofOfAddressName,
    passportPhotoName: form.passportPhotoName,
    previousNicName: form.previousNicName,
    status: form.status,
  };
}

async function saveNicForm(req, res) {
  try {
    if (req.user.role !== "village_officer") {
      return res.status(403).json({
        success: false,
        message: "Only a village officer can save an NIC form.",
      });
    }

    const includeContact = Boolean(req.body.includeContact);
    const includeDocuments = Boolean(req.body.includeDocuments);
    const errors = {
      ...personalErrors(req.body),
      ...(includeContact || includeDocuments ? contactErrors(req.body) : {}),
      ...(includeDocuments ? documentErrors(req.body) : {}),
    };

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const details = {
      fullName: String(req.body.fullName).trim(),
      dateOfBirth: String(req.body.dateOfBirth).trim(),
      gender: String(req.body.gender).trim(),
      placeOfBirth: String(req.body.placeOfBirth).trim(),
      district: String(req.body.district).trim(),
      religion: String(req.body.religion).trim(),
      occupation: String(req.body.occupation).trim(),
      status: "draft",
      officer: req.user._id,
    };

    if (includeContact) {
      const sameAsPermanent = Boolean(req.body.sameAsPermanent);
      const permanentAddress = String(req.body.permanentAddress).trim();
      details.permanentAddress = permanentAddress;
      details.sameAsPermanent = sameAsPermanent;
      details.currentAddress = sameAsPermanent
        ? permanentAddress
        : String(req.body.currentAddress).trim();
      details.phone = String(req.body.phone).replace(/[\s-]/g, "");
      details.email = String(req.body.email || "").trim().toLowerCase();
      details.fatherFullName = String(req.body.fatherFullName).trim();
      details.fatherNic = String(req.body.fatherNic).replace(/\s/g, "").toUpperCase();
      details.motherFullName = String(req.body.motherFullName).trim();
      details.motherNic = String(req.body.motherNic).replace(/\s/g, "").toUpperCase();
      details.maritalStatus = String(req.body.maritalStatus).trim();
    }

    if (includeDocuments) {
      details.birthCertificateName = String(req.body.birthCertificateName || "").trim();
      details.birthCertificateMime = String(req.body.birthCertificateMime || "").trim().toLowerCase();
      details.birthCertificateSize = Number(req.body.birthCertificateSize || 0);
      details.proofOfAddressName = String(req.body.proofOfAddressName || "").trim();
      details.proofOfAddressMime = String(req.body.proofOfAddressMime || "").trim().toLowerCase();
      details.proofOfAddressSize = Number(req.body.proofOfAddressSize || 0);
      details.passportPhotoName = String(req.body.passportPhotoName || "").trim();
      details.passportPhotoMime = String(req.body.passportPhotoMime || "").trim().toLowerCase();
      details.passportPhotoSize = Number(req.body.passportPhotoSize || 0);
      details.previousNicName = String(req.body.previousNicName || "").trim();
      details.previousNicMime = String(req.body.previousNicMime || "").trim().toLowerCase();
      details.previousNicSize = Number(req.body.previousNicSize || 0);
    }

    let form;
    if (req.body.id) {
      form = await NICForm.findOne({ _id: req.body.id, officer: req.user._id });
      if (!form) {
        return res.status(404).json({
          success: false,
          message: "This draft could not be found.",
        });
      }
      if (form.status === "pending_approval" || form.status === "approved") {
        return res.status(400).json({
          success: false,
          message: "This application has already been submitted.",
        });
      }
      Object.assign(form, details);
      await form.save();
    } else {
      form = await NICForm.create(details);
    }

    return res.status(200).json({
      success: true,
      message: "Saved successfully!",
      form: publicForm(form),
    });
  } catch (error) {
    console.error("Could not save NIC form:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save the NIC form.",
    });
  }
}

module.exports = {
  saveNicForm,
  authorizeNicForm,
  approveNicForm,
  listNicForms,
};

async function approveNicForm(req, res) {
  try {
    if (req.user.role !== "district_registrar") {
      return res.status(403).json({
        success: false,
        message: "Only a district registrar can approve an NIC application.",
      });
    }

    const form = await NICForm.findById(req.params.id);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "This application could not be found.",
      });
    }
    if (form.status === "approved") {
      return res.status(400).json({
        success: false,
        message: "This application is already approved.",
      });
    }
    if (form.status !== "pending_approval") {
      return res.status(400).json({
        success: false,
        message: "Only a submitted application can be approved.",
      });
    }

    form.status = "approved";
    form.approvedAt = new Date();
    await form.save();

    return res.status(200).json({
      success: true,
      message: "NIC application approved.",
      application: queueApplication(form),
    });
  } catch (error) {
    console.error("Could not approve NIC form:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not approve the NIC application.",
    });
  }
}

async function authorizeNicForm(req, res) {
  try {
    if (req.user.role !== "village_officer") {
      return res.status(403).json({
        success: false,
        message: "Only a village officer can authorize an NIC application.",
      });
    }

    const username = String(req.body.username || "").trim().toLowerCase();
    const serviceNumber = String(req.body.serviceNumber || "").trim().toUpperCase();
    const password = String(req.body.password || "");
    const errors = {};

    if (!/^[a-z]+(\.[a-z]+)+$/.test(username)) {
      errors.username = "Enter a valid officer username.";
    }
    if (!/^[A-Z]{2,}-\d{3,}$/.test(serviceNumber)) {
      errors.serviceNumber = "Enter a valid service number.";
    }
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Check the highlighted fields.",
        errors,
      });
    }

    const User = require("../models/User");
    const officer = await User.findOne({ username });
    const serviceMatches = officer && officer.serviceNumber.toUpperCase() === serviceNumber;
    const passwordMatches = officer ? await bcrypt.compare(password, officer.password) : false;

    if (!officer || !serviceMatches || !passwordMatches || officer.role !== "village_officer") {
      return res.status(401).json({
        success: false,
        message: "Incorrect username, service number, or password.",
      });
    }

    if (officer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Authorize with the signed-in village officer account.",
      });
    }

    const form = await NICForm.findOne({ _id: req.params.id, officer: req.user._id });
    if (!form) {
      return res.status(404).json({
        success: false,
        message: "This application could not be found.",
      });
    }

    if (!form.birthCertificateName || !form.proofOfAddressName || !form.passportPhotoName) {
      return res.status(400).json({
        success: false,
        message: "Attach the required documents before authorizing.",
      });
    }

    const year = new Date().getFullYear();
    if (!form.applicationReference) {
      const count = await NICForm.countDocuments({
        applicationReference: new RegExp(`^NIC-${year}-`),
      });
      form.applicationReference = `NIC-${year}-${String(count + 1).padStart(5, "0")}`;
    }

    form.status = "pending_approval";
    form.authorizingOfficerName = officer.name;
    form.authorizingOfficerService = officer.serviceNumber;
    form.submittedAt = new Date();
    await form.save();

    return res.status(200).json({
      success: true,
      receipt: {
        reference: form.applicationReference,
        applicantName: form.fullName,
        officerName: officer.name,
        officerService: officer.serviceNumber,
        destination: `District Registrar Office - ${form.district}`,
        status: "PENDING APPROVAL",
        submittedAt: form.submittedAt,
      },
    });
  } catch (error) {
    console.error("Could not authorize NIC form:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not authorize the application.",
    });
  }
}
