import React, { useState } from "react";
import { Check, X, Edit2, Loader } from "lucide-react";

interface EditableFieldProps {
  value: string | number;
  field: string;
  type?: 'text' | 'number' | 'textarea' | 'select';
  options?: string[];
  canEdit: boolean;
  onSave: (field: string, value: any) => Promise<void>;
  displayValue?: string; // For custom display formatting (e.g., "£1,000,000")
  className?: string;
  rows?: number;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  field,
  type = 'text',
  options = [],
  canEdit,
  onSave,
  displayValue,
  className = "",
  rows = 4
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value || ''));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const processedValue = type === 'number' ? 
        parseInt(editValue.replace(/[£,]/g, '')) || 0 : 
        editValue;
      await onSave(field, processedValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      // Show user-friendly error message
      alert(`Failed to save ${field}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(String(value || ''));
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && type !== 'textarea') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Enter' && type === 'textarea' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // If not editing or can't edit, show display mode
  if (!canEdit || !isEditing) {
    return (
      <div className={`group relative inline-flex items-center ${className}`}>
        <span className="mr-2">{displayValue || value}</span>
        {canEdit && (
          <button
            onClick={() => {
              setEditValue(String(value || ''));
              setIsEditing(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
            title={`Edit ${field}`}
          >
            <Edit2 className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    );
  }

  // Editing mode
  return (
    <div className="flex items-center gap-2 w-full">
      {type === 'textarea' ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          rows={rows}
          autoFocus
          disabled={isSaving}
        />
      ) : type === 'select' ? (
        <select
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          autoFocus
          disabled={isSaving}
        >
          <option value="">Select...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          autoFocus
          disabled={isSaving}
        />
      )}
      
      <button
        onClick={handleSave}
        disabled={isSaving || !editValue.trim()}
        className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[40px]"
      >
        {isSaving ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>
      
      <button
        onClick={handleCancel}
        disabled={isSaving}
        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md disabled:opacity-50"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default EditableField;
