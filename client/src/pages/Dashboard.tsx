import React, { useEffect, useState } from 'react';
import type { Category } from '@/types';
import { categoriesApi } from '@/lib/api';
import { CategoryCard } from '@/components/Categories/CategoryCard';
import { CategoryForm } from '@/components/Categories/CategoryForm';
import { Button } from '@/components/ui/button';
import { Plus, Grid, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };

    loadCategories();
  }, []);


  const handleDelete = (category: Category) => {
    // TODO: Implement category deletion
    console.log('Delete category:', category);
  };

  const handleCategoryCreated = () => {
    // Refresh categories list
    fetchCategories();
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data.data.categories || []);
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

  const totalItems = categories.reduce((sum, cat) => sum + (cat.items?.[0]?.count || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl">
            <BarChart3 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600">Manage your home organization system</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Grid className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-green-50 rounded-xl">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalItems}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Quick Actions</p>
              <div className="mt-2">
                <CategoryForm onCategoryCreated={handleCategoryCreated} trigger={
                  <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                    New Category
                  </Button>
                } />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Recent Categories</h2>
        <Link to="/categories">
          <Button variant="outline">View All</Button>
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first category to start organizing your items.
          </p>
          <CategoryForm onCategoryCreated={handleCategoryCreated} trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          } />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.slice(0, 6).map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onCategoryUpdated={() => fetchCategories()}
              onDelete={handleDelete}
              onItemCreated={() => fetchCategories()}
            />
          ))}
        </div>
      )}
    </div>
  );
};