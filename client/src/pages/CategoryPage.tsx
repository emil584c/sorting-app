import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Category, Item } from '@/types';
import { categoriesApi, itemsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Grid, List, Filter } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [categoryResponse, itemsResponse] = await Promise.all([
          categoriesApi.getById(id),
          itemsApi.getAll({ category_id: id })
        ]);

        setCategory(categoryResponse.data.data.category);
        setItems(itemsResponse.data.data.items || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-red-600">Category not found</div>
      </div>
    );
  }

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <div
            className="w-6 h-6 rounded-full"
            style={{ backgroundColor: category.color || '#3B82F6' }}
          />
          <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        </div>
        {category.description && (
          <p className="text-gray-600 mb-4">{category.description}</p>
        )}
        <div className="text-sm text-gray-500">
          {items.length} {items.length === 1 ? 'item' : 'items'} • {category.field_config.length} custom fields
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {items.length === 0 ? 'No items yet' : 'No items found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {items.length === 0 
              ? 'Add your first item to this category.'
              : 'No items match your search criteria.'
            }
          </p>
          {items.length === 0 && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'space-y-4'
        }>
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                {item.description && (
                  <CardDescription>{item.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {item.images && item.images.length > 0 && (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                )}
                <div className="space-y-2">
                  {Object.entries(item.field_data).map(([fieldId, value]) => {
                    const field = category.field_config.find(f => f.id === fieldId);
                    if (!field || !value) return null;

                    return (
                      <div key={fieldId} className="text-sm">
                        <span className="font-medium text-gray-700">{field.name}:</span>{' '}
                        <span className="text-gray-600">
                          {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  Added {new Date(item.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};