import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { inventoryAPI, productAPI, storeAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Edit, Trash2, Loader2, AlertTriangle, Package } from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addStockDialog, setAddStockDialog] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [addStockAmount, setAddStockAmount] = useState('');
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'low-stock'
  const [editingInventory, setEditingInventory] = useState(null);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    lowStockThreshold: 10,
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
          setInventory([]);
          setProducts([]);
          return;
        }
        throw error;
      }
      setStore(storeData);

      if (storeData?.id) {
        const [inventoryResponse, productsResponse] = await Promise.all([
          inventoryAPI.getByStore(storeData.id),
          productAPI.getByStore(storeData.id),
        ]);
        setInventory(inventoryResponse.data || []);
        setProducts(productsResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (inv = null) => {
    if (inv) {
      setEditingInventory(inv);
      setFormData({
        productId: inv.product?.id || inv.productId || '',
        quantity: inv.quantity || '',
        lowStockThreshold: inv.lowStockThreshold || 10,
      });
    } else {
      setEditingInventory(null);
      setFormData({
        productId: '',
        quantity: '',
        lowStockThreshold: 10,
      });
    }
    setDialogOpen(true);
  };

  const handleAddStockDialog = (inv) => {
    setSelectedInventory(inv);
    setAddStockAmount('');
    setAddStockDialog(true);
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.addStock(selectedInventory.id, parseInt(addStockAmount));
      toast({
        title: "Success",
        description: `Added ${addStockAmount} units to ${selectedInventory.product.name}`,
      });
      setAddStockDialog(false);
      loadData();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: "Error",
        description: "Failed to add stock",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!store) {
      toast({
        title: "Error",
        description: "Store not found",
        variant: "destructive",
      });
      return;
    }

    try {
      const inventoryData = {
        storeId: store.id,
        productId: parseInt(formData.productId),
        quantity: parseInt(formData.quantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
      };

      if (editingInventory) {
        await inventoryAPI.update(editingInventory.id, inventoryData);
        toast({
          title: "Success",
          description: "Inventory updated successfully",
        });
      } else {
        await inventoryAPI.create(inventoryData);
        toast({
          title: "Success",
          description: "Inventory created successfully",
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving inventory:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save inventory",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this inventory entry?')) return;

    try {
      await inventoryAPI.delete(id);
      toast({
        title: "Success",
        description: "Inventory deleted successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory",
        variant: "destructive",
      });
    }
  };

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
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="mt-2 p-4 rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/10">
          <p className="text-sm text-emerald-200">
            No store found for this account yet. Create a store in{' '}
            <a href="/store-settings" className="font-medium text-emerald-400 hover:underline hover:text-emerald-300">
              Store Settings
            </a>{' '}
            before managing inventory.
          </p>
        </div>
      </div>
    );
  }

  const lowStockItems = inventory.filter(inv => inv.quantity <= (inv.lowStockThreshold || 10));
  const displayedInventory = viewMode === 'low-stock' ? lowStockItems : inventory;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage product inventory</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Inventory
        </Button>
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <h3 className="font-semibold text-destructive">Low Stock Alert</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {lowStockItems.length} product{lowStockItems.length > 1 ? 's are' : ' is'} running low on stock
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="all">
            <Package className="h-4 w-4 mr-2" />
            All ({inventory.length})
          </TabsTrigger>
          <TabsTrigger value="low-stock">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Low Stock ({lowStockItems.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedInventory.map((inv) => (
          <Card key={inv.id} className={inv.quantity <= (inv.lowStockThreshold || 10) ? 'border-destructive/50' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">
                      {inv.product?.name || 'Unknown Product'}
                    </h3>
                    {inv.quantity <= (inv.lowStockThreshold || 10) && (
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    SKU: {inv.product?.sku || 'N/A'}
                  </p>
                  <div className="mt-2">
                    <span className={`text-2xl font-bold ${inv.quantity <= (inv.lowStockThreshold || 10) ? 'text-destructive' : 'text-primary'
                      }`}>
                      {inv.quantity}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">units</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Alert threshold: {inv.lowStockThreshold || 10}
                  </p>
                  {inv.quantity <= (inv.lowStockThreshold || 10) && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => handleAddStockDialog(inv)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Stock
                    </Button>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(inv)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(inv.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInventory ? 'Edit Inventory' : 'Add Inventory'}
            </DialogTitle>
            <DialogDescription>
              {editingInventory ? 'Update inventory quantity' : 'Add inventory for a product'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="productId">Product *</Label>
              <Select
                value={formData.productId?.toString() || ''}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                disabled={!!editingInventory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name} ({product.sku || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Alert Threshold *</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                required
                min="0"
              />
              <p className="text-xs text-muted-foreground">
                You'll be alerted when quantity drops to or below this number
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingInventory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Stock Dialog */}
      <Dialog open={addStockDialog} onOpenChange={setAddStockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Stock</DialogTitle>
            <DialogDescription>
              Add more units to {selectedInventory?.product?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div className="space-y-2">
              <Label>Current Stock</Label>
              <p className="text-2xl font-bold text-muted-foreground">
                {selectedInventory?.quantity || 0} units
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addStockAmount">Quantity to Add *</Label>
              <Input
                id="addStockAmount"
                type="number"
                value={addStockAmount}
                onChange={(e) => setAddStockAmount(e.target.value)}
                required
                min="1"
                placeholder="Enter quantity"
              />
            </div>
            {addStockAmount && (
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground">New Total</p>
                <p className="text-xl font-bold text-primary">
                  {(selectedInventory?.quantity || 0) + parseInt(addStockAmount || 0)} units
                </p>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddStockDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Add Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
