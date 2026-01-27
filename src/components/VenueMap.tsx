import { useState, useMemo } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

interface Section {
  id: string;
  name: string;
  path: string;
  tier: 'floor' | 'lower' | 'upper';
  available: number;
  priceFrom: number;
}

interface VenueMapProps {
  onSectionHover: (section: Section | null) => void;
  onSectionClick: (sectionId: string) => void;
  selectedSection: string | null;
}

// Arena sections data
const sections: Section[] = [
  // Floor sections (GA Pit, A, B, C, D, F, MIX)
  { id: 'ga-pit', name: 'GA PIT', path: 'M 540 400 L 620 400 L 620 480 L 540 480 Z', tier: 'floor', available: 12, priceFrom: 350 },
  { id: 'stage', name: 'STAGE', path: 'M 620 400 L 720 400 L 720 480 L 620 480 Z', tier: 'floor', available: 0, priceFrom: 0 },
  { id: 'floor-a', name: 'A', path: 'M 540 340 L 620 340 L 620 400 L 540 400 Z', tier: 'floor', available: 8, priceFrom: 295 },
  { id: 'floor-b', name: 'B', path: 'M 480 400 L 540 400 L 540 460 L 480 460 Z', tier: 'floor', available: 15, priceFrom: 275 },
  { id: 'floor-c', name: 'C', path: 'M 540 480 L 620 480 L 620 540 L 540 540 Z', tier: 'floor', available: 11, priceFrom: 275 },
  { id: 'floor-d', name: 'D', path: 'M 480 340 L 540 340 L 540 400 L 480 400 Z', tier: 'floor', available: 6, priceFrom: 285 },
  { id: 'floor-f', name: 'F', path: 'M 480 460 L 540 460 L 540 540 L 480 540 Z', tier: 'floor', available: 9, priceFrom: 265 },
  { id: 'mix', name: 'MIX', path: 'M 420 400 L 480 400 L 480 460 L 420 460 Z', tier: 'floor', available: 4, priceFrom: 225 },

  // Lower Bowl sections (101-122)
  { id: '101', name: '101', path: 'M 720 430 L 770 400 L 790 450 L 740 480 Z', tier: 'lower', available: 24, priceFrom: 165 },
  { id: '102', name: '102', path: 'M 740 480 L 790 450 L 800 500 L 750 530 Z', tier: 'lower', available: 18, priceFrom: 165 },
  { id: '103', name: '103', path: 'M 730 530 L 780 510 L 790 560 L 740 580 Z', tier: 'lower', available: 31, priceFrom: 145 },
  { id: '104', name: '104', path: 'M 700 570 L 750 560 L 760 610 L 710 620 Z', tier: 'lower', available: 22, priceFrom: 145 },
  { id: '105', name: '105', path: 'M 660 590 L 710 585 L 715 635 L 665 640 Z', tier: 'lower', available: 28, priceFrom: 135 },
  { id: '106', name: '106', path: 'M 610 600 L 660 598 L 665 648 L 615 650 Z', tier: 'lower', available: 35, priceFrom: 135 },
  { id: '107', name: '107', path: 'M 555 605 L 610 603 L 615 653 L 560 655 Z', tier: 'lower', available: 42, priceFrom: 125 },
  { id: '108', name: '108', path: 'M 500 605 L 555 605 L 560 655 L 505 655 Z', tier: 'lower', available: 38, priceFrom: 125 },
  { id: '109', name: '109', path: 'M 420 580 L 470 590 L 475 640 L 425 630 Z', tier: 'lower', available: 29, priceFrom: 135 },
  { id: '110', name: '110', path: 'M 370 550 L 420 570 L 425 620 L 375 600 Z', tier: 'lower', available: 21, priceFrom: 145 },
  { id: '111', name: '111', path: 'M 330 500 L 380 530 L 375 580 L 325 550 Z', tier: 'lower', available: 33, priceFrom: 145 },
  { id: '112', name: '112', path: 'M 310 440 L 355 475 L 345 525 L 300 490 Z', tier: 'lower', available: 26, priceFrom: 155 },
  { id: '113', name: '113', path: 'M 320 380 L 360 420 L 340 465 L 300 430 Z', tier: 'lower', available: 19, priceFrom: 165 },
  { id: '114', name: '114', path: 'M 350 320 L 385 365 L 360 405 L 325 365 Z', tier: 'lower', available: 27, priceFrom: 165 },
  { id: '115', name: '115', path: 'M 400 275 L 430 315 L 395 350 L 365 315 Z', tier: 'lower', available: 32, priceFrom: 155 },
  { id: '116', name: '116', path: 'M 455 250 L 480 285 L 445 320 L 420 290 Z', tier: 'lower', available: 25, priceFrom: 145 },
  { id: '117', name: '117', path: 'M 515 235 L 535 270 L 505 300 L 485 270 Z', tier: 'lower', available: 40, priceFrom: 135 },
  { id: '118', name: '118', path: 'M 575 230 L 590 260 L 565 295 L 550 270 Z', tier: 'lower', available: 36, priceFrom: 135 },
  { id: '119', name: '119', path: 'M 640 240 L 650 270 L 630 305 L 620 280 Z', tier: 'lower', available: 28, priceFrom: 145 },
  { id: '120', name: '120', path: 'M 700 260 L 705 295 L 685 330 L 680 300 Z', tier: 'lower', available: 23, priceFrom: 155 },
  { id: '121', name: '121', path: 'M 740 300 L 755 335 L 730 375 L 715 345 Z', tier: 'lower', available: 17, priceFrom: 165 },
  { id: '122', name: '122', path: 'M 755 360 L 780 395 L 750 435 L 730 400 Z', tier: 'lower', available: 14, priceFrom: 175 },

  // Upper Bowl sections (201-222, 301-322)
  { id: '201', name: '201', path: 'M 780 630 L 820 610 L 840 660 L 800 680 Z', tier: 'upper', available: 45, priceFrom: 120 },
  { id: '202', name: '202', path: 'M 800 680 L 840 660 L 855 710 L 815 730 Z', tier: 'upper', available: 52, priceFrom: 120 },
  { id: '203', name: '203', path: 'M 740 700 L 780 690 L 795 740 L 755 750 Z', tier: 'upper', available: 48, priceFrom: 110 },
  { id: '204', name: '204', path: 'M 680 710 L 720 705 L 730 755 L 690 760 Z', tier: 'upper', available: 55, priceFrom: 100 },
  { id: '205', name: '205', path: 'M 620 715 L 660 712 L 670 762 L 630 765 Z', tier: 'upper', available: 61, priceFrom: 95 },
  { id: '206', name: '206', path: 'M 555 718 L 600 716 L 608 766 L 563 768 Z', tier: 'upper', available: 58, priceFrom: 90 },
  { id: '207', name: '207', path: 'M 490 718 L 535 718 L 543 768 L 498 768 Z', tier: 'upper', available: 64, priceFrom: 85 },
  { id: '208', name: '208', path: 'M 430 700 L 475 710 L 478 760 L 433 750 Z', tier: 'upper', available: 56, priceFrom: 90 },
  { id: '209', name: '209', path: 'M 370 670 L 415 690 L 413 740 L 368 720 Z', tier: 'upper', available: 49, priceFrom: 95 },
  { id: '210', name: '210', path: 'M 320 630 L 365 660 L 358 710 L 313 680 Z', tier: 'upper', available: 43, priceFrom: 100 },
  { id: '211', name: '211', path: 'M 280 580 L 325 615 L 313 665 L 268 630 Z', tier: 'upper', available: 38, priceFrom: 110 },
  { id: '212', name: '212', path: 'M 250 520 L 295 560 L 280 610 L 235 570 Z', tier: 'upper', available: 41, priceFrom: 115 },
  { id: '213', name: '213', path: 'M 235 455 L 280 500 L 260 550 L 215 505 Z', tier: 'upper', available: 35, priceFrom: 120 },
  { id: '214', name: '214', path: 'M 240 390 L 280 435 L 255 485 L 215 440 Z', tier: 'upper', available: 37, priceFrom: 120 },
  { id: '215', name: '215', path: 'M 260 325 L 295 375 L 268 420 L 233 370 Z', tier: 'upper', available: 42, priceFrom: 115 },
  { id: '216', name: '216', path: 'M 295 265 L 325 315 L 295 360 L 265 310 Z', tier: 'upper', available: 39, priceFrom: 110 },
  { id: '217', name: '217', path: 'M 345 215 L 375 260 L 340 305 L 310 260 Z', tier: 'upper', available: 46, priceFrom: 100 },
  { id: '218', name: '218', path: 'M 405 180 L 430 220 L 395 265 L 370 225 Z', tier: 'upper', available: 51, priceFrom: 95 },
  { id: '219', name: '219', path: 'M 470 160 L 490 195 L 455 240 L 435 205 Z', tier: 'upper', available: 57, priceFrom: 90 },
  { id: '220', name: '220', path: 'M 540 150 L 555 185 L 525 225 L 510 190 Z', tier: 'upper', available: 62, priceFrom: 85 },
  { id: '221', name: '221', path: 'M 615 155 L 625 190 L 595 230 L 585 195 Z', tier: 'upper', available: 54, priceFrom: 90 },
  { id: '222', name: '222', path: 'M 690 175 L 700 210 L 670 255 L 660 220 Z', tier: 'upper', available: 47, priceFrom: 95 },

  // 300 level sections
  { id: '301', name: '301', path: 'M 820 720 L 860 700 L 885 755 L 845 775 Z', tier: 'upper', available: 68, priceFrom: 75 },
  { id: '302', name: '302', path: 'M 800 770 L 845 755 L 865 810 L 820 825 Z', tier: 'upper', available: 72, priceFrom: 70 },
  { id: '303', name: '303', path: 'M 740 785 L 785 775 L 800 830 L 755 840 Z', tier: 'upper', available: 65, priceFrom: 65 },
  { id: '304', name: '304', path: 'M 675 795 L 720 790 L 735 845 L 690 850 Z', tier: 'upper', available: 78, priceFrom: 60 },
  { id: '305', name: '305', path: 'M 610 800 L 655 798 L 665 853 L 620 855 Z', tier: 'upper', available: 82, priceFrom: 55 },
  { id: '306', name: '306', path: 'M 545 800 L 590 800 L 598 855 L 553 855 Z', tier: 'upper', available: 85, priceFrom: 50 },
  { id: '307', name: '307', path: 'M 475 795 L 525 798 L 530 853 L 480 850 Z', tier: 'upper', available: 79, priceFrom: 55 },
  { id: '308', name: '308', path: 'M 410 780 L 460 790 L 465 845 L 415 835 Z', tier: 'upper', available: 73, priceFrom: 60 },
  { id: '309', name: '309', path: 'M 350 755 L 400 775 L 400 830 L 350 810 Z', tier: 'upper', available: 66, priceFrom: 65 },
  { id: '310', name: '310', path: 'M 295 720 L 345 750 L 340 805 L 290 775 Z', tier: 'upper', available: 61, priceFrom: 70 },
  { id: '311', name: '311', path: 'M 250 670 L 300 710 L 290 765 L 240 725 Z', tier: 'upper', available: 56, priceFrom: 75 },
  { id: '312', name: '312', path: 'M 215 610 L 265 660 L 250 715 L 200 665 Z', tier: 'upper', available: 52, priceFrom: 80 },
  { id: '313', name: '313', path: 'M 195 545 L 245 600 L 225 655 L 175 600 Z', tier: 'upper', available: 48, priceFrom: 85 },
  { id: '314', name: '314', path: 'M 195 475 L 240 535 L 215 590 L 170 530 Z', tier: 'upper', available: 51, priceFrom: 85 },
  { id: '315', name: '315', path: 'M 210 405 L 250 465 L 225 520 L 185 460 Z', tier: 'upper', available: 54, priceFrom: 80 },
  { id: '316', name: '316', path: 'M 240 340 L 275 400 L 248 455 L 213 395 Z', tier: 'upper', available: 57, priceFrom: 75 },
  { id: '317', name: '317', path: 'M 285 280 L 315 340 L 285 395 L 255 335 Z', tier: 'upper', available: 62, priceFrom: 70 },
  { id: '318', name: '318', path: 'M 345 230 L 375 285 L 340 340 L 310 285 Z', tier: 'upper', available: 67, priceFrom: 65 },
  { id: '319', name: '319', path: 'M 415 190 L 440 240 L 405 295 L 380 245 Z', tier: 'upper', available: 71, priceFrom: 60 },
  { id: '320', name: '320', path: 'M 490 165 L 510 210 L 475 265 L 455 220 Z', tier: 'upper', available: 76, priceFrom: 55 },
  { id: '321', name: '321', path: 'M 570 155 L 585 195 L 555 250 L 540 210 Z', tier: 'upper', available: 74, priceFrom: 55 },
  { id: '322', name: '322', path: 'M 655 165 L 665 205 L 640 260 L 630 220 Z', tier: 'upper', available: 69, priceFrom: 60 },
];

export const VenueMap = ({ onSectionHover, onSectionClick, selectedSection }: VenueMapProps) => {
  const [scale, setScale] = useState(1);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const handleZoomIn = () => setScale(Math.min(scale + 0.2, 2));
  const handleZoomOut = () => setScale(Math.max(scale - 0.2, 0.5));
  const handleReset = () => setScale(1);

  const getSectionColor = (section: Section, isHovered: boolean, isSelected: boolean) => {
    if (section.name === 'STAGE') return 'hsl(var(--muted))';
    if (section.available === 0) return 'hsl(var(--muted))';
    
    const baseColors = {
      floor: isSelected ? 'hsl(142 76% 45%)' : isHovered ? 'hsl(142 76% 55%)' : 'hsl(142 76% 36%)',
      lower: isSelected ? 'hsl(199 89% 58%)' : isHovered ? 'hsl(199 89% 60%)' : 'hsl(199 89% 48%)',
      upper: isSelected ? 'hsl(199 89% 58%)' : isHovered ? 'hsl(199 89% 60%)' : 'hsl(199 89% 48%)',
    };
    return baseColors[section.tier];
  };

  const handleMouseEnter = (section: Section) => {
    if (section.available > 0 && section.name !== 'STAGE') {
      setHoveredSection(section.id);
      onSectionHover(section);
    }
  };

  const handleMouseLeave = () => {
    setHoveredSection(null);
    onSectionHover(null);
  };

  const handleClick = (section: Section) => {
    if (section.available > 0 && section.name !== 'STAGE') {
      onSectionClick(section.id);
    }
  };

  return (
    <div className="relative bg-card rounded-xl border border-border overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 bg-background/90 rounded-lg p-1 border border-border">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Zoom In"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-secondary rounded transition-colors"
          title="Reset"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* SVG Map */}
      <div className="overflow-hidden" style={{ cursor: 'grab' }}>
        <svg
          viewBox="100 100 800 800"
          className="w-full h-auto transition-transform duration-200"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
        >
          {/* Background */}
          <rect x="100" y="100" width="800" height="800" fill="transparent" />
          
          {/* Arena outline */}
          <ellipse cx="530" cy="450" rx="380" ry="350" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
          
          {/* Sections */}
          {sections.map((section) => {
            const isHovered = hoveredSection === section.id;
            const isSelected = selectedSection === section.id;
            
            return (
              <g key={section.id}>
                <path
                  d={section.path}
                  fill={getSectionColor(section, isHovered, isSelected)}
                  stroke={isSelected ? 'hsl(var(--primary))' : 'hsl(var(--background))'}
                  strokeWidth={isSelected ? 2 : 1}
                  className={`transition-all duration-150 ${section.available > 0 && section.name !== 'STAGE' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onMouseEnter={() => handleMouseEnter(section)}
                  onMouseLeave={handleMouseLeave}
                  onClick={() => handleClick(section)}
                />
                <text
                  x={getPathCenter(section.path).x}
                  y={getPathCenter(section.path).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize={section.tier === 'floor' ? 12 : 10}
                  fontWeight="600"
                  pointerEvents="none"
                  className="select-none"
                >
                  {section.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* VIP Badge */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-background/90 rounded-lg px-3 py-2 border border-border">
        <div className="w-5 h-5 bg-amber-500 rounded flex items-center justify-center">
          <span className="text-[8px] font-bold text-black">★</span>
        </div>
        <span className="text-sm font-medium text-foreground">VIP</span>
      </div>
    </div>
  );
};

// Helper function to get center of a path for label placement
function getPathCenter(path: string): { x: number; y: number } {
  const coords = path.match(/[\d.]+/g)?.map(Number) || [];
  if (coords.length < 4) return { x: 0, y: 0 };
  
  let sumX = 0, sumY = 0, count = 0;
  for (let i = 0; i < coords.length - 1; i += 2) {
    sumX += coords[i];
    sumY += coords[i + 1];
    count++;
  }
  return { x: sumX / count, y: sumY / count };
}

export { sections };
export type { Section };
