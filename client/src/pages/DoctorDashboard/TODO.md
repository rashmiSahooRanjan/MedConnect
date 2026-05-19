# Doctor Dashboard History Fix TODO

## Approved Plan: Fix History Data Display
**Goal:** Make real data show in History section after actions (appointments, payments, etc.)

**Status:** Starting implementation ⏳

## Breakdown Steps:

### 1. **[PENDING]** Backend Setup
   - [ ] Create `server/controllers/doctorController.js` with `getDoctorHistory`
   - [ ] Add route `server/routes/doctorRoutes.js`: GET `/api/doctors/:id/history`
   - [ ] Test API: `curl http://localhost:5000/api/doctors/DEMO_ID/history`

### 2. **[PENDING]** Frontend Updates
   - [ ] Update `History.jsx`: Fetch from new `/api/doctors/:id/history`
   - [ ] Fix `PaymentHistory.jsx`, `Prescriptions.jsx`, `PatientLabReports.jsx`: Real fetches
   - [ ] Remove demo-only fallbacks where possible

### 3. **[PENDING]** Test & Verify
   - [ ] Create test appointment/payment via Patient side
   - [ ] Check History shows real data
   - [ ] Update this TODO

**Next:** Backend first → restart server → test API → frontend.

**Progress Tracking:** Updated after each step.

