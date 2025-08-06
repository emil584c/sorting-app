import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ItemForm } from '@/components/Items/ItemForm';
import { ArrowLeft, Search, Edit, Trash2, Plus } from 'lucide-react';
import { itemsApi, categoriesApi } from '@/lib/api';
import type { Category } from '@/types';

interface Item {
  id: string;
  name: string;
  description?: string;
  field_data: Record<string, any>;
  created_at: string;
}

export const ItemsPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!categoryId) return;
      
      try {
        setLoading(true);
        
        // Fetch category details
        const categoryResponse = await categoriesApi.getById(categoryId);
        setCategory(categoryResponse.data.data.category);
        
        // Fetch items in this category
        const itemsResponse = await itemsApi.getAll({ category_id: categoryId });
        const itemsList = itemsResponse.data.data.items || [];
        setItems(itemsList);
        setFilteredItems(itemsList);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId]);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [items, searchTerm]);

  const handleItemCreated = () => {
    // Refresh items list
    if (categoryId) {
      itemsApi.getAll({ category_id: categoryId })
        .then(response => {
          const itemsList = response.data.data.items || [];
          setItems(itemsList);
        })
        .catch(error => console.error('Failed to refresh items:', error));
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await itemsApi.delete(itemId);
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
      } catch (error) {
        console.error('Failed to delete item:', error);
        alert('Failed to delete item');
      }
    }
  };

  const renderFieldValue = (field: any, value: any) => {
    if (value === null || value === undefined || value === '') return '-';

    switch (field.type) {
      case 'boolean':
        return value ? '✓' : '✗';
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'quantity':
        return `${value}${field.options?.unit ? ` ${field.options.unit}` : ''}`;
      case 'tags':
        return Array.isArray(value) ? value.join(', ') : value;
      case 'image':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex space-x-1">
              {value.slice(0, 2).map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${field.name} ${index + 1}`}
                  className="w-6 h-6 rounded object-cover border"
                />
              ))}
              {value.length > 2 && (
                <span className="text-xs text-gray-500">+{value.length - 2}</span>
              )}
            </div>
          );
        } else if (typeof value === 'string' && value) {
          return (
            <img
              src={value}
              alt={field.name}
              className="w-6 h-6 rounded object-cover border"
            />
          );
        }
        return '-';
      default:
        return String(value);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category not found</h1>
          <Link to="/categories">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Categories
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/categories">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div
                className="w-6 h-6 rounded-full shadow-sm ring-2 ring-white/50"
                style={{ backgroundColor: category.color || '#3B82F6' }}
              />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {category.name}
                </h1>
                <p className="text-gray-600">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          </div>
          {categoryId && (
            <ItemForm categoryId={categoryId} onItemCreated={handleItemCreated} />
          )}
        </div>

        {category.description && (
          <p className="text-gray-600 mb-6">{category.description}</p>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          {items.length === 0 ? (
            <>
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items yet</h3>
              <p className="text-gray-600 mb-4">
                Add your first item to start organizing.
              </p>
              {categoryId && (
                <ItemForm 
                  categoryId={categoryId} 
                  onItemCreated={handleItemCreated}
                  trigger={
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </Button>
                  }
                />
              )}
            </>
          ) : (
            <>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">
                No items match your search criteria.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredItems.length} of {items.length} items
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 border-gray-200/50 bg-white/80 backdrop-blur-sm group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {item.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(item.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteItem(item.id)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.description && (
                    <p className="text-sm text-gray-600 mb-4">{item.description}</p>
                  )}
                  
                  {/* Custom Fields */}
                  {category.field_config.length > 0 && (
                    <div className="space-y-2">
                      {category.field_config.map((field: any) => (
                        <div key={field.id} className="flex justify-between items-center text-sm">
                          <span className="font-medium text-gray-700">{field.name}:</span>
                          <span className="text-gray-600 text-right max-w-32 truncate">
                            {renderFieldValue(field, item.field_data[field.id])}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};