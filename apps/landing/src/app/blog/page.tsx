import type { Metadata } from 'next'
import Nav from '@/components/nav'
import Footer from '@/components/footer'
import { blogPosts } from '@/content/blog-posts'

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Technical analysis, regulatory deadlines, and field reports from the post-quantum migration front. No FUD\u200a\u2014\u200ajust data.',
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogIndex() {
  return (
    <>
      <Nav />
      <main className="pt-32 pb-24">
        <div className="max-w-[720px] mx-auto px-6">
          {/* Header */}
          <div className="mb-16">
            <p className="font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-[var(--accent)] mb-4">
              Research &amp; Analysis
            </p>
            <h1 className="font-[var(--font-heading)] text-[clamp(32px,5vw,48px)] font-semibold leading-[1.1] tracking-[-0.02em] text-[var(--graphite)] mb-6">
              Blog
            </h1>
            <p className="text-[16px] leading-[1.7] text-[var(--graphite-med)] max-w-[540px]">
              Technical analysis, regulatory deadlines, and field reports from the
              post-quantum migration front. No FUD&thinsp;&mdash;&thinsp;just data.
            </p>
          </div>

          {/* Post list */}
          <div className="space-y-0">
            {blogPosts.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block group border-t border-[var(--graphite-ghost)] py-8 transition-colors duration-200 hover:bg-[rgba(0,204,170,0.02)]"
              >
                {/* Meta row */}
                <div className="flex items-center gap-3 mb-3">
                  <time
                    dateTime={post.date}
                    className="font-mono text-[11px] tracking-[0.04em] text-[var(--graphite-light)]"
                  >
                    {formatDate(post.date)}
                  </time>
                  <span className="text-[var(--graphite-ghost)]">&middot;</span>
                  <span className="font-mono text-[11px] tracking-[0.04em] text-[var(--graphite-light)]">
                    {post.readingTime}
                  </span>
                </div>

                {/* Title */}
                <h2 className="font-[var(--font-heading)] text-[22px] font-semibold leading-[1.3] text-[var(--graphite)] group-hover:text-[var(--accent)] transition-colors duration-200 mb-3">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-[15px] leading-[1.7] text-[var(--graphite-med)]">
                  {post.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="font-mono text-[10px] font-medium tracking-[0.06em] uppercase px-2.5 py-1 border border-[var(--graphite-ghost)] text-[var(--graphite-light)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </a>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
