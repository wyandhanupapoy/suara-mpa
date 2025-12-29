'use client';

import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Lock, 
  Tag,
  X
} from 'lucide-react';

export default function InternalNotes({ aspiration, currentUser, db, appId }) {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [newTag, setNewTag] = useState('');

  // Available tags
  const AVAILABLE_TAGS = [
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'duplicate', label: 'Duplicate', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    { value: 'needs-review', label: 'Needs Review', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-700 border-green-200' },
    { value: 'pending-info', label: 'Pending Info', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { value: 'escalated', label: 'Escalated', color: 'bg-orange-100 text-orange-700 border-orange-200' }
  ];

  // Load notes and tags (from localStorage for demo)
  useEffect(() => {
    const storageKey = `notes_${aspiration.id}`;
    const tagsKey = `tags_${aspiration.id}`;
    
    const savedNotes = localStorage.getItem(storageKey);
    const savedTags = localStorage.getItem(tagsKey);
    
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    
    if (savedTags) {
      setTags(JSON.parse(savedTags));
    }
  }, [aspiration.id]);

  const saveNotes = (newNotes) => {
    const storageKey = `notes_${aspiration.id}`;
    localStorage.setItem(storageKey, JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const saveTags = (newTags) => {
    const tagsKey = `tags_${aspiration.id}`;
    localStorage.setItem(tagsKey, JSON.stringify(newTags));
    setTags(newTags);
  };

  const handleAddNote = () => {
    if (!noteContent.trim()) {
      alert('Note content cannot be empty');
      return;
    }

    const newNote = {
      id: Date.now(),
      content: noteContent,
      createdBy: currentUser.displayName || currentUser.email,
      createdById: currentUser.uid,
      createdAt: new Date().toISOString(),
      isPrivate: true
    };

    saveNotes([newNote, ...notes]);
    setNoteContent('');
    setIsAddingNote(false);
  };

  const handleDeleteNote = (noteId) => {
    if (confirm('Delete this note?')) {
      const updated = notes.filter(note => note.id !== noteId);
      saveNotes(updated);
    }
  };

  const handleToggleTag = (tagValue) => {
    if (tags.includes(tagValue)) {
      saveTags(tags.filter(t => t !== tagValue));
    } else {
      saveTags([...tags, tagValue]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Tags Section */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            Tags
          </h4>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map((tag) => {
            const isActive = tags.includes(tag.value);
            return (
              <button
                key={tag.value}
                onClick={() => handleToggleTag(tag.value)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all
                  ${isActive 
                    ? tag.color + ' shadow-sm' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
              >
                {tag.label}
                {isActive && <X className="w-3 h-3 inline ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Section */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-purple-600" />
            Internal Notes
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Private
            </span>
          </h4>
          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 
                     text-white text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-3 h-3" />
            Add Note
          </button>
        </div>

        {/* Add Note Form */}
        {isAddingNote && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Write internal note... (visible only to staff)"
              rows={3}
              className="w-full px-3 py-2 border border-purple-200 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleAddNote}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white 
                         text-xs font-bold rounded-lg transition-all"
              >
                Save Note
              </button>
              <button
                onClick={() => {
                  setIsAddingNote(false);
                  setNoteContent('');
                }}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 
                         text-xs font-bold rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-400">
            <StickyNote className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p>No internal notes yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-200 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {note.createdBy}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(note.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 
                             rounded transition-all"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
