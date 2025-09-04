import { Check, ArrowRight } from 'lucide-react';
import React, { useState } from 'react';

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const plans = [
    {
      name: 'Free',
      price: 0,
      description: 'For small teams getting started',
      features: [
        '100 conversations/month',
        '1 AI assistant',
        'Basic analytics',
        'Email support'
      ],
      buttonText: 'Get started',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white'
    },
    {
      name: 'Pro',
      price: isYearly ? 29 : 39,
      description: 'For growing businesses',
      features: [
        '5,000 conversations/month',
        '5 AI assistants',
        'Advanced analytics',
        'Human handoff',
        'Mobile app access',
        'Priority support'
      ],
      buttonText: 'Start free trial',
      buttonStyle: 'bg-gray-900 hover:bg-gray-800 text-white',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Unlimited conversations',
        'Unlimited assistants',
        'Custom integrations',
        'Dedicated support',
        'SLA guarantee',
        'Advanced security'
      ],
      buttonText: 'Contact sales',
      buttonStyle: 'border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900'
    }
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Start free and scale as you grow. No hidden fees or surprises.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-8 sm:mb-12">
          <div className="bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                !isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isYearly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-1 sm:ml-2 text-xs bg-green-100 text-green-700 px-1.5 sm:px-2 py-0.5 rounded-full">
                Save 25%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-lg border p-4 sm:p-6 lg:p-8 transition-all hover:shadow-sm ${
                plan.popular 
                  ? 'border-gray-900 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-2 sm:-top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-gray-900 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    Most popular
                  </div>
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4">{plan.description}</p>
                
                <div className="mb-4">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && plan.price > 0 && (
                    <span className="text-sm sm:text-base text-gray-600">/month</span>
                  )}
                </div>
              </div>

              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center text-gray-700">
                    <Check className="w-4 h-4 text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-2 sm:py-3 px-4 rounded-lg text-sm sm:text-base font-medium transition-all ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        {/* Enterprise CTA */}
        <div className="mt-12 sm:mt-16 text-center">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
              Need something custom?
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
              Get a tailored solution with dedicated support and custom integrations.
            </p>
            <button className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-4 sm:px-6 py-3 rounded-lg text-sm sm:text-base font-medium transition-all">
              <span>Contact sales</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}