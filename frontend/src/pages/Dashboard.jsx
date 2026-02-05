import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { storeAPI, orderAPI, shiftReportAPI, customerAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { DollarSign, ShoppingCart, Users, TrendingUp, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalCustomers: 0,
    activeShift: null,
  });
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Get store info
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
        // Gracefully handle "no store yet" / onboarding state
        if (error.response?.status === 400 || error.response?.status === 404) {
          setStore(null);
          setStats({
            todaySales: 0,
            todayOrders: 0,
            totalCustomers: 0,
            activeShift: null,
          });
          return;
        }
        throw error;
      }
      setStore(storeData);

      if (storeData?.id) {
        // Get today's orders
        const ordersResponse = await orderAPI.getTodayOrders(storeData.id);
        const todayOrders = ordersResponse.data || [];
        
        const todaySales = todayOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

        // Get total customers for this store
        let totalCustomers = 0;
        try {
          const customersResponse = await customerAPI.getAll();
          const allCustomers = customersResponse.data || [];
          totalCustomers = allCustomers.filter(
            (customer) => customer.store && customer.store.id === storeData.id
          ).length;
        } catch (error) {
          // If customer fetch fails, keep totalCustomers as 0
        }
        
        // Get current shift
        let activeShift = null;
        try {
          const shiftResponse = await shiftReportAPI.getCurrentShift();
          activeShift = shiftResponse.data;
        } catch (error) {
          // No active shift
        }

        setStats({
          todaySales,
          todayOrders: todayOrders.length,
          totalCustomers,
          activeShift,
        });
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {user?.fullName}
        </p>
      </div>

      {!store && (
        <div className="mb-4 p-4 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/40">
          <h2 className="font-semibold text-lg">Set up your first store</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You don&apos;t have a store configured yet. Create a store to start using POS, inventory, and employees.
          </p>
          <a
            href="/store-settings"
            className="inline-flex mt-3 px-4 py-2 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Go to Store Settings
          </a>
        </div>
      )}

      {store && (
        <div className="mb-4 p-4 bg-primary/10 rounded-lg">
          <h2 className="font-semibold text-lg">{store.brand}</h2>
          <p className="text-sm text-muted-foreground">{store.description}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total revenue today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">Orders processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shift</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.activeShift ? 'Active' : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.activeShift ? 'Shift in progress' : 'No active shift'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Status</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {store?.status || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Current status</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a href="/pos" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Start New Sale</div>
              <div className="text-sm text-muted-foreground">Open POS interface</div>
            </a>
            <a href="/products" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">Manage Products</div>
              <div className="text-sm text-muted-foreground">Add or edit products</div>
            </a>
            <a href="/orders" className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors">
              <div className="font-medium">View Orders</div>
              <div className="text-sm text-muted-foreground">Order history</div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
