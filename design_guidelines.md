# Noctoon - Manga/Webtoon Reader Design Guidelines

## Design Approach

**Reference-Based Approach** drawing from industry leaders in content consumption and manga reading platforms (Webtoon, MangaDex, Netflix, Crunchyroll Manga). This is a visual-rich, content-focused application where user experience and reading comfort are paramount.

---

## Core Design Principles

1. **Content-First Philosophy**: Manga covers and reading panels are the heroes - minimize UI chrome, maximize content visibility
2. **Immersive Reading**: Reader mode should eliminate all distractions
3. **Discovery & Browse**: Grid-based layouts showcasing manga covers prominently
4. **Reading Comfort**: Typography and spacing optimized for long reading sessions

---

## Typography System

**Primary Font**: Inter or Poppins (clean, modern sans-serif)
**Secondary Font**: Source Sans Pro or Open Sans (body text)
**Manga Titles**: Font weight 700, sizes ranging from text-2xl to text-4xl
**Chapter Numbers**: Font weight 600, text-sm to text-base
**Descriptions**: Font weight 400, text-sm with relaxed line-height (1.7)
**Metadata** (authors, dates, genres): Font weight 500, text-xs uppercase tracking-wide

---

## Layout & Spacing System

**Tailwind Spacing Units**: Consistently use 2, 4, 6, 8, 12, 16, 20, 24 units
- Small gaps: gap-2, gap-4 (component internals)
- Section spacing: p-8, p-12, p-16 (desktop), p-4, p-6 (mobile)
- Component margins: mb-8, mb-12, mb-16
- Container max-widths: max-w-7xl for main content areas

**Grid Systems**:
- Manga Grid (Home/Library): `grid-cols-2 md:grid-cols-4 lg:grid-cols-6` with gap-4 md:gap-6
- Featured Section: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` with gap-6
- Chapter List: Single column stack with consistent spacing

---

## Component Library

### Navigation
- **Top Navbar**: Fixed position, backdrop-blur-md, height h-16, contains logo, search bar, user menu
- **Mobile Bottom Nav**: Fixed bottom, h-16, 4-5 icon buttons (Home, Search, Library, Profile)
- **Search Bar**: Prominent in navbar, expandable on mobile, with keyboard shortcuts hint

### Manga Cards
- **Aspect Ratio**: 2:3 portrait (standard manga cover ratio)
- **Hover State**: Subtle scale transform (scale-105), smooth shadow increase
- **Overlay**: Gradient overlay on hover revealing title, rating, quick actions
- **Structure**: Cover image + metadata footer with title, latest chapter, status badge

### Reader Interface
- **Full-Screen Mode**: Hide all navigation, max-h-screen for images
- **Reading Controls**: Fixed bottom bar with minimal opacity, appears on hover/tap
  - Chapter navigation arrows (left/right)
  - Progress indicator (current page / total)
  - Settings icon (reading mode, zoom)
  - Chapter selector dropdown
- **Image Display**: Center-aligned, max-w-4xl container, responsive width
- **Vertical Scroll Mode**: Continuous scroll with lazy loading
- **Page Navigation**: Click left/right sides of image or arrow keys

### Content Sections (Home Page)
1. **Hero Carousel**: Full-width (not full-height), h-96 lg:h-[500px], featured manga with large cover, title overlay, "Read Now" CTA
2. **Trending Grid**: Grid of 6 manga cards, title "Trending Now"
3. **Recently Updated**: Horizontal scrollable row or grid
4. **Genres Section**: Tabbed or filterable grid by genre
5. **Recommendations**: Personalized grid for logged-in users

### Series Detail Page
- **Hero Section**: Cover + metadata side-by-side layout (grid-cols-1 lg:grid-cols-3)
  - Large cover image (col-span-1)
  - Details section (col-span-2): Title, author, genres, rating, description, "Start Reading" button
- **Chapter List**: Scrollable list with chapter number, title, date, read status indicator
- **Related Series**: Grid of similar manga (4-6 cards)

### User Profile
- **Profile Header**: Avatar, username, reading stats (total read, favorites count)
- **Tabs**: Currently Reading / Favorites / History
- **Content Grids**: Same manga card pattern as library

### Forms & Modals
- **Login Modal**: Centered modal, max-w-md, minimal fields, social login options
- **Search Modal**: Full-screen on mobile, modal on desktop, filters sidebar (genres, status, year)
- **Filters**: Checkbox groups for genres, radio for status, range slider for year

---

## Images Strategy

**Hero Section**: Yes - Use manga cover artwork with gradient overlay
**Manga Covers**: Critical - Every manga needs cover image, use placeholder for missing
**Backgrounds**: Subtle texture or minimal patterns, never competing with manga covers
**Icons**: Lucide React icons throughout (consistent, clean)

**Image Specifications**:
- Cover images: 400x600px minimum, WebP format preferred
- Manga panels: Variable size, lazy load, progressive enhancement
- Hero backgrounds: 1920x1080px, subtle blur effect

---

## Animations & Interactions

**Minimal Animation Philosophy** - Use sparingly for polish:
- Card hover: `transition-transform duration-200 ease-out`
- Modal entrance: Fade + slight scale `animate-in fade-in-0 zoom-in-95`
- Page transitions: None (instant for snappy feel)
- Reader image load: Skeleton shimmer effect
- Infinite scroll: Smooth append with intersection observer

---

## Accessibility

- **Keyboard Navigation**: Full arrow key support in reader
- **Focus Indicators**: Clear ring-2 ring-offset-2 on all interactive elements
- **ARIA Labels**: All icon buttons have descriptive labels
- **Contrast**: Maintain WCAG AA standard (handled by theme, not specified here)
- **Alt Text**: All manga covers have descriptive alt text

---

## Responsive Breakpoints

- **Mobile**: Default (< 768px) - Single column, bottom nav, simplified reader controls
- **Tablet**: md (768px+) - 2-4 column grids, show full navbar
- **Desktop**: lg (1024px+) - 4-6 column grids, side-by-side layouts, enhanced reader

---

## Key Pages Layout Structure

**HomePage**: Navbar → Hero Carousel → Trending Grid (6 items) → Recently Updated (scrollable) → Genre Tabs with Grids → Footer

**SeriesDetailPage**: Navbar → Hero (Cover + Info) → Chapter List (scrollable) → Related Series Grid → Footer

**ReaderPage**: Minimal UI → Full-screen manga panels → Bottom controls (on hover) → Chapter navigation

**LibraryPage**: Navbar → Tabs (Reading/Favorites/History) → Filtered Grid → Pagination → Footer

**ProfilePage**: Navbar → Profile Header → Stats Cards → Activity Feed/Grids → Footer