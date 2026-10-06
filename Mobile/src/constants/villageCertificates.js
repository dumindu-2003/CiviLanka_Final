export const VILLAGE_PORTAL = "GRAMA NILADHARI PORTAL";

export const VILLAGE_CERTIFICATES = [
  {
    id: "BR-2026-8942",
    type: "birth",
    typeLabel: "BIRTH",
    date: "2026-09-01",
    name: "Baby Perera",
    ref: "BR-2026-8942",
    status: "Pending",
    icon: "person-outline",
  },
  {
    id: "DR-2026-1029",
    type: "death",
    typeLabel: "DEATH",
    date: "2026-08-28",
    name: "Nimal Silva",
    ref: "DR-2026-1029",
    status: "Approved",
    icon: "person-outline",
  },
  {
    id: "MR-2026-0418",
    type: "marriage",
    typeLabel: "MARRIAGE",
    date: "2026-08-25",
    name: "Kasun Perera",
    ref: "MR-2026-0418",
    status: "Approved",
    icon: "heart-outline",
  },
];

export const CERTIFICATE_VIEWS = [
  { type: "birth", label: "View Birth Certificate", icon: "document-text-outline" },
  { type: "death", label: "View Death Certificate", icon: "document-text-outline" },
  { type: "marriage", label: "View Married Certificate", icon: "heart-outline" },
];

export function certificatesByType(type) {
  return VILLAGE_CERTIFICATES.filter((item) => item.type === type);
}

export function certificateListTitle(type) {
  if (type === "birth") {
    return "Birth Certificates";
  }
  if (type === "death") {
    return "Death Certificates";
  }
  if (type === "marriage") {
    return "Married Certificates";
  }
  return "Certificates";
}
