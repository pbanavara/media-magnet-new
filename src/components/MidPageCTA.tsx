import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Rocket, Zap } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface MidPageCTAProps {
  onSubmit: (website: string) => void;
}

export const MidPageCTA = ({ onSubmit }: MidPageCTAProps) => {
  const [website, setWebsite] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedWebsite = website.trim();
    if (trimmedWebsite) {
      analytics.websiteSubmitted({ source: 'midpage_form', website: trimmedWebsite });
      onSubmit(trimmedWebsite);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 to-primary-glow/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="card-shadow p-8 lg:p-12 text-center glow-effect">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full">
              <Zap className="h-4 w-4" />
              <span className="font-semibold">Limited Time Offer</span>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">
              Don't Wait for Press Coverage
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every day you wait is another day your competitors could land the story that should be yours. 
              Get your personalized journalist list in seconds.
            </p>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
              <Input
                type="url"
                placeholder="Enter your startup website..."
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="h-14 text-lg input-glow border-2 focus:border-primary"
                required
              />
              <Button 
                type="submit" 
                variant="hero" 
                size="default"
                className="font-normal"
              >
                Find my journalists now <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <p className="text-sm text-muted-foreground">
              ✨ No credit card required • Results in under 60 seconds
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
};
