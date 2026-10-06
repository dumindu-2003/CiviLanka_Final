export const NIC_DISTRICTS = [
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

export const NIC_RELIGIONS = ["Buddhism", "Hinduism", "Islam", "Christianity", "Other"];

export const NIC_GENDERS = ["Male", "Female", "Other"];

export function validatePersonalDetails(form) {
  const errors = {};
  const fullName = form.fullName.trim();
  const dateOfBirth = form.dateOfBirth.trim();

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

  if (!NIC_GENDERS.includes(form.gender)) {
    errors.gender = "Select a gender.";
  }

  if (!form.placeOfBirth.trim()) {
    errors.placeOfBirth = "Place of birth is required.";
  }

  if (!NIC_DISTRICTS.includes(form.district)) {
    errors.district = "Select a district.";
  }

  if (!NIC_RELIGIONS.includes(form.religion)) {
    errors.religion = "Select a religion.";
  }

  if (!form.occupation.trim()) {
    errors.occupation = "Occupation is required.";
  }

  return errors;
}

export const NIC_MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];

export function validateContactDetails(form) {
  const errors = {};
  const permanentAddress = form.permanentAddress.trim();
  const currentAddress = form.sameAsPermanent ? permanentAddress : form.currentAddress.trim();
  const phone = form.phone.replace(/[\s-]/g, "");
  const email = form.email.trim();
  const fatherNic = form.fatherNic.replace(/\s/g, "").toUpperCase();
  const motherNic = form.motherNic.replace(/\s/g, "").toUpperCase();

  if (!permanentAddress) {
    errors.permanentAddress = "Permanent address is required.";
  }

  if (!currentAddress) {
    errors.currentAddress = "Current address is required.";
  }

  if (!phone) {
    errors.phone = "Phone number is required.";
  } else if (!/^(\+94\d{9}|0\d{9})$/.test(phone)) {
    errors.phone = "Enter a Sri Lankan number like +94771234567 or 0771234567.";
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.fatherFullName.trim()) {
    errors.fatherFullName = "Father's full name is required.";
  } else if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(form.fatherFullName.trim())) {
    errors.fatherFullName = "Enter a valid father's full name.";
  }

  if (!fatherNic) {
    errors.fatherNic = "Father's NIC number is required.";
  } else if (!/^(\d{12}|\d{9}[VX])$/.test(fatherNic)) {
    errors.fatherNic = "Enter 12 digits or 9 digits followed by V.";
  }

  if (!form.motherFullName.trim()) {
    errors.motherFullName = "Mother's full name is required.";
  } else if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(form.motherFullName.trim())) {
    errors.motherFullName = "Enter a valid mother's full name.";
  }

  if (!motherNic) {
    errors.motherNic = "Mother's NIC number is required.";
  } else if (!/^(\d{12}|\d{9}[VX])$/.test(motherNic)) {
    errors.motherNic = "Enter 12 digits or 9 digits followed by V.";
  }

  if (!NIC_MARITAL_STATUSES.includes(form.maritalStatus)) {
    errors.maritalStatus = "Select a marital status.";
  }

  return errors;
}

const MAX_DOCUMENT_BYTES = 5 * 1024 * 1024;
const DOCUMENT_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];

export function validateDocuments(files) {
  const errors = {};

  function check(file, key, label, required) {
    if (!file?.name) {
      if (required) {
        errors[key] = `${label} is required.`;
      }
      return;
    }

    const mime = String(file.mimeType || "").toLowerCase();
    if (!DOCUMENT_TYPES.includes(mime)) {
      errors[key] = `${label} must be a PDF or JPG file.`;
    } else if (Number(file.size || 0) > MAX_DOCUMENT_BYTES) {
      errors[key] = `${label} must be 5MB or smaller.`;
    }
  }

  check(files.birthCertificate, "birthCertificateName", "Birth certificate copy", true);
  check(files.proofOfAddress, "proofOfAddressName", "Proof of address", true);
  check(files.passportPhoto, "passportPhotoName", "Passport size photo", true);
  check(files.previousNic, "previousNicName", "Previous NIC copy", false);
  return errors;
}

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
