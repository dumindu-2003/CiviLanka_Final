function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}

function parseSriLankanNic(value) {
  const nic = String(value || "").replace(/\s/g, "").toUpperCase();
  let year = 0;
  let dayCode = 0;

  if (/^\d{9}[VX]$/.test(nic)) {
    year = 1900 + Number(nic.slice(0, 2));
    dayCode = Number(nic.slice(2, 5));
  } else if (/^\d{12}$/.test(nic)) {
    year = Number(nic.slice(0, 4));
    dayCode = Number(nic.slice(4, 7));
  } else {
    return null;
  }

  let gender = "Male";
  let dayOfYear = dayCode;
  if (dayCode >= 500) {
    gender = "Female";
    dayOfYear = dayCode - 500;
  }

  const maxDay = isLeapYear(year) ? 366 : 365;
  if (dayOfYear < 1 || dayOfYear > maxDay) {
    return null;
  }

  const born = new Date(year, 0, dayOfYear);
  if (born.getFullYear() !== year) {
    return null;
  }

  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (born > today || year < 1900) {
    return null;
  }

  return {
    nic,
    gender,
    dateOfBirth: formatDate(born),
    documentType: "National ID (NIC)",
  };
}

module.exports = {
  parseSriLankanNic,
};
