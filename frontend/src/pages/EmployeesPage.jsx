import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI, storeAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';

export default function EmployeesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'ROLE_STAFF',
  });

  useEffect(() => {
    if (user?.role === 'ROLE_OWNER') {
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      try {
        const response = await storeAPI.getByAdmin();
        const storeData = response.data;
        setStore(storeData);

        if (storeData?.id) {
          const employeesResponse = await employeeAPI.getByStore(storeData.id);
          setEmployees(employeesResponse.data || []);
        }
      } catch (error) {
        if (error.response?.status === 400 || error.response?.status === 404) {
          setStore(null);
          setEmployees([]);
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      toast({
        title: "Error",
        description: "Failed to load employees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (employee = null) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        fullName: employee.fullName || '',
        email: employee.email || '',
        password: '',
        phone: employee.phone || '',
        role: employee.role || 'ROLE_STAFF',
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'ROLE_STAFF',
      });
    }
    setDialogOpen(true);
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
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee.id, formData);
        toast({
          title: "Success",
          description: "Employee updated successfully",
        });
      } else {
        await employeeAPI.create(store.id, formData);
        toast({
          title: "Success",
          description: "Employee created successfully",
        });
      }

      setDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving employee:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save employee",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;

    try {
      await employeeAPI.delete(id);
      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== 'ROLE_OWNER') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold">Employees</h1>
        <div className="mt-2 p-4 rounded-lg border border-dashed border-emerald-500/20 bg-emerald-500/10">
          <p className="text-sm text-emerald-200">
            You don&apos;t have a store yet. Create a store in{' '}
            <a href="/store-settings" className="font-medium text-emerald-400 hover:underline hover:text-emerald-300">
              Store Settings
            </a>{' '}
            before adding employees or cashiers.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground mt-1">Manage store employees</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold">{employee.fullName}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {employee.email}
                  </p>
                  {employee.phone && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {employee.phone}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 capitalize">
                    {employee.role?.replace('ROLE_', '')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(employee.id)}
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
              {editingEmployee ? 'Edit Employee' : 'Add Employee'}
            </DialogTitle>
            <DialogDescription>
              {editingEmployee ? 'Update employee information' : 'Add a new employee to your store'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {editingEmployee ? 'New Password (leave blank to keep current)' : 'Password *'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingEmployee}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ROLE_STAFF">Staff</SelectItem>
                  <SelectItem value="ROLE_OWNER">Owner</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEmployee ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
