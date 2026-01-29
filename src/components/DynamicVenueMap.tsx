import { useState, useEffect, useRef, useMemo } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';
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

// Check if the input is a URL
const isUrl = (str: string): boolean => {
  return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/');
};

// Normalize a name for fuzzy matching
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[-_\s]+/g, '')
    .replace(/section/gi, '')
    .replace(/group/gi, '')
    .replace(/level/gi, '')
    .replace(/tier/gi, '')
    .replace(/bowl/gi, '')
    .trim();
};

// Extract potential section identifiers from an element ID
const extractIdentifiers = (elementId: string): string[] => {
  const identifiers: string[] = [];
  const lowerElementId = elementId.toLowerCase();
  
  // Original ID
  identifiers.push(lowerElementId);
  
  // Without -group or -section suffix
  const withoutSuffix = lowerElementId.replace(/[-_](group|section|path)$/i, '');
  if (withoutSuffix !== lowerElementId) {
    identifiers.push(withoutSuffix);
  }
  
  // Normalized version
  identifiers.push(normalizeName(elementId));
  
  // Extract numeric part if present (e.g., "101" from "section-101-group")
  const numericMatch = elementId.match(/(\d{1,3})/);
  if (numericMatch) {
    identifiers.push(numericMatch[1]);
  }
  
  return [...new Set(identifiers)];
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
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch SVG content if it's a URL
  useEffect(() => {
    if (!svgMap) {
      setSvgContent('');
      return;
    }

    if (isUrl(svgMap)) {
      setLoading(true);
      fetch(svgMap)
        .then(res => res.text())
        .then(text => {
          setSvgContent(extractSvgContent(text));
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch SVG:', err);
          setSvgContent('');
          setLoading(false);
        });
    } else {
      setSvgContent(extractSvgContent(svgMap));
    }
  }, [svgMap]);

  const effectiveViewBox = viewBox || extractViewBox(svgContent);

  // Build comprehensive mapping for section matching
  const sectionMapping = useMemo(() => {
    const mapping = new Map<string, { section: Section; eventSection?: EventSection; hasTickets: boolean }>();
    
    sections.forEach(section => {
      const eventSection = eventSections.find(es => es.section_id === section.id);
      const hasTickets = eventSection ? eventSection.available_count > 0 : false;
      const data = { section, eventSection, hasTickets };
      
      // Map by svg_path if present
      if (section.svg_path) {
        const svgPathLower = section.svg_path.toLowerCase();
        mapping.set(svgPathLower, data);
        mapping.set(`${svgPathLower}-group`, data);
        mapping.set(`${svgPathLower}-section`, data);
        
        // Also add normalized version
        mapping.set(normalizeName(section.svg_path), data);
      }
      
      // Map by section name (for fallback matching)
      const normalizedName = normalizeName(section.name);
      if (!mapping.has(normalizedName)) {
        mapping.set(normalizedName, data);
      }
      
      // Also map common variations of the section name
      const nameLower = section.name.toLowerCase();
      mapping.set(nameLower, data);
      mapping.set(nameLower.replace(/\s+/g, '-'), data);
      mapping.set(nameLower.replace(/\s+/g, '_'), data);
      mapping.set(nameLower.replace(/\s+/g, ''), data);
    });
    
    return mapping;
  }, [sections, eventSections]);

  // Setup SVG interactivity
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgContent) return;

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
    
    // Track which sections we've matched to avoid duplicates
    const matchedSectionIds = new Set<string>();

    allElements.forEach((element) => {
      const elementId = element.getAttribute('id') || '';
      const lowerElementId = elementId.toLowerCase();
      
      // Skip if already processed
      if (processedElements.has(lowerElementId)) return;
      
      // Skip common non-section elements
      const skipPatterns = [
        /^svg$/i, /^defs$/i, /^clip/i, /^mask/i, /^gradient/i, /^pattern/i,
        /^filter/i, /^g\d*$/i, /^layer/i, /^path\d*$/i, /^rect\d*$/i,
        /^text\d*$/i, /^tspan/i, /^use\d*$/i, /^symbol/i, /^image/i,
        /^style/i, /^metadata/i, /^namedview/i, /^sodipodi/i, /^stage/i,
        /^background/i, /^border/i, /^outline/i,
      ];
      
      if (skipPatterns.some(pattern => pattern.test(elementId))) return;
      
      // Try to find matching section data using multiple strategies
      let matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean } | undefined;
      
      const identifiers = extractIdentifiers(elementId);
      for (const id of identifiers) {
        matchData = sectionMapping.get(id);
        if (matchData) break;
      }
      
      // If no match found, skip this element
      if (!matchData) return;
      
      // Avoid duplicate processing of the same section
      if (matchedSectionIds.has(matchData.section.id)) return;
      matchedSectionIds.add(matchData.section.id);
      
      processedElements.add(lowerElementId);

      const { section, eventSection, hasTickets } = matchData;
      const isSelected = selectedSectionId === section.id;

      // Find the target element to style (might be inside a group)
      let targetElement = element;
      const innerPath = element.querySelector('path, polygon, rect, circle, ellipse');
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
  }, [svgContent, sectionMapping, selectedSectionId, onSectionClick, onSectionHover, effectiveViewBox]);

  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.25));
  const handleReset = () => setZoom(1);

  if (loading) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!svgContent) {
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
          <span className="text-muted-foreground">Available ({eventSections.filter(es => es.available_count > 0).length})</span>
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
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </div>
    </div>
  );
};

export default DynamicVenueMap;
