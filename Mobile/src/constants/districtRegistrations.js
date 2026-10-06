export const BIRTH_STATS = [
  { key: "new", icon: "document-text-outline", value: "5", label: "New Entries" },
  { key: "pending", icon: "hourglass-outline", value: "3", label: "Pending" },
  { key: "approved", icon: "checkmark-circle-outline", value: "12", label: "Approved" },
];

export const DEATH_STATS = [
  { key: "new", icon: "document-text-outline", value: "3", label: "New Registrations" },
  { key: "pending", icon: "hourglass-outline", value: "2", label: "Pending Approval" },
  { key: "approved", icon: "checkmark-circle-outline", value: "8", label: "Approved" },
];

export const BIRTH_REGISTRATIONS = [
  {
    id: "B001",
    kind: "birth",
    name: "Baby Perera",
    date: "2026-09-01",
    status: "Pending",
  },
  {
    id: "B002",
    kind: "birth",
    name: "Baby Silva",
    date: "2026-08-28",
    status: "Approved",
  },
];

export const DEATH_REGISTRATIONS = [
  {
    id: "D001",
    kind: "death",
    name: "Nimal Silva",
    date: "2026-08-28",
    status: "Pending",
  },
  {
    id: "D002",
    kind: "death",
    name: "Kamala Perera",
    date: "2026-08-25",
    status: "Approved",
  },
];

export function districtRegistrationById(registrationId) {
  return [...BIRTH_REGISTRATIONS, ...DEATH_REGISTRATIONS].find((item) => item.id === registrationId);
}

export function districtRegistrationsByKind(kind) {
  if (kind === "death") {
    return DEATH_REGISTRATIONS;
  }
  return BIRTH_REGISTRATIONS;
}
