/**
 * Create Market Page
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useCreateMarket } from '@/hooks/useMarkets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUiStore } from '@/store/uiStore';
import { X, Plus } from 'lucide-react';

export default function CreateMarketPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { addNotification } = useUiStore();
  const createMarket = useCreateMarket();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_time: new Date().toISOString().split('T')[0],
    end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    liquidity_parameter: 100,
    outcomes: [
      { description: 'Yes' },
      { description: 'No' },
    ],
  });

  if (!user) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-secondary">Please login to create a market</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="section container-max">
        <Card>
          <CardContent>
            <p className="text-center text-secondary">Only admins can create markets</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddOutcome = () => {
    setFormData({
      ...formData,
      outcomes: [...formData.outcomes, { description: '' }],
    });
  };

  const handleRemoveOutcome = (index: number) => {
    if (formData.outcomes.length <= 2) {
      addNotification({
        type: 'error',
        message: 'Market must have at least 2 outcomes',
      });
      return;
    }
    setFormData({
      ...formData,
      outcomes: formData.outcomes.filter((_, i) => i !== index),
    });
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes[index].description = value;
    setFormData({
      ...formData,
      outcomes: newOutcomes,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addNotification({
        type: 'error',
        message: 'Market name is required',
      });
      return;
    }

    if (formData.outcomes.length < 2) {
      addNotification({
        type: 'error',
        message: 'Market must have at least 2 outcomes',
      });
      return;
    }

    if (formData.outcomes.some(o => !o.description.trim())) {
      addNotification({
        type: 'error',
        message: 'All outcomes must have descriptions',
      });
      return;
    }

    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      addNotification({
        type: 'error',
        message: 'End time must be after start time',
      });
      return;
    }

    createMarket.mutate(
      {
        name: formData.name,
        description: formData.description,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        liquidity_parameter: formData.liquidity_parameter,
        outcomes: formData.outcomes,
      },
      {
        onSuccess: (market: any) => {
          router.push(`/markets/${market.id}`);
        },
      }
    );
  };

  return (
    <div className="section container-max space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Create Market</h1>
        <p className="text-secondary">Create a new prediction market</p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Market Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Market Name *
              </label>
              <Input
                type="text"
                placeholder="e.g., Will Bitcoin hit $100k by end of 2024?"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                disabled={createMarket.isPending}
                required
              />
              <p className="text-xs text-muted mt-1">
                3-200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Description
              </label>
              <textarea
                placeholder="Provide details about the market resolution criteria..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                disabled={createMarket.isPending}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-surface/50 border border-primary/20 text-primary placeholder-primary/40 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  Start Time *
                </label>
                <Input
                  type="date"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  disabled={createMarket.isPending}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-primary mb-2">
                  End Time *
                </label>
                <Input
                  type="date"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  disabled={createMarket.isPending}
                  required
                />
              </div>
            </div>

            {/* Liquidity Parameter */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Liquidity Parameter
              </label>
              <Input
                type="number"
                min="0"
                max="10000"
                step="1"
                value={formData.liquidity_parameter}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    liquidity_parameter: parseFloat(e.target.value) || 100,
                  })
                }
                disabled={createMarket.isPending}
              />
              <p className="text-xs text-muted mt-1">
                Higher values mean more liquidity (default: 100, max: 10000)
              </p>
            </div>

            {/* Outcomes */}
            <div>
              <label className="block text-sm font-medium text-primary mb-2">
                Outcomes * (minimum 2)
              </label>
              <div className="space-y-3">
                {formData.outcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder={`Outcome ${index + 1}`}
                      value={outcome.description}
                      onChange={(e) => handleOutcomeChange(index, e.target.value)}
                      disabled={createMarket.isPending}
                      required
                    />
                    {formData.outcomes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOutcome(index)}
                        disabled={createMarket.isPending}
                        className="px-3 py-2 rounded-lg bg-error/10 border border-error/20 text-error hover:bg-error/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddOutcome}
                disabled={createMarket.isPending}
                className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                Add Outcome
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={createMarket.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMarket.isPending}
                className="flex-1"
              >
                {createMarket.isPending ? 'Creating...' : 'Create Market'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
