import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Shield, Bell, Palette } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({ trigger }) => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette }
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-6 mt-4">
          {/* Sidebar */}
          <div className="w-48 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'profile' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Profile Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={user?.email || ''} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input placeholder="Enter your display name" />
                  </div>
                  <div className="space-y-2">
                    <Label>About</Label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>
                <Button>Save Profile</Button>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Security Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Change Password</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Update your password to keep your account secure.
                    </p>
                    <div className="space-y-3">
                      <Input type="password" placeholder="Current password" />
                      <Input type="password" placeholder="New password" />
                      <Input type="password" placeholder="Confirm new password" />
                    </div>
                    <Button className="mt-3">Update Password</Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Add an extra layer of security to your account.
                    </p>
                    <Button variant="outline">Enable 2FA</Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                    { id: 'push', label: 'Push Notifications', desc: 'Receive push notifications in your browser' },
                    { id: 'weekly', label: 'Weekly Summary', desc: 'Get a weekly summary of your activity' },
                    { id: 'reminders', label: 'Item Reminders', desc: 'Get reminded about expiring items' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.label}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                      <input type="checkbox" className="rounded" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Appearance Settings</h3>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Theme</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Choose your preferred color scheme.
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map((theme) => (
                        <button
                          key={theme}
                          className="p-3 border rounded-lg text-center capitalize hover:bg-gray-50"
                        >
                          {theme}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Density</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Adjust the spacing and size of interface elements.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {['comfortable', 'compact'].map((density) => (
                        <button
                          key={density}
                          className="p-3 border rounded-lg text-center capitalize hover:bg-gray-50"
                        >
                          {density}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};