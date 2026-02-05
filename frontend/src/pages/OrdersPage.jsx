import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, storeAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Loader2, Receipt } from 'lucide-react';
import { format } from 'date-fns';

export default function OrdersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    paymentType: 'all',
    orderStatus: 'all',
  });

  useEffect(() => {
    loadData();
  }, [filters]);

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
          setOrders([]);
          return;
        }
        throw error;
      }
      setStore(storeData);

      if (storeData?.id) {
        const filterParams = {};
        if (filters.paymentType !== 'all') filterParams.paymentType = filters.paymentType;
        if (filters.orderStatus !== 'all') filterParams.orderStatus = filters.orderStatus;

        const response = await orderAPI.getByStore(storeData.id, filterParams);
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold">Orders</h1>
        <div className="mt-2 p-4 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40">
          <p className="text-sm text-muted-foreground">
            No store found yet. Create a store in{' '}
            <a href="/store-settings" className="font-medium text-primary hover:underline">
              Store Settings
            </a>{' '}
            before viewing orders.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-muted-foreground mt-1">View and manage orders</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.paymentType}
            onValueChange={(value) => setFilters({ ...filters, paymentType: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Payment Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.orderStatus}
            onValueChange={(value) => setFilters({ ...filters, orderStatus: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No orders found</p>
            </CardContent>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">Order #{order.id}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.paymentType === 'CASH' ? 'bg-green-100 text-green-800' :
                        order.paymentType === 'CARD' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {order.paymentType}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt && format(new Date(order.createdAt), 'PPpp')}
                    </p>
                    {order.customer && (
                      <p className="text-sm mt-1">
                        Customer: {order.customer.fullName}
                      </p>
                    )}
                    {order.cashier && (
                      <p className="text-sm text-muted-foreground">
                        Cashier: {order.cashier.fullName}
                      </p>
                    )}
                    {order.items && order.items.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-sm">
                            {item.product?.name || 'Product'} × {item.quantity} @ ${item.price}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      ${order.totalAmount?.toFixed(2) || '0.00'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
