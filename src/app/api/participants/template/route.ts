import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export function GET() {
  // Create workbook
  const wb = XLSX.utils.book_new();

  // Define headers and sample row
  const headers = ["Full Name", "Email", "Institution", "Position"];
  const sampleRow = [
    "Rahma Fitria",
    "rahma@example.com",
    "Universitas ABC",
    "Participant",
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, sampleRow]);

  // Style headers: bold + column widths
  const colWidths = [{ wch: 28 }, { wch: 32 }, { wch: 30 }, { wch: 20 }];
  ws["!cols"] = colWidths;

  // Mark header cells bold
  headers.forEach((_, col) => {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!ws[cellRef]) return;
    ws[cellRef].s = { font: { bold: true } };
  });

  XLSX.utils.book_append_sheet(wb, ws, "Participants");

  // Write to buffer
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition":
        'attachment; filename="sertifkilat_template_peserta.xlsx"',
      "Cache-Control": "no-cache",
    },
  });
}
