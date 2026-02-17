import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { shiftReportAPI, storeAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Loader2, Play, Square } from 'lucide-react';
import { format } from 'date-fns';

export default function ShiftReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shiftReports, setShiftReports] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
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
          setShiftReports([]);
          setCurrentShift(null);
          return;
        }
        throw error;
      }
      setStore(storeData);

      if (storeData?.id) {
        const [reportsResponse, currentResponse] = await Promise.all([
          shiftReportAPI.getByStore(storeData.id).catch(() => ({ data: [] })),
          shiftReportAPI.getCurrentShift().catch(() => ({ data: null })),
        ]);
        setShiftReports(reportsResponse.data || []);
        setCurrentShift(currentResponse.data);
      }
    } catch (error) {
      console.error('Error loading shift reports:', error);
      toast({
        title: "Error",
        description: "Failed to load shift reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartShift = async () => {
    try {
      const response = await shiftReportAPI.startShift();
      setCurrentShift(response.data);
      toast({
        title: "Success",
        description: "Shift started successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error starting shift:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to start shift",
        variant: "destructive",
      });
    }
  };

  const handleEndShift = async () => {
    try {
      await shiftReportAPI.endShift();
      setCurrentShift(null);
      toast({
        title: "Success",
        description: "Shift ended successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error ending shift:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to end shift",
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
        <h1 className="text-3xl font-bold">Shift Reports</h1>
        <div className="mt-2 p-4 rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/10">
          <p className="text-sm text-emerald-200">
            No store configured yet. Create a store in{' '}
            <a href="/store-settings" className="font-medium text-emerald-400 hover:underline hover:text-emerald-300">
              Store Settings
            </a>{' '}
            before starting shifts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shift Reports</h1>
          <p className="text-muted-foreground mt-1">Manage shifts and view reports</p>
        </div>
        {!currentShift && (
          <Button onClick={handleStartShift}>
            <Play className="h-4 w-4 mr-2" />
            Start Shift
          </Button>
        )}
        {currentShift && (
          <Button onClick={handleEndShift} variant="destructive">
            <Square className="h-4 w-4 mr-2" />
            End Shift
          </Button>
        )}
      </div>

      {currentShift && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Current Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Started</p>
                <p className="font-semibold">
                  {currentShift.shiftStart && format(new Date(currentShift.shiftStart), 'PPpp')}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="font-semibold">
                  ${currentShift.totalSales?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <p className="font-semibold">
                  {currentShift.totalOrders || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cashier</p>
                <p className="font-semibold">
                  {currentShift.cashier?.fullName || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Shift History</h2>
        {shiftReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No shift reports found</p>
            </CardContent>
          </Card>
        ) : (
          shiftReports.map((report) => (
            <Card key={report.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="font-semibold text-lg">Shift #{report.id}</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Start Time</p>
                        <p className="font-medium">
                          {report.shiftStart && format(new Date(report.shiftStart), 'PPpp')}
                        </p>
                      </div>
                      {report.shiftEnd && (
                        <div>
                          <p className="text-sm text-muted-foreground">End Time</p>
                          <p className="font-medium">
                            {format(new Date(report.shiftEnd), 'PPpp')}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sales</p>
                        <p className="font-semibold text-lg">
                          ${report.totalSales?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Orders</p>
                        <p className="font-semibold text-lg">
                          {report.totalOrders || 0}
                        </p>
                      </div>
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
