export const BANK_BRANCH = "Branch 042";

export const BANK_VERIFICATIONS = [
  {
    nic: "199012345678",
    fullName: "Saman Perera",
    dateOfBirth: "1990-05-14",
    documentType: "National ID (NIC)",
    hash: "#9D84",
    verifiedAt: "Just now",
    date: "2026-09-01",
    statusLabel: "Valid",
  },
  {
    nic: "198512345678",
    fullName: "Nimal Silva",
    documentType: "National ID (NIC)",
    verifiedAt: "2026-08-30",
    date: "2026-08-30",
    statusLabel: "Valid",
  },
];

const CERTIFICATE_LOOKUPS = [
  {
    nic: "BR-2026-8801",
    fullName: "Sahan Jayasuriya",
    documentType: "Birth Certificate",
    date: "2026-08-12",
    verifiedAt: "Registry record",
    statusLabel: "Valid",
  },
  {
    nic: "BR-2026-8714",
    fullName: "Amaya Fernando",
    documentType: "Birth Certificate",
    date: "2026-07-30",
    verifiedAt: "Registry record",
    statusLabel: "Valid",
  },
  {
    nic: "DR-2026-1029",
    fullName: "Nimal Silva",
    documentType: "Death Certificate",
    date: "2026-08-28",
    verifiedAt: "Registry record",
    statusLabel: "Record",
    note: "This number is on a death record.",
  },
  {
    nic: "MR-2026-0418",
    fullName: "Kasun Perera & Nadeesha Fernando",
    documentType: "Marriage Certificate",
    date: "2026-08-25",
    verifiedAt: "Registry record",
    statusLabel: "Valid",
  },
  {
    nic: "BR-2026-8942",
    fullName: "Baby Perera",
    documentType: "Birth Certificate",
    date: "2026-09-01",
    verifiedAt: "Registry record",
    statusLabel: "Pending",
    note: "This certificate is still pending approval.",
  },
];

function normalizeNumber(value) {
  return String(value || "").replace(/\s/g, "").toUpperCase();
}

export function findSampleVerification(value) {
  const query = normalizeNumber(value);
  if (!query) {
    return null;
  }

  return [...BANK_VERIFICATIONS, ...CERTIFICATE_LOOKUPS].find(
    (item) => normalizeNumber(item.nic) === query
  );
}
