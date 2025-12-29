'use client';

import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF, exportWithFilters, exportSummaryReport } from '@/lib/exportUtils';

export default function ExportButton({ aspirations, analytics, filters }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    
    try {
      let result;
      
      if (filters && (filters.category || filters.status || filters.startDate || filters.endDate)) {
        // Export with filters
        result = exportWithFilters(aspirations, filters, format);
      } else {
        // Export all data
        switch (format) {
          case 'excel':
            result = exportToExcel(aspirations);
            break;
          case 'csv':
            result = exportToCSV(aspirations);
            break;
          case 'pdf':
            result = exportToPDF(aspirations);
            break;
          case 'summary':
            if (analytics) {
              result = exportSummaryReport(aspirations, analytics);
            } else {
              result = { success: false, message: 'Analytics data not available' };
            }
            break;
          default:
            result = { success: false, message: 'Invalid format' };
        }
      }
      
      if (result.success) {
        // Show success message (you can replace this with a toast notification)
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal melakukan export');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportOptions = [
    {
      format: 'excel',
      label: 'Excel (.xlsx)',
      icon: <FileSpreadsheet className="w-5 h-5" />,
      description: 'Format terbaik untuk analisis data',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      format: 'csv',
      label: 'CSV',
      icon: <FileText className="w-5 h-5" />,
      description: 'Kompatibel dengan semua software',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      format: 'pdf',
      label: 'PDF',
      icon: <File className="w-5 h-5" />,
      description: 'Format untuk dokumentasi resmi',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    }
  ];

  if (analytics) {
    exportOptions.push({
      format: 'summary',
      label: 'Summary Report (PDF)',
      icon: <FileText className="w-5 h-5" />,
      description: 'Laporan ringkasan dengan grafik',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!aspirations || aspirations.length === 0 || isExporting}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                 text-white font-bold rounded-xl transition-all
                 disabled:opacity-50 disabled:cursor-not-allowed
                 shadow-lg hover:shadow-xl"
      >
        <Download className="w-5 h-5" />
        <span>Export Data</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="font-black text-slate-900">Export Aspirasi</h3>
              <p className="text-xs text-slate-500 mt-1">
                {aspirations.length} aspirasi akan di-export
              </p>
            </div>

            <div className="p-2 max-h-96 overflow-y-auto">
              {exportOptions.map((option) => (
                <button
                  key={option.format}
                  onClick={() => handleExport(option.format)}
                  disabled={isExporting}
                  className={`w-full px-4 py-3 rounded-xl transition-all text-left
                    ${option.bgColor} ${option.hoverColor}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    mb-2 last:mb-0`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${option.color} mt-0.5`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className={`font-bold ${option.color}`}>
                        {option.label}
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5">
                        {option.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filters && (filters.category || filters.status) && (
              <div className="p-4 border-t border-slate-100 bg-blue-50">
                <p className="text-xs font-bold text-blue-800">
                  Filter aktif akan diterapkan pada export
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
