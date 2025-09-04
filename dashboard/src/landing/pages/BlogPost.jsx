import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Tag, Share2 } from 'lucide-react';

export function BlogPost() {
  const { slug } = useParams();

  // In a real app, this would fetch the post data based on the slug
  const post = {
    title: 'The Future of Customer Support: AI and Human Collaboration',
    content: `
      <p class="lead">
        The landscape of customer support is rapidly evolving, with artificial intelligence playing an increasingly crucial role in how businesses interact with their customers.
      </p>

      <h2>The Current State of Customer Support</h2>
      <p>
        Traditional customer support models are being challenged by increasing customer expectations and the need for 24/7 availability. Businesses are finding themselves at a crossroads: adapt to new technologies or risk falling behind.
      </p>

      <h2>The Role of AI in Modern Support</h2>
      <p>
        AI is not just a buzzword - it's transforming how we approach customer service. From chatbots handling routine queries to advanced analytics predicting customer needs, AI is becoming an indispensable tool in the support toolkit.
      </p>

      <h2>Finding the Right Balance</h2>
      <p>
        The key to successful implementation lies in finding the perfect balance between AI efficiency and human touch. While AI can handle routine tasks and provide instant responses, human agents are crucial for complex issues and emotional support.
      </p>

      <h2>Looking Ahead</h2>
      <p>
        As AI technology continues to evolve, we can expect even more sophisticated solutions that blur the line between automated and human support. The future is not about replacing humans, but about empowering them with better tools.
      </p>
    `,
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1600&h=800&fit=crop',
    date: 'Mar 15, 2024',
    readTime: '5 min read',
    category: 'AI & Machine Learning',
    author: {
      name: 'Sarah Johnson',
      role: 'AI Research Lead',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face'
    }
  };

  return (
    <article className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/80" />
        </div>
        <div className="container mx-auto px-6 relative text-white text-center">
          <Link
            to="/blog"
            className="inline-flex items-center text-sky-300 hover:text-sky-400 transition-colors mb-8 group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
          <h1 className="text-5xl font-bold mb-6 max-w-4xl mx-auto">
            {post.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-gray-300">
            <span className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              {post.date}
            </span>
            <span className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              {post.readTime}
            </span>
            <span className="flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              {post.category}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Author */}
          <div className="flex items-center gap-4 mb-8 p-6 bg-sky-50 rounded-2xl">
            <img
              src={post.author.image}
              alt={post.author.name}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
              <p className="text-gray-600">{post.author.role}</p>
            </div>
            <button className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          <div className="mt-12 pt-8 border-t">
            <div className="flex flex-wrap gap-2">
              {['AI', 'Customer Support', 'Future of Work', 'Technology'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}