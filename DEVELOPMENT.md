# EduHub Development Guide

## Quick Start

### Installation
```bash
cd client
npm install
npm start
```

The app will open at `http://localhost:3000`

---

## Project Structure

```
client/src/
├── components/
│   ├── ui/                    # Core UI components
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── StatsCard.jsx
│   │   ├── Modal.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Toast.jsx
│   │   ├── Dropdown.jsx
│   │   ├── Tabs.jsx
│   │   ├── DataTable.jsx
│   │   ├── AnimatedCard.jsx
│   │   └── index.js
│   ├── layout/
│   │   ├── DashboardShell.jsx # Main layout
│   │   └── MobileMenu.jsx
│   ├── common/
│   │   └── PageTransition.jsx
│   └── ...
├── context/
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── features/
│   ├── student/
│   ├── mentor/
│   └── admin/
├── lib/
│   ├── animations.js          # Framer Motion presets
│   ├── responsive.js          # Responsive utilities
│   ├── performance.js         # Performance helpers
│   ├── seo.js                 # SEO utilities
│   ├── utils.js
│   └── api/
├── hooks/
│   └── useLazyLoad.js
├── styles/
│   ├── tokens.css             # Design tokens
│   └── globals.css            # Global utilities
├── constants/
│   └── navigation.js
└── stores/
    └── auth.store.js
```

---

## Design System

### Color Tokens
Access colors via CSS variables:
```css
--color-accent              /* Primary brand color */
--color-success             /* Success state */
--color-warning             /* Warning state */
--color-danger              /* Error state */
--color-ink                 /* Text color dark */
--color-text                /* Primary text */
--color-text-2              /* Secondary text */
--color-text-3              /* Tertiary text */
--color-surface             /* Cards/elevated surfaces */
--color-surface-2           /* Secondary surface */
--color-surface-3           /* Tertiary surface */
--color-border              /* Subtle borders */
--color-border-2            /* Strong borders */
```

### Shadows
```css
--shadow-xs                 /* Minimal shadow */
--shadow-card               /* Card shadow */
--shadow-card-hover         /* Card hover shadow */
--shadow-elevated           /* Elevated shadow */
--shadow-inset              /* Inset shadow */
--shadow-ring               /* Focus ring */
--shadow-focus-ring         /* Full focus ring */
```

### Gradients
```css
--gradient-primary          /* Brand gradient */
--gradient-subtle           /* Subtle gradient */
--gradient-mesh             /* Mesh background */
--gradient-glow             /* Glow effect */
--gradient-card             /* Card gradient */
```

### Spacing Scale
Tokens follow a 4px scale:
```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-12: 48px
```

### Radii
```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
--radius-2xl: 24px
--radius-full: 9999px
```

---

## Component Usage

### Card Component
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>My Card</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### StatsCard
```jsx
import { StatsCard } from '@/components/ui';
import { Users } from 'lucide-react';

<StatsCard
  title="Total Users"
  value={1234}
  icon={<Users size={20} />}
  trend="up"
  color="accent"
/>
```

### AnimatedCard
```jsx
import { AnimatedCard } from '@/components/ui';

<AnimatedCard delay={0.1}>
  <h3>Animated Content</h3>
</AnimatedCard>
```

### Button
```jsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Click Me
</Button>

// Variants: primary, secondary, danger, ghost
// Sizes: sm, md, lg
```

### Modal
```jsx
import { Modal } from '@/components/ui';
import { useState } from 'react';

const [open, setOpen] = useState(false);

<Modal open={open} onOpenChange={setOpen}>
  <h2>Modal Title</h2>
  <p>Modal content</p>
</Modal>
```

### Toast
```jsx
import { useToast } from '@/components/ui';

const { toast } = useToast();

toast({
  title: 'Success',
  description: 'Operation completed',
  variant: 'success', // 'success' | 'error' | 'warning' | 'info'
});
```

### DataTable
```jsx
import { DataTable } from '@/components/ui';

<DataTable
  data={items}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
  ]}
/>
```

---

## Animations

### Entrance Animations
```jsx
import { motion } from 'framer-motion';
import { fadeInUp, slideInLeft } from '@/lib/animations';

<motion.div initial="hidden" animate="visible" variants={fadeInUp}>
  Content
</motion.div>
```

### Staggered List
```jsx
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

<motion.div variants={containerVariants} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Common Animations
- `fadeInUp` - Fade in while sliding up
- `fadeIn` - Simple fade
- `slideInLeft` / `slideInRight` - Slide from sides
- `scaleIn` - Scale up from center
- `hoverScale` - Scale on hover
- `hoverLift` - Lift on hover
- `pulse` - Pulsing animation
- `shimmer` - Shimmer effect

---

## Responsive Design

### Mobile-First Approach
```jsx
// Automatically responsive grid
<div className="grid-responsive">
  {/* 1 column on mobile, 2 on tablet, 3 on desktop, 4 on large */}
</div>

// Responsive flexbox
<div className="flex-responsive">
  {/* Column on mobile, row on desktop */}
</div>

// Responsive container with max-width
<div className="container-responsive">
  {/* Auto padding, max-width adjusts by breakpoint */}
</div>
```

### useResponsive Hook
```jsx
import { useResponsive } from '@/lib/responsive';

function MyComponent() {
  const { isMobile, isTablet, isDesktop, size } = useResponsive();

  if (isMobile) return <MobileLayout />;
  if (isTablet) return <TabletLayout />;
  return <DesktopLayout />;
}
```

### Breakpoints
- `xs`: 320px (small phones)
- `sm`: 640px (large phones)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)
- `2xl`: 1536px (ultra-wide)

---

## Performance Optimization

### Lazy Loading Images
```jsx
import { useLazyLoad } from '@/hooks/useLazyLoad';

function Image() {
  const { elementRef, isVisible } = useLazyLoad();

  return (
    <img
      ref={elementRef}
      src={isVisible ? imageUrl : placeholderUrl}
      alt="description"
    />
  );
}
```

### Debounce & Throttle
```jsx
import { debounce, throttle } from '@/lib/performance';

// For expensive operations (resize, search)
const handleSearch = debounce((query) => {
  // API call
}, 300);

// For frequent events (scroll, resize)
const handleScroll = throttle(() => {
  // Update logic
}, 100);
```

### Connection-Aware Loading
```jsx
import { shouldReduceAnimation, shouldLoadHighQuality } from '@/lib/performance';

function Image() {
  const src = shouldLoadHighQuality() ? highResUrl : lowResUrl;
  const reduceMotion = shouldReduceAnimation();

  return <img src={src} alt="..." />;
}
```

---

## Theme Management

### Toggle Theme
```jsx
import { useTheme } from '@/context/ThemeContext';

function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button onClick={toggleDarkMode}>
      {darkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

### Theme Persistence
Themes are automatically saved to localStorage and persist across sessions.

---

## Icons

Use Lucide React icons throughout:
```jsx
import { 
  Users,
  Settings,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  // ... 1000+ icons available
} from 'lucide-react';

<Users size={24} color="currentColor" />
```

---

## Common Patterns

### Form with Validation
```jsx
import { Button } from '@/components/ui';
import { useState } from 'react';

function Form() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate and submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      {errors.name && <span className="text-danger">{errors.name}</span>}
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Loading State
```jsx
import { Skeleton, StatsCardSkeleton } from '@/components/ui';

function Content({ loading, data }) {
  if (loading) {
    return <StatsCardSkeleton count={4} />;
  }

  return <div>{data}</div>;
}
```

### Empty State
```jsx
import { EmptyStat } from '@/components/common';

function List({ items }) {
  if (items.length === 0) {
    return (
      <EmptyStat
        icon="📚"
        title="No Items"
        description="Create your first item to get started"
      />
    );
  }

  return <div>{items.map(renderItem)}</div>;
}
```

---

## SEO Helpers

### Set Page Meta
```jsx
import { setPageMeta } from '@/lib/seo';

useEffect(() => {
  setPageMeta({
    title: 'Course Name - EduHub',
    description: 'Learn amazing things',
    image: 'https://...',
    url: 'https://eduhub.com/courses/123',
  });
}, []);
```

### Structured Data
```jsx
import { addStructuredData, createCourseSchema } from '@/lib/seo';

useEffect(() => {
  addStructuredData(createCourseSchema({
    name: 'Course Title',
    description: 'Course description',
    url: 'https://...',
    image: 'https://...',
    instructor: 'John Doe',
    rating: 4.5,
    ratingCount: 100,
  }));
}, []);
```

---

## Debugging

### Enable Performance Monitoring (Development)
Performance metrics are logged to console in development mode:
```
[Performance] ComponentName took 15.32ms
[Web Vitals] FCP: 1200ms (good)
```

### Check SEO
```jsx
import { validateSEO } from '@/lib/seo';

validateSEO();
// Shows warnings for missing SEO optimizations
```

---

## Git Workflow

1. Create feature branch from `modernize-educational-platform-ui`
2. Make changes in a new folder/feature
3. Test thoroughly
4. Commit with clear message
5. Push and create PR to main

```bash
git checkout -b feature/my-feature
git add .
git commit -m "feat: description of changes"
git push origin feature/my-feature
```

---

## Common Issues

### Module Not Found
Ensure imports use correct paths:
```jsx
// ✓ Correct
import { Button } from '@/components/ui';
import { useTheme } from '@/context/ThemeContext';

// ✗ Wrong (unless at that path)
import Button from '@/components/ui/Button';
```

### Styles Not Applying
Check that:
1. CSS variables are defined in `tokens.css`
2. Global styles are imported in main.jsx
3. Tailwind classes or CSS classNames are correct

### Components Not Rendering
Verify:
1. Component is exported from its file
2. Import path is correct
3. All required props are provided
4. Context providers are in App.jsx

---

## Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [React Docs](https://react.dev/)
- [React Router Docs](https://reactrouter.com/)
- [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)

---

## Support

For issues or questions:
1. Check this guide first
2. Review the MODERNIZATION.md file
3. Check component source code
4. Ask in team Slack channel

Happy coding! 🚀
