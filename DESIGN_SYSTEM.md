# HirePlan Design System

## Sizing Standards

This document outlines the consistent sizing system used throughout the HirePlan application.

### Core Sizing Scale

| Size | Button Height | Input Height | Card Padding | Badge |
|------|--------------|--------------|--------------|-------|
| **sm** | `h-8` (32px) | `h-8` (32px) | `p-4` (16px) | `text-[10px] px-2` |
| **md** (default) | `h-10` (40px) | `h-10` (40px) | `p-6` (24px) | `text-xs px-2.5` |
| **lg** | `h-12` (48px) | `h-12` (48px) | `p-8` (32px) | `text-sm px-3` |
| **xl** | `h-14` (56px) | - | - | - |

### Component Sizing

#### Button Component
```tsx
<Button size="sm">Small</Button>     // h-8 (32px)
<Button size="default">Medium</Button> // h-10 (40px) - default
<Button size="lg">Large</Button>     // h-12 (48px)
<Button size="xl">Extra Large</Button> // h-14 (56px)

// Icon buttons
<Button size="icon">         // 40x40px
<Button size="icon-sm">      // 32x32px
<Button size="icon-lg">      // 48x48px
```

#### Input Component
```tsx
<Input size="sm" />   // h-8 (32px), text-xs
<Input size="md" />   // h-10 (40px), text-sm - default
<Input size="lg" />   // h-12 (48px), text-base
```

#### Badge Component
```tsx
<Badge size="sm">Small</Badge>    // text-[10px], px-2
<Badge size="md">Medium</Badge>   // text-xs, px-2.5 - default
<Badge size="lg">Large</Badge>    // text-sm, px-3
```

#### Card Component
```tsx
// Card sizing affects all internal padding
<Card size="sm">
  <CardHeader size="sm">   // p-4
  <CardContent size="sm">  // p-4 pt-0
  <CardTitle size="sm">    // text-lg
</Card>

<Card size="md">            // Default
  <CardHeader size="md">   // p-6
  <CardContent size="md">  // p-6 pt-0
  <CardTitle size="md">    // text-2xl
</Card>

<Card size="lg">
  <CardHeader size="lg">   // p-8
  <CardContent size="lg">  // p-8 pt-0
  <CardTitle size="lg">    // text-3xl
</Card>
```

### Spacing System

#### Component Gaps
- **Tight**: `gap-2` (8px) - between related items
- **Normal**: `gap-4` (16px) - default spacing
- **Loose**: `gap-6` (24px) - between sections
- **Extra Loose**: `gap-8` (32px) - between major sections

#### Section Spacing
- **Small**: `space-y-2` - tight forms
- **Medium**: `space-y-4` - default
- **Large**: `space-y-6` - cards/panels
- **Extra Large**: `space-y-8` - page-level

### Typography Scale

| Element | Size | Line Height | Use Case |
|---------|------|-------------|----------|
| `text-xs` | 12px | 16px | Labels, captions, badges |
| `text-sm` | 14px | 20px | Body text, form labels |
| `text-base` | 16px | 24px | Default body text |
| `text-lg` | 18px | 28px | Subheadings |
| `text-xl` | 20px | 28px | Card titles |
| `text-2xl` | 24px | 32px | Section headings |
| `text-3xl` | 30px | 36px | Page titles |

### Border Radius

- **Small**: `rounded-sm` (2px) - buttons, inputs
- **Medium**: `rounded-md` (6px) - cards, panels
- **Large**: `rounded-lg` (8px) - default cards
- **Full**: `rounded-full` - badges, avatars

### Shadows

- **xs**: `shadow-xs` - subtle elevation
- **sm**: `shadow-sm` - cards
- **md**: `shadow-md` - elevated cards
- **lg**: `shadow-lg` - modals, dropdowns

### Best Practices

1. **Always use size props** instead of custom classes when available
2. **Maintain consistent heights** - buttons and inputs at same level should be same height
3. **Use semantic sizing** - small for compact areas, large for prominent actions
4. **Match input heights to button heights** in forms
5. **Avoid overrides** - let the component variants handle sizing

### Common Patterns

#### Form Layout
```tsx
<div className="space-y-4">
  <Input size="md" />           // Match label
  <Button size="md">Submit</Button> // Match input height
</div>
```

#### Card with Actions
```tsx
<Card size="md">
  <CardHeader size="md">
    <CardTitle size="md">Title</CardTitle>
  </CardHeader>
  <CardContent size="md">
    <p>Content</p>
  </CardContent>
  <div className="flex gap-2">
    <Button size="sm">Action</Button>
  </div>
</Card>
```

#### Compact Layout
```tsx
<Card size="sm">
  <CardHeader size="sm">
    <CardTitle size="sm">Compact Title</CardTitle>
  </CardHeader>
  <CardContent size="sm">
    <Input size="sm" />
    <Button size="sm">Save</Button>
  </CardContent>
</Card>
```
