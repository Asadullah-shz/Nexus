import React, { useState } from 'react';
import { User, Lock, Bell, Palette, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeNav, setActiveNav] = useState('profile');
  
  const [settings, setSettings] = useState({
    twoFactor: false,
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    darkMode: false,
    publicProfile: true
  });
  
  if (!user) return null;
  
  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings((prev: typeof settings) => ({ ...prev, [key]: !prev[key] }));
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings navigation */}
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
        
        {/* Main settings content */}
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
                  <div className="relative group">
                    <Avatar
                      src={user.avatarUrl}
                      alt={user.name}
                      size="xl"
                      className="ring-4 ring-white shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Palette size={20} className="text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <Button variant="outline" size="sm" className="font-semibold">
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
                    defaultValue={user.name}
                    className="font-medium"
                  />
                  
                  <Input
                    label="Email Address"
                    type="email"
                    defaultValue={user.email}
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
                    defaultValue="San Francisco, CA"
                    className="font-medium"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Professional Bio
                  </label>
                  <textarea
                    className="w-full rounded-xl border-gray-200 shadow-sm focus:border-primary-500 focus:ring-primary-500 transition-all font-medium text-sm"
                    rows={4}
                    defaultValue={user.bio}
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
                    <Input label="Current Password" type="password" />
                    <div className="grid grid-cols-2 gap-4">
                      <Input label="New Password" type="password" />
                      <Input label="Confirm New Password" type="password" />
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
                        onClick={() => toggleSetting(item.id as any)}
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
        </div>
      </div>
    </div>
  );
};