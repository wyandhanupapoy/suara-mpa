/**
 * Export Utilities for Aspirations Data
 * Supports Excel, CSV, and PDF export
 */

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Format date for export
 */
const formatDateForExport = (timestamp) => {
  if (!timestamp) return '-';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return '-';
  }
};

/**
 * Get status label in Indonesian
 */
const getStatusLabel = (status) => {
  const labels = {
    received: 'Diterima',
    verified: 'Diverifikasi',
    process: 'Dalam Proses',
    followed_up: 'Ditindaklanjuti',
    finished: 'Selesai',
    rejected: 'Ditolak/Spam'
  };
  return labels[status] || status;
};

/**
 * Prepare data for export
 */
const prepareDataForExport = (aspirations) => {
  return aspirations.map((asp, index) => ({
    'No': index + 1,
    'Kode Tracking': asp.tracking_code || '-',
    'Tanggal': formatDateForExport(asp.created_at),
    'Kategori': asp.category || '-',
    'Judul': asp.title || '-',
    'Deskripsi': asp.description || '-',
    'Status': getStatusLabel(asp.status),
    'Respon Admin': asp.admin_response || '-',
    'Terakhir Update': formatDateForExport(asp.updated_at)
  }));
};

/**
 * Export to Excel (.xlsx)
 */
export const exportToExcel = (aspirations, filename = 'aspirasi-mpa') => {
  try {
    const data = prepareDataForExport(aspirations);
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Set column widths
    const wscols = [
      { wch: 5 },  // No
      { wch: 15 }, // Kode Tracking
      { wch: 18 }, // Tanggal
      { wch: 12 }, //Kategori
      { wch: 30 }, // Judul
      { wch: 50 }, // Deskripsi
      { wch: 15 }, // Status
      { wch: 40 }, // Respon Admin
      { wch: 18 }  // Terakhir Update
    ];
    ws['!cols'] = wscols;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Aspirasi');
    
    // Generate file
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `${filename}_${timestamp}.xlsx`);
    
    return { success: true, message: 'Excel file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, message: 'Failed to export to Excel' };
  }
};

/**
 * Export to CSV
 */
export const exportToCSV = (aspirations, filename = 'aspirasi-mpa') => {
  try {
    const data = prepareDataForExport(aspirations);
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Convert to CSV
    const csv = XLSX.utils.sheet_to_csv(ws);
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    const timestamp = new Date().toISOString().slice(0, 10);
    link.setAttribute('download', `${filename}_${timestamp}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true, message: 'CSV file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, message: 'Failed to export to CSV' };
  }
};

/**
 * Export to PDF
 */
export const exportToPDF = (aspirations, filename = 'aspirasi-mpa') => {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape, millimeters, A4
    
    // Add title
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Laporan Aspirasi MPA HIMAKOM', 14, 15);
    
    // Add metadata
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total: ${aspirations.length} aspirasi`, 14, 22);
    doc.text(`Tanggal Export: ${new Date().toLocaleString('id-ID')}`, 14, 27);
    
    // Prepare table data
    const tableData = aspirations.map((asp, index) => [
      index + 1,
      asp.tracking_code || '-',
      formatDateForExport(asp.created_at),
      asp.category || '-',
      asp.title || '-',
      getStatusLabel(asp.status)
    ]);
    
    // Add table
    doc.autoTable({
      startY: 32,
      head: [['No', 'Kode', 'Tanggal', 'Kategori', 'Judul', 'Status']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      headStyles: {
        fillColor: [37, 99, 235], // blue-600
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252] // slate-50
      },
      columnStyles: {
        0: { cellWidth: 10 },  // No
        1: { cellWidth: 25 },  // Kode
        2: { cellWidth: 35 },  // Tanggal
        3: { cellWidth: 25 },  // Kategori
        4: { cellWidth: 'auto' }, // Judul
        5: { cellWidth: 30 }   // Status
      },
      margin: { left: 14, right: 14 }
    });
    
    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`${filename}_${timestamp}.pdf`);
    
    return { success: true, message: 'PDF file downloaded successfully' };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return { success: false, message: 'Failed to export to PDF' };
  }
};

/**
 * Export filtered data with date range
 */
export const exportWithFilters = (aspirations, filters, format = 'excel') => {
  let filteredData = [...aspirations];
  
  // Apply filters
  if (filters.category) {
    filteredData = filteredData.filter(asp => asp.category === filters.category);
  }
  
  if (filters.status) {
    filteredData = filteredData.filter(asp => asp.status === filters.status);
  }
  
  if (filters.startDate) {
    filteredData = filteredData.filter(asp => {
      const aspDate = asp.created_at?.toDate ? asp.created_at.toDate() : new Date(asp.created_at);
      return aspDate >= new Date(filters.startDate);
    });
  }
  
  if (filters.endDate) {
    filteredData = filteredData.filter(asp => {
      const aspDate = asp.created_at?.toDate ? asp.created_at.toDate() : new Date(asp.created_at);
      return aspDate <= new Date(filters.endDate);
    });
  }
  
  // Generate filename based on filters
  let filename = 'aspirasi-mpa';
  if (filters.category) filename += `_${filters.category}`;
  if (filters.status) filename += `_${filters.status}`;
  
  // Export based on format
  switch (format.toLowerCase()) {
    case 'excel':
    case 'xlsx':
      return exportToExcel(filteredData, filename);
    case 'csv':
      return exportToCSV(filteredData, filename);
    case 'pdf':
      return exportToPDF(filteredData, filename);
    default:
      return { success: false, message: 'Unsupported export format' };
  }
};

/**
 * Generate summary report PDF
 */
export const exportSummaryReport = (aspirations, analytics) => {
  try {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('Laporan Summary Aspirasi', 14, 20);
    doc.text('MPA HIMAKOM POLBAN', 14, 30);
    
    // Period
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Periode: ${new Date().toLocaleDateString('id-ID')}`, 14, 40);
    
    // Key Metrics
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Ringkasan Utama', 14, 50);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const metrics = [
      `Total Aspirasi: ${analytics.totalAspirations}`,
      `Pending: ${analytics.pending}`,
      `Dalam Proses: ${analytics.inProgress}`,
      `Selesai: ${analytics.finished}`,
      `Rata-rata Waktu Respon: ${analytics.avgResponseTime} hari`,
      `Completion Rate: ${analytics.completionRate}%`
    ];
    
    metrics.forEach((metric, index) => {
      doc.text(metric, 14, 58 + (index * 7));
    });
    
    // Category Distribution
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Distribusi Kategori', 14, 105);
    
    doc.autoTable({
      startY: 110,
      head: [['Kategori', 'Jumlah', 'Persentase']],
      body: analytics.categoryData.map(cat => [
        cat.name,
        cat.value,
        `${cat.percentage}%`
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] }
    });
    
    // Save
    const timestamp = new Date().toISOString().slice(0, 10);
    doc.save(`summary-report_${timestamp}.pdf`);
    
    return { success: true, message: 'Summary report downloaded successfully' };
  } catch (error) {
    console.error('Error generating summary report:', error);
    return { success: false, message: 'Failed to generate summary report' };
  }
};
