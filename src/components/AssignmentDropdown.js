'use client';

import React, { useState } from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { canAssignTo, getRoleLabel, getRoleColor } from '@/lib/staffUtils';

export default function AssignmentDropdown({ 
  aspiration, 
  staff, 
  currentUser, 
  onAssign 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async (staffMember) => {
    if (!onAssign) return;
    
    setIsAssigning(true);
    try {
      await onAssign(aspiration.id, staffMember);
      setIsOpen(false);
    } catch (error) {
      console.error('Assignment error:', error);
      alert('Gagal assign aspirasi');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async () => {
    if (!onAssign) return;
    
    if (confirm('Unassign aspirasi ini?')) {
      setIsAssigning(true);
      try {
        await onAssign(aspiration.id, null);
        setIsOpen(false);
      } catch (error) {
        console.error('Unassignment error:', error);
        alert('Gagal unassign aspirasi');
      } finally {
        setIsAssigning(false);
      }
    }
  };

  // Get currently assigned staff
  const assignedStaff = staff.find(s => s.uid === aspiration.assignedTo);
  
  // Filter staff that can be assigned
  const assignableStaff = staff.filter(s => 
    canAssignTo(currentUser, s) && s.uid !== aspiration.assignedTo
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isAssigning}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-bold
          ${assignedStaff 
            ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
          }
          disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <UserPlus className="w-4 h-4" />
        {assignedStaff ? assignedStaff.displayName : 'Unassigned'}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-purple-50">
              <h4 className="font-black text-sm text-slate-900">Assign To</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                #{aspiration.tracking_code}
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto p-2">
              {/* Current Assignment */}
              {assignedStaff && (
                <div className="p-3 mb-2 rounded-lg bg-green-50 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-sm text-green-900">
                        {assignedStaff.displayName}
                      </div>
                      <div className="text-xs text-green-700">
                        Currently assigned
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRoleColor(assignedStaff.role)}`}>
                      {getRoleLabel(assignedStaff.role)}
                    </span>
                  </div>
                  <button
                    onClick={handleUnassign}
                    disabled={isAssigning}
                    className="w-full px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 
                             text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Unassign
                  </button>
                </div>
              )}

              {/* Available Staff */}
              {assignableStaff.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">
                  No available staff to assign
                </div>
              ) : (
                assignableStaff.map((member) => (
                  <button
                    key={member.uid}
                    onClick={() => handleAssign(member)}
                    disabled={isAssigning}
                    className="w-full p-3 hover:bg-blue-50 rounded-lg transition-all text-left
                             disabled:opacity-50 disabled:cursor-not-allowed mb-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-900">
                          {member.displayName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {member.email}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {member.assignedCount || 0} assigned
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getRoleColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
