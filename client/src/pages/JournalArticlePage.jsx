import React, { useEffect, useState } from 'react';
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import { api } from '../services/api';

export default function JournalArticlePage({ slug, onNavigate }) {
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    if (!slug) return () => { mounted = false; };

    api.journal.getBySlug(slug)
      .then((res) => {
        if (mounted) setArticle(res.article || null);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Article not found');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [slug]);

  const formatDate = (date) => (
    date
      ? new Date(date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
      : ''
  );

  if (!slug) {
    return (
      <div className="min-h-screen bg-white px-4 py-20 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-ash mb-3">
          Journal
        </p>
        <h1 className="font-display text-3xl font-extrabold text-noir mb-4">
          Article not found
        </h1>
        <button
          onClick={() => onNavigate('journal')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-noir hover:text-ash transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-4 py-20 text-center text-sm text-ash">
        Loading journal story...
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white px-4 py-20 max-w-3xl mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-ash mb-3">
          Journal
        </p>
        <h1 className="font-display text-3xl font-extrabold text-noir mb-4">
          Article not found
        </h1>
        <button
          onClick={() => onNavigate('journal')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-noir hover:text-ash transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </button>
      </div>
    );
  }

  const paragraphs = (article.content || '').split(/\n{2,}/).filter(Boolean);

  return (
    <article className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <button
          onClick={() => onNavigate('journal')}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ash hover:text-noir transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Journal
        </button>

        <header className="space-y-5 mb-8">
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-ash font-medium">
            <span className="text-noir font-bold uppercase tracking-wider text-[10px]">
              {article.tag}
            </span>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {article.readTime || '4 min read'}
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-noir tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-ash leading-relaxed max-w-3xl">
            {article.summary}
          </p>
        </header>

        <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-sand mb-8">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        {(article.sourceName || article.sourceUrl) && (
          <div className="mb-10 rounded-2xl border border-black/10 bg-cream/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ash">
                Source
              </p>
              <p className="text-sm font-semibold text-noir">
                {article.sourceName || 'Original source'}
                {article.sourcePublishedAt ? ` · ${formatDate(article.sourcePublishedAt)}` : ''}
              </p>
            </div>

            {article.sourceUrl && (
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-noir hover:text-emerald-700 transition-colors"
              >
                Open Source
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}

        <div className="prose prose-neutral max-w-none">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-[15px] sm:text-base leading-8 text-noir/80 mb-6">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </article>
  );
}
