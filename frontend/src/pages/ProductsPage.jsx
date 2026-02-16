import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, categoryAPI, storeAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, Search, Loader2 } from 'lucide-react';
import CategoryManager from '../components/CategoryManager';

export default function ProductsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    mrp: '',
    sellingPrice: '',
    brand: '',
    image: '',
    categoryId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let storeData;
      try {
        if (user?.role === 'ROLE_OWNER') {
          const response = await storeAPI.getByAdmin();
          storeData = response.data;
        } else {
          const response = await storeAPI.getByEmployee();
          storeData = response.data;
        }
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 404) {
          setStore(null);
          setProducts([]);
          setCategories([]);
          return;
        }
        throw error;
      }
      setStore(storeData);

      if (storeData?.id) {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productAPI.getByStore(storeData.id),
          categoryAPI.getByStore(storeData.id),
        ]);
        setProducts(productsResponse.data || []);
        setCategories(categoriesResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        mrp: product.mrp || '',
        sellingPrice: product.sellingPrice || '',
        brand: product.brand || '',
        image: product.image || '',
        categoryId: product.category?.id || product.categoryId || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        mrp: '',
        sellingPrice: '',
        brand: '',
        image: '',
        categoryId: '',
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        storeId: store.id,
        mrp: parseFloat(formData.mrp) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
      };

      if (editingProduct) {
        await productAPI.update(editingProduct.id, productData);
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        await productAPI.create(productData);
        toast({
          title: "Success",
          description: "Product created successfully",
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save product",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productAPI.delete(id);
      toast({
        title: "Success",
        description: "Product deleted successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="mt-2 p-4 rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/10">
          <p className="text-sm text-emerald-200">
            You don&apos;t have a store yet. Create a store in{' '}
            <a href="/store-settings" className="font-medium text-emerald-400 hover:underline hover:text-emerald-300">
              Store Settings
            </a>{' '}
            before managing products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {store && (
        <Card>
          <CardContent className="p-6">
            <CategoryManager
              storeId={store.id}
              onCategoryChange={(cats) => setCategories(cats)}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        SKU: {product.sku || 'N/A'}
                      </p>
                      <p className="text-sm font-medium mt-2">
                        ${product.sellingPrice || product.mrp || 0}
                      </p>
                      {product.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {product.category.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mrp">MRP</Label>
                <Input
                  id="mrp"
                  type="number"
                  step="0.01"
                  value={formData.mrp}
                  onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <Select
                  value={formData.categoryId?.toString() || ''}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
