export const DEATH_GENDERS = ["Male", "Female", "Other"];

export const DEATH_RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Relative", "Other"];

export function validateDeathReport(form) {
  const errors = {};
  const nic = form.nic.replace(/\s/g, "").toUpperCase();
  const informantNic = form.informantNic.replace(/\s/g, "").toUpperCase();
  const phone = form.informantPhone.replace(/[\s-]/g, "");
  const age = Number(form.age.trim());

  if (!form.fullName.trim()) {
    errors.fullName = "Full name is required.";
  } else if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(form.fullName.trim())) {
    errors.fullName = "Enter a valid full name.";
  }

  if (nic && !/^(\d{12}|\d{9}[VX])$/.test(nic)) {
    errors.nic = "Enter 12 digits or 9 digits followed by V.";
  }

  if (!form.dateOfDeath.trim()) {
    errors.dateOfDeath = "Date of death is required.";
  } else if (!isValidDate(form.dateOfDeath.trim())) {
    errors.dateOfDeath = "Enter a valid date as DD/MM/YYYY.";
  }

  if (form.placeOfDeath.trim().length < 2) {
    errors.placeOfDeath = "Enter the place of death.";
  }

  if (!DEATH_GENDERS.includes(form.gender)) {
    errors.gender = "Select a gender.";
  }

  if (!form.age.trim()) {
    errors.age = "Age is required.";
  } else if (!Number.isInteger(age) || age < 0 || age > 120) {
    errors.age = "Enter an age from 0 to 120.";
  }

  if (!form.informantName.trim()) {
    errors.informantName = "Informant's full name is required.";
  } else if (!/^[A-Za-z][A-Za-z .'-]{1,}$/.test(form.informantName.trim())) {
    errors.informantName = "Enter a valid informant's full name.";
  }

  if (!informantNic) {
    errors.informantNic = "Informant's NIC number is required.";
  } else if (!/^(\d{12}|\d{9}[VX])$/.test(informantNic)) {
    errors.informantNic = "Enter 12 digits or 9 digits followed by V.";
  }

  if (!DEATH_RELATIONSHIPS.includes(form.relationship)) {
    errors.relationship = "Select a relationship.";
  }

  if (!phone) {
    errors.informantPhone = "Phone number is required.";
  } else if (!/^(\+94\d{9}|0\d{9})$/.test(phone)) {
    errors.informantPhone = "Enter a Sri Lankan number like +94771234567 or 0771234567.";
  }

  if (form.division.trim().length < 2) {
    errors.division = "Enter the Grama Niladhari division.";
  }

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
