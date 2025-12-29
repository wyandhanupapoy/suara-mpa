'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, FileText } from 'lucide-react';

export default function TemplateManager({ db, appId, onSelectTemplate }) {
  const [templates, setTemplates] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Diterima',
    content: ''
  });

  // Template categories
  const categories = [
    'Diterima',
    'Diverifikasi',
    'Dalam Proses',
    'Selesai',
    'Ditolak',
    'Umum'
  ];

  // Load templates (from localStorage for now, can migrate to Firebase later)
  useEffect(() => {
    const loadedTemplates = localStorage.getItem('responseTemplates');
    if (loadedTemplates) {
      setTemplates(JSON.parse(loadedTemplates));
    }
  }, []);

  // Save templates
  const saveTemplates = (newTemplates) => {
    localStorage.setItem('responseTemplates', JSON.stringify(newTemplates));
    setTemplates(newTemplates);
  };

  const handleSave = () => {
    if (!formData.name || !formData.content) {
      alert('Nama dan konten template harus diisi');
      return;
    }

    if (editingTemplate !== null) {
      // Update existing template
      const updated = templates.map((t, i) =>
        i === editingTemplate ? { ...formData, id: Date.now() } : t
      );
      saveTemplates(updated);
    } else {
      // Add new template
      saveTemplates([...templates, { ...formData, id: Date.now() }]);
    }

    // Reset form
    setFormData({ name: '', category: 'Diterima', content: '' });
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleEdit = (index) => {
    setFormData(templates[index]);
    setEditingTemplate(index);
    setIsEditing(true);
  };

  const handleDelete = (index) => {
    if (confirm('Hapus template ini?')) {
      const updated = templates.filter((_, i) => i !== index);
      saveTemplates(updated);
    }
  };

  const handleCancel = () => {
    setFormData({ name: '', category: 'Diterima', content: '' });
    setIsEditing(false);
    setEditingTemplate(null);
  };

  const handleInsert = (template) => {
    if (onSelectTemplate) {
      onSelectTemplate(template.content);
    }
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const cat = template.category || 'Umum';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(template);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-slate-900">Response Templates</h3>
          <p className="text-sm text-slate-500 mt-1">Manage quick response templates</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 
                   text-white font-bold rounded-xl transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Template
        </button>
      </div>

      {/* Edit/Create Form */}
      {isEditing && (
        <div className="glass-card p-6 rounded-2xl border-2 border-blue-300">
          <h4 className="font-black text-lg mb-4">
            {editingTemplate !== null ? 'Edit Template' : 'New Template'}
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Template Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Terima Kasih - Akademik"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Template Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tulis template response di sini..."
                rows={6}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Tip: Gunakan placeholder seperti [NAMA], [KATEGORI], [KODE] untuk personalisasi
              </p>
            </div>

            <div className="flex gap-2">
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
        </div>
      )}

      {/* Templates List */}
      {templates.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">
            Belum ada template. Klik "Add Template" untuk membuat template pertama.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const catTemplates = groupedTemplates[category];
            if (!catTemplates || catTemplates.length === 0) return null;

            return (
              <div key={category}>
                <h4 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-3">
                  {category}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catTemplates.map((template, index) => {
                    const globalIndex = templates.indexOf(template);
                    return (
                      <div
                        key={template.id}
                        className="glass-card p-4 rounded-xl hover:border-blue-300 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h5 className="font-black text-slate-900 text-sm">
                            {template.name}
                          </h5>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(globalIndex)}
                              className="p-1 hover:bg-blue-100 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => handleDelete(globalIndex)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-3 mb-3">
                          {template.content}
                        </p>
                        {onSelectTemplate && (
                          <button
                            onClick={() => handleInsert(template)}
                            className="w-full px-3 py-1.5 bg-blue-50 hover:bg-blue-100 
                                     text-blue-700 text-xs font-bold rounded-lg transition-all"
                          >
                            Insert Template
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
