import { useState } from 'react';
import { ChevronDown, HelpCircle, MessageSquare, Sparkles, ArrowRight } from 'lucide-react';

const faqs = [
  {
    question: "How does CustomerBot's AI understand customer queries?",
    answer: "CustomerBot uses advanced natural language processing and machine learning to understand context, intent, and sentiment in customer messages. Our AI is trained on millions of conversations and continuously learns from interactions to provide accurate and relevant responses.",
    category: "AI Technology"
  },
  {
    question: "Can I customize the AI's responses and appearance?",
    answer: "Absolutely! You can fully customize your bot's personality, responses, colors, avatar, and branding. Train it with your company's specific knowledge base, set the tone of voice, and ensure it aligns perfectly with your brand identity.",
    category: "Customization"
  },
  {
    question: "What languages does CustomerBot support?",
    answer: "CustomerBot supports over 50 languages with real-time translation capabilities. This ensures you can provide global customer support coverage and communicate effectively with customers worldwide, regardless of their preferred language.",
    category: "Features"
  },
  {
    question: "How secure is my customer data?",
    answer: "We employ enterprise-grade encryption and comply with GDPR, CCPA, SOC 2, and other privacy regulations. Your data is stored in secure, certified data centers with multiple layers of protection. We never share or sell your data to third parties.",
    category: "Security"
  },
  {
    question: "Can CustomerBot integrate with my existing tools?",
    answer: "Yes! CustomerBot seamlessly integrates with popular CRM systems, help desks, e-commerce platforms, and communication tools through our robust API. We support Shopify, WordPress, Salesforce, HubSpot, Zendesk, Slack, and many more.",
    category: "Integrations"
  },
  {
    question: "How quickly can I set up CustomerBot?",
    answer: "You can have CustomerBot up and running in under 60 seconds! Simply enter your website URL, and our AI will automatically scan and learn from your content. No technical knowledge required - it's that simple.",
    category: "Setup"
  },
  {
    question: "What kind of support do you provide?",
    answer: "We offer 24/7 support through multiple channels including live chat, email, and phone. Our team of experts is always ready to help you optimize your chatbot performance and resolve any issues quickly.",
    category: "Support"
  },
  {
    question: "Can I try CustomerBot before purchasing?",
    answer: "Yes! We offer a 14-day free trial with full access to all features. No credit card required. You can test all functionalities and see how CustomerBot transforms your customer support before making any commitment.",
    category: "Pricing"
  }
];

const categories = [...new Set(faqs.map(faq => faq.category))];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredFaqs = selectedCategory === 'All' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <section className="relative py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/4 -left-1/4 w-96 h-96 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-6 py-3 rounded-full border border-indigo-200 shadow-lg mb-6">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">FAQ</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Frequently Asked
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know about CustomerBot and how it can transform your customer support
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              selectedCategory === 'All'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-white/50'
            }`}
          >
            All Questions
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                  : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-white/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto space-y-4 mb-16">
          {filteredFaqs.map((faq, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <button
                className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-blue-50/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {faq.question}
                    </span>
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" />
                        {faq.category}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown
                  className={`w-6 h-6 text-blue-500 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <div
                className={`px-8 transition-all duration-300 overflow-hidden ${
                  openIndex === index ? 'pb-6' : 'max-h-0'
                }`}
              >
                <div className="pl-16">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contact Support CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-6">
                <MessageSquare className="w-6 h-6" />
                <span className="text-lg font-semibold">Still Have Questions?</span>
              </div>
              
              <h3 className="text-4xl font-bold mb-6">
                We're Here to Help
              </h3>
              
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Our support team is available 24/7 to answer any questions and help you get the most out of CustomerBot.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105">
                  <span>Contact Support</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300">
                  <span>Live Chat</span>
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}