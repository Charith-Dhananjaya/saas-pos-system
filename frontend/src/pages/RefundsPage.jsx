import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { orderAPI, storeAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';

export default function RefundsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [refunds, setRefunds] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

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
          setRefunds([]);
          return;
        }
        throw error;
      }
      setStore(storeData);

      if (storeData?.id) {
        const response = await refundAPI.getByStore(storeData.id);
        setRefunds(response.data || []);
      }
    } catch (error) {
      console.error('Error loading refunds:', error);
      toast({
        title: "Error",
        description: "Failed to load refunds",
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
        <h1 className="text-3xl font-bold">Refunds</h1>
        <div className="mt-2 p-4 rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/10">
          <p className="text-sm text-emerald-200">
            No store found yet. Create a store in{' '}
            <a href="/store-settings" className="font-medium text-emerald-400 hover:underline hover:text-emerald-300">
              Store Settings
            </a>{' '}
            before viewing refunds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Refunds</h1>
        <p className="text-muted-foreground mt-1">View refund history</p>
      </div>

      <div className="space-y-4">
        {refunds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <RotateCcw className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No refunds found</p>
            </CardContent>
          </Card>
        ) : (
          refunds.map((refund) => (
            <Card key={refund.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">Refund #{refund.id}</h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                        Refunded
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {refund.createdAt && format(new Date(refund.createdAt), 'PPpp')}
                    </p>
                    {refund.order && (
                      <p className="text-sm mt-1">
                        Order: #{refund.order.id}
                      </p>
                    )}
                    {refund.reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Reason: {refund.reason}
                      </p>
                    )}
                    {refund.cashier && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Processed by: {refund.cashier.fullName}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-destructive">
                      -${refund.amount?.toFixed(2) || '0.00'}
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
