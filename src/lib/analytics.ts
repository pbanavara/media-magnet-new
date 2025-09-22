import { track } from '@vercel/analytics';

type TrackPrimitive = string | number | boolean | null;
type TrackPayload = Record<string, TrackPrimitive | undefined>;

const sanitizePayload = (payload?: TrackPayload):
  | Record<string, TrackPrimitive>
  | undefined => {
  if (!payload) {
    return undefined;
  }

  const entries = Object.entries(payload).filter(([, value]) => value !== undefined);
  if (!entries.length) {
    return undefined;
  }

  return entries.reduce<Record<string, TrackPrimitive>>((acc, [key, value]) => {
    acc[key] = value === undefined ? null : value;
    return acc;
  }, {});
};

const safeTrack = (eventName: string, payload?: TrackPayload) => {
  try {
    const sanitized = sanitizePayload(payload);
    if (sanitized) {
      track(eventName, sanitized);
    } else {
      track(eventName);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[analytics] Failed to track "${eventName}"`, error);
    }
  }
};

const toHostname = (website: string) => {
  const trimmed = website.trim();
  const normalized = trimmed.replace(/\/$/, '');
  const maybeUrl = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;

  try {
    const hostname = new URL(maybeUrl).hostname;
    return hostname.replace(/^www\./i, '');
  } catch {
    return normalized.replace(/^www\./i, '');
  }
};

const withWebsiteDetails = (
  website: string,
  additionalPayload: TrackPayload = {},
) => {
  const trimmed = website.trim();
  const hasProtocol = /^https?:\/\//i.test(trimmed);
  const hostname = toHostname(trimmed);

  return {
    website_input: trimmed,
    website_domain: hostname,
    website_has_protocol: hasProtocol,
    ...additionalPayload,
  } satisfies TrackPayload;
};

export const analytics = {
  websiteSubmitted: ({ source, website }: { source: 'hero_form' | 'midpage_form' | 'sticky_footer_form'; website: string }) => {
    safeTrack('website_submitted', withWebsiteDetails(website, { source }));
  },

  stickyFooterDisplayed: (details: { reason: 'scroll_threshold'; website?: string | null }) => {
    safeTrack('sticky_footer_displayed', {
      reason: details.reason,
      ...(details.website ? withWebsiteDetails(details.website) : {}),
    });
  },

  stickyFooterDismissed: (details: { method: 'close_button' | 'cta_submission'; website?: string | null }) => {
    safeTrack('sticky_footer_dismissed', {
      method: details.method,
      ...(details.website ? withWebsiteDetails(details.website) : {}),
    });
  },

  journalistResultsLoaded: ({ website, count }: { website: string; count: number }) => {
    safeTrack('journalist_results_loaded', withWebsiteDetails(website, { count }));
  },

  journalistResultsEmpty: ({ website }: { website: string }) => {
    safeTrack('journalist_results_empty', withWebsiteDetails(website));
  },

  journalistResultsFailed: ({ website, errorMessage }: { website: string; errorMessage: string }) => {
    safeTrack('journalist_results_failed', withWebsiteDetails(website, {
      error_message: errorMessage,
    }));
  },

  outreachPanelToggled: ({
    journalistName,
    organization,
    relevanceScore,
    expanded,
  }: {
    journalistName: string;
    organization: string;
    relevanceScore: number;
    expanded: boolean;
  }) => {
    safeTrack('outreach_panel_toggled', {
      journalist_name: journalistName,
      journalist_organization: organization,
      relevance_score: relevanceScore,
      expanded,
    });
  },

  outreachRequested: ({
    journalistName,
    organization,
    relevanceScore,
    website,
  }: {
    journalistName: string;
    organization: string;
    relevanceScore: number;
    website: string;
  }) => {
    safeTrack('outreach_requested', withWebsiteDetails(website, {
      journalist_name: journalistName,
      journalist_organization: organization,
      relevance_score: relevanceScore,
    }));
  },

  outreachGenerated: ({
    journalistName,
    organization,
    relevanceScore,
    website,
  }: {
    journalistName: string;
    organization: string;
    relevanceScore: number;
    website: string;
  }) => {
    safeTrack('outreach_generated', withWebsiteDetails(website, {
      journalist_name: journalistName,
      journalist_organization: organization,
      relevance_score: relevanceScore,
    }));
  },

  outreachGenerationFailed: ({
    journalistName,
    organization,
    relevanceScore,
    website,
    errorMessage,
  }: {
    journalistName: string;
    organization: string;
    relevanceScore: number;
    website: string;
    errorMessage: string;
  }) => {
    safeTrack('outreach_generation_failed', withWebsiteDetails(website, {
      journalist_name: journalistName,
      journalist_organization: organization,
      relevance_score: relevanceScore,
      error_message: errorMessage,
    }));
  },

  outreachEmailCopied: ({
    journalistName,
    organization,
  }: {
    journalistName: string;
    organization: string;
  }) => {
    safeTrack('outreach_email_copied', {
      journalist_name: journalistName,
      journalist_organization: organization,
    });
  },

  outreachSendEmailClicked: ({
    journalistName,
    organization,
    source,
  }: {
    journalistName: string;
    organization: string;
    source: 'header_mailto' | 'cta_button';
  }) => {
    safeTrack('outreach_send_email_clicked', {
      journalist_name: journalistName,
      journalist_organization: organization,
      source,
    });
  },

  coverageLinkClicked: ({
    journalistName,
    organization,
  }: {
    journalistName: string;
    organization: string;
  }) => {
    safeTrack('coverage_link_clicked', {
      journalist_name: journalistName,
      journalist_organization: organization,
    });
  },

  profileLinkClicked: ({
    journalistName,
    organization,
    platform,
  }: {
    journalistName: string;
    organization: string;
    platform: 'twitter' | 'linkedin' | 'instagram';
  }) => {
    safeTrack('journalist_profile_clicked', {
      journalist_name: journalistName,
      journalist_organization: organization,
      platform,
    });
  },

  testimonialNavigated: ({
    action,
    fromIndex,
    toIndex,
  }: {
    action: 'next' | 'previous' | 'direct';
    fromIndex: number;
    toIndex: number;
  }) => {
    safeTrack('testimonial_navigated', {
      action,
      from_index: fromIndex,
      to_index: toIndex,
    });
  },
};

export type AnalyticsClient = typeof analytics;
