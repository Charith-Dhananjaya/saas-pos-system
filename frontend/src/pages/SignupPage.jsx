import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { Store } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // role is always OWNER for self-signup; staff are created by owner
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields are identical.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: 'ROLE_OWNER',
    };

    const result = await signup(payload);
    
    if (result.success) {
      toast({
        title: "Success",
        description: "Account created successfully!",
      });
      navigate('/dashboard');
    } else {
      toast({
        title: "Error",
        description: result.error || "Signup failed",
        variant: "destructive",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] border border-slate-800">
        {/* Left hero section */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-sky-700 via-sky-800 to-slate-900 p-10 text-white relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top,_#fff,_transparent_60%),radial-gradient(circle_at_bottom,_#fff,_transparent_55%)]" />
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Store className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-sky-100/80">CDZ POS</p>
                <p className="text-xs text-sky-100/70">Built for modern retailers</p>
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-bold leading-snug">
                Create your <span className="text-sky-100/90">store owner</span> account
              </h1>
              <p className="text-sky-100/80 text-sm leading-relaxed max-w-md">
                Set up your main owner login, add cashiers as staff accounts, and start tracking sales,
                inventory, and shifts in minutes.
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-900/30 border border-white/10 px-4 py-3 space-y-1">
                <p className="text-sky-100/70">Multi-counter</p>
                <p className="text-lg font-semibold">Cashiers</p>
                <p className="text-[0.7rem] text-sky-100/60">Manage staff access</p>
              </div>
              <div className="rounded-xl bg-slate-900/30 border border-white/10 px-4 py-3 space-y-1">
                <p className="text-sky-100/70">Inventory</p>
                <p className="text-lg font-semibold">Real-time</p>
                <p className="text-[0.7rem] text-sky-100/60">Low stock alerts</p>
              </div>
              <div className="rounded-xl bg-slate-900/30 border border-white/10 px-4 py-3 space-y-1">
                <p className="text-sky-100/70">Reports</p>
                <p className="text-lg font-semibold">Shifts</p>
                <p className="text-[0.7rem] text-sky-100/60">Daily summaries</p>
              </div>
            </div>
          </div>
          <div className="relative z-10 mt-8 text-[0.7rem] text-sky-100/60">
            Owner account is required before adding staff / cashier logins.
          </div>
        </div>

        {/* Right form section */}
        <div className="bg-white px-6 py-8 sm:px-10 sm:py-10 flex items-center">
          <div className="w-full max-w-sm mx-auto">
            <div className="mb-6">
              <p className="text-xs font-medium tracking-[0.2em] text-slate-400 uppercase mb-2">Create account</p>
              <h2 className="text-2xl font-semibold text-slate-900">Create Account</h2>
              <p className="text-sm text-slate-500 mt-1">
                Sign up as a store owner to get started with CDZ POS.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-xs font-medium text-slate-600">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="h-11 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium text-slate-600">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@store.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-11 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-medium text-slate-600">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="h-11 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium text-slate-600">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="h-11 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-medium text-slate-600">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="h-11 text-sm"
                />
              </div>
              <p className="text-[0.7rem] text-slate-500">
                You are creating an <span className="font-semibold text-slate-900">Owner</span> account.
                Staff / cashiers can be added later from the <span className="font-semibold text-slate-900">Employees</span> page.
              </p>
              <Button type="submit" className="w-full h-11 text-sm font-semibold" disabled={loading}>
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
            <p className="text-xs text-center text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-sky-600 hover:text-sky-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
