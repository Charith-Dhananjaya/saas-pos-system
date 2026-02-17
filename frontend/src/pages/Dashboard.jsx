import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyticsAPI, storeAPI, orderAPI } from '../lib/api';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#34d399', '#2dd4bf', '#38bdf8', '#818cf8', '#f472b6', '#fb7185'];

function KPICard({ title, value, icon: Icon, gradient, trend, trendLabel }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 group">
      {/* Gradient accent */}
      <div className={`absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity bg-gradient-to-br ${gradient}`} />

      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {trend !== undefined && (
            <div className="flex items-center gap-1">
              {trend >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {Math.abs(trend)}%
              </span>
              {trendLabel && <span className="text-xs text-muted-foreground">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} shadow-lg text-white`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, icon: Icon, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

const customTooltipStyle = {
  backgroundColor: 'hsl(var(--card))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '12px',
  padding: '12px 16px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  color: 'hsl(var(--foreground))',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [storeId, setStoreId] = useState(null);
  const [summary, setSummary] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [hourlySales, setHourlySales] = useState([]);
  const [orderStats, setOrderStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          setStoreId(res.data.id);
        }
      } catch (e) {
        console.error('Error fetching store:', e);
      }
    };
    fetchStore();
  }, [user]);

  useEffect(() => {
    if (!storeId) return;
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [summaryRes, trendRes, topRes, hourlyRes, statsRes, recentRes] = await Promise.all([
          analyticsAPI.getDashboardSummary(storeId),
          analyticsAPI.getRevenueTrend(storeId, 14),
          analyticsAPI.getTopProducts(storeId, 6),
          analyticsAPI.getHourlySales(storeId),
          analyticsAPI.getOrderStats(storeId),
          orderAPI.getRecentOrders(storeId),
        ]);
        setSummary(summaryRes.data);
        setRevenueTrend(trendRes.data);
        setTopProducts(topRes.data);
        setHourlySales(hourlyRes.data);
        setOrderStats(statsRes.data);
        setRecentOrders(recentRes.data || []);
      } catch (e) {
        console.error('Error loading analytics:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [storeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl border-2 border-primary/30 border-t-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (val) => `$${(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const paymentTypeData = orderStats?.byPaymentType
    ? Object.entries(orderStats.byPaymentType).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{user?.fullName?.split(' ')[0]}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Here's what's happening with your store today</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Today's Revenue"
          value={formatCurrency(summary?.todayRevenue)}
          icon={DollarSign}
          gradient="from-emerald-500 to-teal-600"
        />
        <KPICard
          title="Today's Orders"
          value={summary?.todayOrders || 0}
          icon={ShoppingCart}
          gradient="from-sky-500 to-blue-600"
        />
        <KPICard
          title="Total Customers"
          value={summary?.totalCustomers || 0}
          icon={Users}
          gradient="from-amber-500 to-orange-600"
        />
        <KPICard
          title="Total Products"
          value={summary?.totalProducts || 0}
          icon={Package}
          gradient="from-rose-500 to-pink-600"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue Trend - wide */}
        <ChartCard
          title="Revenue Trend"
          subtitle="Last 14 days"
          icon={TrendingUp}
          className="xl:col-span-2"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
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
                  itemStyle={{ color: '#34d399' }}
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#colorRevenue)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Payment Type Pie */}
        <ChartCard title="Payment Methods" subtitle="Distribution" icon={BarChart3}>
          <div className="h-72 flex items-center justify-center">
            {paymentTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {paymentTypeData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={customTooltipStyle}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--muted-foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No payment data yet</p>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Hourly Sales */}
        <ChartCard title="Today's Sales by Hour" subtitle="Hourly distribution" icon={Activity}>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlySales} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={customTooltipStyle}
                  labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                  formatter={(value) => [formatCurrency(value), 'Sales']}
                  cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {hourlySales.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(var(--primary) / ${0.3 + (index / hourlySales.length) * 0.7})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top Products */}
        <ChartCard title="Top Products" subtitle="By units sold" icon={Package}>
          <div className="space-y-3">
            {topProducts.length > 0 ? topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: `${CHART_COLORS[index % CHART_COLORS.length]}20`, color: CHART_COLORS[index % CHART_COLORS.length] }}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground ml-2">{product.unitsSold} sold</p>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${topProducts.length > 0 ? (product.unitsSold / topProducts[0].unitsSold) * 100 : 0}%`,
                        backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm font-semibold text-primary ml-2">{formatCurrency(product.revenue)}</p>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-8">No product data yet</p>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            {formatCurrency(summary?.totalRevenue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
            {summary?.totalOrders || 0}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Total Orders</p>
        </div>
        <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 text-center">
          <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            {formatCurrency(summary?.avgOrderValue)}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Avg Order Value</p>
        </div>
      </div>
    </div>
  );
}
