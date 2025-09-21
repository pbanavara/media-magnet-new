import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, X } from 'lucide-react';
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
    if (website.trim()) {
      onSubmit(website.trim());
    }
  };
  if (!isVisible) return null;
  return <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50 smooth-transition">
      
    </div>;
};