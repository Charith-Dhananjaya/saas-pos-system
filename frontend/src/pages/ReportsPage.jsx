import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { reportAPI, storeAPI } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, DollarSign, ShoppingCart, Package, TrendingUp, Loader2 } from 'lucide-react';

const customTooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    color: 'hsl(var(--foreground))',
};

export default function ReportsPage() {
    const { user } = useAuth();
    const [store, setStore] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dailySalesData, setDailySalesData] = useState([]);
    const [itemSalesData, setItemSalesData] = useState([]);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        const fetchStore = async () => {
            try {
                let res;
                if (user?.role === 'ROLE_OWNER') {
                    res = await storeAPI.getByAdmin();
                } else {
                    res = await storeAPI.getByEmployee();
                }
                if (res.data?.id) {
                    setStore(res.data);
                }
            } catch (e) {
                console.error('Error fetching store:', e);
            }
        };
        fetchStore();
    }, [user]);

    useEffect(() => {
        if (!store?.id) return;
        loadReports();
    }, [store]);

    const loadReports = async () => {
        setLoading(true);
        try {
            const [dailyRes, itemRes] = await Promise.all([
                reportAPI.getDailySales(store.id, dateRange.startDate, dateRange.endDate),
                reportAPI.getItemSales(store.id, dateRange.startDate, dateRange.endDate),
            ]);
            setDailySalesData(dailyRes.data || []);
            setItemSalesData(itemRes.data || []);
        } catch (error) {
            console.error('Error loading reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (val) => `$${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const totalRevenue = dailySalesData.reduce((sum, day) => sum + (day.totalRevenue || 0), 0);
    const totalOrders = dailySalesData.reduce((sum, day) => sum + (day.totalOrders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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
                <h1 className="text-3xl font-bold">Reports</h1>
                <p className="text-muted-foreground">Create a store to view reports</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Sales Reports</h1>
                <p className="text-muted-foreground mt-1">Analyze your sales performance</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Date Range
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button onClick={loadReports}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Generate Report
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Revenue</p>
                                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center  justify-center text-white">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold">{totalOrders}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                                <p className="text-2xl font-bold">{formatCurrency(avgOrderValue)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Daily Sales</CardTitle>
                </CardHeader>
                <CardContent>
                    {dailySalesData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dailySalesData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    tickFormatter={formatDate}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                                    tickFormatter={(v) => `$${v}`}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    contentStyle={customTooltipStyle}
                                    labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                                    formatter={(value, name) => {
                                        if (name === 'totalRevenue') return [formatCurrency(value), 'Revenue'];
                                        if (name === 'totalOrders') return [value, 'Orders'];
                                        if (name === 'averageOrderValue') return [formatCurrency(value), 'Avg Order'];
                                        return [value, name];
                                    }}
                                    labelFormatter={(label) => formatDate(label)}
                                />
                                <Bar dataKey="totalRevenue" radius={[6, 6, 0, 0]} fill="#10b981" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No sales data for this period</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Item-Wise Sales
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {itemSalesData.length > 0 ? (
                        <div className="space-y-2">
                            <div className="grid grid-cols-5 gap-4 px-4 py-2 bg-muted rounded-lg text-sm font-medium">
                                <div className="col-span-2">Product</div>
                                <div className="text-right">Quantity</div>
                                <div className="text-right">Revenue</div>
                                <div className="text-right">Orders</div>
                            </div>
                            {itemSalesData.map((item, index) => (
                                <div
                                    key={index}
                                    className="grid grid-cols-5 gap-4 px-4 py-3 border-b border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="col-span-2">
                                        <p className="font-medium">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">{item.category}</p>
                                    </div>
                                    <div className="text-right font-medium">{item.totalQuantitySold}</div>
                                    <div className="text-right text-primary font-semibold">{formatCurrency(item.totalRevenue)}</div>
                                    <div className="text-right text-muted-foreground">{item.numberOfOrders}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No item sales data for this period</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
