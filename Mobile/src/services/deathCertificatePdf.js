function escapeHtml(value) {
  return String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildDeathCertificateHtml(application, issuedAt = new Date()) {
  if (application.statusCode !== "approved") {
    throw new Error("Only approved death applications can generate a certificate.");
  }

  const fields = [
    ["Date of death", application.dateOfDeath],
    ["Place of death", application.placeOfDeath],
    ["Gender", application.gender],
    ["Age", application.age],
    ["Deceased NIC", application.nic],
    ["Informant", application.informantName],
    ["Informant NIC", application.informantNic],
    ["Relationship", application.relationship],
    ["Informant phone", application.informantPhone],
    ["Division", application.division],
  ];
  const details = fields
    .map(
      ([label, value]) => `
        <div class="detail-row">
          <div class="detail-label">${escapeHtml(label)}</div>
          <div class="detail-value">${escapeHtml(value)}</div>
        </div>`
    )
    .join("");
  const issueDate = issuedAt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      @page { size: A4 portrait; margin: 0; }
      * { box-sizing: border-box; }
      body { margin: 0; padding: 32px; color: #17243a; background: #fff; font-family: Georgia, "Times New Roman", serif; }
      .certificate { min-height: 780px; padding: 38px 42px 30px; border: 2px solid #10294b; outline: 1px solid #c69b42; outline-offset: -9px; }
      .top-rule { height: 7px; margin: -12px 0 24px; background: #c69b42; }
      .brand, .heading { text-align: center; color: #10294b; }
      .brand-mark { display: inline-flex; width: 54px; height: 54px; align-items: center; justify-content: center; border: 2px solid #c69b42; border-radius: 50%; font: bold 25px Arial, sans-serif; }
      .republic { margin-top: 14px; font: 700 11px Arial, sans-serif; letter-spacing: 1.8px; }
      .department { margin-top: 7px; color: #596579; font: 10px Arial, sans-serif; letter-spacing: .5px; }
      .divider { height: 1px; margin: 23px 0; background: #d7c18e; }
      .approved { display: inline-block; padding: 6px 12px; border: 1px solid #bad8c3; border-radius: 20px; color: #22643b; background: #edf7ef; font: 700 9px Arial, sans-serif; letter-spacing: 1px; }
      h1 { margin: 17px 0 7px; color: #10294b; font-size: 29px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
      .subtitle { margin: 0; color: #697589; font: 11px Arial, sans-serif; }
      .reference { margin: 22px auto 25px; padding: 10px 14px; border-top: 1px solid #e5dfd0; border-bottom: 1px solid #e5dfd0; color: #10294b; font: 10px Arial, sans-serif; text-align: center; }
      .intro { margin: 0 0 10px; color: #596579; font-size: 13px; line-height: 1.65; text-align: center; }
      .person-name { margin: 0 0 21px; color: #10294b; font-size: 24px; font-weight: 700; text-align: center; }
      .details { border-top: 1px solid #e6e9ed; }
      .detail-row { display: flex; min-height: 38px; align-items: center; border-bottom: 1px solid #e6e9ed; }
      .detail-label { width: 37%; padding: 8px 12px 8px 4px; color: #697589; font: 700 10px Arial, sans-serif; text-transform: uppercase; }
      .detail-value { flex: 1; padding: 8px 4px; color: #202b3b; font-size: 12px; }
      .footer { display: flex; justify-content: space-between; margin-top: 34px; padding-top: 12px; border-top: 1px solid #d7c18e; color: #697589; font: 9px Arial, sans-serif; }
      .footer strong { color: #10294b; }
      .notice { margin-top: 18px; color: #8790a0; font: 8px Arial, sans-serif; line-height: 1.5; text-align: center; }
    </style>
  </head>
  <body>
    <main class="certificate">
      <div class="top-rule"></div>
      <header class="brand">
        <div class="brand-mark">C</div>
        <div class="republic">DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA</div>
        <div class="department">CIVIL REGISTRATION • DISTRICT REGISTRAR</div>
      </header>
      <div class="divider"></div>
      <section class="heading">
        <span class="approved">APPLICATION APPROVED</span>
        <h1>Certificate of Death</h1>
        <p class="subtitle">CERTIFIED DEATH REGISTRATION RECORD</p>
      </section>
      <div class="reference">REGISTRATION REFERENCE &nbsp; <strong>${escapeHtml(application.reportReference)}</strong></div>
      <p class="intro">This is to certify that the following death particulars are recorded in the CiviLanka civil registration system:</p>
      <p class="person-name">${escapeHtml(application.fullName)}</p>
      <section class="details">${details}</section>
      <footer class="footer">
        <span>ISSUED <strong>${escapeHtml(issueDate)}</strong></span>
        <span>STATUS <strong>APPROVED</strong></span>
      </footer>
      <p class="notice">Digitally generated certificate copy. Verify the registration reference against the official civil register where required.</p>
    </main>
  </body>
</html>`;
}
