import { useState, useEffect, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Section {
  id: string;
  name: string;
  svg_path: string | null;
  section_type: string;
  capacity: number | null;
}

interface EventSection {
  id: string;
  section_id: string;
  price: number;
  available_count: number;
  is_sold_out: boolean | null;
  section?: Section | null;
}

interface DynamicVenueMapProps {
  svgMap: string;
  viewBox?: string | null;
  sections: Section[];
  eventSections: EventSection[];
  selectedSectionId: string | null;
  onSectionClick: (sectionId: string, section: Section, eventSection?: EventSection) => void;
  onSectionHover: (section: Section | null, eventSection?: EventSection) => void;
}

// Extract clean SVG from potentially messy data
const extractSvgContent = (rawSvg: string): string => {
  if (!rawSvg) return '';
  const svgStartMatch = rawSvg.match(/<svg[\s\S]*<\/svg>/i);
  return svgStartMatch ? svgStartMatch[0] : rawSvg;
};

// Parse viewBox from SVG if not provided
const extractViewBox = (svgContent: string): string | null => {
  const viewBoxMatch = svgContent.match(/viewBox=["']([^"']+)["']/i);
  return viewBoxMatch ? viewBoxMatch[1] : null;
};

// Determine section type from SVG element ID (numbered sections)
const getSectionTypeFromNumber = (sectionNum: number): string | null => {
  // Common arena numbering:
  // 1-99: Floor/Pit/GA
  // 100-199: Lower level
  // 200-299: Club/Suite level
  // 300-399: Upper level
  // 400-499: Also upper level in many arenas
  if (sectionNum < 100) return 'floor';
  if (sectionNum < 200) return 'lower';
  if (sectionNum < 300) return 'club';
  return 'upper'; // 300+ is upper
};

// Extract section number from various ID patterns
const extractSectionNumber = (elementId: string): number | null => {
  // Match patterns like "101", "101-section", "101-group", "section-101"
  const patterns = [
    /^(\d{1,3})$/,                    // "101"
    /^(\d{1,3})-(?:section|group)$/i, // "101-section" or "101-group"
    /^section-?(\d{1,3})$/i,          // "section101" or "section-101"
  ];
  
  for (const pattern of patterns) {
    const match = elementId.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num >= 1 && num <= 500) return num;
    }
  }
  return null;
};

export const DynamicVenueMap = ({
  svgMap,
  viewBox,
  sections,
  eventSections,
  selectedSectionId,
  onSectionClick,
  onSectionHover,
}: DynamicVenueMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  // Clean SVG content
  const cleanSvgMap = useMemo(() => extractSvgContent(svgMap), [svgMap]);
  const effectiveViewBox = viewBox || extractViewBox(cleanSvgMap);

  // Build section type lookup: which section types have available tickets?
  const sectionTypeData = useMemo(() => {
    const typeMap = new Map<string, { section: Section; eventSection: EventSection }>();
    
    eventSections.forEach(es => {
      if (es.available_count > 0) {
        const section = sections.find(s => s.id === es.section_id);
        if (section) {
          const type = section.section_type?.toLowerCase() || 'standard';
          // Store the section data for this type
          if (!typeMap.has(type)) {
            typeMap.set(type, { section, eventSection: es });
          }
        }
      }
    });
    
    return typeMap;
  }, [sections, eventSections]);

  // Setup SVG interactivity
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !cleanSvgMap) return;

    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    // Make SVG responsive
    if (effectiveViewBox) {
      svgElement.setAttribute('viewBox', effectiveViewBox);
    }
    svgElement.removeAttribute('width');
    svgElement.removeAttribute('height');
    svgElement.style.width = '100%';
    svgElement.style.height = '100%';
    svgElement.style.maxWidth = '100%';
    svgElement.style.maxHeight = '100%';
    svgElement.style.display = 'block';

    // Find all elements - look for both groups and paths with section-like IDs
    const allElements = svgElement.querySelectorAll('[id]');
    const cleanupFunctions: (() => void)[] = [];
    let matchedCount = 0;
    const processedSections = new Set<number>();

    allElements.forEach((element) => {
      const elementId = element.getAttribute('id') || '';
      
      // Extract section number from the ID
      const sectionNum = extractSectionNumber(elementId);
      if (!sectionNum) return;
      
      // Skip if we already processed this section number (avoid duplicates from group + section)
      if (processedSections.has(sectionNum)) return;
      
      // Determine which section type this belongs to
      const sectionType = getSectionTypeFromNumber(sectionNum);
      if (!sectionType) return;
      
      // Check if we have tickets for this section type
      const typeData = sectionTypeData.get(sectionType);
      
      if (typeData) {
        const { section, eventSection } = typeData;
        const isSelected = selectedSectionId === section.id;
        processedSections.add(sectionNum);
        matchedCount++;

        // Find the actual path/shape element to style
        // If this is a group, find the section-path inside it
        let targetElement = element;
        const sectionPath = element.querySelector('.section-path, [id$="-section"]');
        if (sectionPath) {
          targetElement = sectionPath;
        }

        // Apply styling class
        targetElement.classList.remove(
          'venue-section-available',
          'venue-section-selected',
          'venue-section-hovered'
        );

        if (isSelected) {
          targetElement.classList.add('venue-section-selected');
        } else {
          targetElement.classList.add('venue-section-available');
        }

        // Make the whole group interactive
        (element as HTMLElement).style.cursor = 'pointer';

        const handleMouseEnter = () => {
          targetElement.classList.add('venue-section-hovered');
          onSectionHover(section, eventSection);
        };

        const handleMouseLeave = () => {
          targetElement.classList.remove('venue-section-hovered');
          onSectionHover(null);
        };

        const handleClick = (e: Event) => {
          e.stopPropagation();
          onSectionClick(section.id, section, eventSection);
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('click', handleClick);

        cleanupFunctions.push(() => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('click', handleClick);
        });
      }
    });

    console.log(`DynamicVenueMap: Matched ${matchedCount} sections, types available: ${Array.from(sectionTypeData.keys()).join(', ')}`);

    // Inject styles - Blue for available sections
    const styleId = 'dynamic-venue-map-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .venue-section-available {
        fill: #3b82f6 !important;
        fill-opacity: 0.7 !important;
        stroke: #1d4ed8 !important;
        stroke-width: 1.5px !important;
        transition: all 0.15s ease;
      }
      .venue-section-selected {
        fill: #1d4ed8 !important;
        fill-opacity: 0.9 !important;
        stroke: #1e40af !important;
        stroke-width: 2.5px !important;
      }
      .venue-section-hovered {
        fill: #2563eb !important;
        fill-opacity: 0.85 !important;
        stroke-width: 2.5px !important;
        filter: brightness(1.15);
      }
    `;

    return () => {
      cleanupFunctions.forEach(fn => fn());
    };
  }, [cleanSvgMap, sectionTypeData, selectedSectionId, onSectionClick, onSectionHover, effectiveViewBox]);

  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.25));
  const handleReset = () => setZoom(1);

  // Calculate stats for legend
  const availableCount = eventSections.filter(es => es.available_count > 0).length;
  const totalSections = eventSections.length;

  if (!cleanSvgMap) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center text-muted-foreground">
        No venue map available
      </div>
    );
  }

  return (
    <div className="relative h-full flex flex-col gap-2">
      {/* Legend */}
      <div className="absolute top-2 left-2 z-10 flex gap-3 bg-card/90 backdrop-blur rounded-lg px-3 py-2 border border-border text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-muted-foreground">Available ({availableCount}/{totalSections})</span>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 bg-card/90 backdrop-blur rounded-lg p-1 border border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomOut}>
          <ZoomOut size={16} />
        </Button>
        <span className="flex items-center justify-center w-12 text-xs text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleZoomIn}>
          <ZoomIn size={16} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleReset}>
          <RotateCcw size={16} />
        </Button>
      </div>

      {/* Map Container */}
      <div 
        className="flex-1 bg-card rounded-lg border border-border overflow-hidden"
        style={{ aspectRatio: '1 / 1' }}
      >
        <div
          ref={containerRef}
          className="w-full h-full flex items-center justify-center p-2"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
          dangerouslySetInnerHTML={{ __html: cleanSvgMap }}
        />
      </div>
    </div>
  );
};

export default DynamicVenueMap;
