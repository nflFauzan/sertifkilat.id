import * as XLSX from "xlsx";

/**
 * Generates and downloads a professional Excel template (XLSX) for participants list.
 */
export function downloadExcelTemplate() {
  // Bold-ready uppercase headers
  const headers = [["Full Name", "Gmail", "Certificate ID (optional)"]];
  const worksheet = XLSX.utils.aoa_to_sheet(headers);

  // Set column widths
  worksheet["!cols"] = [
    { wch: 25 }, // Full Name
    { wch: 30 }, // Gmail
    { wch: 25 }, // Certificate ID (optional)
  ];

  // Add Instruction / Example Note in D1
  worksheet["D1"] = {
    t: "s",
    v: "PETUNJUK: Isi nama lengkap peserta pada kolom 'Full Name' dan alamat Gmail pada kolom 'Gmail'. Kolom 'Certificate ID' opsional untuk nomor sertifikat kustom.",
  };

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Template Peserta");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sertifkilat_template_peserta.xlsx";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
