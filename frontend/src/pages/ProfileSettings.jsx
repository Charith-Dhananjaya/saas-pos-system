import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { userAPI } from '../lib/api';
import { User, Mail, Phone, Lock, Upload, Loader2, X } from 'lucide-react';

export default function ProfileSettings() {
    const { user, login } = useAuth();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [currentImage, setCurrentImage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    // Clean up preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const fetchProfile = async () => {
        try {
            const res = await userAPI.getProfile();
            if (res.data) {
                setFormData(prev => ({
                    ...prev,
                    fullName: res.data.fullName || '',
                    email: res.data.email || '',
                    phone: res.data.phone || '',
                }));
                setCurrentImage(res.data.profileImage || '');
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            toast({
                title: "Error",
                description: "Failed to load profile data",
                variant: "destructive"
            });
        } finally {
            setFetching(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            // Create preview
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (formData.password && formData.password !== formData.confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please make sure both password fields are identical.",
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        try {
            const data = new FormData();
            data.append('fullName', formData.fullName);
            data.append('phone', formData.phone);
            if (formData.password) {
                // Backend currently doesn't support password update via this endpoint in the example logic, 
                // but assuming it gets added or handled. 
                // Note: The provided UserServiceImpl didn't implement password update logic yet, 
                // but we'll send it in case.
                data.append('password', formData.password);
            }
            if (selectedFile) {
                data.append('file', selectedFile);
            }

            const res = await userAPI.updateProfile(data);

            toast({
                title: "Success",
                description: "Profile updated successfully!",
            });

            // Update displayed image if return data has it
            if (res.data && res.data.profileImage) {
                setCurrentImage(res.data.profileImage);
                handleRemoveFile(); // Clear selection
            }

            // Clear password fields
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));

        } catch (error) {
            console.error("Update failed", error);
            toast({
                title: "Error",
                description: "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
                <p className="text-slate-400">Manage your account settings and preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="bg-slate-900 border-slate-800 md:col-span-1 h-fit">
                    <CardHeader>
                        <CardTitle className="text-white">Profile Image</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center text-center">
                        <div className="relative h-32 w-32 rounded-full overflow-hidden mb-4 border-4 border-slate-800 bg-slate-800 group">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                            ) : currentImage ? (
                                <img src={currentImage} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-slate-800 text-slate-500">
                                    <User className="h-12 w-12" />
                                </div>
                            )}

                            {/* Overlay for quick upload */}
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}>
                                <Upload className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white">{formData.fullName}</h3>
                        <p className="text-sm text-slate-400">{formData.email}</p>
                    </CardContent>
                </Card>

                {/* Form Card */}
                <Card className="bg-slate-900 border-slate-800 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-white">Account Details</CardTitle>
                        <CardDescription className="text-slate-400">
                            Update your personal information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName" className="text-slate-300">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="fullName"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="pl-9 bg-slate-950 border-slate-800 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-300">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        disabled
                                        className="pl-9 bg-slate-950/50 border-slate-800 text-slate-500 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-300">Phone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                    <Input
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="pl-9 bg-slate-950 border-slate-800 text-white"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-300">Profile Image</Label>
                                <div className="flex gap-2 items-center">
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="bg-slate-950 border-slate-800 text-white file:bg-slate-800 file:text-white file:border-0 file:rounded-md file:px-2 file:mr-4 file:text-sm hover:file:bg-slate-700"
                                    />
                                    {selectedFile && (
                                        <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                                            <X className="h-4 w-4 text-slate-400 hover:text-red-500" />
                                        </Button>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">Click to upload a new profile image (Max 5MB).</p>
                            </div>

                            <div className="pt-4 border-t border-slate-800">
                                <h4 className="text-sm font-medium text-white mb-4">Change Password</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-slate-300">New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="pl-9 bg-slate-950 border-slate-800 text-white"
                                                placeholder="Leave empty to keep current"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword" className="text-slate-300">Confirm New Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                            <Input
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="pl-9 bg-slate-950 border-slate-800 text-white"
                                                placeholder="Confirm new password"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
