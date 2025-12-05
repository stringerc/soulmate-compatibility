# Data Recovery Plan & Recommendations

## 🔍 Current Issue: User Data Disappeared

### Root Causes Identified

1. **localStorage Dependency**: The app relies heavily on browser localStorage as a fallback
   - Data is lost when:
     - User clears browser data
     - User switches browsers/devices
     - User uses incognito/private mode
     - Browser storage quota is exceeded
     - localStorage expires (7-day check in code)

2. **Backend Sync Issues**: 
   - If user wasn't authenticated when completing the test, data wasn't saved to backend
   - Backend API might be unavailable or returning errors
   - Session tokens might have expired

3. **No Data Export/Backup**: Users have no way to export or backup their data

---

## 🚨 Immediate Recovery Steps

### Step 1: Check Backend for Data
1. **Verify Authentication**: Make sure you're logged in with the same email you used before
2. **Check Backend API**: The app should automatically try to load from backend first
3. **Check Browser Console**: Open DevTools (F12) → Console tab, look for errors

### Step 2: Check localStorage (if same browser/device)
1. Open Browser DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Expand **Local Storage** → `https://soulmates.syncscript.app`
4. Look for `soulmates_profile` key
5. If it exists, copy the value (it's JSON)

### Step 3: Manual Recovery (if localStorage data found)
If you find data in localStorage, we can create a recovery script to restore it.

---

## 🛠️ Recommended Fixes (Implementation Plan)

### Priority 1: Improve Data Persistence

#### 1.1 Always Save to Backend (Even if Unauthenticated)
- Create anonymous user sessions
- Save data with session ID
- Link to account when user authenticates later

#### 1.2 Add Data Export Feature
- Allow users to download their profile as JSON
- Add "Export My Data" button on dashboard
- Include all: traits, archetype, attachment style, love languages, exploration history

#### 1.3 Improve Backend Sync
- Add retry logic for failed saves
- Queue saves when offline, sync when online
- Show sync status indicator

#### 1.4 Add Data Recovery UI
- "Recover My Data" button on dashboard
- Check for orphaned data by email
- Manual data import from JSON

### Priority 2: Better Error Handling

#### 2.1 Clear Error Messages
- Show specific messages when data is missing
- Explain why (not authenticated, localStorage cleared, etc.)
- Provide actionable next steps

#### 2.2 Data Validation
- Verify data integrity on load
- Auto-repair corrupted data when possible
- Warn user if data seems incomplete

### Priority 3: User Education

#### 3.1 Onboarding Tips
- Explain that data is saved to account (if authenticated)
- Warn about localStorage limitations
- Encourage account creation for data persistence

#### 3.2 Dashboard Warnings
- Show banner if data is only in localStorage
- Prompt to "Save to Account" if not authenticated
- Remind users to export data periodically

---

## 📋 Implementation Checklist

### Immediate (This Week)
- [ ] Add "Recover My Data" feature
- [ ] Add data export functionality
- [ ] Improve error messages for missing data
- [ ] Add sync status indicator

### Short-term (Next 2 Weeks)
- [ ] Implement anonymous session storage
- [ ] Add offline queue for saves
- [ ] Create data import from JSON
- [ ] Add backup reminders

### Long-term (Next Month)
- [ ] Implement cloud backup (optional)
- [ ] Add data versioning/history
- [ ] Create admin tools for data recovery
- [ ] Add email notifications for data sync issues

---

## 🔧 Technical Implementation Details

### Data Export Feature
```typescript
// Add to dashboard
const exportData = () => {
  const data = {
    profile: profile,
    explorationHistory: getExplorationStats(),
    bonds: bonds,
    journalEntries: journalEntries,
    exportedAt: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `soulmates-data-${Date.now()}.json`;
  a.click();
};
```

### Data Recovery Feature
```typescript
// Check for orphaned data by email
const recoverData = async (email: string) => {
  // Call backend API to search for data by email
  // Even if not linked to current session
  const response = await fetch(`/api/v1/soulmates/profile/recover?email=${email}`);
  return response.json();
};
```

### Anonymous Session Storage
```typescript
// Save data with anonymous session ID
const anonymousSessionId = localStorage.getItem('anonymous_session_id') || 
  `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Save to backend with session ID
await profileApi.createOrUpdate({
  ...profileData,
  anonymous_session_id: anonymousSessionId
});

// Link to account when user authenticates
if (isAuthenticated) {
  await profileApi.linkAnonymousSession(anonymousSessionId);
}
```

---

## 📊 Success Metrics

- **Data Loss Rate**: Target < 1% of users
- **Recovery Success Rate**: Target > 80% of reported cases
- **Export Usage**: Track how many users export data
- **Backend Sync Rate**: Target > 95% successful saves

---

## 🎯 User Communication

### Email Template (if data recovery needed)
```
Subject: Recover Your Soulmate Profile Data

Hi [Name],

We noticed you're having trouble accessing your profile data. Here's how to recover it:

1. Make sure you're logged in with the same email: [email]
2. Click "Recover My Data" on your dashboard
3. If that doesn't work, reply to this email and we'll help manually

To prevent this in the future:
- Export your data regularly (Dashboard → Export My Data)
- Make sure you're logged in when completing the test
- Keep your browser data if using localStorage

Best,
Soulmates Team
```

---

## 🔐 Privacy & Security Considerations

- **Data Export**: Only export user's own data
- **Data Recovery**: Require email verification
- **Anonymous Sessions**: Auto-link to account on auth, don't expose session IDs
- **Data Retention**: Clear anonymous sessions after 90 days of inactivity

