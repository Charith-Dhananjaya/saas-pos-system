import { useState, useEffect } from 'react';
import { categoryAPI } from '../lib/api';
import { useToast } from './ui/use-toast';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Edit, Trash2 } from 'lucide-react';

export default function CategoryManager({ storeId, onCategoryChange }) {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (storeId) {
      loadCategories();
    }
  }, [storeId]);

  const loadCategories = async () => {
    try {
      const response = await categoryAPI.getByStore(storeId);
      setCategories(response.data || []);
      if (onCategoryChange) {
        onCategoryChange(response.data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const categoryData = {
        name: formData.name,
        storeId: storeId,
      };

      if (editingCategory) {
        await categoryAPI.update(editingCategory.id, categoryData);
        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        await categoryAPI.create(categoryData);
        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      setDialogOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save category",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryAPI.delete(id);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Categories</h3>
        <Button size="sm" onClick={() => handleOpenDialog()}>
          Add Category
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
          >
            <span className="text-sm">{category.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleOpenDialog(category)}
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleDelete(category.id)}
            >
              <Trash2 className="h-3 w-3 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory ? 'Update category name' : 'Create a new category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
