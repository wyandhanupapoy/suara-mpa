'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield, 
  Mail,
  Phone,
  Save,
  X,
  Search,
  Filter
} from 'lucide-react';
import { 
  ROLES, 
  getRoleLabel, 
  getRoleColor,
  hasPermission,
  PERMISSIONS,
  validateStaffData
} from '@/lib/staffUtils';

export default function StaffManager({ currentUser, db, appId }) {
  const [staff, setStaff] = useState([]);
  const [isAddingStaff, setIsAddingStaff] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: ROLES.STAFF,
    phone: ''
  });

  // Check if current user can manage staff
  const canManageStaff = hasPermission(currentUser?.role, PERMISSIONS.MANAGE_STAFF);

  // Load staff from Firestore (placeholder - implement actual Firebase query)
  useEffect(() => {
    // TODO: Firebase query
    // For now, load from localStorage as demo
    const savedStaff = localStorage.getItem('staffMembers');
    if (savedStaff) {
      setStaff(JSON.parse(savedStaff));
    } else {
      // Demo data
      setStaff([
        {
          uid: 'demo-admin',
          email: 'admin@himakom.ac.id',
          displayName: 'Admin MPA',
          role: ROLES.ADMIN,
          phone: '081234567890',
          createdAt: new Date('2024-01-01'),
          assignedCount: 0
        }
      ]);
    }
  }, [db, appId]);

  const saveStaff = (newStaff) => {
    localStorage.setItem('staffMembers', JSON.stringify(newStaff));
    setStaff(newStaff);
  };

  const handleSave = () => {
    const validation = validateStaffData(formData);
    
    if (!validation.valid) {
      alert(validation.errors.join('\n'));
      return;
    }

    if (editingStaff !== null) {
      // Update existing
      const updated = staff.map((s, i) =>
        i === editingStaff 
          ? { ...s, ...formData, updatedAt: new Date() }
          : s
      );
      saveStaff(updated);
    } else {
      // Add new
      const newStaffMember = {
        ...formData,
        uid: `staff-${Date.now()}`,
        createdAt: new Date(),
        assignedCount: 0
      };
      saveStaff([...staff, newStaffMember]);
    }

    handleCancel();
  };

  const handleEdit = (index) => {
    setFormData(staff[index]);
    setEditingStaff(index);
    setIsAddingStaff(true);
  };

  const handleDelete = (index) => {
    if (confirm('Hapus staff member ini? Semua assignment akan di-unassign.')) {
      const updated = staff.filter((_, i) => i !== index);
      saveStaff(updated);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: '',
      displayName: '',
      role: ROLES.STAFF,
      phone: ''
    });
    setIsAddingStaff(false);
    setEditingStaff(null);
  };

  // Filter staff
  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || s.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (!canManageStaff) {
    return (
      <div className="glass-card p-12 rounded-2xl text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">
          Anda tidak memiliki akses untuk mengelola staff.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900 mb-2">Staff Management</h2>
          <p className="text-slate-500 font-medium">Kelola tim dan assignment aspirasi</p>
        </div>
        <button
          onClick={() => setIsAddingStaff(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                   text-white font-bold rounded-xl transition-all shadow-lg"
        >
          <UserPlus className="w-5 h-5" />
          Add Staff
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAddingStaff && (
        <div className="glass-card p-6 rounded-2xl border-2 border-blue-300">
          <h4 className="font-black text-lg mb-4">
            {editingStaff !== null ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@himakom.ac.id"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="Nama Lengkap"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                Role
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(ROLES).map((role) => (
                  <option key={role} value={role}>
                    {getRoleLabel(role)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="081234567890"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700
                       text-white font-bold rounded-lg transition-all"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300
                       text-gray-700 font-bold rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search staff by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            {Object.values(ROLES).map((role) => (
              <option key={role} value={role}>
                {getRoleLabel(role)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            {searchTerm || filterRole !== 'all' 
              ? 'Tidak ada staff yang sesuai dengan filter.' 
              : 'Belum ada staff. Klik "Add Staff" untuk menambahkan.'}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-left text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Assigned</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStaff.map((member, index) => {
                const globalIndex = staff.indexOf(member);
                return (
                  <tr key={member.uid} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-black text-slate-900">{member.displayName}</div>
                        <div className="text-sm text-slate-500">{member.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getRoleColor(member.role)}`}>
                        {getRoleLabel(member.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        {member.phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-blue-600">
                        {member.assignedCount || 0} aspirasi
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(globalIndex)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(globalIndex)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Total Staff
          </div>
          <div className="text-2xl font-black text-slate-900">{staff.length}</div>
        </div>
        {Object.values(ROLES).map((role) => {
          const count = staff.filter(s => s.role === role).length;
          if (count === 0) return null;
          return (
            <div key={role} className="glass-card p-4 rounded-xl">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                {getRoleLabel(role)}
              </div>
              <div className="text-2xl font-black text-slate-900">{count}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
