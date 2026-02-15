# Google Stitch Design Prompt Template

Use this template when you want to design a new page using the Google Stitch skill. Copy this template, fill in your specific details, and submit it to get repo-compliant UI code.

---

## Step 1: Page Overview

**Page Name:** [Provide a clear, descriptive name for your page]

**Purpose/Goal:** [What is the primary purpose of this page? What should users accomplish?]

**Target Platform:**

- [ ] Web (Next.js) → `apps/web`
- [ ] Mobile (React Native) → `apps/mobile`

**Route/Path:** [e.g., `/dashboard`, `/profile`, `/settings`]

---

## Step 2: Design Description

### Visual Reference

[Upload your design image/screenshot here or describe it in detail below]

### Layout Structure

- **Header:** [Describe header content - logo, navigation, user menu, etc.]
- **Main Content Area:** [Describe the primary content sections]
- **Sidebar:** [If applicable - navigation, filters, related content]
- **Footer:** [If applicable - links, copyright, secondary nav]

### Key Components to Include

- [ ] Navigation/menu
- [ ] Cards/containers
- [ ] Forms/inputs
- [ ] Buttons/CTAs
- [ ] Tables/lists
- [ ] Charts/graphs
- [ ] Images/media
- [ ] Modals/drawers
- [ ] Other: [specify]

### Color Scheme

- **Primary:** [Main brand color]
- **Secondary:** [Accent color]
- **Background:** [Page/container backgrounds]
- **Text:** [Primary and secondary text colors]

### Typography

- **Headings:** [Font style preferences if specific]
- **Body text:** [Font style preferences if specific]
- **Special elements:** [Any special text treatments]

---

## Step 3: Functional Requirements

### Data Needs

- **Data sources:** [APIs, databases, external services]
- **Dynamic content:** [What needs to be fetched/updated?]
- **State management:** [Any complex state requirements?]

### User Interactions

- **Click actions:** [What happens when users click?]
- **Form submissions:** [Any forms to submit?]
- **Navigation:** [Links to other pages?]
- **Real-time updates:** [WebSockets, polling, etc.?]

### Responsive Behavior

- **Desktop:** [How should it look on large screens?]
- **Tablet:** [How should it adapt to medium screens?]
- **Mobile:** [How should it look on small screens?]

---

## Step 4: Repository Integration

### Standards to Follow

The generated code will be adapted to match:

- [ ] `docs/README.md` - Project overview and conventions
- [ ] Root `AGENT.md` - Global coding standards
- [ ] Workspace `AGENT.md` - App-specific standards (`apps/web/` or `apps/mobile/`)
- [ ] `.github/copilot-instructions.md` - Additional guidelines

### Component Library

- **Preferred UI library:** [e.g., Shadcn/ui, Material-UI, etc.]
- **Existing components to use:** [List any specific components from the repo]
- **Design tokens:** [Should use existing colors, spacing, etc.]

### Backend Constraints

- **API contracts:** [Any specific API requirements or constraints?]
- **Authentication:** [Protected route? User permissions?]
- **Data boundaries:** [Any backend authority rules to respect?]

---

## Step 5: Additional Context

### Similar Pages/References

- [Link to existing pages in the app that have similar patterns]
- [Any external examples or inspiration]

### Special Considerations

- **Accessibility:** [Any specific a11y requirements?]
- **Performance:** [Any performance constraints or goals?]
- **SEO:** [Any SEO requirements for this page?]

### Open Questions

[Anything you're unsure about or need guidance on?]

---

## Workflow Summary (What Happens Next)

When you submit this prompt:

1. **Skills Loading:** Google Stitch skill will be loaded, plus target-specific skills (Next.js or React Native)
2. **Standards Resolution:** The system will read your repository's documentation and standards
3. **Stitch Generation:** Your design will be converted to baseline code via Google Stitch
4. **Adaptation:** The baseline code will be adapted to match your repository's:
   - Architecture and folder structure
   - Styling conventions and design tokens
   - Component patterns and naming
   - Backend API contracts
5. **Delivery:** You'll receive:
   - The generated files with locations
   - Notes on standards applied
   - Any deviations from the original design (if necessary for compliance)
   - Follow-up items for refinement

---

## Example Submission

Here's a filled-out example:

```
## Step 1: Page Overview
**Page Name:** User Dashboard
**Purpose:** Provide users with an overview of their account activity, recent orders, and quick actions
**Target Platform:** Web (Next.js) → apps/web
**Route:** /dashboard

## Step 2: Design Description
[Upload screenshot of dashboard mockup]

**Layout Structure:**
- Header: Logo, search bar, user avatar with dropdown
- Sidebar: Navigation links (Dashboard, Orders, Settings, Help)
- Main Content: Welcome banner, stats cards (4 columns), recent orders table, quick action buttons
- Footer: Minimal footer with copyright

**Key Components:**
- [x] Navigation/menu
- [x] Cards/containers (stats cards)
- [x] Tables/lists (orders table)
- [x] Buttons/CTAs (quick actions)

**Color Scheme:**
- Primary: Blue (#3B82F6)
- Secondary: Gray (#6B7280)
- Background: White (#FFFFFF) / Light gray (#F3F4F6)
- Text: Dark gray (#111827) / Medium gray (#6B7280)

## Step 3: Functional Requirements
**Data Needs:**
- Fetch user stats from /api/user/stats
- Fetch recent orders from /api/orders?limit=5
- Real-time order status updates via WebSocket

**User Interactions:**
- Click on order row → navigate to /orders/[id]
- Click quick action buttons → open modals or navigate
- User menu dropdown → profile, settings, logout

**Responsive Behavior:**
- Desktop: Full layout with sidebar
- Tablet: Collapsible sidebar, 2-column stats
- Mobile: Hidden sidebar (hamburger menu), stacked stats, cards instead of table

## Step 4: Repository Integration
**Standards:** Follow existing Next.js conventions in apps/web/AGENT.md
**Component Library:** Use existing Card, Button, and Table components from @/components
**Backend:** Protected route, requires authentication

## Step 5: Additional Context
**Similar Pages:** Reference the /admin/dashboard page for layout patterns
**Accessibility:** Ensure keyboard navigation for sidebar and table
```

---

**Ready?** Fill out the sections above and submit your request!
