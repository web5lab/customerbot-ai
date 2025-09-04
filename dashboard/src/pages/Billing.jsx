import { CreditCard, Package, Zap, CheckCircle, Brain, MessageSquare, Database, Cpu, Crown, Star, TrendingUp, Shield, Gift, Sparkles, ArrowRight, Plus, Minus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { UpgradeModal } from '../components/UpgradeModal';
import { AddOnModal } from '../components/AddOnModal';
import { subscriptionSelector, usageStatsSelector } from '../store/global.Selctor';
import { getUserSubscription, getUsageStats } from '../store/global.Action';

export function Billing() {
  const dispatch = useDispatch();
  const subscription = useSelector(subscriptionSelector);
  const usageStatsData = useSelector(usageStatsSelector);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');

  useEffect(() => {
    dispatch(getUserSubscription());
    dispatch(getUsageStats());
  }, [dispatch]);

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      description: 'Perfect for getting started',
      features: [
        '100 conversations/month',
        '1 AI assistant',
        'Basic analytics',
        'Email support',
      ],
      current: subscription?.planType === 'free',
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      description: 'For growing businesses',
      features: [
        '5,000 conversations/month',
        '5 AI assistants',
        'Advanced analytics',
        'Human handoff',
        'Mobile app access',
        'Priority support',
      ],
      current: subscription?.planType === 'pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'For large organizations',
      features: [
        'Unlimited conversations',
        'Unlimited assistants',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Advanced security',
      ],
      current: subscription?.planType === 'enterprise',
      popular: false
    }
  ];

  const usageStats = [
    {
      label: 'Conversations',
      current: usageStatsData?.conversations?.used || 0,
      total: usageStatsData?.conversations?.total || 100,
      icon: MessageSquare,
      unit: 'conversations'
    },
    {
      label: 'AI Assistants',
      current: usageStatsData?.bots?.used || 0,
      total: usageStatsData?.bots?.total || 1,
      icon: Brain,
      unit: 'assistants'
    },
    {
      label: 'Credits',
      current: usageStatsData?.credits?.used || 0,
      total: usageStatsData?.credits?.total || 100,
      icon: Package,
      unit: 'credits'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {selectedPlan && (
        <UpgradeModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}

      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="text-gray-600">Manage your subscription and usage</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Current Plan */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current Plan</h2>
              <p className="text-gray-600">Pro Plan - Active</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">$29<span className="text-base text-gray-500">/month</span></div>
              <p className="text-sm text-gray-500">Next billing: Dec 15, 2024</p>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {usageStats.map((stat, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600">{stat.label}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-gray-900">
                      {stat.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      of {stat.total === 999 ? '∞' : stat.total.toLocaleString()} {stat.unit}
                    </span>
                  </div>
                  
                  {stat.total !== 999 && (
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 bg-gray-900 rounded-full"
                        style={{ width: `${Math.min((stat.current / stat.total) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex justify-center">
          <div className="bg-gray-100 rounded-lg p-1">
            <div className="flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'yearly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Yearly
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative border rounded-lg p-6 ${
                plan.current
                  ? 'border-gray-900 bg-gray-50'
                  : plan.popular
                    ? 'border-gray-300 shadow-sm'
                    : 'border-gray-200'
              }`}
            >
              {/* Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}

              {/* Current Plan Indicator */}
              {plan.current && (
                <div className="absolute top-4 right-4">
                  <span className="bg-gray-900 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Current
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price}
                    {plan.period && <span className="text-lg text-gray-500 font-normal">{plan.period}</span>}
                  </div>
                  {billingCycle === 'yearly' && plan.price !== 'Custom' && plan.price !== '$0' && (
                    <div className="text-sm text-green-600 font-medium mt-1">
                      Save 20% with yearly billing
                    </div>
                  )}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  plan.current
                    ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    : plan.popular
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => !plan.current && setSelectedPlan(plan)}
                disabled={plan.current}
              >
                {plan.current ? 'Current Plan' : plan.price === 'Custom' ? 'Contact Sales' : 'Upgrade'}
              </button>
            </div>
          ))}
        </div>

        {/* Billing History */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                View all
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {subscription?.paymentHistory?.length > 0 ? (
                subscription.paymentHistory.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <div className="font-medium text-gray-900">{item.description || `Payment ${index + 1}`}</div>
                      <div className="text-sm text-gray-600">{new Date(item.paidAt).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">${item.amount}</div>
                      <div className={`text-sm ${
                        item.status === 'succeeded' ? 'text-green-600' : 
                        item.status === 'failed' ? 'text-red-600' : 
                        'text-yellow-600'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No billing history available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-600">
                  {subscription?.planType?.charAt(0).toUpperCase() + subscription?.planType?.slice(1) || 'Free'} Plan - {subscription?.status || 'Active'}
                </p>
                  {subscription?.daysUntilRenewal || 0}
                </div>
                <div className="text-sm text-gray-600">Days Until Renewal</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              <div className="text-2xl font-bold text-blue-600">{stats?.new || 0}</div>
                <div className="text-sm text-gray-600">Status</div>
              </div>
                <div className="text-2xl font-bold text-gray-900">
              <div className="text-2xl font-bold text-yellow-600">{stats?.contacted || 0}</div>
                  <span className="text-base text-gray-500">/month</span>
                </div>
                <p className="text-sm text-gray-500">
              <div className="text-2xl font-bold text-purple-600">{stats?.qualified || 0}</div>
                </p>
                  {subscription?.billingCycle?.charAt(0).toUpperCase() + subscription?.billingCycle?.slice(1) || 'Monthly'}
                </div>
              <div className="text-2xl font-bold text-green-600">{stats?.converted || 0}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}