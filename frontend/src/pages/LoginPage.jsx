import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { Store } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Error",
        description: result.error || "Login failed",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] border border-slate-800">
        {/* Left hero section */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-emerald-900 to-slate-900 p-10 text-white relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top,_#fff,_transparent_60%),radial-gradient(circle_at_bottom,_#fff,_transparent_55%)]" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
                <img src="/pos-logo.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-emerald-100/80">CDZ POS</p>
                <p className="text-xs text-emerald-100/60">Smart retail management</p>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-snug">
                Welcome back to your <span className="text-emerald-400">store control center</span>
              </h1>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Monitor sales in real time, manage inventory, and keep your cashiers in sync across all counters
                with one modern POS dashboard.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-950/50 border border-white/10 px-4 py-3 space-y-1">
                <p className="text-slate-400">Today&apos;s Sales</p>
                <p className="text-lg font-semibold text-emerald-400">$12,450</p>
                <p className="text-[0.7rem] text-slate-500">+18% vs yesterday</p>
              </div>
              <div className="rounded-xl bg-slate-950/50 border border-white/10 px-4 py-3 space-y-1">
                <p className="text-slate-400">Active Counters</p>
                <p className="text-lg font-semibold text-white">4</p>
                <p className="text-[0.7rem] text-slate-500">2 shifts running</p>
              </div>
              <div className="rounded-xl bg-slate-950/50 border border-white/10 px-4 py-3 space-y-1">
                <p className="text-slate-400">Inventory Health</p>
                <p className="text-lg font-semibold text-white">97%</p>
                <p className="text-[0.7rem] text-slate-500">Low-stock alerts ready</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8 text-[0.7rem] text-slate-500">
            Secure login for owners & cashiers. Your data is encrypted and protected.
          </div>
        </div>

        {/* Right form section */}
        <div className="bg-slate-950 px-6 py-8 sm:px-10 sm:py-10 flex items-center border-l border-slate-800">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-6">
              <p className="text-xs font-medium tracking-[0.2em] text-emerald-500 uppercase mb-2">Sign in</p>
              <h2 className="text-2xl font-semibold text-white">Welcome Back</h2>
              <p className="text-sm text-slate-400 mt-1">
                Enter your credentials to access your POS dashboard.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-400">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@store.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 text-sm bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-slate-400">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 text-sm bg-slate-900 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50"
                />
              </div>
              <Button type="submit" className="w-full h-11 text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <p className="text-xs text-center text-slate-500 mt-6">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
