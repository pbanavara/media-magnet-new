export const TrustSection = () => {
  const outlets = [
    { name: 'Wall Street Journal', logo: 'WSJ' },
    { name: 'Forbes', logo: 'FORBES' },
    { name: 'TechCrunch', logo: 'TechCrunch' },
    { name: 'Business Insider', logo: 'Business Insider' },
    { name: 'Washington Post', logo: 'The Washington Post' }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-lg font-semibold text-muted-foreground mb-8">
          Featured in top outlets
        </h3>
        
        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
          {outlets.map((outlet) => (
            <div 
              key={outlet.name}
              className="text-2xl lg:text-3xl font-bold text-foreground hover:opacity-100 smooth-transition"
            >
              {outlet.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};