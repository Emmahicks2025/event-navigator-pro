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

// Extract section number/id from various patterns
const extractSectionKey = (elementId: string): string | null => {
  // Match patterns like "101-group", "101-section", "A1-group", "Floor-group"
  const groupMatch = elementId.match(/^(.+?)(?:-(?:group|section))$/i);
  if (groupMatch) return groupMatch[1];
  
  // Match simple numeric IDs like "101", "102"
  if (/^\d{1,3}$/.test(elementId)) return elementId;
  
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

  // Build mapping from svg_path to section/eventSection
  const sectionMapping = useMemo(() => {
    const mapping = new Map<string, { section: Section; eventSection?: EventSection; hasTickets: boolean }>();
    
    sections.forEach(section => {
      if (!section.svg_path) return;
      
      const eventSection = eventSections.find(es => es.section_id === section.id);
      const hasTickets = eventSection ? eventSection.available_count > 0 : false;
      
      // Map both the full svg_path and extracted key
      mapping.set(section.svg_path.toLowerCase(), { section, eventSection, hasTickets });
      
      // Also map without -group/-section suffix
      const key = extractSectionKey(section.svg_path);
      if (key) {
        mapping.set(key.toLowerCase(), { section, eventSection, hasTickets });
        mapping.set(`${key}-group`.toLowerCase(), { section, eventSection, hasTickets });
        mapping.set(`${key}-section`.toLowerCase(), { section, eventSection, hasTickets });
      }
    });
    
    return mapping;
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

    // Find all elements with IDs
    const allElements = svgElement.querySelectorAll('[id]');
    const cleanupFunctions: (() => void)[] = [];
    const processedElements = new Set<string>();

    allElements.forEach((element) => {
      const elementId = element.getAttribute('id') || '';
      const lowerElementId = elementId.toLowerCase();
      
      // Skip if already processed or not a section-like ID
      if (processedElements.has(lowerElementId)) return;
      
      // Try to find matching section data
      let matchData = sectionMapping.get(lowerElementId);
      
      // If no direct match, try extracting the key
      if (!matchData) {
        const key = extractSectionKey(elementId);
        if (key) {
          matchData = sectionMapping.get(key.toLowerCase());
        }
      }

      if (!matchData) return;
      
      processedElements.add(lowerElementId);

      const { section, eventSection, hasTickets } = matchData;
      const isSelected = selectedSectionId === section.id;

      // Find the path/shape element to style (might be inside a group)
      let targetElement = element;
      const innerPath = element.querySelector('.section-path, [id$="-section"], path, polygon');
      if (innerPath && element.tagName.toLowerCase() === 'g') {
        targetElement = innerPath;
      }

      // Clear previous classes
      targetElement.classList.remove(
        'venue-section-available',
        'venue-section-unavailable',
        'venue-section-selected',
        'venue-section-hovered'
      );

      // Apply styling based on availability
      if (isSelected) {
        targetElement.classList.add('venue-section-selected');
      } else if (hasTickets) {
        targetElement.classList.add('venue-section-available');
      } else {
        targetElement.classList.add('venue-section-unavailable');
      }

      // Set cursor and interactivity
      if (hasTickets) {
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
      } else {
        // Non-interactive for unavailable sections
        (element as HTMLElement).style.cursor = 'not-allowed';
        (element as HTMLElement).style.pointerEvents = 'none';
      }
    });

    // Inject styles
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
        fill-opacity: 0.65 !important;
        stroke: #1d4ed8 !important;
        stroke-width: 1.5px !important;
        transition: all 0.15s ease;
      }
      .venue-section-unavailable {
        fill: #6b7280 !important;
        fill-opacity: 0.3 !important;
        stroke: #4b5563 !important;
        stroke-width: 0.5px !important;
      }
      .venue-section-selected {
        fill: #1d4ed8 !important;
        fill-opacity: 0.9 !important;
        stroke: #1e40af !important;
        stroke-width: 3px !important;
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
  }, [cleanSvgMap, sectionMapping, selectedSectionId, onSectionClick, onSectionHover, effectiveViewBox]);

  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.25));
  const handleReset = () => setZoom(1);

  // Calculate stats for legend
  const availableCount = eventSections.filter(es => es.available_count > 0).length;
  const totalSections = sections.length;

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
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-500 opacity-40" />
          <span className="text-muted-foreground">Unavailable</span>
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
