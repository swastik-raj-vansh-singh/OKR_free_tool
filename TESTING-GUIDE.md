# OKR System Testing Guide

## Overview
This guide helps you verify that the entire OKR generation and team invitation flow is working correctly after the recent fixes.

## What Was Fixed

### Flow 4 (Save OKRs) - COMPLETED ✅
- **Issue**: Only saved to `okr_generations` table, not `users` table
- **Fix**: Updated to insert into BOTH tables with `ON CONFLICT` handling
- **Added fields**: `user_email`, `user_name`, `user_role`
- **Result**: Leader now properly created in `users` table when saving OKRs

### Flow 5 (Invite Team) - READY FOR TESTING ⏳
- **Issue**: FK constraint violation because leader didn't exist in `users` table
- **Fix**: Now works because Flow 4 creates leader first
- **Other fixes**:
  - Changed schema from `objectives: [string]` to `objectives: string`
  - Added `https://` protocol to website URLs
  - Enhanced response parsing with robust `extractArray()` function

### Frontend Updates - COMPLETED ✅
- Proper UUID v4 generation with `crypto.randomUUID()`
- Added user fields to Flow 4 payload
- Stringified objectives for Flow 5
- Protocol handling for website URLs
- Comprehensive debug logging

## Testing Checklist

### Pre-Test Setup
- [ ] Clear browser localStorage: `localStorage.clear()`
- [ ] Open browser DevTools Console to monitor logs
- [ ] Have Supabase dashboard open to verify database changes

### Test 1: Leader OKR Generation (Flow 1-4)

#### Steps:
1. Navigate to the OKR application homepage
2. Enter company website (e.g., `https://stripe.com` or `thedermaco.com`)
3. Fill in user details:
   - Name
   - Email
   - Role
   - Planning period (e.g., "Q1 2025")
4. Click "Generate OKRs"

#### Expected Results:
- [ ] Console shows `🔵 Lamatic API Request:` for Flow 1 (Research Company)
- [ ] Company profile displays correctly
- [ ] Console shows `🔵 Lamatic API Request:` for Flow 2 (Generate OKRs)
- [ ] OKRs display on screen with objectives and key results
- [ ] Console shows `🔵 Lamatic API Request:` for Flow 4 (Save OKRs)
- [ ] Success message: "OKRs saved successfully!"
- [ ] In Supabase `users` table: New record with your UUID, email, name, role
- [ ] In Supabase `okr_generations` table: New record with `is_draft = false`

#### Debug Points:
```javascript
// Check localStorage for generated user ID
localStorage.getItem('okr_user_id')
// Should be valid UUID format: e.g., "550e8400-e29b-41d4-a716-446655440001"

// Check console logs
// Look for: "📤 Saving OKRs to database:"
// Verify payload includes: user_email, user_name, user_role
```

#### Supabase SQL Verification:
```sql
-- Check if leader exists in users table
SELECT id, email, name, role, company_name, website_url, created_at
FROM users
WHERE email = 'your-test-email@example.com';

-- Check if OKR was saved
SELECT id, user_id, company_name, planning_period, is_draft, created_at
FROM okr_generations
WHERE user_id = '<uuid-from-above-query>';
```

### Test 2: Team Member Invitation (Flow 5)

#### Steps:
1. After completing Test 1, click "Edit & Invite Team"
2. Click "Add Team Member" button
3. Fill in team member details:
   - Name: "Test Member 1"
   - Email: "test1@example.com"
   - Role: "Senior Engineer"
4. Add another team member:
   - Name: "Test Member 2"
   - Email: "test2@example.com"
   - Role: "Product Manager"
5. Click "Send Invites"

#### Expected Results:
- [ ] Console shows `📤 Sending to Flow 5:` with:
  - `leader_user_id`: Your UUID
  - `website_url`: With `https://` protocol
  - `objectives_length`: > 0 (stringified JSON)
  - `team_members_count`: 2
- [ ] Console shows `🔵 Lamatic API Request:` for Flow 5
- [ ] Console shows `📥 Flow 5 Response:` with:
  - `success: true`
  - `total_invited: 2`
  - `invitations`: Array with 2 items
- [ ] Success modal appears with invitation links
- [ ] In Supabase `users` table: 2 new records with `invited_by = <your-uuid>`
- [ ] In Supabase `okr_generations` table: 2 new records with `is_draft = true`

#### Debug Points:
```javascript
// Check Flow 5 payload in console
// Look for: "📤 Sending to Flow 5:"
// Verify:
// - leader_user_id matches localStorage user ID
// - website_url starts with "https://"
// - objectives_sample shows stringified JSON
```

#### Supabase SQL Verification:
```sql
-- Check if team members exist
SELECT id, email, name, role, invited_by, invitation_token, created_at
FROM users
WHERE invited_by = '<leader-uuid>';

-- Check if draft OKRs were created
SELECT og.id, og.user_id, u.email, u.name, og.is_draft, og.created_at
FROM okr_generations og
JOIN users u ON og.user_id = u.id
WHERE u.invited_by = '<leader-uuid>';

-- Verify invitation tokens are unique
SELECT invitation_token, COUNT(*)
FROM users
WHERE invited_by = '<leader-uuid>'
GROUP BY invitation_token
HAVING COUNT(*) > 1;
-- Should return 0 rows (no duplicates)
```

### Test 3: Team Member Acceptance (Future Flow)

#### Steps:
1. Copy one of the invitation links from Test 2 success modal
2. Open in new incognito window
3. Review draft OKRs
4. Click "Accept" (if implemented)

#### Expected Results:
- [ ] Invitation page loads with team member's draft OKRs
- [ ] Company name and planning period display correctly
- [ ] Can edit OKRs before accepting
- [ ] After accepting: `is_draft` changes to `false` in database

## Common Issues & Solutions

### Issue 1: "Failed to save OKRs"
**Possible Causes:**
- Flow 4 response parsing error
- Database RLS policies blocking insert
- Invalid UUID format

**Debug Steps:**
1. Check Supabase logs for actual error
2. Verify RLS is disabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
3. Check console for "🔴 Lamatic API Error Response:"
4. Verify user_id is valid UUID format

**Fix:**
```sql
-- Disable RLS if needed (development only)
ALTER TABLE okr_generations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### Issue 2: "No users created" in Flow 5
**Possible Causes:**
- Leader doesn't exist in `users` table (Flow 4 didn't run)
- Response parsing error in Flow 5
- SQL generation error

**Debug Steps:**
1. Verify leader exists: `SELECT * FROM users WHERE id = '<leader-uuid>'`
2. Check console for "📤 Sending to Flow 5:" - verify `leader_user_id`
3. Check Flow 5 Lamatic logs for SQL execution errors
4. Verify `objectives` is stringified JSON, not array

**Fix:**
- Run Test 1 first to ensure leader is created
- If leader exists but Flow 5 fails, check Lamatic Flow 5 logs for SQL errors

### Issue 3: "u.map is not a function"
**Possible Causes:**
- Objectives not parsed correctly in Flow 5
- Schema mismatch (array vs string)

**Debug Steps:**
1. Check Flow 5 schema: Should be `"objectives": "string"`
2. Check `codeNode_parseInput` in Flow 5: Should parse string → array
3. Verify frontend sends stringified JSON: `console.log(typeof objectivesString)`

**Fix:**
Already implemented in current version. If still occurs:
1. Verify Flow 5 schema is updated
2. Check `codeNode_parseInput` node exists and is before LLM node

### Issue 4: Missing `https://` in website_url
**Cause:** Frontend didn't add protocol prefix

**Fix:**
Already implemented in `screen-2-edit-invite.tsx:186-188`:
```typescript
const websiteUrl = companyProfile.domain.startsWith('http')
  ? companyProfile.domain
  : `https://${companyProfile.domain}`;
```

## Performance Benchmarks

Expected timing for each flow:
- **Flow 1 (Research Company)**: 5-10 seconds
- **Flow 2 (Generate OKRs)**: 10-15 seconds
- **Flow 4 (Save OKRs)**: 1-2 seconds
- **Flow 5 (Invite Team)**: 5-10 seconds per team member

If any flow takes longer than 30 seconds, check:
- Lamatic workflow logs for stuck nodes
- Network tab for failed requests
- Console for timeout errors

## Database Schema Reference

### `users` table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT,
  company_name TEXT,
  website_url TEXT,
  invited_by UUID REFERENCES users(id),
  invitation_token TEXT UNIQUE,
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `okr_generations` table
```sql
CREATE TABLE okr_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  website_url TEXT,
  company_name TEXT,
  planning_period TEXT,
  strategic_narrative TEXT,
  okrs JSONB NOT NULL,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Next Steps After Testing

1. **If all tests pass:**
   - Document any edge cases discovered
   - Consider re-enabling RLS for production
   - Add back FK constraints
   - Implement proper authentication

2. **If tests fail:**
   - Check the specific failure in this guide's troubleshooting section
   - Review Lamatic workflow logs
   - Check Supabase database logs
   - Verify all recent code changes are deployed

3. **Production Checklist:**
   - [ ] Re-enable RLS policies
   - [ ] Add back FK constraints
   - [ ] Implement proper user authentication (Clerk/Auth0/Supabase Auth)
   - [ ] Add email sending for invitation links
   - [ ] Add error tracking (Sentry/Rollbar)
   - [ ] Add analytics for conversion tracking
   - [ ] Implement invitation expiration (7 days)
   - [ ] Add rate limiting for API calls

## Support

If you encounter issues not covered in this guide:

1. Check Lamatic workflow execution logs
2. Check Supabase database logs and RLS policies
3. Review browser console for frontend errors
4. Verify all environment variables are set correctly
5. Check that all recent code changes match the files in this repository

## Summary of Key Changes

### Files Modified:
1. `lib/lamatic-api.ts` - Added user fields to Flow 4, updated interfaces
2. `components/okr/screen-1-kickoff.tsx` - UUID generation, user fields in payload
3. `components/okr/screen-2-edit-invite.tsx` - Protocol handling, debug logging
4. `fix-database-schema.sql` - RLS disable, nullable user_id, helper functions

### Lamatic Flows Updated:
1. **Flow 4 (saveOKRs)**:
   - Trigger schema: Added `user_email`, `user_name`, `user_role`
   - `codeNode_buildSQL`: Insert into BOTH `users` and `okr_generations` tables
   - `codeNode_response`: Enhanced `extractArray()` for robust parsing

2. **Flow 5 (inviteTeamMembers)**:
   - Trigger schema: Changed `objectives` from `[string]` to `string`
   - Added `codeNode_parseInput`: Parse stringified objectives → array
   - Added `codeNode_validateLLM`: Validate LLM output
   - `codeNode_buildAllSQL`: Sequential SQL generation with proper escaping
   - `codeNode_response`: Enhanced parsing with comprehensive format handling

---

Last Updated: 2025-12-24
Version: 1.0
Status: Ready for Testing
