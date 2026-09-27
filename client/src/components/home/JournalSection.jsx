import React, { useEffect, useState } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { demoArticles } from '../../data/demoArticles';

export default function JournalSection({ onNavigate }) {
  const mapArticle = (a) => ({
    id: a._id,
    slug: a.slug,
    title: a.title,
    date: new Date(a.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
    readTime: a.readTime || '4 min read',
    tag: a.tag,
    image: a.image,
    summary: a.summary
  });

  const [articles, setArticles] = useState(demoArticles.slice(0, 3).map(mapArticle));

  useEffect(() => {
    let mounted = true;
    api.journal.getTop()
      .then((res) => {
        if (mounted && res?.articles) {
          setArticles(res.articles.map(mapArticle));
        }
      })
      .catch((err) => console.error('Failed to load journal articles:', err));

    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-black/5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-ash">
            Editorial & Insights
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-noir tracking-tight mt-1">
            From the Journal
          </h2>
          <p className="text-xs sm:text-sm text-ash mt-1 font-normal max-w-md">
            Explore style inspiration, seasonal trends, and guides to building a timeless wardrobe.
          </p>
        </div>

        <button
          onClick={() => onNavigate('journal')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-noir hover:text-ash transition-colors group"
        >
          <span>View More</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {articles.map((art) => (
          <article
            key={art.id}
            onClick={() => art.slug ? onNavigate('journal-article', { slug: art.slug }) : onNavigate('journal')}
            className="group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-sand mb-4">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>

              <div className="flex items-center gap-3 text-[11px] text-ash font-medium mb-2">
                <span className="text-noir font-bold uppercase tracking-wider text-[10px]">
                  {art.tag}
                </span>
                <span>•</span>
                <span>{art.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {art.readTime}
                </span>
              </div>

              <h3 className="font-display text-base font-bold text-noir group-hover:text-emerald-700 transition-colors leading-snug">
                {art.title}
              </h3>

              <p className="text-xs text-ash mt-2 leading-relaxed line-clamp-2">
                {art.summary}
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-noir mt-4 group-hover:translate-x-1 transition-transform">
              <span>Read Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
