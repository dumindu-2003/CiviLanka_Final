function escapeHtml(value) {
  return String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildBirthCertificateHtml(application, issuedAt = new Date()) {
  const fields = [
    ["Date of birth", application.birthDate],
    ["Time of birth", application.birthTime],
    ["Sex", application.gender],
    ["Place of birth", application.hospitalName],
    ["Father's name", application.fatherName],
    ["Mother's name", application.motherName],
    ["Family address", application.address],
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
      body {
        margin: 0;
        padding: 32px;
        color: #17243a;
        background: #fff;
        font-family: Georgia, "Times New Roman", serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .certificate {
        position: relative;
        min-height: 780px;
        padding: 38px 42px 30px;
        border: 2px solid #10294b;
        outline: 1px solid #c69b42;
        outline-offset: -9px;
      }
      .top-rule { height: 7px; margin: -12px 0 24px; background: #c69b42; }
      .brand { text-align: center; color: #10294b; }
      .brand-mark {
        display: inline-flex;
        width: 54px;
        height: 54px;
        align-items: center;
        justify-content: center;
        border: 2px solid #c69b42;
        border-radius: 50%;
        color: #10294b;
        font-family: Arial, sans-serif;
        font-size: 25px;
        font-weight: bold;
      }
      .republic {
        margin-top: 14px;
        font-family: Arial, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 1.8px;
      }
      .department {
        margin-top: 7px;
        color: #596579;
        font-family: Arial, sans-serif;
        font-size: 10px;
        letter-spacing: .5px;
      }
      .divider { height: 1px; margin: 23px 0; background: #d7c18e; }
      .approved {
        display: inline-block;
        padding: 6px 12px;
        border: 1px solid #bad8c3;
        border-radius: 20px;
        color: #22643b;
        background: #edf7ef;
        font-family: Arial, sans-serif;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 1px;
      }
      h1 {
        margin: 17px 0 7px;
        color: #10294b;
        font-size: 29px;
        font-weight: 600;
        letter-spacing: 2px;
        text-align: center;
        text-transform: uppercase;
      }
      .subtitle {
        margin: 0;
        color: #697589;
        font-family: Arial, sans-serif;
        font-size: 11px;
        text-align: center;
      }
      .reference {
        margin: 22px auto 25px;
        padding: 10px 14px;
        border-top: 1px solid #e5dfd0;
        border-bottom: 1px solid #e5dfd0;
        color: #10294b;
        font-family: Arial, sans-serif;
        font-size: 10px;
        text-align: center;
      }
      .intro {
        margin: 0 0 10px;
        color: #596579;
        font-size: 13px;
        line-height: 1.65;
        text-align: center;
      }
      .child-name {
        margin: 0 0 21px;
        color: #10294b;
        font-size: 24px;
        font-weight: 700;
        text-align: center;
      }
      .details { border-top: 1px solid #e6e9ed; }
      .detail-row {
        display: flex;
        min-height: 42px;
        align-items: center;
        border-bottom: 1px solid #e6e9ed;
      }
      .detail-label {
        width: 37%;
        padding: 10px 12px 10px 4px;
        color: #697589;
        font-family: Arial, sans-serif;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
      }
      .detail-value {
        flex: 1;
        padding: 10px 4px;
        color: #202b3b;
        font-size: 13px;
      }
      .attestation {
        margin: 23px 0 0;
        color: #596579;
        font-size: 11px;
        line-height: 1.6;
        text-align: center;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        margin-top: 42px;
        padding-top: 12px;
        border-top: 1px solid #d7c18e;
        color: #697589;
        font-family: Arial, sans-serif;
        font-size: 9px;
      }
      .footer strong { color: #10294b; }
      .notice {
        margin-top: 18px;
        color: #8790a0;
        font-family: Arial, sans-serif;
        font-size: 8px;
        line-height: 1.5;
        text-align: center;
      }
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
      <section style="text-align:center">
        <span class="approved">APPLICATION APPROVED</span>
        <h1>Certificate of Birth</h1>
        <p class="subtitle">CERTIFIED BIRTH REGISTRATION RECORD</p>
      </section>
      <div class="reference">
        REGISTRATION REFERENCE &nbsp; <strong>${escapeHtml(application.applicationReference)}</strong>
      </div>
      <p class="intro">This is to certify that the following birth particulars are recorded in the CiviLanka civil registration system:</p>
      <p class="child-name">${escapeHtml(application.birthName)}</p>
      <section class="details">${details}</section>
      <p class="attestation">This certificate reflects the approved application record identified above. The particulars should be verified against the official civil register where required.</p>
      <footer class="footer">
        <span>ISSUED <strong>${escapeHtml(issueDate)}</strong></span>
        <span>STATUS <strong>APPROVED</strong></span>
      </footer>
      <p class="notice">Digitally generated certificate copy. The application reference is provided for registry verification.</p>
    </main>
  </body>
</html>`;
}
