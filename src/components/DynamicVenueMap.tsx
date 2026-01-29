import { useState, useEffect, useRef, useMemo, useCallback, forwardRef, type MutableRefObject } from 'react';
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
  onDebugEvent?: (info: {
    at: string;
    targetTag?: string;
    targetId?: string | null;
    closestId?: string | null;
    labelText?: string | null;
    resolvedSectionId?: string | null;
    resolutionPath?: 'mapping' | 'proximity' | 'none';
    candidateCount?: number;
  }) => void;
  debugLog?: boolean;
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

  // Some venue exports include CSS/attrs that disable all interaction.
  // Force-enable pointer events so our delegated handlers can work.
  svg = svg.replace(/pointer-events\s*:\s*none\s*;?/gi, 'pointer-events:all;');
  svg = svg.replace(/pointer-events\s*=\s*"none"/gi, 'pointer-events="all"');
  svg = svg.replace(/pointer-events\s*=\s*'none'/gi, "pointer-events='all'");
  
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
    // Common venue label synonyms/abbreviations (kept before stripping separators)
    // Helps maps that label full words ("ORCHESTRA") while DB uses abbreviations ("ORCH").
    .replace(/orchestra/gi, 'orch')
    .replace(/mezzanine/gi, 'mezz')
    .replace(/balcony/gi, 'balc')
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
      /* Keep sections clickable so users can filter and see “no tickets” states */
      cursor: pointer;
      pointer-events: all;
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

export const DynamicVenueMap = forwardRef<HTMLDivElement, DynamicVenueMapProps>(function DynamicVenueMap(
  {
    svgMap,
    viewBox,
    sections,
    eventSections,
    selectedSectionId,
    onSectionClick,
    onSectionHover,
    ticketInventory,
    onDebugEvent,
    debugLog,
  }: DynamicVenueMapProps,
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void)[]>([]);
  const processedRef = useRef<string>('');

  const setRootRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!ref) return;
      if (typeof ref === 'function') ref(node);
      else (ref as MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );
  
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

    // Some exported SVGs disable pointer events on the root or via inline styles/classes.
    // Force-enable so delegated clicks always fire.
    (svgElement as unknown as SVGElement).style.pointerEvents = 'all';
    (svgElement as unknown as SVGElement).style.cursor = 'pointer';

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

    // Some exports set pointer-events:none on text labels; force-enable so clicks can be resolved.
    textElements.forEach((el) => {
      (el as unknown as SVGElement).style.pointerEvents = 'all';
      (el as unknown as SVGElement).style.cursor = 'pointer';
    });

    const processedElements = new Set<string>();
    const matchedSectionIds = new Set<string>();

    // Fallback mapping for SVGs that don't have meaningful IDs on section shapes.
    // We map a clickable "section shape" to the nearest text label (e.g., "101", "PIT").
    const elementToMatch = new WeakMap<Element, { section: Section; eventSection?: EventSection; hasTickets: boolean }>();

    const skipPatterns = [
      /^svg$/i, /^defs$/i, /^clip/i, /^mask/i, /^gradient/i, /^pattern/i,
      /^filter/i, /^g\d*$/i, /^layer/i, /^path\d*$/i, /^rect\d*$/i,
      /^text\d*$/i, /^tspan/i, /^use\d*$/i, /^symbol/i, /^image/i,
      /^style/i, /^metadata/i, /^namedview/i, /^sodipodi/i, /^stage/i,
      /^background$/i, /^border$/i, /^outline$/i, /^floor$/i,
    ];

    const bindInteractivity = (sourceEl: Element, matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean }, isTextLabel = false) => {
      const { section, eventSection, hasTickets } = matchData;

      // NOTE: Don't early-return just because a section was "matched".
      // We still need to (re)apply styling when selectedSectionId changes and
      // we still need hover handlers on the correct target element.

      // Prefer binding to a containing <g> (bigger hover target) but style the inner shape.
      const groupEl = sourceEl.closest('g') || sourceEl;
      const innerShape = groupEl.querySelector('path, polygon, rect, circle, ellipse');
      const targetElement = innerShape || groupEl;

      // Some imported SVGs ship with pointer-events disabled on groups/shapes.
      // Force-enable interactivity for matched elements.
      (groupEl as SVGElement).style.pointerEvents = 'all';
      (groupEl as SVGElement).style.cursor = 'pointer';
      (targetElement as SVGElement).style.pointerEvents = 'all';
      (targetElement as SVGElement).style.cursor = 'pointer';

      // *** CRITICAL FIX: Register ALL matched elements in elementToMatch ***
      // This ensures the delegated click handler can resolve sections by walking up the DOM.
      elementToMatch.set(sourceEl, matchData);
      elementToMatch.set(groupEl, matchData);
      elementToMatch.set(targetElement, matchData);
      if (innerShape && innerShape !== targetElement) {
        elementToMatch.set(innerShape, matchData);
      }

      const isSelected = selectedSectionId === section.id;

      // Always apply styling on each run (selectedSectionId is in the effect signature)
      targetElement.classList.remove(
        'venue-section-available',
        'venue-section-unavailable',
        'venue-section-selected'
      );

      if (isSelected) targetElement.classList.add('venue-section-selected');
      else if (hasTickets) targetElement.classList.add('venue-section-available');
      else targetElement.classList.add('venue-section-unavailable');

      matchedSectionIds.add(section.id);

      // Always bind click handlers for matched sections - even if no tickets, clicking should still work
      // (filtering to "no tickets in this section" is valid UX feedback)
      const onEnter = () => handleSectionHover(section, eventSection);
      const onLeave = () => handleSectionHover(null);

      // Bind hover for matched sections. Click is handled centrally via delegated handler
      // (prevents double-trigger toggling).
      if (isTextLabel) {
        (sourceEl as SVGElement).style.cursor = 'pointer';
        (sourceEl as SVGElement).style.pointerEvents = 'all';
        
        // Also attach to parent group for larger click target
        const textGroup = sourceEl.closest('g');
        if (textGroup) {
          (textGroup as SVGElement).style.cursor = 'pointer';
          (textGroup as SVGElement).style.pointerEvents = 'all';
          elementToMatch.set(textGroup, matchData);
          textGroup.addEventListener('mouseenter', onEnter);
          textGroup.addEventListener('mouseleave', onLeave);
          cleanupRef.current.push(() => {
            textGroup.removeEventListener('mouseenter', onEnter);
            textGroup.removeEventListener('mouseleave', onLeave);
          });
        }
        
        sourceEl.addEventListener('mouseenter', onEnter);
        sourceEl.addEventListener('mouseleave', onLeave);
        cleanupRef.current.push(() => {
          sourceEl.removeEventListener('mouseenter', onEnter);
          sourceEl.removeEventListener('mouseleave', onLeave);
        });
      } else {
        // For ID-based elements, attach hover to the group
        groupEl.addEventListener('mouseenter', onEnter);
        groupEl.addEventListener('mouseleave', onLeave);

        cleanupRef.current.push(() => {
          groupEl.removeEventListener('mouseenter', onEnter);
          groupEl.removeEventListener('mouseleave', onLeave);
        });
      }
    };

    // Heuristic resolver for venues whose SVG has granular labels (e.g. "LEFT ORCH")
    // but the DB only contains coarse sections (e.g. "Orchestra").
    const resolveByHeuristics = (raw: string) => {
      const labelNorm = normalizeName(raw);
      if (!labelNorm) return null;

      // Prefer by explicit keywords that usually map to section_type.
      const wantsOrch = labelNorm.includes('orch');
      const wantsMezz = labelNorm.includes('mezz');
      const wantsBalc = labelNorm.includes('balc');
      const wantsBox = labelNorm.includes('box');

      // Fast-path: if the SVG is coarse (e.g. "mezz-section") or uses generic MEZZ/ORCH labels,
      // map directly to the coarse DB sections by section_type.
      const pickByType = (type: string, preferNameIncludes?: string) => {
        const candidates = sections.filter((s) => s.section_type === type);
        if (candidates.length === 0) return null;
        if (preferNameIncludes) {
          const preferred = candidates.find((s) => normalizeName(s.name).includes(preferNameIncludes));
          if (preferred) return preferred;
        }
        return candidates[0];
      };

      if (wantsOrch) {
        const sec = pickByType('orchestra');
        if (sec) {
          const es = eventSections.find((e) => e.section_id === sec.id);
          const hasTickets = ticketInventory ? (ticketInventory.get(sec.id) || 0) > 0 : (es?.available_count || 0) > 0;
          return { section: sec, eventSection: es, hasTickets };
        }
      }
      if (wantsMezz) {
        // Default to Front Mezzanine if present
        const sec = pickByType('mezzanine', 'frontmezz') || pickByType('mezzanine');
        if (sec) {
          const es = eventSections.find((e) => e.section_id === sec.id);
          const hasTickets = ticketInventory ? (ticketInventory.get(sec.id) || 0) > 0 : (es?.available_count || 0) > 0;
          return { section: sec, eventSection: es, hasTickets };
        }
      }
      if (wantsBalc) {
        const sec = pickByType('balcony');
        if (sec) {
          const es = eventSections.find((e) => e.section_id === sec.id);
          const hasTickets = ticketInventory ? (ticketInventory.get(sec.id) || 0) > 0 : (es?.available_count || 0) > 0;
          return { section: sec, eventSection: es, hasTickets };
        }
      }
      if (wantsBox) {
        const sec = pickByType('standard', 'box') || sections.find((s) => normalizeName(s.name).includes('box'));
        if (sec) {
          const es = eventSections.find((e) => e.section_id === sec.id);
          const hasTickets = ticketInventory ? (ticketInventory.get(sec.id) || 0) > 0 : (es?.available_count || 0) > 0;
          return { section: sec, eventSection: es, hasTickets };
        }
      }

      const scored = sections
        .map((section) => {
          const sectionNorm = normalizeName(section.name);
          if (!sectionNorm) return null;

          // Base score using substring containment (coarse section names should match parts of label)
          let score = 0;
          if (labelNorm === sectionNorm) score += 100;
          if (labelNorm.includes(sectionNorm) || sectionNorm.includes(labelNorm)) score += Math.min(40, sectionNorm.length);

          // Boost by section_type hints
          if (wantsOrch && section.section_type === 'orchestra') score += 80;
          if (wantsMezz && section.section_type === 'mezzanine') score += 80;
          if (wantsBalc && section.section_type === 'balcony') score += 80;
          if (wantsBox && sectionNorm.includes('box')) score += 80;

          // Front/Rear mezzanine hint if label includes it
          if (wantsMezz) {
            const wantsRear = labelNorm.includes('rear') || labelNorm.includes('back');
            const wantsFront = labelNorm.includes('front');
            if (wantsRear && sectionNorm.includes('rearmezz')) score += 60;
            if (wantsFront && sectionNorm.includes('frontmezz')) score += 60;

            // If the SVG is coarse (e.g. "mezz-section"), prefer Front Mezzanine by default.
            if (!wantsRear && !wantsFront && sectionNorm.includes('frontmezz')) score += 20;
          }

          return { section, score };
        })
        .filter(Boolean) as Array<{ section: Section; score: number }>;

      scored.sort((a, b) => b.score - a.score);
      const best = scored[0];
      if (!best || best.score < 60) return null;

      const eventSection = eventSections.find((es) => es.section_id === best.section.id);
      let hasTickets = false;
      if (ticketInventory) hasTickets = (ticketInventory.get(best.section.id) || 0) > 0;
      else if (eventSection) hasTickets = eventSection.available_count > 0;

      return { section: best.section, eventSection, hasTickets };
    };

    // Strategy 1: ID-based processing
    
    idElements.forEach((element) => {
      const elementId = element.getAttribute('id') || '';
      const lowerElementId = elementId.toLowerCase();

      if (!elementId) return;
      if (processedElements.has(lowerElementId)) return;

      let matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean } | undefined;
      const identifiers = extractIdentifiers(elementId);
      
      // Also try direct section number extraction (e.g., "203" from "section-203-path" or "g203")
      const allDigits = elementId.match(/\d+/g);
      if (allDigits) {
        identifiers.push(...allDigits);
      }
      
      for (const id of identifiers) {
        matchData = sectionMapping.get(id);
        if (matchData) break;
      }

      // Only skip generic SVG ids if we did NOT find a matching section.
      // Some venue exports use ids like "g202" / "path203" for real sections.
      if (!matchData) {
        if (skipPatterns.some((pattern) => pattern.test(elementId))) return;
        return;
      }
      processedElements.add(lowerElementId);
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

      // Always bind interactivity for text labels - they need direct click handling
      bindInteractivity(textEl, matchData, true);

      // Save label geometry for later proximity matching (Strategy 3)
      try {
        const bb = (textEl as unknown as SVGGraphicsElement).getBBox?.();
        if (bb && Number.isFinite(bb.x) && Number.isFinite(bb.y)) {
          (textEl as any).__tixLabelCenter = { x: bb.x + bb.width / 2, y: bb.y + bb.height / 2 };
          (textEl as any).__tixLabelMatch = matchData;
        }
      } catch {
        // getBBox can throw if element is not rendered; ignore
      }
    });

    // Strategy 3: class + proximity-based binding
    // Many exported maps (including some arena diagrams) use CSS classes like `.section-path`
    // on the actual section shapes, and rely on nearby <text> labels for the section number.
    // We bind those shapes by finding the closest label's matched section.
    const labelIndex = textElements
      .map((el) => {
        const c = (el as any).__tixLabelCenter as { x: number; y: number } | undefined;
        const m = (el as any).__tixLabelMatch as { section: Section; eventSection?: EventSection; hasTickets: boolean } | undefined;
        if (!c || !m) return null;
        return { el, cx: c.x, cy: c.y, matchData: m };
      })
      .filter(Boolean) as Array<{ el: Element; cx: number; cy: number; matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean } }>;

    // Some theatre-style SVGs don't mark section shapes with ids/classes at all.
    // In that case, we fall back to mapping *generic shapes* to the nearest matched label.
    const sectionShapeCandidates = Array.from(
      svgElement.querySelectorAll<SVGElement>(
        [
          // Preferred explicit class markers (fast + accurate)
          '.section-path',
          '[class*="section-path"]',
          '[class*="section_"]',
          // Generic shapes (broad fallback)
          'path',
          'polygon',
          'rect',
          'circle',
          'ellipse',
        ].join(',')
      )
    ).filter((el) => {
      // Skip non-visual containers and text labels
      const tag = el.tagName.toLowerCase();
      if (tag === 'text' || tag === 'tspan') return false;

      // Ignore defs/clip/masks/etc.
      if (el.closest('defs, clipPath, mask, pattern, linearGradient, radialGradient, symbol')) return false;

      // If the SVG explicitly says fill='none', it’s usually a border/outline, not a section.
      const fillAttr = (el.getAttribute('fill') || '').trim().toLowerCase();
      if (fillAttr === 'none') return false;

      // Skip elements that are clearly not section shapes by id/class hints
      const id = (el.getAttribute('id') || '').toLowerCase();
      const cls = (el.getAttribute('class') || '').toLowerCase();
      const combined = `${id} ${cls}`;
      if (
        combined.includes('background') ||
        combined.includes('stage') ||
        combined.includes('outline') ||
        combined.includes('border')
      ) {
        return false;
      }

      // Quick area filter to avoid binding to tiny decorative shapes.
      try {
        const bb = (el as unknown as SVGGraphicsElement).getBBox?.();
        if (!bb) return false;
        const area = bb.width * bb.height;
        // Tuned for typical venue SVG viewBox units; keeps performance stable.
        if (!Number.isFinite(area) || area < 80) return false;
      } catch {
        return false;
      }

      return true;
    });

    const MAX_SHAPES_TO_PROCESS = 1500;
    const MAX_LABEL_DISTANCE = 220; // SVG units; tuned to typical arena map scale

    if (labelIndex.length > 0 && sectionShapeCandidates.length > 0) {
      sectionShapeCandidates.slice(0, MAX_SHAPES_TO_PROCESS).forEach((shapeEl) => {
        try {
          const bb = (shapeEl as unknown as SVGGraphicsElement).getBBox?.();
          if (!bb) return;
          const cx = bb.x + bb.width / 2;
          const cy = bb.y + bb.height / 2;

          let best: { dist: number; matchData: { section: Section; eventSection?: EventSection; hasTickets: boolean } } | null = null;
          for (const lbl of labelIndex) {
            const dx = lbl.cx - cx;
            const dy = lbl.cy - cy;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d > MAX_LABEL_DISTANCE) continue;
            if (!best || d < best.dist) best = { dist: d, matchData: lbl.matchData };
          }

          if (best) {
            elementToMatch.set(shapeEl, best.matchData);
            // Bind styles + hover on the actual section shape.
            bindInteractivity(shapeEl, best.matchData, false);
          }
        } catch {
          // Ignore shapes that fail getBBox
        }
      });
    }

    // Delegated handler (single source of truth).
    // Prevents double-trigger toggling when multiple listeners exist in the SVG tree.
    const delegatedClick = (e: Event) => {
      if ((e as any).__tixorbitHandled) return;
      (e as any).__tixorbitHandled = true;

      const target = e.target as Element | null;
      if (!target) return;

      const debugBase = {
        at: new Date().toISOString(),
        targetTag: (target as any)?.tagName,
        targetId: target.getAttribute?.('id') ?? null,
        closestId: (target.closest?.('[id]') as Element | null)?.getAttribute?.('id') ?? null,
      };

      // Find the most relevant element to identify a section
      // Prefer composedPath so we can still find the underlying <text> when pointer-events
      // makes the event target something else (e.g., the <svg> root).
      const path = (e as any).composedPath?.() as Element[] | undefined;
      const pathTextEl = path?.find((n) => (n as any)?.tagName?.toLowerCase?.() === 'text') as Element | undefined;
      const textEl = (pathTextEl || target.closest('text')) as Element | null;
      const labeled = (textEl as any)?.textContent?.trim?.();

      const shouldLog =
        !!debugLog &&
        typeof window !== 'undefined' &&
        import.meta.env.DEV &&
        window.sessionStorage?.getItem('tixorbit_map_debug') === '1';

      // *** STRATEGY 0: Walk up DOM and check elementToMatch (primary, most reliable) ***
      // This works for ALL binding strategies since we now populate elementToMatch universally.
      let walkEl: Element | null = target;
      for (let i = 0; i < 10 && walkEl; i++) {
        const mapped = elementToMatch.get(walkEl);
        if (mapped) {
          e.preventDefault();
          e.stopPropagation();
          onDebugEvent?.({
            ...debugBase,
            labelText: labeled ?? null,
            resolvedSectionId: mapped.section.id,
            resolutionPath: 'mapping',
            candidateCount: 0,
          });
          if (shouldLog) {
            // eslint-disable-next-line no-console
            console.info('[MapDebug] resolved via elementToMatch (DOM walk)', {
              resolvedSectionId: mapped.section.id,
              resolvedSectionName: mapped.section.name,
              walkDepth: i,
              elementTag: walkEl.tagName,
            });
          }
          handleSectionClick(mapped.section.id, mapped.section, mapped.eventSection);
          return;
        }
        walkEl = walkEl.parentElement;
      }

      // Fallback: ID/text candidates (in case elementToMatch wasn't populated for this element)
      const candidates: string[] = [];
      if (labeled) {
        candidates.push(normalizeName(labeled), labeled.toLowerCase());
        const num = labeled.match(/(\d{1,3})/);
        if (num) candidates.push(num[1]);
      }

      // Walk up a few levels for ids like "202-group" / "g202" / "path203"
      let el: Element | null = target;
      for (let i = 0; i < 6 && el; i++) {
        const id = el.getAttribute('id');
        if (id) {
          candidates.push(...extractIdentifiers(id));
          const digits = id.match(/\d+/g);
          if (digits) candidates.push(...digits);
        }
        el = el.parentElement;
      }

      const uniq = Array.from(new Set(candidates)).filter(Boolean);

      if (shouldLog) {
        // eslint-disable-next-line no-console
        console.groupCollapsed('[MapDebug] click resolution (fallback to ID/text)');
        // eslint-disable-next-line no-console
        console.log('target', {
          tag: (target as any)?.tagName,
          id: target.getAttribute?.('id') ?? null,
          closestId: (target.closest?.('[id]') as Element | null)?.getAttribute?.('id') ?? null,
          labelText: labeled ?? null,
        });
        // eslint-disable-next-line no-console
        console.log('candidates', uniq);
        // eslint-disable-next-line no-console
        console.groupEnd();
      }

      for (const c of uniq) {
        const matchData = sectionMapping.get(c);
        if (matchData) {
          e.preventDefault();
          e.stopPropagation();
          onDebugEvent?.({
            ...debugBase,
            labelText: labeled ?? null,
            resolvedSectionId: matchData.section.id,
            resolutionPath: 'mapping',
            candidateCount: uniq.length,
          });
          if (shouldLog) {
            // eslint-disable-next-line no-console
            console.info('[MapDebug] resolved via sectionMapping (ID/text)', {
              candidate: c,
              resolvedSectionId: matchData.section.id,
              resolvedSectionName: matchData.section.name,
            });
          }
          handleSectionClick(matchData.section.id, matchData.section, matchData.eventSection);
          return;
        }
      }

      // Heuristic fallback for coarse DB sections vs granular SVG IDs/labels.
      // Works even when SVG provides ids like "mezz-section" and labelText is empty.
      const heuristicSource = labeled || uniq.join(' ');
      if (heuristicSource) {
        const heuristic = resolveByHeuristics(heuristicSource);
        if (heuristic) {
          e.preventDefault();
          e.stopPropagation();
          onDebugEvent?.({
            ...debugBase,
            labelText: labeled ?? null,
            resolvedSectionId: heuristic.section.id,
            resolutionPath: 'mapping',
            candidateCount: uniq.length,
          });
          if (shouldLog) {
            // eslint-disable-next-line no-console
            console.info('[MapDebug] resolved via heuristics', {
              source: heuristicSource,
              resolvedSectionId: heuristic.section.id,
              resolvedSectionName: heuristic.section.name,
            });
          }
          handleSectionClick(heuristic.section.id, heuristic.section, heuristic.eventSection);
          return;
        }
      }

      // No match.
      onDebugEvent?.({
        ...debugBase,
        labelText: labeled ?? null,
        resolvedSectionId: null,
        resolutionPath: 'none',
        candidateCount: uniq.length,
      });

      if (shouldLog) {
        // eslint-disable-next-line no-console
        console.warn('[MapDebug] no match found', { candidateCount: uniq.length });
      }
    };
    // Some exported SVGs cancel/never emit 'click' reliably (e.g. drag/zoom libs, pointer-event quirks).
    // Bind to pointer/mouse down in capture phase so we always see the interaction.
    const events: Array<keyof GlobalEventHandlersEventMap> = ['pointerdown', 'mousedown', 'click'];
    events.forEach((evt) => svgElement.addEventListener(evt, delegatedClick, true));
    cleanupRef.current.push(() => events.forEach((evt) => svgElement.removeEventListener(evt, delegatedClick, true)));

    // Also attach to the host wrapper so clicks still register when SVG internals
    // swallow events (common with some exported venue maps).
    // Attach to the container too. If the SVG sets pointer-events:none, clicks land on the container,
    // and the host (child) will never receive the event.
    events.forEach((evt) => container.addEventListener(evt, delegatedClick, true));
    cleanupRef.current.push(() => events.forEach((evt) => container.removeEventListener(evt, delegatedClick, true)));

    events.forEach((evt) => host.addEventListener(evt, delegatedClick, true));
    cleanupRef.current.push(() => events.forEach((evt) => host.removeEventListener(evt, delegatedClick, true)));

    return () => {
      cleanupRef.current.forEach(fn => fn());
      cleanupRef.current = [];
    };
   }, [svgContent, sectionMapping, selectedSectionId, handleSectionClick, handleSectionHover, effectiveViewBox, sections.length, eventSections.length, !!ticketInventory]);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(3, z + 0.25)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(0.5, z - 0.25)), []);
  const handleReset = useCallback(() => setZoom(1), []);

  // Debug hook: verify pointer events reach the container even if the SVG disables pointer events.
  const handleHostPointerDownCapture = useCallback(
    (e: any) => {
      onDebugEvent?.({
        at: new Date().toISOString(),
        targetTag: e?.target?.tagName,
        targetId: e?.target?.getAttribute?.('id') ?? null,
        closestId: e?.target?.closest?.('[id]')?.getAttribute?.('id') ?? null,
        labelText: e?.target?.closest?.('text')?.textContent?.trim?.() ?? null,
        resolvedSectionId: null,
        resolutionPath: 'none',
        candidateCount: 0,
      });
    },
    [onDebugEvent]
  );

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
    <div ref={setRootRef} className="relative h-full flex flex-col gap-2">
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
            onPointerDownCapture={handleHostPointerDownCapture}
          style={{ 
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
            <div
              ref={svgHostRef}
              className="w-full h-full"
            />
        </div>
      </div>
    </div>
  );
});

export default DynamicVenueMap;
