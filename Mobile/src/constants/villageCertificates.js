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
    place: "Colombo",
    division: "Grama Niladhari Division",
    gender: "Female",
    father: "Sunil Perera",
    mother: "Kumari Perera",
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
    place: "Gampaha",
    division: "Grama Niladhari Division",
    age: "68",
    informant: "Sanduni Silva",
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
    place: "Kandy",
    division: "Grama Niladhari Division",
    spouse: "Nadeesha Fernando",
    registrar: "Malith Fernando",
  },
];

export const VILLAGE_CERTIFICATE_RECORDS = [
  ...VILLAGE_CERTIFICATES,
  {
    id: "BR-2026-8801",
    type: "birth",
    typeLabel: "BIRTH",
    date: "2026-08-12",
    name: "Sahan Jayasuriya",
    ref: "BR-2026-8801",
    status: "Approved",
    icon: "person-outline",
    place: "Galle",
    division: "Grama Niladhari Division",
    gender: "Male",
    father: "Ruwan Jayasuriya",
    mother: "Dilani Jayasuriya",
  },
  {
    id: "BR-2026-8714",
    type: "birth",
    typeLabel: "BIRTH",
    date: "2026-07-30",
    name: "Amaya Fernando",
    ref: "BR-2026-8714",
    status: "Approved",
    icon: "person-outline",
    place: "Matara",
    division: "Grama Niladhari Division",
    gender: "Female",
    father: "Pradeep Fernando",
    mother: "Chamari Fernando",
  },
  {
    id: "DR-2026-0981",
    type: "death",
    typeLabel: "DEATH",
    date: "2026-08-14",
    name: "Sunil Fernando",
    ref: "DR-2026-0981",
    status: "Approved",
    icon: "person-outline",
    place: "Kalutara",
    division: "Grama Niladhari Division",
    age: "74",
    informant: "Nimal Fernando",
  },
  {
    id: "DR-2026-0916",
    type: "death",
    typeLabel: "DEATH",
    date: "2026-07-22",
    name: "Kamala Rathnayake",
    ref: "DR-2026-0916",
    status: "Pending",
    icon: "person-outline",
    place: "Kurunegala",
    division: "Grama Niladhari Division",
    age: "81",
    informant: "Thisara Rathnayake",
  },
  {
    id: "MR-2026-0392",
    type: "marriage",
    typeLabel: "MARRIAGE",
    date: "2026-08-02",
    name: "Ruwan Perera",
    ref: "MR-2026-0392",
    status: "Approved",
    icon: "heart-outline",
    place: "Colombo",
    division: "Grama Niladhari Division",
    spouse: "Nadeesha Silva",
    registrar: "Malith Fernando",
  },
  {
    id: "MR-2026-0366",
    type: "marriage",
    typeLabel: "MARRIAGE",
    date: "2026-07-18",
    name: "Thisara Silva",
    ref: "MR-2026-0366",
    status: "Pending",
    icon: "heart-outline",
    place: "Gampaha",
    division: "Grama Niladhari Division",
    spouse: "Dilani Rathnayake",
    registrar: "Malith Fernando",
  },
];

export const VILLAGE_NEWS = [
  {
    id: "news-nic",
    date: "2 Oct 2026",
    title: "NIC applications open this week",
    body: "Village officers can accept National Identity Card applications for residents in this division. Submit the completed form for district registrar review.",
  },
  {
    id: "news-birth",
    date: "20 Sep 2026",
    title: "Register births within the required period",
    body: "Birth certificates for this division should be checked against the local register before they are marked approved.",
  },
  {
    id: "news-hours",
    date: "1 Sep 2026",
    title: "Grama Niladhari office hours",
    body: "Certificate viewing and NIC form assistance are available on working days from 8.30 a.m. to 4.15 p.m.",
  },
];

export const VILLAGE_NOTIFICATIONS = [
  {
    id: "note-birth",
    title: "Birth certificate pending",
    body: "BR-2026-8942 for Baby Perera is waiting for review.",
    time: "1 Sep 2026",
  },
  {
    id: "note-death",
    title: "Death certificate approved",
    body: "DR-2026-1029 for Nimal Silva has been approved.",
    time: "28 Aug 2026",
  },
  {
    id: "note-marriage",
    title: "Marriage certificate approved",
    body: "MR-2026-0418 for Kasun Perera has been approved.",
    time: "25 Aug 2026",
  },
];

export const CERTIFICATE_VIEWS = [
  { type: "birth", label: "View Birth Certificate", icon: "document-text-outline" },
  { type: "death", label: "View Death Certificate", icon: "document-text-outline" },
  { type: "marriage", label: "View Married Certificate", icon: "heart-outline" },
];

export function certificatesByType(type) {
  return VILLAGE_CERTIFICATE_RECORDS.filter((item) => item.type === type);
}

export function certificateById(id) {
  return VILLAGE_CERTIFICATE_RECORDS.find((item) => item.id === id);
}

export function certificateDetailRows(item) {
  if (!item) {
    return [];
  }
  if (item.type === "birth") {
    return [
      ["Reference", item.ref],
      ["Child", item.name],
      ["Date of birth", item.date],
      ["Gender", item.gender],
      ["Place of birth", item.place],
      ["Father", item.father],
      ["Mother", item.mother],
      ["Division", item.division],
    ];
  }
  if (item.type === "death") {
    return [
      ["Reference", item.ref],
      ["Name", item.name],
      ["Date of death", item.date],
      ["Age", item.age],
      ["Place", item.place],
      ["Informant", item.informant],
      ["Division", item.division],
    ];
  }
  return [
    ["Reference", item.ref],
    ["Name", item.name],
    ["Spouse", item.spouse],
    ["Date of marriage", item.date],
    ["Place", item.place],
    ["Registrar", item.registrar],
    ["Division", item.division],
  ];
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
