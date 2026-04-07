# Calorie Tracker - Specification

## Concept & Vision

A sleek, dark-themed calorie tracker that feels like a premium health dashboard. The interface should feel motivating and effortless—users can quickly log meals and see their daily progress visualized with smooth, satisfying animations. The aesthetic is health-tech premium: deep purples and teals against a dark background, with glowing accents that make data feel alive.

## Design Language

### Aesthetic Direction
Premium dark health-tech aesthetic—think futuristic fitness app meets data dashboard. Glassmorphism cards floating over a gradient background.

### Color Palette
- Background: `#0a0e1a` (deep navy-black)
- Card Background: `rgba(15, 20, 35, 0.7)` with glassmorphism blur
- Primary Accent: `#10b981` (emerald green - success/under goal)
- Warning: `#f59e0b` (amber - approaching limit)
- Danger: `#ef4444` (red - over limit)
- Text Primary: `#f1f5f9`
- Text Secondary: `#94a3b8`
- Border: `rgba(255, 255, 255, 0.08)`

### Typography
- Headings: Outfit (700 weight)
- Body: Inter (400-500 weight)

### Motion Philosophy
- Progress bars animate smoothly on update (600ms ease-out)
- Food items slide in from left on add, slide out right on delete
- Micro-interactions on hover: subtle glow, scale transforms
- Numbers count up when values change

## Layout & Structure

### Main Container (centered, max-width 480px)
1. **Header Section**
   - App title "Calorie Tracker"
   - Current date display
   - Daily calorie goal (editable inline)

2. **Progress Dashboard**
   - Circular or horizontal progress bar showing calories consumed vs goal
   - Large calorie count display (consumed / goal)
   - Macronutrient summary row (protein, carbs, fat grams)

3. **Add Food Form**
   - Compact inline form: food name, calories, protein/carbs/fat (optional)
   - Add button with plus icon

4. **Food Log List**
   - Scrollable list of today's food entries
   - Each entry shows: name, calories, macro pills (P/C/F), delete button
   - Empty state message when no entries

5. **Quick Stats Footer**
   - Remaining calories (goal - consumed)
   - Average per meal

## Features & Interactions

### Core Features
- **Add Food Entry**: Name (required), calories (required), protein/carbs/fat (optional, defaults to 0)
- **Daily Progress Tracking**: Visual progress bar, percentage display
- **Macro Tracking**: Track P/C/F alongside calories
- **Persistent Storage**: All data saved to localStorage, persists across sessions
- **Daily Reset**: Data automatically resets for new day (based on date)

### Interaction Details
- Form validation: highlight empty required fields with red border, shake animation
- Delete: slide-out animation, item removed from list
- Progress bar: color shifts from green → amber → red as user approaches/exceeds goal
- Clicking goal number allows inline editing

### Edge Cases
- Over limit: progress bar extends past 100%, shows in red, displays negative remaining
- Empty state: friendly message encouraging first food entry
- No macros entered: show 0 for all three, don't display pills

## Component Inventory

### Progress Ring/Bar
- States: Under 80% (green), 80-100% (amber), Over 100% (red)
- Animated fill on value change
- Shows percentage in center/beside

### Food Entry Card
- States: Default, Hover (slight lift, border glow), Deleting (slide out)
- Shows: Food name, calorie badge, macro pills (condensed P/C/F display)

### Input Fields
- States: Default, Focus (accent glow), Error (red border, shake)
- Clean rounded corners, dark background

### Add Button
- States: Default, Hover (glow + scale), Active (pressed), Disabled (greyed)

### Delete Button
- States: Default (subtle), Hover (red background)

## Technical Approach

- Vanilla HTML/CSS/JavaScript
- localStorage for persistence with key `calorie_tracker_data`
- Data structure: `{ goal: number, entries: [{ id, name, calories, protein, carbs, fat, timestamp }], date: string }`
- Date check on load to reset entries for new day while preserving goal
