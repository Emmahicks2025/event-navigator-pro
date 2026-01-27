import { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tables } from '@/integrations/supabase/types';

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

  // Create a map of svg_path to section data
  const sectionMap = new Map<string, { section: Section; eventSection?: EventSection }>();
  sections.forEach(section => {
    if (section.svg_path) {
      const eventSection = eventSections.find(es => es.section_id === section.id);
      sectionMap.set(section.svg_path, { section, eventSection });
    }
  });

  // Setup SVG interactivity
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !svgMap) return;

    const svgElement = container.querySelector('svg');
    if (!svgElement) return;

    // Apply viewbox if provided
    if (viewBox) {
      svgElement.setAttribute('viewBox', viewBox);
    }

    // Style the SVG
    svgElement.style.width = '100%';
    svgElement.style.height = 'auto';
    svgElement.style.maxWidth = 'none';

    // Find all elements that could be sections
    const allElements = svgElement.querySelectorAll('path, polygon, rect, circle, g');
    
    allElements.forEach((element) => {
      const id = element.getAttribute('id');
      if (!id) return;

      const sectionData = sectionMap.get(id);
      
      if (sectionData) {
        const { section, eventSection } = sectionData;
        const isSelected = selectedSectionId === section.id;
        const isSoldOut = eventSection?.is_sold_out || eventSection?.available_count === 0;
        
        // Apply styling
        element.classList.remove('venue-section-available', 'venue-section-sold-out', 'venue-section-selected');
        
        if (isSelected) {
          element.classList.add('venue-section-selected');
        } else if (isSoldOut) {
          element.classList.add('venue-section-sold-out');
        } else if (eventSection) {
          element.classList.add('venue-section-available');
        }

        (element as HTMLElement).style.cursor = isSoldOut ? 'not-allowed' : 'pointer';
        
        // Event listeners
        const handleMouseEnter = () => {
          if (!isSoldOut) {
            element.classList.add('venue-section-hovered');
          }
          onSectionHover(section, eventSection);
        };
        
        const handleMouseLeave = () => {
          element.classList.remove('venue-section-hovered');
          onSectionHover(null);
        };
        
        const handleClick = (e: Event) => {
          e.stopPropagation();
          if (!isSoldOut) {
            onSectionClick(section.id, section, eventSection);
          }
        };

        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        element.addEventListener('click', handleClick);

        // Store cleanup functions
        (element as any)._cleanup = () => {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
          element.removeEventListener('click', handleClick);
        };
      }
    });

    // Add global styles
    const styleId = 'dynamic-venue-map-styles';
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = `
      .venue-section-available {
        fill: hsl(var(--success)) !important;
        fill-opacity: 0.5 !important;
        stroke: hsl(var(--success)) !important;
        stroke-width: 1px !important;
        transition: all 0.2s ease;
      }
      .venue-section-sold-out {
        fill: hsl(var(--muted)) !important;
        fill-opacity: 0.3 !important;
        stroke: hsl(var(--border)) !important;
        stroke-width: 1px !important;
      }
      .venue-section-selected {
        fill: hsl(var(--primary)) !important;
        fill-opacity: 0.7 !important;
        stroke: hsl(var(--primary)) !important;
        stroke-width: 3px !important;
      }
      .venue-section-hovered {
        fill-opacity: 0.8 !important;
        stroke-width: 2px !important;
        filter: brightness(1.1);
      }
    `;

    // Cleanup
    return () => {
      allElements.forEach((element) => {
        if ((element as any)._cleanup) {
          (element as any)._cleanup();
        }
      });
    };
  }, [svgMap, sections, eventSections, selectedSectionId, onSectionClick, onSectionHover]);

  const handleZoomIn = () => setZoom(z => Math.min(3, z + 0.25));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, z - 0.25));
  const handleReset = () => setZoom(1);

  return (
    <div className="relative">
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
        className="overflow-auto bg-card rounded-lg border border-border"
        style={{ maxHeight: '500px' }}
      >
        <div
          ref={containerRef}
          className="p-4 min-w-fit"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
          }}
          dangerouslySetInnerHTML={{ __html: svgMap }}
        />
      </div>
    </div>
  );
};

export default DynamicVenueMap;
