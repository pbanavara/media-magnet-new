import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Mail, Twitter, Linkedin, Instagram } from 'lucide-react';
import {
  findJournalists,
  getEmailBody,
  inferCompanyNameFromUrl,
  inferCompanyDescriptionFromUrl,
  type Journalist,
  type OutreachMessages,
} from '@/services/journalists';

interface JournalistListProps {
  website: string;
  onResults?: (journalists: Journalist[]) => void;
}

const toProfileUrl = (value: string | null, baseUrl: string) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const stripped = trimmed.replace(/^@/, '');
  return `${baseUrl}${stripped}`;
};

export const JournalistList = ({ website, onResults }: JournalistListProps) => {
  const [expandedJournalists, setExpandedJournalists] = useState<Set<string>>(new Set());
  const companyName = useMemo(() => inferCompanyNameFromUrl(website), [website]);
  const companyDescription = useMemo(
    () => inferCompanyDescriptionFromUrl(website, companyName),
    [companyName, website],
  );
  const onResultsRef = useRef(onResults);
  const [outreachMessages, setOutreachMessages] = useState<Record<string, OutreachMessages>>({});
  const [outreachErrors, setOutreachErrors] = useState<Record<string, string>>({});
  const [outreachLoading, setOutreachLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    onResultsRef.current = onResults;
  }, [onResults]);

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['findJournalists', website],
    queryFn: () =>
      findJournalists({
        website,
        companyName,
        companyDescription,
      }),
    enabled: Boolean(website),
  });

  useEffect(() => {
    const callback = onResultsRef.current;
    if (!callback) {
      return;
    }

    if (isError || !data?.journalists) {
      callback([]);
      return;
    }

    callback(data.journalists);
  }, [data?.journalists, isError]);
  const journalistsList = useMemo(() => data?.journalists ?? [], [data?.journalists]);

  const outreachMutation = useMutation({
    mutationFn: ({ journalist }: { journalist: Journalist }) =>
      getEmailBody({ journalist, companyName, companyDescription, website }),
  });

  const toggleExpanded = (journalistKey: string, journalist: Journalist) => {
    const willExpand = !expandedJournalists.has(journalistKey);
    const newExpanded = new Set(expandedJournalists);
    if (newExpanded.has(journalistKey)) {
      newExpanded.delete(journalistKey);
    } else {
      newExpanded.add(journalistKey);
    }
    setExpandedJournalists(newExpanded);

    if (!willExpand) {
      return;
    }

    if (outreachMessages[journalistKey] || outreachLoading[journalistKey]) {
      return;
    }

    setOutreachLoading((prev) => ({ ...prev, [journalistKey]: true }));
    setOutreachErrors((prev) => {
      const { [journalistKey]: _ignored, ...rest } = prev;
      return rest;
    });

    outreachMutation.mutate(
      { journalist },
      {
        onSuccess: (response) => {
          setOutreachMessages((prev) => ({ ...prev, [journalistKey]: response.outreach }));
        },
        onError: (mutationError) => {
          const message =
            mutationError instanceof Error ? mutationError.message : 'Unable to generate outreach messages.';
          setOutreachErrors((prev) => ({ ...prev, [journalistKey]: message }));
        },
        onSettled: () => {
          setOutreachLoading((prev) => ({ ...prev, [journalistKey]: false }));
        },
      },
    );
  };

  const getRelevanceBadgeColor = (relevanceScore: number) => {
    if (relevanceScore >= 90) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (relevanceScore >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl text-center text-muted-foreground">
          Loading journalist recommendations...
        </div>
      </section>
    );
  }

  if (isError) {
    console.error('[JournalistList] Query failed', { error, website, companyName, companyDescription });
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl text-center text-destructive">
          We couldn't load journalist recommendations right now. Please try again shortly.
          <pre className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
            {error instanceof Error ? error.message : 'Unknown error'}
          </pre>
        </div>
      </section>
    );
  }

  if (!journalistsList.length) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 max-w-4xl text-center text-muted-foreground">
          No journalist matches yet—try another website once we're able to pull live data.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Your Personalized Journalist List
          </h2>
          <p className="text-lg text-muted-foreground">
            Curated outreach targets for {companyName}
          </p>
        </div>

        <div className="space-y-4">
          {journalistsList.map((journalist, index) => {
            const twitterUrl = toProfileUrl(journalist.twitter, 'https://twitter.com/');
            const linkedInUrl = toProfileUrl(journalist.linkedIn, 'https://www.linkedin.com/in/');
            const instagramUrl = toProfileUrl(journalist.instagram, 'https://www.instagram.com/');
            const journalistKey = `${journalist.email ?? journalist.coverageLink ?? journalist.name}-${index}`;
            const isExpanded = expandedJournalists.has(journalistKey);
            const outreach = outreachMessages[journalistKey];
            const isGeneratingOutreach = Boolean(outreachLoading[journalistKey]);
            const outreachError = outreachErrors[journalistKey];

            return (
              <Card key={journalistKey} className="card-shadow hover-scale smooth-transition">
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-foreground">{journalist.name}</h3>
                        <Badge className="bg-primary/10 text-primary border border-primary/20 font-semibold">
                          {journalist.parentMediaOrganization}
                        </Badge>
                        <Badge className={`${getRelevanceBadgeColor(journalist.relevanceScore)} font-semibold`}>
                          Relevance: {journalist.relevanceScore}/100
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">
                        {journalist.coverageSummary}{' '}
                        {journalist.coverageLink && (
                          <a
                            href={journalist.coverageLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-glow"
                          >
                            Read coverage ↗
                          </a>
                        )}
                      </p>

                      <div className="flex items-center gap-4 flex-wrap text-sm">
                        {journalist.email && (
                          <a
                            href={`mailto:${journalist.email}`}
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-glow smooth-transition"
                          >
                            <Mail className="h-4 w-4" />
                            {journalist.email}
                          </a>
                        )}
                        {twitterUrl && (
                          <a
                            href={twitterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-glow smooth-transition"
                          >
                            <Twitter className="h-4 w-4" />
                            X / Twitter
                          </a>
                        )}
                        {linkedInUrl && (
                          <a
                            href={linkedInUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-glow smooth-transition"
                          >
                            <Linkedin className="h-4 w-4" />
                            LinkedIn
                          </a>
                        )}
                        {instagramUrl && (
                          <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-primary hover:text-primary-glow smooth-transition"
                          >
                            <Instagram className="h-4 w-4" />
                            Instagram
                          </a>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpanded(journalistKey, journalist)}
                      className="whitespace-nowrap"
                      disabled={isGeneratingOutreach && !isExpanded}
                    >
                      {isExpanded ? (
                        <>
                          Hide Message <ChevronUp className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          View Message <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    {journalist.sources.length > 0 && (
                      <div>
                        <span className="font-semibold text-foreground mr-2">Sources:</span>
                        <span className="space-x-2">
                          {journalist.sources.map((source, index) => (
                            <a
                              key={`${source.url}-${index}`}
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-glow"
                            >
                              {source.description}
                            </a>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-border">
                      <h4 className="font-semibold text-foreground mb-3">Personalized Outreach Drafts</h4>

                      {isGeneratingOutreach && (
                        <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
                          Generating tailored outreach messages...
                        </div>
                      )}

                      {outreachError && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-lg text-sm">
                          {outreachError}
                        </div>
                      )}

                      {outreach && !isGeneratingOutreach && !outreachError && (
                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <h5 className="font-semibold text-foreground mb-2">Email (cold reach)</h5>
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                              {outreach.email}
                            </pre>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h5 className="font-semibold text-foreground mb-2">X Direct Message</h5>
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                              {outreach.xDirectMessage}
                            </pre>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h5 className="font-semibold text-foreground mb-2">X Public Post</h5>
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                              {outreach.xPublicPost}
                            </pre>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h5 className="font-semibold text-foreground mb-2">LinkedIn Direct Message</h5>
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                              {outreach.linkedInDirectMessage}
                            </pre>
                          </div>
                          <div className="bg-muted p-4 rounded-lg">
                            <h5 className="font-semibold text-foreground mb-2">LinkedIn Public Post</h5>
                            <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">
                              {outreach.linkedInPublicPost}
                            </pre>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-3 flex-wrap">
                        <Button
                          variant="default"
                          size="sm"
                          disabled={!outreach || isGeneratingOutreach}
                          onClick={() => outreach && navigator.clipboard.writeText(outreach.email)}
                        >
                          Copy Email
                        </Button>
                        {journalist.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!outreach || isGeneratingOutreach}
                            onClick={() =>
                              outreach &&
                              window.open(
                                `mailto:${journalist.email}?subject=Story opportunity - ${companyName}&body=${encodeURIComponent(outreach.email)}`,
                              )
                            }
                          >
                            Send Email
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
