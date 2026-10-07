const DeathReport = require("../models/DeathReport");
const MarriageRegistration = require("../models/MarriageRegistration");
const NICForm = require("../models/NICForm");
const { parseSriLankanNic } = require("../utils/nicIdentity");

function exact(value) {
  const escaped = String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}

function same(left, right) {
  return exact(left).test(String(right || "").replace(/\s/g, ""));
}

function todayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function row(label, value) {
  const text = String(value || "").trim();
  if (!text) {
    return null;
  }
  return { label, value: text };
}

function rowsOf(pairs) {
  return pairs.filter(Boolean);
}

function deathCertificate(report) {
  return {
    id: String(report._id),
    source: "registry",
    type: "death",
    typeLabel: "DEATH",
    name: report.fullName,
    ref: report.reportReference || String(report._id).slice(-6).toUpperCase(),
    date: report.dateOfDeath,
    status: report.status === "approved" ? "Approved" : "Sent to District Registrar",
    nic: report.nic || "",
    rows: rowsOf([
      row("Reference", report.reportReference),
      row("Name", report.fullName),
      row("NIC", report.nic),
      row("Date of death", report.dateOfDeath),
      row("Place of death", report.placeOfDeath),
      row("Gender", report.gender),
      row("Age", report.age),
      row("Informant", report.informantName),
      row("Informant NIC", report.informantNic),
      row("Relationship", report.relationship),
      row("Division", report.division),
      row("Status", report.status === "approved" ? "Approved" : "Sent to District Registrar"),
    ]),
  };
}

function marriageCertificate(record) {
  return {
    id: String(record._id),
    source: "registry",
    type: "marriage",
    typeLabel: "MARRIAGE",
    name: `${record.groomName} & ${record.brideName}`,
    ref: record.certificateNo || record.registrationReference,
    date: record.marriageDate,
    status: "Sent to District Registrar",
    nic: record.groomNic || "",
    brideNic: record.brideNic || "",
    applicantNic: record.applicantNic || "",
    rows: rowsOf([
      row("Certificate number", record.certificateNo),
      row("Registration reference", record.registrationReference),
      row("Groom", record.groomName),
      row("Groom NIC", record.groomNic),
      row("Groom date of birth", record.groomDob),
      row("Bride", record.brideName),
      row("Bride NIC", record.brideNic),
      row("Bride date of birth", record.brideDob),
      row("Date of marriage", record.marriageDate),
      row("Place", record.marriagePlace),
      row("Registrar", record.registrarName),
      row("Status", "Sent to District Registrar"),
    ]),
  };
}

function birthFromApplication(form) {
  return {
    id: String(form._id),
    source: "registry",
    type: "birth",
    typeLabel: "BIRTH",
    name: form.fullName,
    ref: form.applicationReference || String(form._id).slice(-6).toUpperCase(),
    date: form.dateOfBirth,
    status: form.status === "approved" ? "Approved" : "Pending",
    nic: form.applicationReference || "",
    rows: rowsOf([
      row("Reference", form.applicationReference),
      row("Name", form.fullName),
      row("Date of birth", form.dateOfBirth),
      row("Gender", form.gender),
      row("Place of birth", form.placeOfBirth),
      row("District", form.district),
      row("Father", form.fatherFullName),
      row("Father NIC", form.fatherNic),
      row("Mother", form.motherFullName),
      row("Mother NIC", form.motherNic),
      row("Status", form.status === "approved" ? "Approved" : "Pending"),
    ]),
  };
}

function personFromNic(parsed, extra) {
  return {
    nic: parsed.nic,
    fullName: extra.fullName || "Name not on file",
    dateOfBirth: extra.dateOfBirth || parsed.dateOfBirth,
    gender: parsed.gender,
    documentType: extra.documentType || "National ID (NIC)",
    verifiedAt: "Just now",
    date: todayStamp(),
    statusLabel: extra.statusLabel || "Valid",
    note: extra.note || "",
    certificates: extra.certificates || [],
  };
}

async function lookupIdentity(req, res) {
  try {
    if (req.user.role !== "bank_manager") {
      return res.status(403).json({
        success: false,
        message: "Only a bank manager can verify identity.",
      });
    }

    const query = String(req.query.q || "").replace(/\s/g, "").toUpperCase();
    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Enter an NIC or certificate number.",
      });
    }

    const pattern = exact(query);
    const [deaths, marriages, applications] = await Promise.all([
      DeathReport.find({
        $or: [{ nic: pattern }, { reportReference: pattern }, { informantNic: pattern }],
      }).sort({ submittedAt: -1 }),
      MarriageRegistration.find({
        $or: [
          { groomNic: pattern },
          { brideNic: pattern },
          { applicantNic: pattern },
          { certificateNo: pattern },
          { registrationReference: pattern },
        ],
      }).sort({ submittedAt: -1 }),
      NICForm.find({
        $or: [
          { applicationReference: pattern },
          { fatherNic: pattern },
          { motherNic: pattern },
        ],
      }).sort({ submittedAt: -1 }),
    ]);

    const certificates = [
      ...deaths
        .filter((report) => same(report.nic, query) || same(report.reportReference, query))
        .map(deathCertificate),
      ...marriages.map(marriageCertificate),
      ...applications
        .filter((form) => same(form.applicationReference, query))
        .map(birthFromApplication),
    ];

    const parsed = parseSriLankanNic(query);
    const marriagePerson = marriages.find(
      (record) =>
        same(record.groomNic, query) || same(record.brideNic, query) || same(record.applicantNic, query)
    );
    const deathPerson = deaths.find((report) => same(report.nic, query));
    const parentApplication = applications.find(
      (form) => same(form.fatherNic, query) || same(form.motherNic, query)
    );

    if (marriagePerson) {
      const isBride = same(marriagePerson.brideNic, query);
      const identity = parsed || {
        nic: query,
        gender: "",
        dateOfBirth: isBride ? marriagePerson.brideDob : marriagePerson.groomDob,
      };
      return res.json({
        success: true,
        match: personFromNic(identity, {
          fullName: isBride ? marriagePerson.brideName : marriagePerson.groomName,
          dateOfBirth: isBride ? marriagePerson.brideDob : marriagePerson.groomDob,
          documentType: "National ID (NIC)",
          statusLabel: "Valid",
          note: "This NIC is on a marriage certificate.",
          certificates,
        }),
      });
    }

    if (deathPerson) {
      const identity = parsed || {
        nic: deathPerson.nic,
        gender: deathPerson.gender || "",
        dateOfBirth: "",
      };
      return res.json({
        success: true,
        match: personFromNic(identity, {
          fullName: deathPerson.fullName,
          documentType: "National ID (NIC)",
          statusLabel: "Record",
          note: "This NIC is on a death certificate.",
          certificates,
        }),
      });
    }

    if (parentApplication && parsed) {
      const isMother = same(parentApplication.motherNic, query);
      return res.json({
        success: true,
        match: personFromNic(parsed, {
          fullName: isMother ? parentApplication.motherFullName : parentApplication.fatherFullName,
          documentType: "National ID (NIC)",
          statusLabel: "Valid",
          note: "This NIC is on a birth record.",
          certificates,
        }),
      });
    }

    if (certificates.length > 0) {
      const first = certificates[0];
      const identity = parsed || {
        nic: query,
        gender: "",
        dateOfBirth: "",
      };
      return res.json({
        success: true,
        match: personFromNic(identity, {
          nic: query,
          fullName: first.name,
          documentType: `${first.typeLabel.charAt(0)}${first.typeLabel.slice(1).toLowerCase()} Certificate`,
          statusLabel: first.status === "Approved" ? "Valid" : "Pending",
          note: "Certificate number matched.",
          certificates,
        }),
      });
    }

    if (!parsed) {
      return res.json({ success: true, match: null });
    }

    return res.json({
      success: true,
      match: personFromNic(parsed, {
        fullName: "Name not on file",
        note: "Date of birth and gender are read from this NIC. Open the certificate lists to view every birth, death, and marriage record.",
        certificates: [],
      }),
    });
  } catch (error) {
    console.error("Identity lookup failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not verify this number.",
    });
  }
}

async function listCertificates(req, res) {
  try {
    if (req.user.role !== "bank_manager") {
      return res.status(403).json({
        success: false,
        message: "Only a bank manager can view certificates.",
      });
    }

    const type = String(req.query.type || "").toLowerCase();
    if (!["birth", "death", "marriage"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Choose birth, death, or marriage certificates.",
      });
    }

    if (type === "death") {
      const reports = await DeathReport.find({}).sort({ submittedAt: -1 });
      return res.json({ success: true, certificates: reports.map(deathCertificate) });
    }

    if (type === "marriage") {
      const records = await MarriageRegistration.find({}).sort({ submittedAt: -1 });
      return res.json({ success: true, certificates: records.map(marriageCertificate) });
    }

    return res.json({ success: true, certificates: [] });
  } catch (error) {
    console.error("Certificate list failed:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load certificates.",
    });
  }
}

module.exports = {
  lookupIdentity,
  listCertificates,
};
