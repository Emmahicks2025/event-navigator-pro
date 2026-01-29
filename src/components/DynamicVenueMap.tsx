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
const getSectionTypeFromId = (elementId: string): string | null => {
  const numMatch = elementId.match(/^(\d+)(-section|-group)?$/i);
  if (!numMatch) return null;
  
  const sectionNum = parseInt(numMatch[1], 10);
  
  // Common arena numbering conventions:
  // 1-99: Floor/Pit
  // 100-199: Lower level
  // 200-299: Club/Mid level
  // 300+: Upper level
  if (sectionNum < 100) return 'floor';
  if (sectionNum < 200) return 'lower';
  if (sectionNum < 300) return 'club';
  return 'upper';
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

  // Build section type to section/eventSection mapping
  const sectionTypeMap = useMemo(() => {
    const map = new Map<string, { section: Section; eventSection?: EventSection }>();
    
    sections.forEach(section => {
      const eventSection = eventSections.find(es => es.section_id === section.id);
      const type = section.section_type?.toLowerCase() || 'general';
      
      // Only add if there are tickets available
      if (eventSection && eventSection.available_count > 0) {
        // Map multiple type variations
        map.set(type, { section, eventSection });
        
        // Add aliases
        if (type === 'floor') {
          map.set('pit', { section, eventSection });
          map.set('ga', { section, eventSection });
        }
        if (type === 'lower') {
          map.set('loge', { section, eventSection });
          map.set('100', { section, eventSection });
        }
        if (type === 'club') {
          map.set('200', { section, eventSection });
          map.set('premium', { section, eventSection });
        }
        if (type === 'upper') {
          map.set('300', { section, eventSection });
          map.set('balcony', { section, eventSection });
        }
      }
    });
    
    return map;
  }, [sections, eventSections]);

  // Get the best matching section for an SVG element
  const findSectionForElement = (elementId: string): { section: Section; eventSection?: EventSection } | null => {
    // First try direct svg_path match
    for (const section of sections) {
      if (section.svg_path?.toLowerCase() === elementId.toLowerCase()) {
        const eventSection = eventSections.find(es => es.section_id === section.id);
        if (eventSection && eventSection.available_count > 0) {
          return { section, eventSection };
        }
      }
    }

    // Then try section type inference from numbered sections
    const sectionType = getSectionTypeFromId(elementId);
    if (sectionType) {
      return sectionTypeMap.get(sectionType) || null;
    }

    // Try name matching
    const cleanId = elementId.toLowerCase().replace(/-section|-group/g, '');
    for (const section of sections) {
      const cleanName = section.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleanName === cleanId || cleanName.includes(cleanId) || cleanId.includes(cleanName)) {
        const eventSection = eventSections.find(es => es.section_id === section.id);
        if (eventSection && eventSection.available_count > 0) {
          return { section, eventSection };
        }
      }
    }

    return null;
  };

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

    // Find all potential section elements
    const allElements = svgElement.querySelectorAll('[id]');
    const cleanupFunctions: (() => void)[] = [];
    
    // Skip these IDs
    const skipPatterns = ['svg', 'defs', 'style', 'metadata', 'background', 'stage', 'layer', 'corel', 'parent', 'namedview'];

    allElements.forEach((element) => {
      const elementId = element.getAttribute('id') || '';
      
      // Skip non-section elements
      if (skipPatterns.some(skip => elementId.toLowerCase().includes(skip))) return;
      if (elementId.startsWith('t') && /^t\d+$/.test(elementId)) return; // Text labels like t101
      if (/^\d{7,}$/.test(elementId)) return; // Long numeric IDs (random)

      const match = findSectionForElement(elementId);

      if (match) {
        const { section, eventSection } = match;
        const hasTickets = eventSection && eventSection.available_count > 0;
        const isSelected = selectedSectionId === section.id;

        // Apply styling
        element.classList.remove(
          'venue-section-available',
          'venue-section-selected',
          'venue-section-hovered'
        );

        if (isSelected) {
          element.classList.add('venue-section-selected');
        } else if (hasTickets) {
          element.classList.add('venue-section-available');
        }

        if (hasTickets) {
          (element as HTMLElement).style.cursor = 'pointer';

          const handleMouseEnter = () => {
            element.classList.add('venue-section-hovered');
            onSectionHover(section, eventSection);
          };

          const handleMouseLeave = () => {
            element.classList.remove('venue-section-hovered');
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
      }
    });

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
        fill-opacity: 0.6 !important;
        stroke: #1d4ed8 !important;
        stroke-width: 1.5px !important;
        transition: all 0.15s ease;
      }
      .venue-section-selected {
        fill: #1d4ed8 !important;
        fill-opacity: 0.85 !important;
        stroke: #1e40af !important;
        stroke-width: 2.5px !important;
      }
      .venue-section-hovered {
        fill: #2563eb !important;
        fill-opacity: 0.8 !important;
        stroke-width: 2px !important;
        filter: brightness(1.1);
      }
    `;

    return () => {
      cleanupFunctions.forEach(fn => fn());
    };
  }, [cleanSvgMap, sections, eventSections, selectedSectionId, onSectionClick, onSectionHover, effectiveViewBox, sectionTypeMap]);

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

      {/* Legend */}
      <div className="absolute top-2 left-2 z-10 flex gap-3 bg-card/90 backdrop-blur rounded-lg px-3 py-2 border border-border text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-blue-500" />
          <span className="text-muted-foreground">Available ({availableCount}/{totalSections})</span>
        </div>
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
