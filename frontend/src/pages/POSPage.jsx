import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { productAPI, customerAPI, orderAPI, storeAPI, billingAPI, categoryAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Plus, Minus, Trash2, CreditCard, DollarSign, Smartphone, Loader2 } from 'lucide-react';

export default function POSPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customers, setCustomers] = useState([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentType, setPaymentType] = useState('CASH');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreAndProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, selectedCategory, products]);

  const loadStoreAndProducts = async () => {
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
          setFilteredProducts([]);
          setCategories([]);
          return;
        }
        throw error;
      }
      setStore(storeData);

      if (storeData?.id) {
        const [productsResponse, categoriesResponse] = await Promise.all([
          productAPI.getByStore(storeData.id),
          categoryAPI.getByStore(storeData.id).catch(() => ({ data: [] })),
        ]);
        setProducts(productsResponse.data || []);
        setFilteredProducts(productsResponse.data || []);
        setCategories(categoriesResponse.data || []);
      }
    } catch (error) {
      console.error('Error loading store/products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?.id === parseInt(selectedCategory));
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        product,
        quantity: 1,
        price: product.sellingPrice || product.mrp || 0,
      }]);
    }
  };

  const updateCartQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) return null;
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty",
        variant: "destructive",
      });
      return;
    }
    setPaymentDialogOpen(true);
  };

  const processPayment = async () => {
    try {
      const totalAmount = getTotal();
      const orderData = {
        storeId: store.id,
        customerId: selectedCustomer?.id || null,
        cashier: {
          id: user.id,
        },
        paymentType: paymentType,
        totalAmount: totalAmount,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      // Note: For CARD payments, Stripe integration would be handled here
      // For now, we'll create the order with the payment type
      // Full Stripe integration can be added later with proper payment confirmation flow
      
      const response = await orderAPI.create(orderData);
      
      toast({
        title: "Success",
        description: "Order created successfully!",
      });

      // Clear cart
      setCart([]);
      setSelectedCustomer(null);
      setPaymentDialogOpen(false);
      setPaymentType('CASH');

      // Reload products to update inventory
      loadStoreAndProducts();
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const searchCustomers = async (query) => {
    if (query.length < 2) {
      setCustomers([]);
      return;
    }
    try {
      const response = await customerAPI.search(query);
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error searching customers:', error);
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
        <h1 className="text-3xl font-bold">POS</h1>
        <div className="mt-2 p-4 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40">
          <p className="text-sm text-muted-foreground">
            You don&apos;t have a store yet. Create a store in{' '}
            <a href="/store-settings" className="font-medium text-primary hover:underline">
              Store Settings
            </a>{' '}
            before processing sales.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="p-3 border rounded-lg hover:bg-gray-50 text-left transition-colors"
                >
                  <div className="font-medium text-sm">{product.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    ${product.sellingPrice || product.mrp || 0}
                  </div>
                  {product.sku && (
                    <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <div className="flex flex-col space-y-4">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Cart</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {/* Customer Selection */}
            <div className="mb-4 space-y-2">
              <label className="text-sm font-medium">Customer (Optional)</label>
              <div className="relative">
                <Input
                  placeholder="Search customer..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    searchCustomers(e.target.value);
                  }}
                />
                {customers.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                    {customers.map((customer) => (
                      <button
                        key={customer.id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setCustomerSearch(customer.fullName);
                          setCustomers([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        {customer.fullName} - {customer.email || customer.phone}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedCustomer && (
                <div className="text-sm text-muted-foreground">
                  Selected: {selectedCustomer.fullName}
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Cart is empty
                </p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.product.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateCartQuantity(item.product.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateCartQuantity(item.product.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <Button
                className="w-full"
                onClick={handleCheckout}
                disabled={cart.length === 0}
              >
                Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Payment Method</DialogTitle>
            <DialogDescription>Choose how the customer will pay</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={paymentType} onValueChange={setPaymentType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Cash
                  </div>
                </SelectItem>
                <SelectItem value="UPI">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    UPI
                  </div>
                </SelectItem>
                <SelectItem value="CARD">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Total Amount:</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={processPayment}>
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
