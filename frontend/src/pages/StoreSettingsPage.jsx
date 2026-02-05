import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storeAPI } from '../lib/api';
import { useToast } from '../components/ui/use-toast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Loader2 } from 'lucide-react';

export default function StoreSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    brand: '',
    description: '',
    storeType: '',
    contact: {
      address: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (user?.role === 'ROLE_OWNER') {
      loadStore();
    }
  }, []);

  const loadStore = async () => {
    try {
      setLoading(true);
      try {
        const response = await storeAPI.getByAdmin();
        const storeData = response.data;
        setStore(storeData);
        setFormData({
          brand: storeData.brand || '',
          description: storeData.description || '',
          storeType: storeData.storeType || '',
          contact: {
            address: storeData.contact?.address || '',
            phone: storeData.contact?.phone || '',
            email: storeData.contact?.email || '',
          },
        });
      } catch (error) {
        // If no store exists yet, stay in "create" mode with empty form
        if (error.response?.status === 400 || error.response?.status === 404) {
          setStore(null);
          setFormData({
            brand: '',
            description: '',
            storeType: '',
            contact: {
              address: '',
              phone: '',
              email: '',
            },
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error loading store:', error);
      toast({
        title: "Error",
        description: "Failed to load store settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (store) {
        await storeAPI.update(store.id, formData);
      } else {
        const response = await storeAPI.create(formData);
        setStore(response.data);
      }
      toast({
        title: "Success",
        description: "Store settings saved successfully",
      });
      loadStore();
    } catch (error) {
      console.error('Error updating store:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update store settings",
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Store Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your store information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Update your store details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Store Name *</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeType">Store Type</Label>
                <Input
                  id="storeType"
                  value={formData.storeType}
                  onChange={(e) => setFormData({ ...formData, storeType: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.contact.address}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, address: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.contact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, phone: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contact.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contact: { ...formData.contact, email: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            <Button type="submit">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
