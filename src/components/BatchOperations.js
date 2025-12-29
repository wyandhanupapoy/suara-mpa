'use client';

import React, { useState } from 'react';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  UserCheck, 
  Edit3,
  Download,
  AlertCircle
} from 'lucide-react';

export default function BatchOperations({ 
  selectedAspirations,
  allAspirations,
  staff,
  currentUser,
  onBatchUpdate,
  onBatchAssign,
  onBatchDelete,
  onBatchExport,
  onClearSelection
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(null);

  const selectedCount = selectedAspirations.length;
  const allSelected = selectedCount === allAspirations.length && allAspirations.length > 0;

  const handleBatchStatusUpdate = async (newStatus) => {
    if (selectedCount === 0) return;
    
    setShowConfirmDialog({
      title: 'Update Status',
      message: `Update status ${selectedCount} aspirasi ke "${newStatus}"?`,
      action: async () => {
        setIsProcessing(true);
        try {
          await onBatchUpdate?.(selectedAspirations, { status: newStatus });
          onClearSelection?.();
        } catch (error) {
          console.error('Batch update error:', error);
          alert('Gagal update status');
        } finally {
          setIsProcessing(false);
          setShowConfirmDialog(null);
        }
      }
    });
  };

  const handleBatchAssign = async (staffMember) => {
    if (selectedCount === 0) return;
    
    setShowConfirmDialog({
      title: 'Batch Assignment',
      message: `Assign ${selectedCount} aspirasi ke ${staffMember?.displayName || 'Unassigned'}?`,
      action: async () => {
        setIsProcessing(true);
        try {
          await onBatchAssign?.(selectedAspirations, staffMember);
          onClearSelection?.();
        } catch (error) {
          console.error('Batch assign error:', error);
          alert('Gagal assign aspirasi');
        } finally {
          setIsProcessing(false);
          setShowConfirmDialog(null);
        }
      }
    });
  };

  const handleBatchDelete = () => {
    if (selectedCount === 0) return;
    
    setShowConfirmDialog({
      title: 'Delete Aspirations',
      message: `PERMANENTLY DELETE ${selectedCount} aspirasi? This action cannot be undone!`,
      danger: true,
      action: async () => {
        setIsProcessing(true);
        try {
          await onBatchDelete?.(selectedAspirations);
          onClearSelection?.();
        } catch (error) {
          console.error('Batch delete error:', error);
          alert('Gagal delete aspirasi');
        } finally {
          setIsProcessing(false);
          setShowConfirmDialog(null);
        }
      }
    });
  };

  const handleBatchExport = () => {
    if (selectedCount === 0) return;
    onBatchExport?.(selectedAspirations);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* Batch Actions Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-dark rounded-2xl shadow-2xl border border-white/20 p-4 flex items-center gap-4 min-w-[600px]">
          {/* Selection Info */}
          <div className="flex items-center gap-3 pr-4 border-r border-white/20">
            <CheckSquare className="w-5 h-5 text-blue-400" />
            <div>
              <div className="text-white font-black text-sm">
                {selectedCount} Selected
              </div>
              <div className="text-blue-300 text-xs">
                {allSelected ? 'All items' : 'Click actions →'}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-1">
            {/* Status Update Dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold 
                               rounded-lg transition-all border border-white/20 flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                Update Status
              </button>
              <div className="absolute bottom-full mb-2 left-0 w-48 bg-white rounded-lg shadow-xl 
                            border border-slate-200 opacity-0 invisible group-hover:opacity-100 
                            group-hover:visible transition-all">
                {['received', 'verified', 'process', 'followed_up', 'finished', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleBatchStatusUpdate(status)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 
                             hover:bg-blue-50 transition-all first:rounded-t-lg last:rounded-b-lg"
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Assign Dropdown */}
            {staff && staff.length > 0 && (
              <div className="relative group">
                <button className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold 
                                 rounded-lg transition-all border border-white/20 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Assign
                </button>
                <div className="absolute bottom-full mb-2 left-0 w-56 bg-white rounded-lg shadow-xl 
                              border border-slate-200 opacity-0 invisible group-hover:opacity-100 
                              group-hover:visible transition-all max-h-64 overflow-y-auto">
                  <button
                    onClick={() => handleBatchAssign(null)}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 text-left text-sm font-medium text-slate-700 
                             hover:bg-blue-50 transition-all border-b border-slate-100"
                  >
                    Unassign
                  </button>
                  {staff.map((member) => (
                    <button
                      key={member.uid}
                      onClick={() => handleBatchAssign(member)}
                      disabled={isProcessing}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-all"
                    >
                      <div className="font-medium text-slate-900">{member.displayName}</div>
                      <div className="text-xs text-slate-500">{member.email}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Export */}
            <button
              onClick={handleBatchExport}
              disabled={isProcessing}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold 
                       rounded-lg transition-all border border-white/20 flex items-center gap-2
                       disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            {/* Delete */}
            <button
              onClick={handleBatchDelete}
              disabled={isProcessing}
              className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-bold 
                       rounded-lg transition-all border border-red-400/20 flex items-center gap-2
                       disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          {/* Clear Selection */}
          <button
            onClick={onClearSelection}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold 
                     rounded-lg transition-all border border-white/20"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                ${showConfirmDialog.danger 
                  ? 'bg-red-100 text-red-600' 
                  : 'bg-blue-100 text-blue-600'
                }`}>
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-black text-slate-900 mb-1">
                  {showConfirmDialog.title}
                </h3>
                <p className="text-sm text-slate-600">
                  {showConfirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmDialog(null)}
                disabled={isProcessing}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 
                         font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                onClick={showConfirmDialog.action}
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 font-bold rounded-lg transition-all
                  ${showConfirmDialog.danger
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
