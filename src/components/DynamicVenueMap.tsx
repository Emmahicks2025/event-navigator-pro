import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  ticketInventory?: Map<string, number>; // section_id -> ticket count (inventory-driven availability)
}

// Sanitize SVG: strip external links, scripts, metadata, event handlers
const sanitizeSvg = (rawSvg: string): string => {
  if (!rawSvg) return '';
  
  // Extract just the <svg>...</svg> content
  const svgMatch = rawSvg.match(/<svg[\s\S]*<\/svg>/i);
  if (!svgMatch) return rawSvg;
  
  let svg = svgMatch[0];
  
  // Remove script tags and their content
  svg = svg.replace(/<script[\s\S]*?<\/script>/gi, '');
  
  // Remove event handlers (onclick, onmouseover, etc.)
  svg = svg.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove external links (xlink:href to external URLs, href to external URLs)
  svg = svg.replace(/xlink:href\s*=\s*["']https?:\/\/[^"']*["']/gi, 'xlink:href=""');
  svg = svg.replace(/href\s*=\s*["']https?:\/\/[^"']*["']/gi, 'href=""');
  
  // Remove metadata, sodipodi, inkscape elements
  svg = svg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
  svg = svg.replace(/<sodipodi:[^>]*\/>/gi, '');
  svg = svg.replace(/<sodipodi:[^>]*>[\s\S]*?<\/sodipodi:[^>]*>/gi, '');
  svg = svg.replace(/<inkscape:[^>]*\/>/gi, '');
  svg = svg.replace(/<inkscape:[^>]*>[\s\S]*?<\/inkscape:[^>]*>/gi, '');
  
  // Remove RDF and DC namespaced elements
  svg = svg.replace(/<rdf:[^>]*>[\s\S]*?<\/rdf:[^>]*>/gi, '');
  svg = svg.replace(/<dc:[^>]*>[\s\S]*?<\/dc:[^>]*>/gi, '');
  svg = svg.replace(/<cc:[^>]*>[\s\S]*?<\/cc:[^>]*>/gi, '');
  
  // Remove style tags with @import or external references
  svg = svg.replace(/<style[^>]*>[\s\S]*?@import[\s\S]*?<\/style>/gi, '');
  
  // Clean up empty attributes and excessive whitespace
  svg = svg.replace(/\s{2,}/g, ' ');
  
  return svg;
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
  
  identifiers.push(lowerElementId);
  
  const withoutSuffix = lowerElementId.replace(/[-_](group|section|path|area|zone)$/i, '');
  if (withoutSuffix !== lowerElementId) {
    identifiers.push(withoutSuffix);
  }
  
  identifiers.push(normalizeName(elementId));
  
  // Extract numeric part if present (e.g., "101" from "section-101-group")
  const numericMatch = elementId.match(/(\d{1,3})/);
  if (numericMatch) {
    identifiers.push(numericMatch[1]);
  }
  
  return [...new Set(identifiers)];
};

// Inject global styles once (use design tokens; no hard-coded colors)
const STYLE_ID = 'dynamic-venue-map-styles';
const ensureStyles = () => {
  if (document.getElementById(STYLE_ID)) return;
  
  const styleEl = document.createElement('style');
  styleEl.id = STYLE_ID;
  styleEl.textContent = `
    .venue-section-available {
      fill: hsl(var(--primary)) !important;
      fill-opacity: 0.65 !important;
      stroke: hsl(var(--ring)) !important;
      stroke-width: 1.5px !important;
      transition: fill 0.1s ease, fill-opacity 0.1s ease, stroke-width 0.1s ease;
      cursor: pointer;
    }
    .venue-section-unavailable {
      fill: hsl(var(--muted)) !important;
      fill-opacity: 0.3 !important;
      stroke: hsl(var(--border)) !important;
      stroke-width: 0.5px !important;
      cursor: not-allowed;
      pointer-events: none;
    }
    .venue-section-selected {
      fill: hsl(var(--primary)) !important;
      fill-opacity: 0.9 !important;
      stroke: hsl(var(--primary)) !important;
      stroke-width: 3px !important;
      cursor: pointer;
    }
    .venue-section-available:hover,
    .venue-section-selected:hover {
      fill: hsl(var(--accent)) !important;
      fill-opacity: 0.85 !important;
      stroke-width: 2.5px !important;
    }
  `;
  document.head.appendChild(styleEl);
};

export const DynamicVenueMap = ({
  svgMap,
  viewBox,
  sections,
  eventSections,
  selectedSectionId,
  onSectionClick,
  onSectionHover,
  ticketInventory,
}: DynamicVenueMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void)[]>([]);
  const processedRef = useRef<string>('');
  
  const [zoom, setZoom] = useState(1);
  const [svgContent, setSvgContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Fetch and sanitize SVG content
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
          setSvgContent(sanitizeSvg(text));
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch SVG:', err);
          setSvgContent('');
          setLoading(false);
        });
    } else {
      setSvgContent(sanitizeSvg(svgMap));
    }
  }, [svgMap]);

  const effectiveViewBox = viewBox || extractViewBox(svgContent);

  // Prevent flicker: only (re)inject SVG markup when svgContent changes
  useEffect(() => {
    const host = svgHostRef.current;
    if (!host) return;
    host.innerHTML = svgContent || '';

    // IMPORTANT: SVG markup can change when navigating between events/venues.
    // Reset the processed signature so we always (re)bind interactivity for the new SVG.
    processedRef.current = '';
  }, [svgContent]);
  
  // Build comprehensive section mapping (inventory-driven availability)
  const sectionMapping = useMemo(() => {
    const mapping = new Map<string, { section: Section; eventSection?: EventSection; hasTickets: boolean }>();
    
    sections.forEach(section => {
      const eventSection = eventSections.find(es => es.section_id === section.id);
      
      // Inventory-driven: check actual ticket_inventory count if provided, else fall back to eventSection.available_count
      let hasTickets = false;
      if (ticketInventory) {
        hasTickets = (ticketInventory.get(section.id) || 0) > 0;
      } else if (eventSection) {
        hasTickets = eventSection.available_count > 0;
      }
      
      const data = { section, eventSection, hasTickets };
      
      // Map by svg_path if present
      if (section.svg_path) {
        const svgPathLower = section.svg_path.toLowerCase();
        mapping.set(svgPathLower, data);
        mapping.set(`${svgPathLower}-group`, data);
        mapping.set(`${svgPathLower}-section`, data);
        mapping.set(normalizeName(section.svg_path), data);
        
        // Also extract numeric portion from svg_path (e.g., "232" from "232-group")
        const svgPathNumeric = svgPathLower.match(/^(\d+)/);
        if (svgPathNumeric && !mapping.has(svgPathNumeric[1])) {
          mapping.set(svgPathNumeric[1], data);
        }
        // Also try alphanumeric patterns like "t305", "ls53"
        const alphaNumeric = svgPathLower.match(/^([a-z]*\d+)/);
        if (alphaNumeric && !mapping.has(alphaNumeric[1])) {
          mapping.set(alphaNumeric[1], data);
        }
      }
      
      // Map by section name (for fallback matching)
      const normalizedName = normalizeName(section.name);
      if (!mapping.has(normalizedName)) {
        mapping.set(normalizedName, data);
      }
      
      const nameLower = section.name.toLowerCase();
      if (!mapping.has(nameLower)) mapping.set(nameLower, data);
      if (!mapping.has(nameLower.replace(/\s+/g, '-'))) mapping.set(nameLower.replace(/\s+/g, '-'), data);
      if (!mapping.has(nameLower.replace(/\s+/g, ''))) mapping.set(nameLower.replace(/\s+/g, ''), data);
      
      // Extract numeric portion from section name (e.g., "101" from "Section 101")
      const sectionNumeric = section.name.match(/(\d+)/);
      if (sectionNumeric && !mapping.has(sectionNumeric[1])) {
        mapping.set(sectionNumeric[1], data);
      }
      
      // Handle T/LS prefixed sections (e.g., "T305" from "Section T305")
      const prefixedMatch = section.name.match(/([TL]S?\d+)/i);
      if (prefixedMatch && !mapping.has(prefixedMatch[1].toLowerCase())) {
        mapping.set(prefixedMatch[1].toLowerCase(), data);
      }
    });
    
    return mapping;
  }, [sections, eventSections, ticketInventory]);

  // Memoized click handler to prevent re-binding
  const handleSectionClick = useCallback((sectionId: string, section: Section, eventSection?: EventSection) => {
    onSectionClick(sectionId, section, eventSection);
  }, [onSectionClick]);

  // Memoized hover handler
  const handleSectionHover = useCallback((section: Section | null, eventSection?: EventSection) => {
    onSectionHover(section, eventSection);
  }, [onSectionHover]);

  // Setup SVG interactivity - only when svgContent changes or selectedSectionId changes
  useEffect(() => {
    const container = containerRef.current;
    const host = svgHostRef.current;
    if (!container || !host || !svgContent) return;

    ensureStyles();

    const svgElement = host.querySelector('svg');
    if (!svgElement) return;

    // Create a signature for this processing to prevent duplicate work
     // Include SVG content fingerprint so navigation between events doesn't accidentally reuse
     // the previous processed signature (which would skip binding and make the map non-interactive).
     const svgFingerprint = `${svgContent.length}:${svgContent.slice(0, 64)}`;
     const processingSignature = `${svgFingerprint}-${effectiveViewBox || 'novb'}-${selectedSectionId}-${sections.length}-${eventSections.length}-${ticketInventory ? 'inv' : 'es'}`;
    if (processedRef.current === processingSignature) return;
    processedRef.current = processingSignature;

    // Cleanup previous listeners
    cleanupRef.current.forEach(fn => fn());
    cleanupRef.current = [];

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

    // Many venue maps have reliable IDs; some (like certain arena exports) have *no* ids.
    // Support both strategies:
    // 1) ID-based matching on elements with [id]
    // 2) Text-label-based matching using <text> content (e.g. "LS53", "101", "PIT PASS")
    const idElements = Array.from(svgElement.querySelectorAll('[id]'));
    const textElements = Array.from(svgElement.querySelectorAll('text'))
      .filter((el) => {
        const txt = (el.textContent || '').trim();
        if (!txt) return false;
        // Avoid processing purely decorative labels
        if (txt.length > 40) return false;
        return true;
      });

    const processedElements = new Set<string>();
    const matchedSectionIds = new Set<string>();

    const skipPatterns = [
      /^svg$/i, /^defs$/i, /^clip/i, /^mask/i, /^gradient/i, /^pattern/i,
      /^filter/i, /^g\d*$/i, /^layer/i, /^path\d*$/i, /^rect\d*$/i,
      /^text\d*$/i, /^tspan/i, /^use\d*$/i, /^symbol/i, /^image/i,
      /^style/i, /^metadata/i, /^namedview/i, /^sodipodi/i, /^stage/i,
      /^background$/i, /^border$/i, /^outline$/i, /^floor$/i,
    ];

    const bindInteractivity = (sourceEl: Element, matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean }, isTextLabel = false) => {
      const { section, eventSection, hasTickets } = matchData;
      
      // For non-text elements, skip if already processed this section
      if (!isTextLabel && matchedSectionIds.has(section.id)) return;

      // Prefer binding to a containing <g> (bigger hover target) but style the inner shape.
      const groupEl = sourceEl.closest('g') || sourceEl;
      const innerShape = groupEl.querySelector('path, polygon, rect, circle, ellipse');
      const targetElement = innerShape || groupEl;

      const isSelected = selectedSectionId === section.id;

      // Only apply styling if not already processed
      if (!matchedSectionIds.has(section.id)) {
        matchedSectionIds.add(section.id);
        
        targetElement.classList.remove(
          'venue-section-available',
          'venue-section-unavailable',
          'venue-section-selected'
        );

        if (isSelected) targetElement.classList.add('venue-section-selected');
        else if (hasTickets) targetElement.classList.add('venue-section-available');
        else targetElement.classList.add('venue-section-unavailable');
      }

      // Always bind click handlers for matched sections - even if no tickets, clicking should still work
      // (filtering to "no tickets in this section" is valid UX feedback)
      const onEnter = () => handleSectionHover(section, eventSection);
      const onLeave = () => handleSectionHover(null);
      const onClick = (e: Event) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('[VenueMap] Section clicked:', section.id, section.name);
        handleSectionClick(section.id, section, eventSection);
      };

      // Always bind click and hover for all matched sections
      // For text labels, ensure pointer events work and attach click + hover
      if (isTextLabel) {
        console.log('[VenueMap] Binding click to text label:', section.name);
        (sourceEl as SVGElement).style.cursor = 'pointer';
        (sourceEl as SVGElement).style.pointerEvents = 'all';
        
        // Also attach to parent group for larger click target
        const textGroup = sourceEl.closest('g');
        if (textGroup) {
          (textGroup as SVGElement).style.cursor = 'pointer';
          (textGroup as SVGElement).style.pointerEvents = 'all';
          textGroup.addEventListener('mouseenter', onEnter);
          textGroup.addEventListener('mouseleave', onLeave);
          textGroup.addEventListener('click', onClick);
          cleanupRef.current.push(() => {
            textGroup.removeEventListener('mouseenter', onEnter);
            textGroup.removeEventListener('mouseleave', onLeave);
            textGroup.removeEventListener('click', onClick);
          });
        }
        
        // Also attach directly to text element for reliability
        sourceEl.addEventListener('click', onClick);
        sourceEl.addEventListener('mouseenter', onEnter);
        sourceEl.addEventListener('mouseleave', onLeave);
        cleanupRef.current.push(() => {
          sourceEl.removeEventListener('click', onClick);
          sourceEl.removeEventListener('mouseenter', onEnter);
          sourceEl.removeEventListener('mouseleave', onLeave);
        });
      } else {
        // For ID-based elements, attach to the group
        groupEl.addEventListener('mouseenter', onEnter);
        groupEl.addEventListener('mouseleave', onLeave);
        groupEl.addEventListener('click', onClick);

        cleanupRef.current.push(() => {
          groupEl.removeEventListener('mouseenter', onEnter);
          groupEl.removeEventListener('mouseleave', onLeave);
          groupEl.removeEventListener('click', onClick);
        });
      }
    };

    // Strategy 1: ID-based processing
    // Strategy 1: ID-based processing
    console.log('[VenueMap] Processing', idElements.length, 'ID elements,', textElements.length, 'text elements');
    
    idElements.forEach((element) => {
      const elementId = element.getAttribute('id') || '';
      const lowerElementId = elementId.toLowerCase();

      if (!elementId) return;
      if (processedElements.has(lowerElementId)) return;
      if (skipPatterns.some((pattern) => pattern.test(elementId))) return;

      let matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean } | undefined;
      const identifiers = extractIdentifiers(elementId);
      
      // Also try direct section number extraction (e.g., "203" from "section-203-path" or "g203")
      const allDigits = elementId.match(/\d+/g);
      if (allDigits) {
        identifiers.push(...allDigits);
      }
      
      for (const id of identifiers) {
        matchData = sectionMapping.get(id);
        if (matchData) {
          console.log('[VenueMap] ID matched:', elementId, '->', matchData.section.name);
          break;
        }
      }

      if (!matchData) return;
      processedElements.add(lowerElementId);
      matchedSectionIds.add(matchData.section.id); // Mark section as matched via ID
      bindInteractivity(element, matchData, false);
    });

    // Strategy 2: text-label based processing (for SVGs without ids)
    // Note: We only run this for labels that map to a section. This is inexpensive and avoids flicker.
    // IMPORTANT: Always process text labels for click binding even if the section was already styled via ID matching
    textElements.forEach((textEl) => {
      const label = (textEl.textContent || '').trim();
      if (!label) return;

      const key = `text:${normalizeName(label)}`;
      // Skip only duplicate text labels, not sections already matched via ID
      if (processedElements.has(key)) return;
      processedElements.add(key);

      // Use normalized label as identifier; also try raw lower.
      const candidates = [
        normalizeName(label),
        label.toLowerCase(),
      ];

      // If label contains digits, also try extracted numeric.
      const numericMatch = label.match(/(\d{1,3})/);
      if (numericMatch) candidates.push(numericMatch[1]);

      let matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean } | undefined;
      for (const c of candidates) {
        matchData = sectionMapping.get(c);
        if (matchData) break;
      }
      if (!matchData) return;

      console.log('[VenueMap] Text label matched:', label, '->', matchData.section.name, 'hasTickets:', matchData.hasTickets);
      
      // Always bind interactivity for text labels - they need direct click handling
      bindInteractivity(textEl, matchData, true);
    });

    return () => {
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
  }, [svgContent, sectionMapping, selectedSectionId, handleSectionClick, handleSectionHover, effectiveViewBox, sections.length]);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(3, z + 0.25)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(0.5, z - 0.25)), []);
  const handleReset = useCallback(() => setZoom(1), []);

  // Count available sections from inventory
  const availableCount = useMemo(() => {
    if (ticketInventory) {
      return Array.from(ticketInventory.values()).filter(count => count > 0).length;
    }
    return eventSections.filter(es => es.available_count > 0).length;
  }, [eventSections, ticketInventory]);

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
          <span className="text-muted-foreground">Available ({availableCount})</span>
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
          className="w-full h-full flex items-center justify-center p-2 will-change-transform"
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <div ref={svgHostRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default DynamicVenueMap;
