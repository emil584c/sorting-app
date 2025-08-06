import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUploadField } from '@/components/Items/ImageUploadField';
import { Plus } from 'lucide-react';
import { itemsApi, categoriesApi } from '@/lib/api';
import type { Category } from '@/types';

interface ItemFormProps {
  categoryId: string;
  onItemCreated: () => void;
  trigger?: React.ReactNode;
}

export const ItemForm: React.FC<ItemFormProps> = ({ categoryId, onItemCreated, trigger }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [fieldData, setFieldData] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await categoriesApi.getById(categoryId);
        setCategory(response.data.data.category);
        
        // Initialize field data with default values
        const initialFieldData: Record<string, any> = {};
        response.data.data.category.field_config.forEach((field: any) => {
          initialFieldData[field.id] = field.options?.defaultValue || '';
        });
        setFieldData(initialFieldData);
      } catch (error) {
        console.error('Failed to fetch category:', error);
      }
    };

    if (open && categoryId) {
      fetchCategory();
    }
  }, [open, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await itemsApi.create({
        category_id: categoryId,
        name: formData.name,
        description: formData.description,
        field_data: fieldData
      });

      // Reset form
      setFormData({ name: '', description: '' });
      setFieldData({});
      setOpen(false);
      onItemCreated();
    } catch (error) {
      console.error('Failed to create item:', error);
      alert('Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const renderField = (field: any) => {
    const value = fieldData[field.id] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.options?.placeholder || `Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.options?.placeholder || `Enter ${field.name.toLowerCase()}`}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
          />
        );

      case 'number':
      case 'quantity':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, parseFloat(e.target.value) || 0)}
              placeholder={field.options?.placeholder || '0'}
              required={field.required}
              min={field.options?.min}
              max={field.options?.max}
              step={field.options?.step || 1}
              className="flex-1"
            />
            {field.options?.unit && (
              <span className="text-sm text-gray-500 font-medium">
                {field.options.unit}
              </span>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-600">
              {field.options?.placeholder || 'Yes'}
            </span>
          </div>
        );

      case 'date':
        return (
          <Input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select {field.name.toLowerCase()}</option>
            {field.options?.options?.map((option: string) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'tags':
        return (
          <Input
            value={Array.isArray(value) ? value.join(', ') : value}
            onChange={(e) => handleFieldChange(field.id, e.target.value.split(', ').filter(Boolean))}
            placeholder="Enter tags separated by commas"
            required={field.required}
          />
        );

      case 'image':
        return (
          <ImageUploadField
            value={value || (field.options?.multiple ? [] : '')}
            onChange={(newValue) => handleFieldChange(field.id, newValue)}
            multiple={field.options?.multiple || false}
            required={field.required}
          />
        );

      default:
        return (
          <Input
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.options?.placeholder || `Enter ${field.name.toLowerCase()}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to {category?.name || 'this category'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter item name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
            </div>
          </div>

          {/* Custom Fields */}
          {category?.field_config && category.field_config.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              {category.field_config.map((field: any) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.name}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          )}

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
              {loading ? 'Creating...' : 'Create Item'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};