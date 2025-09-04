import React from 'react';
import { Bot, Upload, Settings, Rocket, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Create Your Bot',
    description: 'Set up your AI assistant in under 60 seconds. Just enter your website URL and we\'ll scan your content automatically.',
    icon: Bot,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    number: '02',
    title: 'Train & Customize',
    description: 'Upload documents, add FAQs, and customize the appearance to match your brand perfectly.',
    icon: Upload,
    color: 'bg-green-50 text-green-600 border-green-200'
  },
  {
    number: '03',
    title: 'Configure Settings',
    description: 'Set up human handoff rules, team permissions, and notification preferences for optimal workflow.',
    icon: Settings,
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  {
    number: '04',
    title: 'Go Live',
    description: 'Deploy your bot with a single line of code. Start helping customers immediately with 24/7 support.',
    icon: Rocket,
    color: 'bg-orange-50 text-orange-600 border-orange-200'
  }
];

export function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            How it works
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Get your AI-powered customer support up and running in minutes, not hours.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-center">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 ${step.color} rounded-lg border flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-sm`}>
                  <step.icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                
                <div className="text-xs sm:text-sm font-bold text-gray-400 mb-2">{step.number}</div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{step.description}</p>
              </div>

              {/* Arrow for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-6 sm:top-8 -right-4 text-gray-300">
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium transition-all text-base sm:text-lg">
            Start building your bot
          </button>
        </div>
      </div>
    </section>
  );
}