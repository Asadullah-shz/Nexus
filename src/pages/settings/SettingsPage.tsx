import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, CreditCard, PlusCircle } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getStoredBalance, getStoredTransactions } from '../../data/payments';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeNav, setActiveNav] = useState('profile');

  const { accentColor, setAccentColor } = useTheme();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: 'San Francisco, CA'
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(`nexus_settings_${user?.id}`);
    return saved ? JSON.parse(saved) : {
      twoFactor: false,
      emailNotifications: true,
      pushNotifications: true,
      marketingEmails: false,
      compactMode: false,
      publicProfile: true
    };
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(`nexus_settings_${user.id}`, JSON.stringify(settings));
    }
  }, [settings, user]);

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(user.id, {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio
      });
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        await updateProfile(user.id, { avatarUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {}
        <Card className="lg:col-span-1 border-none bg-gray-50/50">
          <CardBody className="p-2">
            <nav className="space-y-1">
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'security', icon: Lock, label: 'Security' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'appearance', icon: Palette, label: 'Appearance' },
                { id: 'billing', icon: CreditCard, label: 'Billing' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveNav(item.id)}
                  className={`flex items-center w-full px-3 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    activeNav === item.id
                      ? 'text-primary-700 bg-white shadow-sm ring-1 ring-black/5'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <item.icon size={18} className={`mr-3 ${activeNav === item.id ? 'text-primary-600' : 'text-gray-400'}`} />
                  {item.label}
                </button>
              ))}
            </nav>
          </CardBody>
        </Card>

        {}
        <div className="lg:col-span-3 space-y-6">
          {activeNav === 'profile' && (
            <Card className="border-none shadow-premium animate-slide-up">
              <CardHeader className="border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Profile Settings</h2>
                {showSuccess && (
                  <Badge variant="success" className="animate-bounce">Changes saved!</Badge>
                )}
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="flex items-center gap-6">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      size="xl"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Palette size={20} className="text-white" />
                    </div>
                  </div>

                  <div>
                    <Button variant="outline" size="sm" className="font-semibold" onClick={triggerFileInput}>
                      Update Avatar
                    </Button>
                    <p className="mt-2 text-xs text-gray-500">
                      Recommend 400x400px. JPG or PNG.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    className="font-medium"
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="font-medium"
                  />

                  <Input
                    label="Account Role"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    disabled
                    className="bg-gray-50 font-medium"
                  />

                  <Input
                    label="Primary Location"
                    value={profileData.location}
                    onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                    className="font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    className="w-full rounded-xl border-gray-200 bg-white shadow-sm focus:border-primary-300 focus:ring-primary-300 transition-all font-medium text-sm"
                    rows={4}
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                  <Button variant="outline" className="rounded-xl px-6">Cancel</Button>
                  <Button
                    onClick={handleSave}
                    isLoading={isSaving}
                    className="rounded-xl px-8 shadow-blue"
                  >
                    Save Profile
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeNav === 'security' && (
            <Card className="border-none shadow-premium animate-slide-up">
              <CardHeader className="border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Security Settings</h2>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-500 mt-1">Protect your account with an extra security layer.</p>
                  </div>
                  <Button
                    variant={settings.twoFactor ? 'outline' : 'primary'}
                    size="sm"
                    onClick={() => toggleSetting('twoFactor')}
                    className="rounded-xl"
                  >
                    {settings.twoFactor ? 'Disable' : 'Enable'}
                  </Button>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm font-bold text-gray-900">Change Password</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <Input label="Current Password" type="password" fullWidth />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="New Password" type="password" fullWidth />
                      <Input label="Confirm New Password" type="password" fullWidth />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button className="rounded-xl shadow-blue">Update Password</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeNav === 'notifications' && (
            <Card className="border-none shadow-premium animate-slide-up">
              <CardHeader className="border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Notification Preferences</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  {[
                    { id: 'emailNotifications', label: 'Email Notifications', desc: 'Receive daily updates and activity reports.' },
                    { id: 'pushNotifications', label: 'Push Notifications', desc: 'Get instant alerts about new messages and requests.' },
                    { id: 'marketingEmails', label: 'Marketing Communications', desc: 'News about Nexus features and industry insights.' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{item.label}</h4>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => toggleSetting(item.id as keyof typeof settings)}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${settings[item.id as keyof typeof settings] ? 'bg-primary-600' : 'bg-gray-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings[item.id as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  ))}
                  <div className="flex justify-end pt-4 border-t border-gray-50">
                    <Button onClick={handleSave} isLoading={isSaving} className="rounded-xl shadow-blue px-8">Save Preferences</Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeNav === 'appearance' && (
            <Card className="border-none shadow-premium animate-slide-up">
              <CardHeader className="border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Appearance</h2>
              </CardHeader>
              <CardBody className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Accent Color</h3>
                  <div className="flex gap-4">
                    {[
                      { id: 'blue', color: 'bg-blue-600' },
                      { id: 'purple', color: 'bg-purple-600' },
                      { id: 'green', color: 'bg-emerald-600' },
                      { id: 'indigo', color: 'bg-indigo-600' }
                    ].map(c => (
                      <button
                        key={c.id}
                        onClick={() => setAccentColor(c.id as any)}
                        className={`w-10 h-10 rounded-full ${c.color} flex items-center justify-center transition-all hover:scale-110 ${accentColor === c.id ? 'ring-4 ring-white shadow-lg scale-110' : ''}`}
                      >
                        {accentColor === c.id && <div className="w-2 h-2 bg-white rounded-full" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Compact Mode</h3>
                    <p className="text-xs text-gray-500 mt-1">Dense information layout for power users.</p>
                  </div>
                  <button
                    onClick={() => toggleSetting('compactMode')}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${settings.compactMode ? 'bg-primary-600' : 'bg-gray-200'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.compactMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-50">
                  <Button onClick={handleSave} isLoading={isSaving} className="rounded-xl shadow-blue px-8">Save Appearance</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeNav === 'billing' && (
            <Card className="border-none shadow-premium animate-slide-up">
              <CardHeader className="border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">Billing & Subscription</h2>
                <Badge variant="primary" className="font-bold">Pro Plan</Badge>
              </CardHeader>
              <CardBody className="space-y-8">
                <div className="p-6 bg-gradient-to-br from-primary-600 to-indigo-700 rounded-2xl text-white shadow-blue">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-primary-100 text-xs font-bold uppercase tracking-wider">Current Balance</p>
                      <h3 className="text-3xl font-bold mt-1">${getStoredBalance().toLocaleString()}</h3>
                    </div>
                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Active</Badge>
                  </div>
                  <div className="mt-8 flex gap-3">
                    <Button className="bg-gray-100 text-black hover:bg-white/90 hover:text-black border-none font-bold rounded-xl">Upgrade Plan</Button>
                    <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 font-bold rounded-xl">View Details</Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Saved Cards</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl hover:border-primary-500 transition-colors cursor-pointer group">
                      <div className="flex items-center">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-4">
                          <CreditCard size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Visa ending in 4242</p>
                          <p className="text-xs text-gray-500">Expires 12/26</p>
                        </div>
                      </div>
                      <Badge variant="gray">Primary</Badge>
                    </div>
                    <Button variant="outline" className="w-full border-dashed border-2 rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-gray-50">
                      <PlusCircle size={18} />
                      Add New Payment Method
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Billing History</h3>
                  <div className="space-y-4">
                    {getStoredTransactions().slice(0, 5).map((bill, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-none">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{bill.description}</p>
                          <p className="text-xs text-gray-500">{new Date(bill.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${bill.type === 'deposit' ? 'text-green-600' : 'text-gray-900'}`}>
                            {bill.type === 'deposit' ? '+' : '-'}${bill.amount.toLocaleString()}
                          </p>
                          <p className={`text-xs font-bold ${bill.status === 'completed' ? 'text-success-600' : 'text-warning-600'}`}>
                            {bill.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};