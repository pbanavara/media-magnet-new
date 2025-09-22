import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, X } from 'lucide-react';
import { analytics } from '@/lib/analytics';
interface StickyFooterCTAProps {
  onSubmit: (website: string) => void;
  isVisible: boolean;
  onClose: () => void;
}
export const StickyFooterCTA = ({
  onSubmit,
  isVisible,
  onClose
}: StickyFooterCTAProps) => {
  const [website, setWebsite] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWebsite = website.trim();
    if (trimmedWebsite) {
      analytics.websiteSubmitted({ source: 'sticky_footer_form', website: trimmedWebsite });
      analytics.stickyFooterDismissed({ method: 'cta_submission', website: trimmedWebsite });
      onSubmit(trimmedWebsite);
    }
  };
  if (!isVisible) return null;
  return <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 smooth-transition">
      
    </div>;
};
