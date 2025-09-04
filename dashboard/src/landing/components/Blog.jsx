import { Calendar, Clock, ArrowRight } from 'lucide-react';

const posts = [
  {
    title: 'The Future of Customer Support: AI and Human Collaboration',
    excerpt: 'Discover how AI is transforming customer support while maintaining the human touch.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&h=400&fit=crop',
    date: 'Mar 15, 2024',
    readTime: '5 min read'
  },
  {
    title: '10 Ways to Improve Customer Response Time with AI',
    excerpt: 'Learn practical strategies to reduce response times and increase customer satisfaction.',
    image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=400&fit=crop',
    date: 'Mar 12, 2024',
    readTime: '4 min read'
  },
  {
    title: 'Building Trust in AI-Powered Customer Service',
    excerpt: 'Essential tips for maintaining authenticity and trust when implementing AI support.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
    date: 'Mar 10, 2024',
    readTime: '6 min read'
  }
];

export function Blog() {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Latest Insights</h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            Stay updated with the latest trends and best practices in AI-powered customer support.
          </p>
        </div>
        <button className="group flex items-center text-sky-500 font-medium hover:text-sky-600 transition-colors">
          View All Posts
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <article
            key={index}
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
              <button className="text-sky-500 font-medium group-hover:text-sky-600 transition-colors">
                Read More
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}