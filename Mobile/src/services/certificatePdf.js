function pdfText(value) {
  return String(value ?? "-")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function assemblePdf(objects) {
  let pdf = "%PDF-1.4\n";
  const offsets = [];

  objects.forEach((objectBody, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${objectBody}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

export function buildCertificatePdf(title, reference, rows) {
  const commands = [
    "0.039 0.122 0.267 rg",
    "0 760 595 82 re f",
    "0.957 0.769 0.188 rg",
    "0 754 595 6 re f",
    "BT",
    "1 1 1 rg",
    "/F2 22 Tf",
    "40 792 Td",
    `(${pdfText(title)}) Tj`,
    "ET",
    "BT",
    "0.957 0.769 0.188 rg",
    "/F1 10 Tf",
    "40 774 Td",
    "(CIVILANKA) Tj",
    "ET",
    "BT",
    "0.039 0.122 0.267 rg",
    "/F2 16 Tf",
    "40 710 Td",
    `(${pdfText(reference)}) Tj`,
    "ET",
    "0.039 0.122 0.267 rg",
    "40 678 78 16 re f",
    "BT",
    "1 1 1 rg",
    "/F1 9 Tf",
    "48 682 Td",
    "(Approved) Tj",
    "ET",
  ];

  let y = 640;
  rows.forEach(([label, value]) => {
    commands.push(
      "BT",
      "0.420 0.447 0.502 rg",
      "/F1 10 Tf",
      `40 ${y} Td`,
      `(${pdfText(label)}) Tj`,
      "ET",
      "BT",
      "0.118 0.118 0.118 rg",
      "/F2 13 Tf",
      `40 ${y - 16} Td`,
      `(${pdfText(value || "-")}) Tj`,
      "ET",
      "0.875 0.882 0.894 RG",
      "1 w",
      `40 ${y - 26} m 555 ${y - 26} l S`
    );
    y -= 44;
  });

  commands.push(
    "BT",
    "0.420 0.447 0.502 rg",
    "/F1 9 Tf",
    `40 ${Math.max(y - 10, 48)} Td`,
    "(Issued for the Grama Niladhari division. This copy can be saved or printed.) Tj",
    "ET"
  );

  const stream = commands.join("\n");
  return assemblePdf([
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ]);
}
