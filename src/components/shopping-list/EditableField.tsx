
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EditableFieldProps {
  value: string | number;
  type: 'text' | 'number';
  placeholder?: string;
  step?: string;
  className?: string;
  onSave: (value: string | number) => void;
  disabled?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  type,
  placeholder,
  step,
  className,
  onSave,
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const handleSave = () => {
    if (type === 'number') {
      const numericValue = editValue === '' ? (step ? 0 : 1) : parseFloat(editValue);
      if (!isNaN(numericValue)) {
        onSave(numericValue);
      }
    } else {
      onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          type={type}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          step={step}
          className={`${className} text-sm`}
          autoFocus
        />
        <Button
          onClick={handleSave}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
        >
          <Check className="w-3 h-3" />
        </Button>
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <div className={`${className} text-sm flex-1 p-2 border border-transparent rounded`}>
        {type === 'number' && step ? 
          (value ? `R$ ${parseFloat(value.toString()).toFixed(2)}` : placeholder) :
          value || placeholder
        }
      </div>
      <Button
        onClick={handleEdit}
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
        disabled={disabled}
      >
        <Pencil className="w-3 h-3" />
      </Button>
    </div>
  );
};

export default EditableField;
