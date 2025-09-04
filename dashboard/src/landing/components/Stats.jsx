import React from 'react';
import { Users, MessageSquare, Clock, Zap } from 'lucide-react';

const stats = [
  {
    number: '10K+',
    label: 'Support Teams',
    description: 'Trust CustomerBot',
    icon: Users,
    color: 'text-blue-600'
  },
  {
    number: '5M+',
    label: 'Conversations',
    description: 'Handled monthly',
    icon: MessageSquare,
    color: 'text-green-600'
  },
  {
    number: '< 2s',
    label: 'Response Time',
    description: 'Average AI response',
    icon: Clock,
    color: 'text-purple-600'
  },
  {
    number: '99.9%',
    label: 'Uptime',
    description: 'Service guarantee',
    icon: Zap,
    color: 'text-orange-600'
  }
];

export function Stats() {
  return (
    <section className="py-12 sm:py-16 bg-gray-50 border-y border-gray-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                  <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${stat.color}`} />
                </div>
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.number}</div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-1">{stat.label}</div>
              <div className="text-xs sm:text-sm text-gray-600">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}