import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Rocket, ArrowRight } from 'lucide-react';
import emailScreenshot from '@/assets/newemail-2.png';
import wsjArticle from '@/assets/newwsj-2.png';
interface HeroSectionProps {
  onSubmit: (website: string) => void;
}
export const HeroSection = ({
  onSubmit
}: HeroSectionProps) => {
  const [website, setWebsite] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (website.trim()) {
      onSubmit(website.trim());
    }
  };
  return <section className="bg-background py-20 lg:py-32">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex flex-col items-center space-y-12">
          {/* Header Text - Centered */}
          <div className="text-center space-y-6">
            <h1 className="text-4xl lg:text-6xl font-black text-foreground leading-tight">
              I landed{' '}
              <span className="text-primary">Forbes</span> and{' '}
              <span className="text-primary">Wall Street Journal</span> without spending a dime.
            </h1>
            
            <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">We help founders secure real media coverage. No PR firm required.</p>
          </div>

          {/* Images - Side by side, centered with arrow */}
          <div className="flex items-center justify-center gap-8 w-full max-w-6xl">
            <div className="card-shadow rounded-2xl overflow-hidden hover-scale smooth-transition flex-1 max-w-lg">
              <img src={emailScreenshot} alt="Email to WSJ reporter" className="w-full h-auto" style={{filter: 'brightness(0.95) contrast(1.1)'}} />
            </div>
            <ArrowRight className="text-primary h-8 w-8 flex-shrink-0 animate-pulse" />
            <div className="card-shadow rounded-2xl overflow-hidden hover-scale smooth-transition flex-1 max-w-lg">
              <img src={wsjArticle} alt="WSJ article coverage" className="w-full h-auto" style={{filter: 'brightness(0.95) contrast(1.1)'}} />
            </div>
          </div>

          {/* CTA Form - Centered */}
          <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-6 w-full max-w-md">
            <div className="relative w-full">
              <Input 
                type="url" 
                placeholder="Enter your startup website..." 
                value={website} 
                onChange={e => setWebsite(e.target.value)} 
                className="w-full h-14 text-lg input-glow smooth-transition border-2 focus:border-primary pr-32 !bg-white !text-black placeholder:!text-gray-500" 
                required 
              />
              <Button type="submit" variant="hero" size="default" className="absolute right-2 top-2 h-10 font-normal">
                Find journalists <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>;
};