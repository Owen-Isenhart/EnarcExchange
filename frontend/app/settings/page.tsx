/**
 * Settings Page
 * Allows users to manage their account settings and preferences
 */

'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/utils/formatting';
import { Settings as SettingsIcon, Lock, Bell, User } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-secondary">Please login to access settings</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="section container-max space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Settings</h1>
        <p className="text-secondary">Manage your account and preferences</p>
      </div>

      {/* Account Information */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <User className="h-6 w-6" />
          Account Information
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-muted mb-1">Username</p>
                <p className="text-lg font-semibold">{user.username}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Email</p>
                <p className="text-lg font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Member Since</p>
                <p className="text-lg font-semibold">{formatDate(user.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Account Status</p>
                <Badge variant={user.is_admin ? 'default' : 'success'}>
                  {user.is_admin ? 'Admin' : 'Active'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Settings */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Lock className="h-6 w-6" />
          Security
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div>
                <p className="font-semibold">Password</p>
                <p className="text-sm text-secondary mt-1">Secure your account with a strong password</p>
              </div>
              <button className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-colors disabled:opacity-50">
                Change Password
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div>
                <p className="font-semibold">Two-Factor Authentication</p>
                <p className="text-sm text-secondary mt-1">Add an extra layer of security (Coming soon)</p>
              </div>
              <button className="px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-lg font-semibold transition-colors disabled:opacity-50" disabled>
                Enable 2FA
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notification Settings */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Notifications
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-4">
              {[
                {
                  label: 'Bet Notifications',
                  description: 'Get notified when your bets settle or are affected by market changes',
                },
                {
                  label: 'Market Updates',
                  description: 'Receive updates about markets you are interested in',
                },
                {
                  label: 'Email Digests',
                  description: 'Weekly summary of your portfolio performance',
                },
              ].map((option, idx) => (
                <div key={idx} className="p-4 bg-surface-secondary rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-sm text-secondary mt-1">{option.description}</p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked={false}
                      className="w-5 h-5 cursor-pointer"
                      disabled
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted text-center py-4">
              Notification settings coming soon
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preferences */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <SettingsIcon className="h-6 w-6" />
          Preferences
        </h2>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="p-4 bg-surface-secondary rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Theme</p>
                  <p className="text-sm text-secondary mt-1">Customize the appearance of your dashboard</p>
                </div>
                <select className="px-3 py-2 bg-surface-secondary rounded-lg border border-surface-light text-primary cursor-pointer" disabled>
                  <option>Dark (Default)</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-muted text-center py-4">
              More preference options coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
