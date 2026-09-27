import React, { useEffect, useState } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { demoArticles } from '../data/demoArticles';

export default function JournalPage({ onNavigate }) {
  const [posts, setPosts] = useState(demoArticles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    api.journal.getAll()
      .then((res) => {
        if (mounted && res.articles?.length) setPosts(res.articles);
      })
      .catch((err) => console.error('Failed to load journal articles:', err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);

  const formatDate = (date) => (
    date
      ? new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : ''
  );

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-ash">
          The FloSet Journal
        </span>
        <h1 className="font-display text-4xl font-extrabold text-noir tracking-tight">
          Style, Trends & Circular Fashion
        </h1>
        <p className="text-xs sm:text-sm text-ash leading-relaxed">
          Guides to building unforgettable occasion looks, fitting tips, and stories from our fashion community.
        </p>
      </div>

      {loading && (
        <div className="text-center text-sm text-ash py-16">
          Loading journal stories...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.map((post) => (
          <article
            key={post._id || post.slug}
            onClick={() => post.slug && onNavigate('journal-article', { slug: post.slug })}
            className="group p-5 rounded-3xl bg-cream/30 border border-black/5 flex flex-col justify-between cursor-pointer"
          >
            <div>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-sand mb-4">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="flex items-center gap-3 text-[11px] text-ash font-medium mb-2">
                <span className="text-noir font-bold uppercase tracking-wider text-[10px]">
                  {post.tag}
                </span>
                <span>•</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readTime}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-noir group-hover:text-emerald-700 transition-colors leading-snug">
                {post.title}
              </h3>

              <p className="text-xs text-ash mt-2 leading-relaxed">
                {post.summary}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-noir mt-4 group-hover:translate-x-1 transition-transform">
              <span>Read Full Article</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
