import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    text: "CustomerBot reduced our support response time by 80%. The AI handles routine questions perfectly, and the human handoff is seamless.",
    author: "Sarah Johnson",
    role: "Head of Support",
    company: "TechCorp",
    image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
  },
  {
    text: "The mobile app lets our team provide support from anywhere. Game-changer for our distributed team.",
    author: "Michael Chen",
    role: "Customer Success",
    company: "CloudScale",
    image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
  },
  {
    text: "Setup took less than 5 minutes. The AI learned our FAQ instantly and started helping customers right away.",
    author: "Emily Rodriguez",
    role: "Operations Manager",
    company: "StartupXYZ",
    image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
  }
];

export function Testimonials() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Loved by support teams
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed">
            See what our customers have to say about their experience.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all">
              <div className="flex gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <blockquote className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>
              
              <div className="flex items-center gap-3">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gray-200"
                />
                <div>
                  <div className="text-sm sm:text-base font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-xs sm:text-sm text-gray-600">{testimonial.role}, {testimonial.company}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}