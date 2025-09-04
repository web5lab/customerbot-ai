import { MapPin, Phone, Mail, Globe, MessageSquare, Clock, Facebook, Twitter, Linkedin, Instagram, Send, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';

const offices = [
  {
    city: 'San Francisco',
    address: '100 Market Street, Suite 300, CA 94105',
    phone: '+1 (415) 555-0123',
    email: 'sf@CustomerBot.ai',
    timezone: 'PST (UTC-8)',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    city: 'London',
    address: '123 King\'s Road, Westminster, SW1A 1AA',
    phone: '+44 20 7123 4567',
    email: 'london@CustomerBot.ai',
    timezone: 'GMT (UTC+0)',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    city: 'Singapore',
    address: '1 Raffles Place, #20-61, 048616',
    phone: '+65 6789 0123',
    email: 'sg@CustomerBot.ai',
    timezone: 'SGT (UTC+8)',
    gradient: 'from-green-500 to-emerald-500'
  }
];

const socials = [
  { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-blue-600' },
  { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-sky-500' },
  { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-700' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-600' }
];

const contactMethods = [
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Chat with our support team',
    action: 'Start Chat',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Mail,
    title: 'Email Support',
    description: 'Get help via email',
    action: 'Send Email',
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    icon: Phone,
    title: 'Phone Support',
    description: 'Speak with an expert',
    action: 'Call Now',
    gradient: 'from-green-500 to-emerald-500'
  }
];

export function Contact() {
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
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-3 rounded-full border border-green-200 shadow-lg mb-6">
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">Contact Us</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Get in Touch
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              With Our Team
            </span>
          </h2>
          
          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {contactMethods.map((method, index) => (
            <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-center">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${method.gradient} shadow-lg mb-6 group-hover:scale-110 transition-transform`}>
                <method.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
              <p className="text-gray-600 mb-6">{method.description}</p>
              <button className={`group/btn inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${method.gradient} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300`}>
                <span>{method.action}</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Enhanced Contact Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/50 shadow-xl">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Send us a Message</h3>
                <p className="text-gray-600">We'll get back to you within 24 hours</p>
              </div>
            </div>

            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-3">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/80 backdrop-blur-sm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/80 backdrop-blur-sm"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-semibold text-gray-700 mb-3">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="Your Company"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-3">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/80 backdrop-blur-sm"
                  placeholder="How can we help?"
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-3">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white/80 backdrop-blur-sm resize-none"
                  placeholder="Tell us about your project or question..."
                />
              </div>
              
              <button
                type="submit"
                className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
              >
                <div className="flex items-center justify-center gap-3">
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <span>Send Message</span>
                </div>
              </button>
            </form>
          </div>

          {/* Enhanced Contact Info */}
          <div className="space-y-8">
            {/* Office Locations */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                Our Offices
              </h3>
              
              {offices.map((office, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${office.gradient} shadow-lg group-hover:scale-110 transition-transform`}>
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">{office.city}</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-gray-400" />
                          <span>{office.address}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{office.phone}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{office.email}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>{office.timezone}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Support */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-white/20 backdrop-blur-sm">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">24/7 Global Support</h3>
                    <p className="text-blue-100">We're here whenever you need us</p>
                  </div>
                </div>
                
                <p className="text-blue-50 mb-6 leading-relaxed">
                  Our support team is available around the clock across multiple time zones to ensure you get help whenever you need it.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Response Time', value: '<2 hours' },
                    { label: 'Satisfaction', value: '99.5%' },
                    { label: 'Languages', value: '15+' },
                    { label: 'Availability', value: '24/7' }
                  ].map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-blue-200">{stat.label}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-4">
                  {socials.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      className="group p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-110"
                      aria-label={social.label}
                    >
                      <social.icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Why Choose Us?
              </h4>
              <div className="space-y-3">
                {[
                  'Enterprise-grade security and compliance',
                  'Dedicated customer success manager',
                  'Custom integrations and development',
                  'SLA-backed uptime guarantee'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}