import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Plus, X } from 'lucide-react';
import { categoriesApi } from '@/lib/api';
import type { Category } from '@/types';

interface CategoryEditFormProps {
  category: Category;
  onCategoryUpdated: () => void;
  trigger?: React.ReactNode;
}

interface FieldConfig {
  id: string;
  name: string;
  type: string;
  required: boolean;
}

export const CategoryEditForm: React.FC<CategoryEditFormProps> = ({ category, onCategoryUpdated, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: category.name,
    description: category.description || '',
    color: category.color || '#3B82F6'
  });
  const [fields, setFields] = useState<FieldConfig[]>([]);
  const [newField, setNewField] = useState({ name: '', type: 'text', required: false });

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'number', label: 'Number' },
    { value: 'boolean', label: 'Yes/No' },
    { value: 'date', label: 'Date' },
    { value: 'image', label: 'Image' },
    { value: 'select', label: 'Dropdown' },
    { value: 'tags', label: 'Tags' },
    { value: 'quantity', label: 'Quantity with Unit' }
  ];

  useEffect(() => {
    if (open) {
      // Reset form data when dialog opens
      setFormData({
        name: category.name,
        description: category.description || '',
        color: category.color || '#3B82F6'
      });
      setFields(category.field_config || []);
      setNewField({ name: '', type: 'text', required: false });
    }
  }, [open, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await categoriesApi.update(category.id, {
        name: formData.name,
        description: formData.description,
        color: formData.color,
        field_config: fields
      });

      setOpen(false);
      onCategoryUpdated();
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const addField = () => {
    if (newField.name.trim()) {
      const fieldWithId = {
        ...newField,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
      setFields([...fields, fieldWithId]);
      setNewField({ name: '', type: 'text', required: false });
    }
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update your category details and custom fields.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Clothes, Electronics, Books"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center space-x-2">
                <input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Custom Fields</h3>
              <span className="text-sm text-gray-600">{fields.length} fields</span>
            </div>
            
            {fields.length > 0 && (
              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{field.name}</span>
                      <span className="ml-2 text-sm text-gray-600">
                        ({fieldTypes.find(t => t.value === field.type)?.label})
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
              <h4 className="font-medium">Add New Field</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Field Name</Label>
                  <Input
                    value={newField.name}
                    onChange={(e) => setNewField({ ...newField, name: e.target.value })}
                    placeholder="e.g., Size, Brand, Location"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <select
                    value={newField.type}
                    onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fieldTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    id="required"
                    type="checkbox"
                    checked={newField.required}
                    onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="required" className="text-sm">Required</Label>
                </div>
              </div>
              <Button type="button" onClick={addField} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Field
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};