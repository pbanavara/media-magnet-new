import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { analytics } from '@/lib/analytics';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  company: string;
  result: string;
}

export const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: '1',
      quote: "I spent $20k looking for media placement, but I didn't even get good results.",
      author: 'Keith',
      company: 'Lightfield',
      result: 'Now featured in Forbes, TechCrunch, and WSJ'
    },
    {
      id: '2',
      quote: "Our PR agency charged us $15k monthly and got us one small mention in 6 months.",
      author: 'Sarah',
      company: 'DataFlow AI',
      result: 'Landed Wall Street Journal and Business Insider in 3 weeks'
    },
    {
      id: '3',
      quote: "I had no idea how to reach journalists. This made it so simple and effective.",
      author: 'Marcus',
      company: 'GreenTech Solutions',
      result: 'Featured in Washington Post and multiple industry publications'
    },
    {
      id: '4',
      quote: "The personalized email drafts were spot-on. Journalists actually responded!",
      author: 'Jennifer',
      company: 'HealthTech Innovations',
      result: 'Covered by Forbes and featured in TechCrunch newsletter'
    }
  ];

  const goToIndex = (
    getNextIndex: (previousIndex: number) => number,
    action: 'next' | 'previous' | 'direct',
  ) => {
    setCurrentIndex((prev) => {
      const nextIndex = ((getNextIndex(prev) % testimonials.length) + testimonials.length) % testimonials.length;
      if (prev === nextIndex) {
        return prev;
      }

      analytics.testimonialNavigated({ action, fromIndex: prev, toIndex: nextIndex });
      return nextIndex;
    });
  };

  const nextTestimonial = () => {
    goToIndex((prev) => prev + 1, 'next');
  };

  const prevTestimonial = () => {
    goToIndex((prev) => prev - 1, 'previous');
  };

  const selectTestimonial = (index: number) => {
    goToIndex(() => index, 'direct');
  };

  // Auto-advance testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-secondary/20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Success Stories
          </h2>
          <p className="text-lg text-muted-foreground">
            See how founders like you landed major press coverage
          </p>
        </div>

        <div className="relative">
          <Card className="card-shadow p-8 lg:p-12 text-center">
            <blockquote className="text-xl lg:text-2xl text-foreground leading-relaxed mb-6 italic">
              "{testimonials[currentIndex].quote}"
            </blockquote>
            
            <div className="space-y-2 mb-6">
              <div className="font-semibold text-foreground text-lg">
                — {testimonials[currentIndex].author}, {testimonials[currentIndex].company}
              </div>
              <div className="text-success font-semibold">
                ✅ {testimonials[currentIndex].result}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="icon" onClick={prevTestimonial} className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => selectTestimonial(index)}
                    className={`w-3 h-3 rounded-full smooth-transition ${
                      index === currentIndex ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              
              <Button variant="outline" size="icon" onClick={nextTestimonial} className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
