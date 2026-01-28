import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Performer {
  id: string;
  name: string;
  image_url: string | null;
}

// Popular USA performers to prioritize (singers, athletes, entertainers)
const PRIORITY_PERFORMERS = [
  'Taylor Swift', 'Drake', 'Beyoncé', 'Travis Scott', 'Bad Bunny', 'The Weeknd',
  'Kendrick Lamar', 'Post Malone', 'Ed Sheeran', 'Bruno Mars', 'Lady Gaga',
  'Justin Bieber', 'Ariana Grande', 'Dua Lipa', 'Harry Styles', 'Billie Eilish',
  'Morgan Wallen', 'Luke Combs', 'Chris Stapleton', 'Zach Bryan', 'Metallica',
  'U2', 'Coldplay', 'Green Day', 'Foo Fighters', 'Red Hot Chili Peppers',
  'SZA', 'Doja Cat', 'Megan Thee Stallion', 'Lizzo', 'Cardi B',
  'Lakers', 'Cowboys', 'Yankees', 'Chiefs', 'Bulls', 'Celtics', 'Warriors',
  'Hamilton', 'Lion King', 'Wicked', 'Cirque du Soleil', 'Blue Man Group'
];

export const PerformerUniverse = () => {
  const [performers, setPerformers] = useState<Performer[]>([]);

  useEffect(() => {
    const fetchPerformers = async () => {
      const { data } = await supabase
        .from('performers')
        .select('id, name, image_url')
        .not('image_url', 'is', null)
        .limit(150);
      
      if (data) {
        // Sort to prioritize popular performers
        const sorted = data.sort((a, b) => {
          const aIsPriority = PRIORITY_PERFORMERS.some(p => a.name.includes(p));
          const bIsPriority = PRIORITY_PERFORMERS.some(p => b.name.includes(p));
          if (aIsPriority && !bIsPriority) return -1;
          if (!aIsPriority && bIsPriority) return 1;
          return 0;
        });
        setPerformers(sorted.slice(0, 120));
      }
    };
    fetchPerformers();
  }, []);

  // Create orbital rings with performers
  const orbits = useMemo(() => {
    if (performers.length === 0) return [];
    
    const rings = [
      { radius: 20, count: 10, speed: 80, direction: 1, size: 72 },
      { radius: 32, count: 14, speed: 100, direction: -1, size: 64 },
      { radius: 46, count: 18, speed: 130, direction: 1, size: 56 },
      { radius: 60, count: 22, speed: 160, direction: -1, size: 48 },
      { radius: 76, count: 26, speed: 200, direction: 1, size: 44 },
      { radius: 94, count: 30, speed: 240, direction: -1, size: 40 },
    ];

    let performerIndex = 0;
    return rings.map((ring, ringIndex) => {
      const items = [];
      for (let i = 0; i < ring.count && performerIndex < performers.length; i++) {
        const angle = (360 / ring.count) * i;
        items.push({
          performer: performers[performerIndex],
          angle,
          floatDelay: i * 0.15,
        });
        performerIndex++;
      }
      return { ...ring, items, ringIndex };
    });
  }, [performers]);

  if (performers.length === 0) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Center glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/40 rounded-full blur-[60px]" />
      
      {/* Orbital rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {orbits.map((orbit) => (
          <div
            key={orbit.ringIndex}
            className="absolute top-1/2 left-1/2 rounded-full"
            style={{
              width: `${orbit.radius * 2}vw`,
              height: `${orbit.radius * 2}vw`,
              marginLeft: `-${orbit.radius}vw`,
              marginTop: `-${orbit.radius}vw`,
              animation: `spin-orbit ${orbit.speed}s linear infinite`,
              animationDirection: orbit.direction === 1 ? 'normal' : 'reverse',
            }}
          >
            {/* Subtle ring line */}
            <div 
              className="absolute inset-0 rounded-full border border-primary/10"
              style={{ opacity: Math.max(0.1, 0.4 - orbit.ringIndex * 0.06) }}
            />
            
            {/* Performers on this orbit */}
            {orbit.items.map(({ performer, angle, floatDelay }, itemIndex) => (
              <div
                key={performer.id}
                className="absolute"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${angle}deg) translateX(${orbit.radius}vw) rotate(-${angle}deg)`,
                  marginTop: -orbit.size / 2,
                  marginLeft: -orbit.size / 2,
                }}
              >
                <div
                  className="rounded-full overflow-hidden border-2 border-primary/40 shadow-lg performer-orbit-item"
                  style={{
                    width: orbit.size,
                    height: orbit.size,
                    boxShadow: '0 0 20px hsl(193 90% 42% / 0.3)',
                    animationName: orbit.direction === 1 ? 'counter-spin-orbit, float-gentle' : 'spin-orbit-inline, float-gentle',
                    animationDuration: `${orbit.speed}s, 3s`,
                    animationTimingFunction: 'linear, ease-in-out',
                    animationIterationCount: 'infinite, infinite',
                    animationDelay: `0s, ${floatDelay}s`,
                  }}
                >
                  <img
                    src={performer.image_url || '/performers/concert-generic.jpg'}
                    alt={performer.name}
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Floating sparkle particles */}
      {[...Array(40)].map((_, i) => (
        <div
          key={`particle-${i}`}
          className="absolute rounded-full animate-twinkle"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            backgroundColor: `hsl(193 90% ${50 + Math.random() * 30}% / ${0.3 + Math.random() * 0.4})`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
};
