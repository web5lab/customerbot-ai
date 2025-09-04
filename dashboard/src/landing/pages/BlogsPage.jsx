import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tag, Calendar, Clock, ArrowRight } from 'lucide-react';

const categories = ['AI & Machine Learning', 'Customer Support', 'Best Practices', 'Industry News', 'Case Studies'];

const posts = [
  {
    title: 'The Future of Customer Support: AI and Human Collaboration',
    excerpt: 'Discover how AI is transforming customer support while maintaining the human touch. Learn about the perfect balance between automation and personal interaction.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop',
    date: 'Mar 15, 2024',
    readTime: '5 min read',
    category: 'AI & Machine Learning',
    slug: 'future-of-customer-support',
    featured: true
  },
  {
    title: '10 Ways to Improve Customer Response Time with AI',
    excerpt: 'Learn practical strategies to reduce response times and increase customer satisfaction. Implement AI-powered solutions for faster support.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop',
    date: 'Mar 12, 2024',
    readTime: '4 min read',
    category: 'Best Practices',
    slug: 'improve-response-time'
  },
  {
    title: 'Building Trust in AI-Powered Customer Service',
    excerpt: 'Essential tips for maintaining authenticity and trust when implementing AI support. Create a seamless experience that customers love.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    date: 'Mar 10, 2024',
    readTime: '6 min read',
    category: 'Customer Support',
    slug: 'building-trust-ai-support'
  },
  {
    title: 'Case Study: How TechCorp Reduced Support Costs by 50%',
    excerpt: 'An in-depth look at how TechCorp transformed their customer support operations using CustomerBot\'s AI solutions.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop',
    date: 'Mar 8, 2024',
    readTime: '8 min read',
    category: 'Case Studies',
    slug: 'techcorp-case-study'
  },
  {
    title: '2024 Customer Service Trends You Need to Know',
    excerpt: 'Stay ahead of the curve with these emerging trends in customer service and support technology.',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=400&fit=crop',
    date: 'Mar 5, 2024',
    readTime: '7 min read',
    category: 'Industry News',
    slug: '2024-service-trends'
  }
];

export function BlogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = posts.find(post => post.featured);

  return (
    <div className="container mx-auto px-6 py-12">
      {/* Featured Post */}
      {featuredPost && (
        <Link 
          to={`/blog/${featuredPost.slug}`}
          className="block group mb-16"
        >
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/75 to-gray-900/0 z-10" />
            <img
              src={featuredPost.image}
              alt={featuredPost.title}
              className="w-full h-[600px] object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-0 left-0 right-0 p-12 z-20 text-white">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-sky-500/90 text-sm font-medium mb-4">
                Featured Post
              </div>
              <h2 className="text-4xl font-bold mb-4 group-hover:text-sky-300 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-lg text-gray-200 mb-6 max-w-3xl">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {featuredPost.date}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  {featuredPost.readTime}
                </span>
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  {featuredPost.category}
                </span>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Search and Filters */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all"
            />
          </div>
          <div className="flex gap-3 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post, index) => (
          <Link
            key={index}
            to={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-lg shadow-sky-100/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative overflow-hidden aspect-[2/1]">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {post.date}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {post.readTime}
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-sky-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-600 mb-4">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-sky-500">{post.category}</span>
                <span className="text-sky-500 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}