import React from 'react';
import type { Category } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ItemForm } from '@/components/Items/ItemForm';
import { CategoryEditForm } from '@/components/Categories/CategoryEditForm';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: Category;
  onCategoryUpdated: () => void;
  onDelete: (category: Category) => void;
  onItemCreated?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onCategoryUpdated,
  onDelete,
  onItemCreated,
}) => {
  const itemCount = category.items?.[0]?.count || 0;

  return (
    <Card className="hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300 border-gray-200/50 bg-white/80 backdrop-blur-sm group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="w-5 h-5 rounded-full shadow-sm ring-2 ring-white/50"
              style={{ backgroundColor: category.color || '#3B82F6' }}
            />
            <div>
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {category.name}
              </CardTitle>
              <CardDescription className="mt-1 font-medium">
                {itemCount} {itemCount === 1 ? 'item' : 'items'}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <CategoryEditForm 
              category={category} 
              onCategoryUpdated={onCategoryUpdated}
              trigger={
                <Button variant="ghost" size="icon" className="hover:bg-blue-50 hover:text-blue-600">
                  <Edit className="h-4 w-4" />
                </Button>
              }
            />
            <Button variant="ghost" size="icon" onClick={() => onDelete(category)} className="hover:bg-red-50 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {category.description && (
          <p className="text-sm text-gray-600 mb-4">{category.description}</p>
        )}
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
            {category.field_config.length} custom fields
          </div>
          <div className="flex space-x-2">
            <Link to={`/categories/${category.id}/items`}>
              <Button variant="outline" size="sm" className="hover:bg-gray-50 transition-colors">
                View Items
              </Button>
            </Link>
            <ItemForm 
              categoryId={category.id} 
              onItemCreated={onItemCreated || (() => {})}
              trigger={
                <Button size="sm" className="shadow-md hover:shadow-lg transition-shadow">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};