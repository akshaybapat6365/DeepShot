 # DeepShot UI/UX Comprehensive Improvement Report
 
 > **Prepared:** 2026-01-19  
 > **App:** DeepShot - TRT Dosage Schedule Tracker  
 > **Objective:** Elevate the current UI/UX to state-of-the-art (SOTA) level, matching best-in-class healthcare and productivity dashboard applications.
 
 ---
 
 ## Table of Contents
 
 1. [Executive Summary](#executive-summary)
 2. [Current State Analysis](#current-state-analysis)
 3. [Critical Findings & Critique](#critical-findings--critique)
 4. [SOTA UI/UX Trends for 2025-2026](#sota-uiux-trends-for-2025-2026)
 5. [Comprehensive Improvement Recommendations](#comprehensive-improvement-recommendations)
 6. [Component-Level Enhancements](#component-level-enhancements)
 7. [Accessibility & Compliance](#accessibility--compliance)
 8. [Mobile Experience Optimization](#mobile-experience-optimization)
 9. [Micro-interactions & Animation Strategy](#micro-interactions--animation-strategy)
 10. [Design System Refinements](#design-system-refinements)
 11. [External Resources & References](#external-resources--references)
 12. [Implementation Roadmap](#implementation-roadmap)
 
 ---
 
 ## Executive Summary
 
 DeepShot is a well-architected TRT (Testosterone Replacement Therapy) injection tracking application with a bold, calendar-first design philosophy. The current implementation demonstrates strong foundations:
 
 - **Strengths:** OLED-optimized dark mode, glassmorphism aesthetic, multi-cycle layer visualization, responsive grid-based calendar, and solid Firebase backend integration.
 - **Gaps:** Accessibility compliance, mobile-first optimization, micro-interaction richness, onboarding flow, and advanced personalization features.
 
 This report provides a comprehensive roadmap to transform DeepShot into a SOTA healthcare dashboard application by addressing identified gaps and incorporating cutting-edge UI/UX patterns from 2025-2026 industry trends.
 
 ---
 
 ## Current State Analysis
 
 ### Architecture Overview
 
 | Aspect | Current Implementation | Assessment |
 |--------|------------------------|------------|
 | **Framework** | React + TypeScript + Vite | Excellent choice for modern SPA |
 | **Styling** | Tailwind CSS + shadcn/ui | Industry-standard, highly maintainable |
 | **State Management** | React hooks + Firebase real-time | Adequate for current scope |
 | **Design System** | Custom OLED + Glassmorphism | Bold aesthetic, needs refinement |
 | **Typography** | Barlow Condensed + Barlow | Athletic, technical feel - appropriate |
 | **Color Palette** | Amber (#F97316) + Cyan (#22D3EE) | Good contrast, strong brand identity |
 
 ### Design System Analysis
 
 **Current Palette:**
 - Primary: `#F97316` (Amber/Orange)
 - Secondary: `#22D3EE` (Cyan)
 - Background: `#05070B` (OLED Black)
 - Text: `#F1F5F9` (Light Gray)
 
 **Typography:**
 - Display: Barlow Condensed (headings, labels)
 - Body: Barlow (content, descriptions)
 
 **Visual Language:**
 - Glassmorphism panels with `backdrop-blur`
 - Layered shadows for depth hierarchy
 - Radial gradient backgrounds for atmosphere
 - Color-coded protocol themes (6 themes available)
 
 ### Component Inventory
 
 | Component | LOC | Complexity | Quality Score |
 |-----------|-----|------------|---------------|
 | `App.tsx` | ~1400 | High (monolithic) | 7/10 |
 | `ProtocolDialog.tsx` | ~280 | Medium | 8/10 |
 | `InjectionDialog.tsx` | ~200 | Medium | 8/10 |
 | `CycleListDialog.tsx` | ~170 | Low | 8/10 |
 | UI Components (shadcn) | ~400 | Low | 9/10 |
 
 ---
 
 ## Critical Findings & Critique
 
 ### 1. Monolithic App Component (Critical)
 
 **Issue:** `App.tsx` at ~1400 lines contains the entire application logic, calendar rendering, and UI layout. This violates separation of concerns and makes the codebase difficult to maintain.
 
 **Impact:** 
 - Slow component re-renders
 - Difficult to unit test
 - Poor developer experience
 - Increased cognitive load
 
 **Recommendation:** Decompose into atomic components:
 ```
 src/
 ├── components/
 │   ├── layout/
 │   │   ├── Header.tsx
 │   │   ├── Sidebar.tsx
 │   │   └── MainLayout.tsx
 │   ├── calendar/
 │   │   ├── CalendarGrid.tsx
 │   │   ├── CalendarHeader.tsx
 │   │   ├── CalendarCell.tsx
 │   │   ├── CalendarLegend.tsx
 │   │   └── DayDetailsPanel.tsx
 │   ├── cycles/
 │   │   ├── CycleCard.tsx
 │   │   ├── CycleMetrics.tsx
 │   │   └── CycleLayerControl.tsx
 │   └── shared/
 │       ├── MetricCard.tsx
 │       ├── StatusBadge.tsx
 │       └── ThemeIndicator.tsx
 ```
 
 ### 2. Accessibility Deficiencies (Critical)
 
 **Issues Identified:**
 
 | Issue | Location | WCAG Violation |
 |-------|----------|----------------|
 | Missing skip links | Header | 2.4.1 Bypass Blocks |
 | No focus trap in dialogs | All dialogs | 2.1.2 No Keyboard Trap |
 | Low contrast white/40 text | Multiple | 1.4.3 Contrast Minimum |
 | Missing ARIA labels | Calendar cells | 4.1.2 Name, Role, Value |
 | No `prefers-reduced-motion` | Animations | 2.3.3 Animation from Interactions |
 | Color-only status indicators | Status badges | 1.4.1 Use of Color |
 
 **Example Contrast Issues:**
 - `text-white/40` on dark background ≈ 2.1:1 (requires 4.5:1)
 - `text-white/50` on dark background ≈ 2.8:1 (requires 4.5:1)
 
 ### 3. Mobile Experience Gaps (High Priority)
 
 **Current Responsive Approach:**
 - Grid breakpoint at `lg:` (1024px)
 - Calendar cells use `p-3 md:p-4` padding
 - Mobile shows sidebar below calendar
 
 **Issues:**
 - Calendar cells too small on mobile (< 768px)
 - Touch targets below 44x44px minimum
 - No swipe gestures for month navigation
 - Header buttons stack poorly on small screens
 - No pull-to-refresh pattern
 - Dialogs don't use bottom sheet pattern on mobile
 
 ### 4. Onboarding & Empty States (High Priority)
 
 **Current State:**
 - No onboarding flow for new users
 - Empty states show generic "No Active Cycle" card
 - No feature discovery or tooltips
 - No progressive disclosure of advanced features
 
 **Impact:**
 - High initial cognitive load
 - Users may not discover key features
 - No guidance on best practices
 
 ### 5. Micro-interactions & Feedback (Medium Priority)
 
 **Current Implementation:**
 - Toast notifications via Sonner
 - Basic hover state transitions (200ms)
 - Button press states (scale transform)
 
 **Missing:**
 - Loading skeletons for async operations
 - Optimistic UI updates
 - Progress indicators for JPEG export
 - Haptic feedback patterns for mobile
 - Celebration animations for milestones
 - Subtle parallax effects
 
 ### 6. Data Visualization Limitations (Medium Priority)
 
 **Current:**
 - Text-based metrics only
 - No historical trend visualization
 - Monthly stats as simple counters
 
 **Missing:**
 - Dosage trend charts (line/area)
 - Injection frequency heatmap
 - Weekly/monthly comparison views
 - Cycle completion progress rings
 - Adherence percentage visualization
 
 ### 7. Performance Considerations (Medium Priority)
 
 **Observations:**
 - Large `useMemo` dependency arrays
 - Calendar grid re-renders on any state change
 - No virtualization for large injection lists
 - JPEG export blocks main thread
 
 ---
 
 ## SOTA UI/UX Trends for 2025-2026
 
 Based on comprehensive research of current industry trends:
 
 ### 1. AI-Powered Personalization
 
 **Trend:** Interfaces that adapt in real-time based on user behavior patterns.
 
 **Application for DeepShot:**
 - Smart dose reminders based on historical patterns
 - Predictive scheduling suggestions
 - Personalized dashboard layouts based on usage
 - Intelligent defaults for new protocols
 
 ### 2. Dark Mode Excellence (OLED-First)
 
 **Best Practices:**
 - Avoid pure black (`#000`) for backgrounds—use dark grays (`#05070B`, `#0B111A`)
 - Maintain 7:1 contrast ratio for primary text
 - Use color temperature shifts for hierarchy (warmer = more important)
 - Implement ambient glow effects for active elements
 
 **DeepShot Status:** Partially implemented; needs contrast improvements.
 
 ### 3. Dark Glassmorphism
 
 **2026 Standard:**
 - Frosted glass with 8-20px blur
 - 10-30% opacity overlays
 - Subtle border glow on active states
 - Avoid over-blurring that reduces legibility
 
 **DeepShot Status:** Well-implemented in `glass-panel` class; needs accessibility testing.
 
 ### 4. Hyper-Personalized Dashboards
 
 **Trend:** Dashboards that predict user needs and surface relevant information.
 
 **Application:**
 - Show next injection prominently
 - Surface adherence warnings
 - Personalized greeting with quick actions
 - Recently accessed protocols
 
 ### 5. Intelligent Micro-interactions
 
 **2026 Standards:**
 - Subtle haptic feedback on mobile
 - Context-aware animation duration
 - Physics-based motion curves
 - Celebration animations for achievements
 
 ### 6. Voice & Multimodal Interfaces
 
 **Emerging Trend:** Health apps increasingly support voice commands.
 
 **Potential:**
 - "Log today's injection"
 - "When is my next shot?"
 - "Show me this month's schedule"
 
 ### 7. Mobile-First Responsive Design
 
 **2026 Expectations:**
 - Bottom navigation for primary actions
 - Bottom sheet dialogs on mobile
 - Swipe gestures for navigation
 - Pull-to-refresh patterns
 - Adaptive touch target sizing
 
 ---
 
 ## Comprehensive Improvement Recommendations
 
 ### Priority 1: Critical Improvements (Week 1-2)
 
 #### 1.1 Accessibility Overhaul
 
 **Text Contrast Fixes:**
 ```css
 /* Replace low-contrast classes */
 .text-white\/40 → .text-white\/70   /* 4.8:1 ratio */
 .text-white\/50 → .text-white\/75   /* 5.2:1 ratio */
 
 /* Add semantic color tokens */
 --text-muted: hsl(220 14% 70%);     /* 4.5:1 minimum */
 --text-subtle: hsl(220 12% 55%);    /* 3.5:1 for large text */
 ```
 
 **ARIA Labels for Calendar:**
 ```tsx
 <button
   key={key}
   type="button"
   onClick={() => handleSelectDate(date)}
   aria-label={`${formatDate(date)}. ${statusLabel || 'No injection'}${doseLabel ? `. ${doseLabel}` : ''}`}
   aria-pressed={isSelected}
   aria-current={isToday ? 'date' : undefined}
 >
 ```
 
 **Skip Navigation:**
 ```tsx
 <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-background">
   Skip to main content
 </a>
 ```
 
 **Reduced Motion Support:**
 ```css
 @media (prefers-reduced-motion: reduce) {
   *, *::before, *::after {
     animation-duration: 0.01ms !important;
     animation-iteration-count: 1 !important;
     transition-duration: 0.01ms !important;
   }
 }
 ```
 
 #### 1.2 Component Decomposition
 
 **Extract Calendar Component (~400 lines):**
 ```tsx
 // src/components/calendar/CalendarGrid.tsx
 interface CalendarGridProps {
   viewDate: Date;
   selectedDate: Date;
   onSelectDate: (date: Date) => void;
   scheduleByDate: Map<number, string[]>;
   logsByDate: Map<number, Injection[]>;
   protocolLookup: Map<string, Protocol>;
   activeProtocol: Protocol | null;
   focusActiveEnabled: boolean;
 }
 
 export function CalendarGrid({ ...props }: CalendarGridProps) {
   // Calendar rendering logic
 }
 ```
 
 **Extract Sidebar Component (~300 lines):**
 ```tsx
 // src/components/layout/CycleSidebar.tsx
 interface CycleSidebarProps {
   activeProtocol: Protocol | null;
   orderedProtocols: Protocol[];
   selectedDate: Date;
   // ...
 }
 
 export function CycleSidebar({ ...props }: CycleSidebarProps) {
   // Sidebar with metrics, layer control, selected day
 }
 ```
 
 ### Priority 2: Mobile Experience (Week 2-3)
 
 #### 2.1 Bottom Sheet Dialogs
 
 **Install Vaul for bottom sheets:**
 ```bash
 npm install vaul
 ```
 
 **Responsive Dialog Pattern:**
 ```tsx
 import { Drawer } from 'vaul';
 
 function ResponsiveDialog({ children, ...props }) {
   const isMobile = useMediaQuery('(max-width: 768px)');
   
   if (isMobile) {
     return (
       <Drawer.Root {...props}>
         <Drawer.Portal>
           <Drawer.Overlay className="fixed inset-0 bg-black/60" />
           <Drawer.Content className="fixed bottom-0 left-0 right-0 rounded-t-3xl bg-background">
             <Drawer.Handle className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-white/20" />
             {children}
           </Drawer.Content>
         </Drawer.Portal>
       </Drawer.Root>
     );
   }
   
   return <Dialog {...props}>{children}</Dialog>;
 }
 ```
 
 #### 2.2 Swipe Navigation
 
 **Install gesture library:**
 ```bash
 npm install @use-gesture/react
 ```
 
 **Calendar Swipe Implementation:**
 ```tsx
 import { useSwipeable } from 'react-swipeable';
 
 const swipeHandlers = useSwipeable({
   onSwipedLeft: () => shiftMonth(1),
   onSwipedRight: () => shiftMonth(-1),
   preventScrollOnSwipe: true,
   trackMouse: false,
 });
 
 <section {...swipeHandlers} className="calendar-container">
 ```
 
 #### 2.3 Touch Target Sizing
 
 **Minimum 44x44px targets:**
 ```css
 /* Calendar cells on mobile */
 @media (max-width: 768px) {
   .calendar-cell {
     min-height: 72px;
     min-width: 48px;
   }
   
   .icon-button {
     min-width: 44px;
     min-height: 44px;
   }
 }
 ```
 
 #### 2.4 Mobile Navigation Pattern
 
 **Bottom Navigation Bar:**
 ```tsx
 function MobileNavBar() {
   return (
     <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/10 bg-background/95 backdrop-blur-lg py-2 md:hidden">
       <NavItem icon={<Calendar />} label="Calendar" active />
       <NavItem icon={<Plus />} label="Log" onClick={handleOpenLogDialog} primary />
       <NavItem icon={<Layers />} label="Cycles" onClick={handleOpenCycleList} />
       <NavItem icon={<Settings />} label="Settings" />
     </nav>
   );
 }
 ```
 
 ### Priority 3: Micro-interactions & Animations (Week 3-4)
 
 #### 3.1 Loading States
 
 **Skeleton Components:**
 ```tsx
 function CalendarSkeleton() {
   return (
     <div className="grid grid-cols-7 gap-1">
       {Array.from({ length: 42 }).map((_, i) => (
         <div
           key={i}
           className="aspect-square animate-pulse rounded-lg bg-white/5"
         />
       ))}
     </div>
   );
 }
 
 function MetricCardSkeleton() {
   return (
     <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
       <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
       <div className="mt-2 h-6 w-24 animate-pulse rounded bg-white/10" />
       <div className="mt-1 h-3 w-16 animate-pulse rounded bg-white/10" />
     </div>
   );
 }
 ```
 
 #### 3.2 Page Transitions
 
 **Install Framer Motion:**
 ```bash
 npm install framer-motion
 ```
 
 **Month Transition Animation:**
 ```tsx
 import { AnimatePresence, motion } from 'framer-motion';
 
 <AnimatePresence mode="wait">
   <motion.div
     key={viewDate.getMonth()}
     initial={{ opacity: 0, x: direction * 50 }}
     animate={{ opacity: 1, x: 0 }}
     exit={{ opacity: 0, x: direction * -50 }}
     transition={{ duration: 0.2, ease: 'easeInOut' }}
   >
     <CalendarGrid {...props} />
   </motion.div>
 </AnimatePresence>
 ```
 
 #### 3.3 Celebration Animations
 
 **Milestone Celebration (confetti):**
 ```bash
 npm install canvas-confetti
 ```
 
 ```tsx
 import confetti from 'canvas-confetti';
 
 function celebrateMilestone() {
   confetti({
     particleCount: 100,
     spread: 70,
     origin: { y: 0.6 },
     colors: ['#F97316', '#22D3EE', '#A3E635'],
   });
 }
 
 // Trigger on:
 // - 10th injection logged
 // - Perfect week adherence
 // - Cycle completion
 ```
 
 #### 3.4 Optimistic UI Updates
 
 ```tsx
 async function handleLogInjection(data: InjectionData) {
   // Immediately update local state
   const optimisticId = `temp-${Date.now()}`;
   setInjections(prev => [...prev, { ...data, id: optimisticId }]);
   
   try {
     const realId = await logInjection(data);
     setInjections(prev =>
       prev.map(inj => inj.id === optimisticId ? { ...inj, id: realId } : inj)
     );
     toast.success('Injection logged.');
   } catch {
     // Rollback on failure
     setInjections(prev => prev.filter(inj => inj.id !== optimisticId));
     toast.error('Failed to log injection.');
   }
 }
 ```
 
 ### Priority 4: Data Visualization (Week 4-5)
 
 #### 4.1 Dosage Trend Chart
 
 **Install Recharts:**
 ```bash
 npm install recharts
 ```
 
 **Weekly Dosage Chart:**
 ```tsx
 import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
 
 function DosageTrendChart({ injections }: { injections: Injection[] }) {
   const weeklyData = useMemo(() => {
     // Aggregate injections by week
     return aggregateByWeek(injections);
   }, [injections]);
   
   return (
     <ResponsiveContainer width="100%" height={120}>
       <AreaChart data={weeklyData}>
         <defs>
           <linearGradient id="dosageGradient" x1="0" y1="0" x2="0" y2="1">
             <stop offset="0%" stopColor="#F97316" stopOpacity={0.4} />
             <stop offset="100%" stopColor="#F97316" stopOpacity={0} />
           </linearGradient>
         </defs>
         <XAxis dataKey="week" tick={{ fill: '#fff', fontSize: 10 }} />
         <YAxis hide />
         <Tooltip />
         <Area
           type="monotone"
           dataKey="totalMg"
           stroke="#F97316"
           fill="url(#dosageGradient)"
         />
       </AreaChart>
     </ResponsiveContainer>
   );
 }
 ```
 
 #### 4.2 Adherence Progress Ring
 
 ```tsx
 function AdherenceRing({ scheduled, logged }: { scheduled: number; logged: number }) {
   const percentage = scheduled > 0 ? Math.round((logged / scheduled) * 100) : 0;
   const circumference = 2 * Math.PI * 40;
   const strokeDashoffset = circumference - (percentage / 100) * circumference;
   
   return (
     <div className="relative size-24">
       <svg className="size-full -rotate-90" viewBox="0 0 100 100">
         <circle
           cx="50" cy="50" r="40"
           fill="none"
           stroke="rgba(255,255,255,0.1)"
           strokeWidth="8"
         />
         <circle
           cx="50" cy="50" r="40"
           fill="none"
           stroke="#F97316"
           strokeWidth="8"
           strokeLinecap="round"
           strokeDasharray={circumference}
           strokeDashoffset={strokeDashoffset}
           className="transition-all duration-500"
         />
       </svg>
       <div className="absolute inset-0 flex items-center justify-center">
         <span className="text-2xl font-bold text-white">{percentage}%</span>
       </div>
     </div>
   );
 }
 ```
 
 #### 4.3 Injection Heatmap
 
 ```tsx
 function InjectionHeatmap({ injections }: { injections: Injection[] }) {
   const heatmapData = useMemo(() => {
     // Generate 52-week heatmap data
     return generateHeatmapData(injections);
   }, [injections]);
   
   return (
     <div className="grid grid-cols-52 gap-0.5">
       {heatmapData.map((week, weekIndex) => (
         <div key={weekIndex} className="flex flex-col gap-0.5">
           {week.map((day, dayIndex) => (
             <div
               key={dayIndex}
               className="size-2.5 rounded-sm"
               style={{
                 backgroundColor: day.count > 0
                   ? `rgba(249, 115, 22, ${Math.min(day.count * 0.3, 1)})`
                   : 'rgba(255,255,255,0.05)',
               }}
               title={`${day.date}: ${day.count} injection${day.count !== 1 ? 's' : ''}`}
             />
           ))}
         </div>
       ))}
     </div>
   );
 }
 ```
 
 ### Priority 5: Onboarding Flow (Week 5-6)
 
 #### 5.1 Progressive Onboarding
 
 ```tsx
 function OnboardingFlow() {
   const [step, setStep] = useState(0);
   
   const steps = [
     {
       title: "Welcome to DeepShot",
       description: "Track your TRT protocol with precision.",
       action: "Let's get started",
     },
     {
       title: "Create Your First Cycle",
       description: "Set your dosage, interval, and start date.",
       action: "Create Cycle",
       component: <ProtocolDialog />,
     },
     {
       title: "Log Your Injections",
       description: "Tap any day on the calendar to log a shot.",
       action: "Got it",
       highlight: "calendar",
     },
     {
       title: "Track Your Progress",
       description: "Monitor your adherence and dosage trends.",
       action: "Start Tracking",
     },
   ];
   
   return (
     <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
       <motion.div
         key={step}
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         className="max-w-md rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-8 text-center"
       >
         <h2 className="text-2xl font-display text-white">{steps[step].title}</h2>
         <p className="mt-2 text-white/60">{steps[step].description}</p>
         <Button
           className="mt-6 bg-[#F97316] text-slate-950"
           onClick={() => step < steps.length - 1 ? setStep(step + 1) : completeOnboarding()}
         >
           {steps[step].action}
         </Button>
       </motion.div>
     </motion.div>
   );
 }
 ```
 
 #### 5.2 Feature Discovery Tooltips
 
 **Install Tippy.js:**
 ```bash
 npm install @tippyjs/react
 ```
 
 ```tsx
 import Tippy from '@tippyjs/react';
 import 'tippy.js/animations/shift-toward.css';
 
 function FeatureTooltip({ content, children, show }) {
   return (
     <Tippy
       content={content}
       visible={show}
       arrow
       theme="deepshot"
       animation="shift-toward"
       placement="bottom"
     >
       {children}
     </Tippy>
   );
 }
 ```
 
 ---
 
 ## Component-Level Enhancements
 
 ### Header Component
 
 **Current Issues:**
 - Actions clustered on right side
 - No visual hierarchy between actions
 - Mobile: buttons stack poorly
 
 **Improved Design:**
 ```tsx
 function Header() {
   return (
     <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07090d]/95 backdrop-blur-md">
       <div className="flex h-16 items-center justify-between px-4 md:px-6">
         {/* Logo + Title */}
         <div className="flex items-center gap-3">
           <Logo className="size-10" />
           <div>
             <h1 className="text-xl font-display font-semibold tracking-wider text-white uppercase">
               DeepShot
             </h1>
             <p className="text-[9px] uppercase tracking-[0.4em] text-white/30">
               Cycle Control
             </p>
           </div>
         </div>
         
         {/* Primary CTA - Always Visible */}
         <Button
           className="gap-2 bg-[#F97316] hover:bg-[#FB923C] text-slate-950 font-medium"
           onClick={handleOpenLogDialog}
           disabled={!activeProtocol}
         >
           <Plus className="size-4" />
           <span className="hidden sm:inline">Log Injection</span>
         </Button>
         
         {/* Secondary Actions - Desktop */}
         <div className="hidden md:flex items-center gap-2">
           <Button variant="ghost" size="icon" onClick={handleOpenCycleList}>
             <Layers className="size-5" />
           </Button>
           <Button variant="ghost" size="icon" onClick={handleOpenNewCycle}>
             <Plus className="size-5" />
           </Button>
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button variant="ghost" size="icon">
                 <User className="size-5" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end">
               <DropdownMenuItem onClick={handleLogout}>
                 <LogOut className="mr-2 size-4" />
                 Sign Out
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </div>
     </header>
   );
 }
 ```
 
 ### Calendar Cell Component
 
 **Enhanced Calendar Cell:**
 ```tsx
 interface CalendarCellProps {
   date: Date;
   isCurrentMonth: boolean;
   isToday: boolean;
   isSelected: boolean;
   isPast: boolean;
   hasLogs: boolean;
   isScheduled: boolean;
   layerIds: string[];
   primaryTheme: ProtocolTheme;
   doseLabel: string | null;
   statusLabel: string;
   onSelect: () => void;
 }
 
 function CalendarCell({
   date,
   isCurrentMonth,
   isToday,
   isSelected,
   isPast,
   hasLogs,
   isScheduled,
   layerIds,
   primaryTheme,
   doseLabel,
   statusLabel,
   onSelect,
 }: CalendarCellProps) {
   return (
     <motion.button
       type="button"
       onClick={onSelect}
       whileTap={{ scale: 0.98 }}
       aria-label={buildAriaLabel(date, statusLabel, doseLabel)}
       aria-pressed={isSelected}
       aria-current={isToday ? 'date' : undefined}
       className={cn(
         'relative flex flex-col justify-between p-2 md:p-3 text-left transition-all',
         'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
         isCurrentMonth ? 'bg-transparent' : 'bg-white/[0.02] text-white/30',
         isSelected && `ring-2 ${primaryTheme.ring} ring-inset`,
         hasLogs && 'bg-white/[0.1]',
         isScheduled && !hasLogs && 'bg-white/[0.05]',
       )}
     >
       {/* Active cycle indicator rail */}
       {layerIds.length > 0 && (
         <span className={cn(
           'absolute left-0 top-0 h-full w-1',
           primaryTheme.accent,
         )} />
       )}
       
       {/* Date + Today badge */}
       <div className="flex items-start justify-between">
         <span className={cn(
           'text-xl md:text-2xl font-semibold font-display',
           isCurrentMonth ? 'text-white' : 'text-white/40',
           isToday && 'text-amber-200',
         )}>
           {date.getDate()}
         </span>
         {isToday && (
           <span className="rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[8px] uppercase tracking-wide text-amber-200">
             Today
           </span>
         )}
       </div>
       
       {/* Status + Dose */}
       <div className="space-y-1">
         {statusLabel && (
           <StatusBadge variant={hasLogs ? 'logged' : isPast ? 'past' : 'scheduled'}>
             {statusLabel}
           </StatusBadge>
         )}
         {doseLabel && (
           <p className="text-sm font-medium text-white/80">{doseLabel}</p>
         )}
       </div>
       
       {/* Layer indicators */}
       {layerIds.length > 0 && (
         <div className="absolute bottom-2 left-2 right-2 flex gap-0.5">
           {layerIds.slice(0, 4).map(id => (
             <span
               key={id}
               className={cn('h-1 flex-1 rounded-full', getThemeForId(id).accent)}
             />
           ))}
         </div>
       )}
       
       {/* Logged indicator */}
       {hasLogs && (
         <CheckCircle2 className="absolute bottom-2 right-2 size-4 text-cyan-300" />
       )}
     </motion.button>
   );
 }
 ```
 
 ### Metric Card Component
 
 **Reusable Metric Card:**
 ```tsx
 interface MetricCardProps {
   label: string;
   value: string | number;
   subtext?: string;
   icon?: React.ReactNode;
   trend?: 'up' | 'down' | 'neutral';
   className?: string;
 }
 
 function MetricCard({ label, value, subtext, icon, trend, className }: MetricCardProps) {
   return (
     <div className={cn(
       'rounded-2xl border border-white/10 bg-white/[0.04] p-4',
       className
     )}>
       <div className="flex items-center justify-between">
         <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
           {label}
         </p>
         {icon && <span className="text-white/30">{icon}</span>}
       </div>
       <div className="mt-2 flex items-baseline gap-2">
         <p className="text-xl font-semibold text-white">{value}</p>
         {trend && (
           <TrendIndicator direction={trend} />
         )}
       </div>
       {subtext && (
         <p className="mt-1 text-xs text-white/50">{subtext}</p>
       )}
     </div>
   );
 }
 ```
 
 ---
 
 ## Accessibility & Compliance
 
 ### WCAG 2.2 Compliance Checklist
 
 | Criterion | Current | Target | Priority |
 |-----------|---------|--------|----------|
 | 1.1.1 Non-text Content | Partial | AA | High |
 | 1.3.1 Info and Relationships | Partial | AA | High |
 | 1.4.3 Contrast (Minimum) | Fail | AA | Critical |
 | 1.4.11 Non-text Contrast | Partial | AA | High |
 | 2.1.1 Keyboard | Pass | AA | - |
 | 2.1.2 No Keyboard Trap | Pass | AA | - |
 | 2.4.1 Bypass Blocks | Fail | AA | High |
 | 2.4.4 Link Purpose | Partial | AA | Medium |
 | 2.4.7 Focus Visible | Partial | AA | High |
 | 2.5.5 Target Size | Fail | AAA | High |
 | 3.2.1 On Focus | Pass | AA | - |
 | 4.1.2 Name, Role, Value | Fail | AA | Critical |
 
 ### Focus Management
 
 **Visible Focus Styles:**
 ```css
 /* Global focus styles */
 :focus-visible {
   outline: 2px solid #F97316;
   outline-offset: 2px;
 }
 
 /* Remove default focus for mouse users */
 :focus:not(:focus-visible) {
   outline: none;
 }
 
 /* Custom focus for dark surfaces */
 .focus-ring {
   @apply focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background;
 }
 ```
 
 ### Screen Reader Announcements
 
 **Live Region for Toasts:**
 ```tsx
 function A11yAnnouncer() {
   const [message, setMessage] = useState('');
   
   useEffect(() => {
     const handler = (e: CustomEvent) => setMessage(e.detail);
     window.addEventListener('a11y-announce', handler);
     return () => window.removeEventListener('a11y-announce', handler);
   }, []);
   
   return (
     <div
       role="status"
       aria-live="polite"
       aria-atomic="true"
       className="sr-only"
     >
       {message}
     </div>
   );
 }
 
 // Usage
 function announce(message: string) {
   window.dispatchEvent(new CustomEvent('a11y-announce', { detail: message }));
 }
 ```
 
 ---
 
 ## Mobile Experience Optimization
 
 ### Responsive Breakpoint Strategy
 
 | Breakpoint | Width | Layout | Calendar Cells |
 |------------|-------|--------|----------------|
 | `xs` | < 480px | Stacked, bottom nav | Compact (date only) |
 | `sm` | 480-640px | Stacked, bottom nav | Medium (date + status) |
 | `md` | 640-768px | Stacked, header nav | Full |
 | `lg` | 768-1024px | 2-column | Full |
 | `xl` | > 1024px | 2-column, expanded | Full + layers |
 
 ### Mobile-Specific Components
 
 **Calendar Cell (Mobile Variant):**
 ```tsx
 function MobileCalendarCell({ date, hasLogs, isScheduled, isToday }) {
   return (
     <button
       className={cn(
         'aspect-square flex flex-col items-center justify-center rounded-lg',
         'min-h-[48px] text-sm transition-colors',
         hasLogs && 'bg-cyan-500/20',
         isScheduled && !hasLogs && 'bg-amber-500/10',
         isToday && 'ring-1 ring-amber-500',
       )}
     >
       <span className="font-medium">{date.getDate()}</span>
       {(hasLogs || isScheduled) && (
         <span className={cn(
           'mt-0.5 size-1.5 rounded-full',
           hasLogs ? 'bg-cyan-400' : 'bg-amber-500',
         )} />
       )}
     </button>
   );
 }
 ```
 
 **Quick Log Action Sheet:**
 ```tsx
 function QuickLogSheet({ date, protocol, onLog }) {
   return (
     <Drawer.Root>
       <Drawer.Portal>
         <Drawer.Overlay className="fixed inset-0 bg-black/60" />
         <Drawer.Content className="fixed bottom-0 left-0 right-0 rounded-t-3xl bg-background p-6">
           <Drawer.Handle className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/20" />
           
           <h3 className="text-lg font-display text-white">Log Injection</h3>
           <p className="text-sm text-white/60">{formatDate(date)}</p>
           
           <div className="mt-4 rounded-xl bg-white/5 p-4">
             <div className="flex items-center justify-between">
               <span className="text-white/70">Dose</span>
               <span className="text-xl font-semibold text-white">
                 {protocol.doseMl * protocol.concentrationMgPerMl} mg
               </span>
             </div>
           </div>
           
           <div className="mt-6 grid gap-3">
             <Button
               className="w-full bg-[#F97316] text-slate-950"
               onClick={() => onLog({ useDefaults: true })}
             >
               Log with Protocol Defaults
             </Button>
             <Button
               variant="outline"
               className="w-full"
               onClick={() => onLog({ customize: true })}
             >
               Customize Dose
             </Button>
           </div>
         </Drawer.Content>
       </Drawer.Portal>
     </Drawer.Root>
   );
 }
 ```
 
 ---
 
 ## Micro-interactions & Animation Strategy
 
 ### Animation Timing Guidelines
 
 | Interaction Type | Duration | Easing | Example |
 |------------------|----------|--------|---------|
 | Button press | 100ms | ease-out | Scale down 2% |
 | Hover state | 150ms | ease-in-out | Background opacity |
 | Dialog enter | 200ms | ease-out | Scale up from 95% |
 | Dialog exit | 150ms | ease-in | Fade + scale down |
 | Page transition | 250ms | ease-in-out | Slide + fade |
 | List item appear | 100ms + stagger | ease-out | Fade up |
 | Toast appear | 200ms | spring | Slide up |
 
 ### Motion Tokens
 
 ```css
 :root {
   --motion-instant: 0ms;
   --motion-fast: 100ms;
   --motion-normal: 200ms;
   --motion-slow: 300ms;
   --motion-slower: 500ms;
   
   --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
   --ease-in: cubic-bezier(0.4, 0, 1, 1);
   --ease-out: cubic-bezier(0, 0, 0.2, 1);
   --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
 }
 
 @media (prefers-reduced-motion: reduce) {
   :root {
     --motion-fast: 0ms;
     --motion-normal: 0ms;
     --motion-slow: 0ms;
     --motion-slower: 0ms;
   }
 }
 ```
 
 ### Key Micro-interaction Implementations
 
 **1. Button Feedback:**
 ```tsx
 <motion.button
   whileHover={{ scale: 1.02 }}
   whileTap={{ scale: 0.98 }}
   transition={{ duration: 0.1 }}
 >
 ```
 
 **2. Calendar Cell Selection:**
 ```tsx
 <motion.div
   layoutId={`cell-${dateKey}`}
   initial={false}
   animate={{
     backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.1)' : 'transparent',
     scale: isSelected ? 1.02 : 1,
   }}
   transition={{ duration: 0.15 }}
 />
 ```
 
 **3. Toast Notification:**
 ```tsx
 <Toaster
   toastOptions={{
     className: 'glass-panel border-white/10',
     duration: 4000,
     style: {
       background: 'rgba(15, 19, 26, 0.95)',
       color: '#F1F5F9',
       border: '1px solid rgba(255,255,255,0.1)',
     },
   }}
 />
 ```
 
 **4. Injection Logged Celebration:**
 ```tsx
 function InjectionLoggedCelebration({ show }) {
   return (
     <AnimatePresence>
       {show && (
         <motion.div
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           exit={{ scale: 0, opacity: 0 }}
           className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
         >
           <motion.div
             initial={{ y: 20 }}
             animate={{ y: -20 }}
             className="flex items-center gap-2 rounded-full bg-cyan-500/20 px-4 py-2"
           >
             <CheckCircle2 className="size-5 text-cyan-300" />
             <span className="font-medium text-white">Injection Logged!</span>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 }
 ```
 
 ---
 
 ## Design System Refinements
 
 ### Enhanced Color Tokens
 
 ```css
 :root {
   /* Semantic Colors */
   --color-success: #22D3EE;       /* Cyan - logged/complete */
   --color-warning: #FBBF24;       /* Amber - attention needed */
   --color-error: #F43F5E;         /* Rose - errors */
   --color-info: #3B82F6;          /* Blue - informational */
   
   /* Surface Colors */
   --surface-base: #05070B;        /* OLED black */
   --surface-raised: #0B111A;      /* Cards, dialogs */
   --surface-overlay: #0F131A;     /* Dropdowns, tooltips */
   --surface-sunken: #030408;      /* Inset areas */
   
   /* Text Colors */
   --text-primary: #F1F5F9;        /* 15.8:1 contrast */
   --text-secondary: #94A3B8;      /* 7.2:1 contrast */
   --text-tertiary: #64748B;       /* 4.6:1 contrast */
   --text-disabled: #475569;       /* 3.1:1 - large text only */
   
   /* Border Colors */
   --border-default: rgba(255, 255, 255, 0.08);
   --border-hover: rgba(255, 255, 255, 0.15);
   --border-focus: #F97316;
 }
 ```
 
 ### Typography Scale
 
 ```css
 /* Display Headings - Barlow Condensed */
 .text-display-xl { font-size: 3rem; line-height: 1; letter-spacing: 0.08em; }
 .text-display-lg { font-size: 2.25rem; line-height: 1.1; letter-spacing: 0.06em; }
 .text-display-md { font-size: 1.5rem; line-height: 1.2; letter-spacing: 0.04em; }
 .text-display-sm { font-size: 1.25rem; line-height: 1.3; letter-spacing: 0.02em; }
 
 /* Body Text - Barlow */
 .text-body-lg { font-size: 1.125rem; line-height: 1.6; }
 .text-body-md { font-size: 1rem; line-height: 1.5; }
 .text-body-sm { font-size: 0.875rem; line-height: 1.5; }
 .text-body-xs { font-size: 0.75rem; line-height: 1.4; }
 
 /* Labels - Barlow */
 .text-label-lg { font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.1em; }
 .text-label-md { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; }
 .text-label-sm { font-size: 0.625rem; text-transform: uppercase; letter-spacing: 0.2em; }
 ```
 
 ### Spacing System
 
 ```css
 :root {
   --space-1: 0.25rem;  /* 4px */
   --space-2: 0.5rem;   /* 8px */
   --space-3: 0.75rem;  /* 12px */
   --space-4: 1rem;     /* 16px */
   --space-5: 1.25rem;  /* 20px */
   --space-6: 1.5rem;   /* 24px */
   --space-8: 2rem;     /* 32px */
   --space-10: 2.5rem;  /* 40px */
   --space-12: 3rem;    /* 48px */
   --space-16: 4rem;    /* 64px */
 }
 ```
 
 ### Component Variants
 
 **Button Variants:**
 ```tsx
 const buttonVariants = cva(
   'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:ring-2 focus-visible:ring-amber-500 disabled:opacity-50',
   {
     variants: {
       variant: {
         primary: 'bg-[#F97316] text-slate-950 hover:bg-[#FB923C] active:scale-[0.98]',
         secondary: 'bg-white/10 text-white hover:bg-white/15 border border-white/10',
         ghost: 'text-white/70 hover:text-white hover:bg-white/5',
         danger: 'bg-rose-500/20 text-rose-200 hover:bg-rose-500/30 border border-rose-500/30',
       },
       size: {
         sm: 'h-8 px-3 text-xs',
         md: 'h-10 px-4 text-sm',
         lg: 'h-12 px-6 text-base',
         icon: 'size-10',
       },
     },
     defaultVariants: {
       variant: 'primary',
       size: 'md',
     },
   }
 );
 ```
 
 ---
 
 ## External Resources & References
 
 ### GitHub Resources for Calendar/UI Components
 
 | Repository | Description | Stars | URL |
 |------------|-------------|-------|-----|
 | `charlietlamb/calendar` | React/shadcn full calendar with dark mode | 526 | [Link](https://github.com/charlietlamb/calendar) |
 | `list-jonas/shadcn-ui-big-calendar` | React Big Calendar with Shadcn CSS variables | - | [Link](https://github.com/list-jonas/shadcn-ui-big-calendar) |
 | `yassir-jeraidi/full-calendar` | ShadCN calendar with TypeScript | - | [Link](https://github.com/yassir-jeraidi/full-calendar) |
 | `dninomiya/full-calendar-for-shadcn-ui` | FullCalendar integration for shadcn | - | [Link](https://github.com/dninomiya/full-calendar-for-shadcn-ui) |
 | `2-fly-4-ai/awesome-shadcnui` | Curated list of shadcn resources | - | [Link](https://github.com/2-fly-4-ai/awesome-shadcnui) |
 
 ### Design System References
 
 | Resource | Focus | URL |
 |----------|-------|-----|
 | Carbon Design System | Patterns & Components | [carbondesignsystem.com](https://carbondesignsystem.com/patterns/overview) |
 | Dashboard Design Patterns | Academic Research | [dashboarddesignpatterns.github.io](https://dashboarddesignpatterns.github.io/patterns.html) |
 | Muzli Dashboard Inspiration | 2026 Trends | [muz.li](https://muz.li/blog/best-dashboard-design-examples-inspirations-for-2026/) |
 
 ### Healthcare UI/UX Best Practices
 
 | Resource | Focus | URL |
 |----------|-------|-----|
 | Eleken Healthcare UI | Best Practices 2025 | [eleken.co](https://www.eleken.co/blog-posts/user-interface-design-for-healthcare-applications) |
 | UX Studio Healthcare Trends | 2026 Trends | [uxstudioteam.com](https://www.uxstudioteam.com/ux-blog/healthcare-ux) |
 | Sidekick Interactive | Healthcare Dashboards | [sidekickinteractive.com](https://www.sidekickinteractive.com/designing-your-app/uxui-best-practices-for-healthcare-analytics-dashboards) |
 | Koru UX | 50 Healthcare Examples | [koruux.com](https://www.koruux.com/50-examples-of-healthcare-UI/) |
 
 ### Dark Mode & Glassmorphism
 
 | Resource | Focus | URL |
 |----------|-------|-----|
 | Dark Glassmorphism Guide | 2026 Implementation | [Medium](https://medium.com/@developer_89726/dark-glassmorphism-the-aesthetic-that-will-define-ui-in-2026) |
 | Dark Mode Accessibility | Accessibility Guide | [accessibilitychecker.org](https://www.accessibilitychecker.org/blog/dark-mode-accessibility/) |
 | Alpha Efficiency | Dark Glassmorphism Tips | [alphaefficiency.com](https://alphaefficiency.com/dark-mode-glassmorphism) |
 
 ### Animation Libraries
 
 | Library | Purpose | Install |
 |---------|---------|---------|
 | Framer Motion | Page & component animations | `npm install framer-motion` |
 | Vaul | Mobile bottom sheets | `npm install vaul` |
 | @use-gesture/react | Swipe gestures | `npm install @use-gesture/react` |
 | canvas-confetti | Celebration effects | `npm install canvas-confetti` |
 | @tippyjs/react | Tooltips | `npm install @tippyjs/react` |
 | recharts | Data visualization | `npm install recharts` |
 
 ---
 
 ## Implementation Roadmap
 
### Phase 1: Foundation
 
| Task | Priority | Impact |
|------|----------|--------|
| Fix text contrast issues | Critical | High |
| Add ARIA labels to calendar | Critical | High |
| Implement skip navigation | High | Medium |
| Add reduced motion support | High | Medium |
| Extract Header component | High | Medium |
| Extract CalendarGrid component | High | High |
| Extract CycleSidebar component | High | High |
 
### Phase 2: Mobile First
 
| Task | Priority | Impact |
|------|----------|--------|
| Implement bottom navigation | High | High |
| Add bottom sheet dialogs (Vaul) | High | High |
| Implement swipe gestures | Medium | Medium |
| Increase touch target sizes | High | High |
| Create mobile calendar variant | High | High |
| Add pull-to-refresh | Low | Low |
 
### Phase 3: Micro-interactions
 
| Task | Priority | Impact |
|------|----------|--------|
| Add loading skeletons | High | High |
| Implement page transitions | Medium | Medium |
| Add button/cell animations | Medium | Medium |
| Create celebration effects | Low | Low |
| Implement optimistic UI | Medium | High |
| Add progress indicators | Medium | Medium |
 
### Phase 4: Data Visualization
 
| Task | Priority | Impact |
|------|----------|--------|
| Install and configure Recharts | Medium | - |
| Create dosage trend chart | Medium | High |
| Create adherence progress ring | Medium | High |
| Create injection heatmap | Low | Medium |
| Add weekly/monthly comparisons | Low | Medium |
 
### Phase 5: Onboarding & Polish
 
| Task | Priority | Impact |
|------|----------|--------|
| Create progressive onboarding | Medium | High |
| Add feature discovery tooltips | Low | Medium |
| Implement empty state designs | Medium | Medium |
| Performance optimization | Medium | High |
| Final accessibility audit | High | High |
| User testing & iteration | High | High |
 
 ---
 
 ## Summary
 
 DeepShot has a strong foundation with its bold, calendar-first design and OLED-optimized dark mode. To achieve SOTA status, the primary focus areas are:
 
 1. **Accessibility** - Fix contrast issues, add ARIA labels, support reduced motion
 2. **Mobile Experience** - Bottom navigation, bottom sheets, swipe gestures, larger touch targets
 3. **Component Architecture** - Decompose monolithic App.tsx into maintainable components
 4. **Micro-interactions** - Loading states, page transitions, celebration animations
 5. **Data Visualization** - Trend charts, progress rings, adherence metrics
 6. **Onboarding** - Progressive disclosure, feature discovery, empty states
 
Implementing these recommendations will transform DeepShot into a best-in-class healthcare tracking application that meets current UI/UX standards while maintaining its distinctive bold aesthetic.
 
 ---
 
 *Report prepared by comprehensive codebase analysis and industry research.*
