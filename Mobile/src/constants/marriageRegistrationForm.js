export const MARRIAGE_RELIGIONS = ["Buddhist", "Hindu", "Christian", "Islam", "Other"];
export const MARRIAGE_NATIONALITIES = ["Sri Lankan", "Other"];
export const MARRIAGE_RELATIONSHIPS = [
  "Father",
  "Mother",
  "Uncle",
  "Aunt",
  "Brother",
  "Sister",
  "Relative",
  "Other",
];
export const MARRIAGE_STATUSES = ["Solemnized", "Witnessed", "Discussed"];

const NIC_PATTERN = /^(\d{12}|\d{9}[VX])$/i;
const PHONE_PATTERN = /^(?:\+94|0)\d{9}$/;

export function ageFromDate(value) {
  const date = parseDate(value);
  if (!date) {
    return "";
  }
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const month = today.getMonth() - date.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age >= 0 ? String(age) : "";
}

export function patchMarriageForm(form, field, value) {
  const next = { ...form, [field]: value };

  if (field === "groomDob") {
    next.groomAge = ageFromDate(value);
  }
  if (field === "brideDob") {
    next.brideAge = ageFromDate(value);
  }
  if (field === "applicantDob") {
    if (form.applicantIsGroom) {
      next.groomDob = value;
      next.groomAge = ageFromDate(value);
    }
  }
  if (form.applicantIsGroom && field === "applicantName") {
    next.groomName = value;
  }
  if (form.applicantIsGroom && field === "applicantNic") {
    next.groomNic = value;
  }
  if (form.applicantIsGroom && field === "applicantAddress") {
    next.groomAddress = value;
  }

  return next;
}

export function setApplicantIsGroom(form, isGroom) {
  if (!isGroom) {
    return { ...form, applicantIsGroom: false };
  }
  const dob = form.applicantDob || form.groomDob;
  return {
    ...form,
    applicantIsGroom: true,
    groomName: form.applicantName,
    groomNic: form.applicantNic,
    groomAddress: form.applicantAddress,
    groomDob: dob,
    groomAge: ageFromDate(dob),
    applicantDob: form.applicantDob || dob,
  };
}

export function validateApplicantStep(form) {
  const errors = {};
  requireName(errors, "applicantName", form.applicantName, "Applicant name");
  requireNic(errors, "applicantNic", form.applicantNic, "Applicant NIC");
  requirePhone(errors, "applicantMobile", form.applicantMobile, "Mobile number");
  requireText(errors, "applicantAddress", form.applicantAddress, "Residential address");
  requireGroom(errors, form);
  requireMaritalStatus(errors, "groomMaritalStatus", form.groomMaritalStatus);
  return errors;
}

export function validateGroomStep(form) {
  const errors = {};
  requireName(errors, "applicantName", form.applicantName, "Applicant name");
  requireNic(errors, "applicantNic", form.applicantNic, "Applicant NIC");
  requireDate(errors, "applicantDob", form.applicantDob, "Applicant date of birth", true);
  requireGroom(errors, form);
  requireStatus(errors, "groomStatus", form.groomStatus);
  return errors;
}

export function validateBrideStep(form) {
  const errors = {};
  requireName(errors, "brideName", form.brideName, "Bride's name");
  requireNic(errors, "brideNic", form.brideNic, "Bride's NIC");
  requireDate(errors, "brideDob", form.brideDob, "Bride's date of birth", true);
  requireAdult(errors, "brideDob", form.brideDob);
  requirePhone(errors, "brideMobile", form.brideMobile, "Bride's mobile number");
  requireText(errors, "brideOccupation", form.brideOccupation, "Occupation");
  requireText(errors, "brideAddress", form.brideAddress, "Permanent address");
  requireChoice(errors, "brideReligion", form.brideReligion, "Religion");
  requireChoice(errors, "brideNationality", form.brideNationality, "Nationality");
  requireMaritalStatus(errors, "brideMaritalStatus", form.brideMaritalStatus, [
    "Spinster",
    "Widowed",
    "Divorced",
  ]);
  requireDate(errors, "marriageDate", form.marriageDate, "Date of marriage", true);
  requireText(errors, "marriagePlace", form.marriagePlace, "Place of marriage");
  requireText(errors, "registrarName", form.registrarName, "Registrar name");
  requireText(errors, "registrationNumber", form.registrationNumber, "Registration number");
  return errors;
}

export function validateMarriageForm(form) {
  return {
    ...validateApplicantStep(form),
    ...validateBrideStep(form),
    ...validateWitnessStep(form),
  };
}

export function validateWitnessStep(form) {
  const errors = {};
  requireName(errors, "femaleWitnessName", form.femaleWitnessName, "Female witness name");
  requireNic(errors, "femaleWitnessNic", form.femaleWitnessNic, "Female witness NIC");
  requireChoice(errors, "femaleWitnessRelationship", form.femaleWitnessRelationship, "Relationship");
  requireText(errors, "femaleWitnessAddress", form.femaleWitnessAddress, "Address");
  requirePhone(errors, "femaleWitnessPhone", form.femaleWitnessPhone, "Contact number");
  requireName(errors, "maleWitnessName", form.maleWitnessName, "Male witness name");
  requireNic(errors, "maleWitnessNic", form.maleWitnessNic, "Male witness NIC");
  requireChoice(errors, "maleWitnessRelationship", form.maleWitnessRelationship, "Relationship");
  requireText(errors, "maleWitnessAddress", form.maleWitnessAddress, "Address");
  requirePhone(errors, "maleWitnessPhone", form.maleWitnessPhone, "Contact number");
  if (!form.declarationAccepted) {
    errors.declarationAccepted = "Accept the legal declaration before submitting.";
  }
  requireName(errors, "officerName", form.officerName, "Officer name");
  requireText(errors, "officerServiceNumber", form.officerServiceNumber, "Officer service number");
  if (!/^\d{4,6}$/.test(String(form.officerPin || "").trim())) {
    errors.officerPin = "Enter the 4 to 6 digit authorization PIN.";
  }
  return errors;
}

function requireGroom(errors, form) {
  requireName(errors, "groomName", form.groomName, "Groom's name");
  requireNic(errors, "groomNic", form.groomNic, "Groom's NIC");
  requireDate(errors, "groomDob", form.groomDob, "Groom's date of birth", true);
  requireAdult(errors, "groomDob", form.groomDob);
  requireText(errors, "groomOccupation", form.groomOccupation, "Occupation");
  requireText(errors, "groomAddress", form.groomAddress, "Permanent address");
  requireChoice(errors, "groomReligion", form.groomReligion, "Religion");
  requireChoice(errors, "groomNationality", form.groomNationality, "Nationality");
}

function requireName(errors, field, value, label) {
  const text = String(value || "").trim();
  if (text.length < 2) {
    errors[field] = `Enter ${label.toLowerCase()}.`;
  }
}

function requireText(errors, field, value, label) {
  if (String(value || "").trim().length < 2) {
    errors[field] = `Enter the ${label.toLowerCase()}.`;
  }
}

function requireChoice(errors, field, value, label) {
  if (!String(value || "").trim()) {
    errors[field] = `Select the ${label.toLowerCase()}.`;
  }
}

function requireNic(errors, field, value, label) {
  const nic = String(value || "").trim().toUpperCase();
  if (!NIC_PATTERN.test(nic)) {
    errors[field] = `${label} must be 12 digits, or 9 digits followed by V or X.`;
  }
}

function requirePhone(errors, field, value, label) {
  const phone = String(value || "").replace(/\s/g, "");
  if (!PHONE_PATTERN.test(phone)) {
    errors[field] = `${label} must start with +94 or 0 and contain 9 more digits.`;
  }
}

function requireMaritalStatus(errors, field, value, options = ["Bachelor", "Widowed", "Divorced"]) {
  if (!options.includes(value)) {
    errors[field] = `Select ${options.join(", ")}.`;
  }
}

function requireStatus(errors, field, value) {
  if (!MARRIAGE_STATUSES.includes(value)) {
    errors[field] = "Select Solemnized, Witnessed, or Discussed.";
  }
}

function requireDate(errors, field, value, label, blockFuture) {
  const date = parseDate(value);
  if (!date) {
    errors[field] = `Select the ${label.toLowerCase()}.`;
    return;
  }
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (blockFuture && date > today) {
    errors[field] = `${label} cannot be in the future.`;
  }
}

function requireAdult(errors, field, value) {
  const age = Number(ageFromDate(value));
  if (value && ageFromDate(value) && age < 18) {
    errors[field] = "Must be 18 years or older.";
  }
}

function parseDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(value || "").trim());
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    year < 1900
  ) {
    return null;
  }
  return date;
}
