import { useMemo, useState, useEffect, useRef } from 'react';
import { HeroSection } from '@/components/HeroSection';
import { JournalistList } from '@/components/JournalistList';
import { TrustSection } from '@/components/TrustSection';
import { TestimonialsCarousel } from '@/components/TestimonialsCarousel';
import { MidPageCTA } from '@/components/MidPageCTA';
import { StickyFooterCTA } from '@/components/StickyFooterCTA';
import { useToast } from '@/hooks/use-toast';
import type { Journalist } from '@/services/journalists';
import { analytics } from '@/lib/analytics';

const Index = () => {
  const [submittedWebsite, setSubmittedWebsite] = useState<string | null>(null);
  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const [structuredJournalists, setStructuredJournalists] = useState<Journalist[]>([]);
  const { toast } = useToast();
  const stickyFooterVisibleRef = useRef(false);

  // Show sticky footer when user scrolls past hero
  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerHeight;
      setShowStickyFooter(window.scrollY > heroHeight * 0.8);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWebsiteSubmit = (website: string) => {
    setSubmittedWebsite(website);
    toast({
      title: "Generating your journalist list...",
      description: "This will take just a moment!",
      duration: 2000,
    });

    // Scroll to results after a brief delay
    setTimeout(() => {
      const resultsSection = document.getElementById('journalist-results');
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 500);
  };

  const handleStickyFooterClose = () => {
    setShowStickyFooter(false);
    analytics.stickyFooterDismissed({
      method: 'close_button',
      website: submittedWebsite,
    });
  };

  useEffect(() => {
    if (showStickyFooter && !stickyFooterVisibleRef.current) {
      analytics.stickyFooterDisplayed({
        reason: 'scroll_threshold',
        website: submittedWebsite,
      });
      stickyFooterVisibleRef.current = true;
    }

    if (!showStickyFooter && stickyFooterVisibleRef.current) {
      stickyFooterVisibleRef.current = false;
    }
  }, [showStickyFooter, submittedWebsite]);

  const structuredData = useMemo(() => {
    const base = {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'Startup Publicity Tool',
      description:
        'Get press coverage in top outlets like WSJ, Forbes, TechCrunch without PR agencies or upfront costs',
      provider: {
        '@type': 'Organization',
        name: 'Startup Publicity Tool',
      },
      serviceType: 'Media Relations',
      areaServed: 'Worldwide',
    } as const;

    if (!structuredJournalists.length) {
      return base;
    }

    const journalistEntries = structuredJournalists.map((journalist, index) => {
      const sameAs = [
        journalist.email ? `mailto:${journalist.email}` : null,
        journalist.twitter,
        journalist.linkedIn,
        journalist.instagram,
      ].filter(
        (link): link is string => Boolean(link),
      );
      const citations = (journalist.sources ?? []).map((source) => ({
        '@type': 'CreativeWork',
        name: source.description,
        url: source.url,
      }));

      return {
        '@type': 'Person',
        position: index + 1,
        name: journalist.name,
        worksFor: {
          '@type': 'Organization',
          name: journalist.parentMediaOrganization,
        },
        email: journalist.email ? `mailto:${journalist.email}` : undefined,
        sameAs,
        subjectOf: {
          '@type': 'CreativeWork',
          headline: journalist.coverageSummary,
          url: journalist.coverageLink,
        },
        additionalProperty: [
          {
            '@type': 'PropertyValue',
            name: 'Relevance Score',
            value: journalist.relevanceScore,
          },
        ],
        ...(citations.length ? { citation: citations } : {}),
      };
    });

    return {
      ...base,
      potentialAction: {
        '@type': 'FindAction',
        name: 'Find Journalists',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: '/findJournalists?website={website}',
          httpMethod: 'GET',
          contentType: 'application/json',
        },
        result: {
          '@type': 'ItemList',
          name: 'Recommended Journalists',
          itemListElement: journalistEntries,
        },
      },
    };
  }, [structuredJournalists]);

  return (
    <main className="min-h-screen bg-background">
      {/* Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>

      <header>
        <h1 className="sr-only">Get Press Coverage in Top Outlets Without PR Agencies</h1>
      </header>

      <HeroSection onSubmit={handleWebsiteSubmit} />

      {submittedWebsite && (
        <div id="journalist-results">
          <JournalistList
            website={submittedWebsite}
            onResults={(results) => setStructuredJournalists(results)}
          />
        </div>
      )}
    </main>
  );
};

export default Index;
