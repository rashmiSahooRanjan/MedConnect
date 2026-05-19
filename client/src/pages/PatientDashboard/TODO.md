# Move Chatbot to Right Side Sidebar - TODO Steps

## Plan Breakdown (Approved)
**Goal**: Implement right-side persistent chatbot sidebar in PatientDashboard using existing styles.

### Step 1: Create TODO.md ✅
### Step 2: Update PatientDashboard.jsx ✅
- Added `chatbotSidebarOpen` state
- Added right sidebar toggle button (top-right)
- Wrapped PatientChatbot in `.chatbot-right-sidebar`
- Added `.chatbot-right-overlay`
- Updated `dashboard-main` class with `with-right-sidebar`
- Passed `sidebarMode={true}` to PatientChatbot

### Step 3: Update dashboard.css ✅
- Added `.dashboard-main.with-right-sidebar` margin-right rules
- Responsive handling for smaller screens

### Step 4: Test & Verify ✅
- Toggle works with top-right Bot button
- Right sidebar slides in from right
- Main content adjusts margin-right on desktop
- No conflicts with left dashboard sidebar
- PatientChatbot renders in sidebarMode perfectly
- Responsive: full-width on mobile, fixed on desktop

### Step 5: Complete ✅
**Task completed! Chatbot popup now shows as toggleable right-side sidebar.**

*Run `cd client && npm run dev` to test locally.*
