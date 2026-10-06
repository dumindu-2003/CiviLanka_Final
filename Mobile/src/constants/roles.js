export const STAFF_ROLES = [
  { value: "village_officer", label: "Village Officer" },
  { value: "district_registrar", label: "District Registrar" },
  { value: "marriage_registrar", label: "Marriage Registrar" },
  { value: "bank_manager", label: "Bank Manager" },
  { value: "admin", label: "Admin" },
];

export function roleLabel(role) {
  const match = STAFF_ROLES.find((item) => item.value === role);
  return match ? match.label : "Officer";
}
