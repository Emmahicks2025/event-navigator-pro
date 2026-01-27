

# Industrial-Scale Backend Integration & WordPress-Like Admin Experience

## Overview

This plan transforms your ticketing platform from a mock-data demo into a fully database-driven application with an intuitive, WordPress-like admin experience. The goal is to make managing events, venues, and tickets as simple as drag-and-drop.

---

## Current Issues Identified

1. **Frontend uses mock data** - Index, Category, EventDetail, and Search pages all import from `mockData.ts` instead of querying the database
2. **Missing admin pages** - No performers manager, no categories manager, no ticket inventory manager
3. **SVG section mapping is manual** - Requires copying SVG paths by hand instead of visual click-to-assign
4. **No event-section pricing workflow** - Cannot set per-section pricing when creating events
5. **Dashboard quick actions link to non-existent pages** (`/admin/performers/new`, `/admin/inventory`)
6. **No visual feedback** - Admin UI lacks modern UX patterns like inline editing, bulk actions, and visual previews

---

## Implementation Plan

### Phase 1: Connect Frontend to Database

Replace all mock data imports with real Supabase queries across the public-facing pages.

**Files to modify:**
- `src/pages/Index.tsx` - Fetch featured events, categories, and events by category from database
- `src/pages/Category.tsx` - Query events filtered by category slug
- `src/pages/EventDetail.tsx` - Load event, venue (with SVG map), sections, and ticket inventory from database
- `src/pages/Search.tsx` - Implement real search across events, performers, and venues
- `src/components/EventsCarousel.tsx` - Accept database event format
- `src/components/PerformersSection.tsx` - Fetch performers from database
- `src/components/EventCard.tsx` - Update to handle database event shape with relations

**Technical approach:**
- Create custom hooks: `useEvents()`, `useCategories()`, `useFeaturedEvents()`, `usePerformers()`
- Handle loading states with skeleton components
- Cache data using React Query for performance

---

### Phase 2: Complete Admin Dashboard

Add missing management pages with a clean, WordPress-inspired interface.

#### 2.1 Performers Manager
**New files:**
- `src/pages/admin/PerformersList.tsx` - List all performers with search, filter by category
- `src/pages/admin/PerformerForm.tsx` - Create/edit performer with image upload

**Features:**
- Image URL or file upload
- Link to category
- View upcoming events count

#### 2.2 Categories Manager
**New files:**
- `src/pages/admin/CategoriesList.tsx` - Manage event categories

**Features:**
- Drag-to-reorder categories
- Custom icons (emoji picker)
- Edit category name/slug inline

#### 2.3 Ticket Inventory Manager
**New files:**
- `src/pages/admin/InventoryList.tsx` - View all ticket inventory across events
- `src/pages/admin/InventoryForm.tsx` - Add/edit ticket listings

**Features:**
- Filter by event, section, status
- Bulk price updates
- Mark as lowest price / clear view
- Quick stock adjustment

#### 2.4 Event Section Pricing
**Modify:** `src/pages/admin/EventForm.tsx`

**Features:**
- After selecting a venue, show all venue sections
- Set price per section for the event
- Set capacity/availability per section
- Toggle sections on/off for specific events

---

### Phase 3: Visual SVG Section Mapper

Transform the section manager into a visual, click-to-assign tool.

**Modify:** `src/pages/admin/SectionsManager.tsx`

**New workflow:**
1. Display the venue's SVG map in full
2. Highlight clickable paths that don't have sections assigned
3. Click on any SVG path to open a modal
4. Modal pre-fills the SVG path data and lets you name the section
5. Assigned sections show in a different color with labels
6. Hover shows section details

**Technical approach:**
- Parse SVG and extract all `<path>`, `<polygon>`, `<rect>` elements with IDs
- Create a state map of `pathId -> sectionId`
- On click, capture the path's `d` attribute and ID
- Visual color coding: unassigned (gray), assigned (blue), selected (green)

---

### Phase 4: Enhanced Admin UI/UX

Make the admin experience feel modern and intuitive.

#### 4.1 Navigation Improvements
**Modify:** `src/components/admin/AdminLayout.tsx`

- Add sidebar navigation with icons
- Breadcrumb navigation
- Collapsible sidebar for mobile
- Quick search command palette (Cmd+K)

#### 4.2 Data Tables Enhancement
**Apply to all list pages:**

- Inline editing for simple fields
- Bulk selection and actions
- Column visibility toggle
- Export to CSV
- Pagination with page size options

#### 4.3 Form Improvements
- Auto-save drafts
- Image preview on URL paste
- Rich text editor for descriptions
- Validation feedback in real-time

---

### Phase 5: Event Detail Page - Database Integration

Connect the event detail page to real data.

**Modify:** `src/pages/EventDetail.tsx`

**Changes:**
1. Fetch event by ID from database with venue and sections
2. Render venue's `svg_map` dynamically
3. Query `event_sections` for pricing per section
4. Query `ticket_inventory` for available listings
5. Map SVG paths to sections using `sections.svg_path` matching
6. Show real prices and availability on hover

**New component:** `src/components/DynamicVenueMap.tsx`
- Renders any venue's SVG map
- Highlights sections based on database data
- Interactive hover/click behavior

---

## File Changes Summary

| Action | File | Description |
|--------|------|-------------|
| Modify | `src/pages/Index.tsx` | Replace mock imports with database queries |
| Modify | `src/pages/Category.tsx` | Query categories and events from database |
| Modify | `src/pages/EventDetail.tsx` | Full database integration for event, venue, sections, inventory |
| Modify | `src/pages/Search.tsx` | Real search implementation |
| Modify | `src/components/EventCard.tsx` | Handle database event format |
| Modify | `src/components/EventsCarousel.tsx` | Accept database events |
| Modify | `src/components/PerformersSection.tsx` | Fetch from database |
| Create | `src/hooks/useEvents.ts` | Custom hook for event queries |
| Create | `src/hooks/useCategories.ts` | Custom hook for categories |
| Create | `src/hooks/usePerformers.ts` | Custom hook for performers |
| Create | `src/pages/admin/PerformersList.tsx` | Performers list page |
| Create | `src/pages/admin/PerformerForm.tsx` | Create/edit performer |
| Create | `src/pages/admin/CategoriesList.tsx` | Categories manager |
| Create | `src/pages/admin/InventoryList.tsx` | Ticket inventory list |
| Create | `src/pages/admin/InventoryForm.tsx` | Add/edit inventory |
| Modify | `src/pages/admin/EventForm.tsx` | Add section pricing UI |
| Modify | `src/pages/admin/SectionsManager.tsx` | Visual SVG path mapping |
| Modify | `src/components/admin/AdminLayout.tsx` | Enhanced navigation |
| Create | `src/components/DynamicVenueMap.tsx` | Render any venue SVG |
| Modify | `src/App.tsx` | Add new admin routes |

---

## Technical Details

### Database Query Patterns

```text
Featured Events Query:
SELECT * FROM events
WHERE is_featured = true AND is_active = true
ORDER BY display_order
LIMIT 10

Category Events Query:
SELECT events.*, venues.name as venue_name
FROM events
JOIN categories ON events.category_id = categories.id
WHERE categories.slug = $slug AND events.is_active = true
ORDER BY event_date

Event Detail Query:
SELECT events.*,
       venues.name, venues.svg_map, venues.map_viewbox,
       performers.name as performer_name,
       categories.name as category_name
FROM events
LEFT JOIN venues ON events.venue_id = venues.id
LEFT JOIN performers ON events.performer_id = performers.id
LEFT JOIN categories ON events.category_id = categories.id
WHERE events.id = $id

Event Sections with Pricing:
SELECT event_sections.*, sections.name, sections.svg_path
FROM event_sections
JOIN sections ON event_sections.section_id = sections.id
WHERE event_sections.event_id = $eventId

Available Tickets:
SELECT ticket_inventory.*,
       event_sections.price as section_price,
       sections.name as section_name
FROM ticket_inventory
JOIN event_sections ON ticket_inventory.event_section_id = event_sections.id
JOIN sections ON event_sections.section_id = sections.id
WHERE event_sections.event_id = $eventId
AND ticket_inventory.status = 'available'
ORDER BY ticket_inventory.price
```

### SVG Path Mapping Logic

```text
1. Parse venue.svg_map as DOM
2. Find all elements with id attribute (paths, polygons, rects)
3. For each section in database with svg_path:
   - Find matching element by id or path data
   - Apply section styling (fill color, cursor)
   - Attach hover/click handlers
4. Unassigned paths get neutral styling
5. On click: open assignment modal with path data
```

---

## Expected Outcome

After implementation:
- All pages display real data from the database
- Admins can manage everything through an intuitive interface
- SVG sections are assigned visually by clicking on the map
- Event pricing is set per-section when creating events
- Ticket inventory is tracked and displayed accurately
- The platform is ready for production use

