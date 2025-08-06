import React, { useEffect, useState } from 'react';
import type { Category } from '@/types';
import { categoriesApi } from '@/lib/api';
import { CategoryCard } from '@/components/Categories/CategoryCard';
import { CategoryForm } from '@/components/Categories/CategoryForm';
import { Button } from '@/components/ui/button';
import { Plus, Search, Grid } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categories, searchTerm]);


  const handleDelete = async (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all items in this category.`)) {
      try {
        await categoriesApi.delete(category.id);
        const updatedCategories = categories.filter(cat => cat.id !== category.id);
        setCategories(updatedCategories);
      } catch (error) {
        console.error('Failed to delete category:', error);
        alert('Failed to delete category');
      }
    }
  };

  const handleCategoryCreated = () => {
    // Refresh categories list
    fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data.categories || []);
      setFilteredCategories(response.data.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
              <Grid className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Categories
              </h1>
              <p className="text-gray-600">Organize your items into custom categories</p>
            </div>
          </div>
          <CategoryForm onCategoryCreated={handleCategoryCreated} />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="text-center py-12">
          {categories.length === 0 ? (
            <>
              <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first category to start organizing your items.
              </p>
              <CategoryForm onCategoryCreated={handleCategoryCreated} trigger={
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Category
                </Button>
              } />
            </>
          ) : (
            <>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-600">
                No categories match your search criteria.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredCategories.length} of {categories.length} categories
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onCategoryUpdated={() => fetchCategories()}
                onDelete={handleDelete}
                onItemCreated={() => fetchCategories()}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};