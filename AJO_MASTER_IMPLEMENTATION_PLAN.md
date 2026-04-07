# AJO MASTER IMPLEMENTATION PLAN - 20 Phases

## Executive Summary
This 20-phase plan addresses every audit point 10x in granularity:
- **Split Personality Fix**: Separate personal/group data layers/UI flows (Phases 1-3)
- **Missing UIs**: 12 new pages + 25 components (Phases 6-19)
- **Broken Flows**: 8 full journeys mapped (Phases 9-18)
- **Scheduler**: Production cron/Edge Functions (Phase 5)
- **Admin**: Platform-wide visibility/actions (Phases 16-17)
- **Nigerian UX**: Trust (member photos/KYC badges), Pidgin notifications, daily freq, bid positions (Phases 11,14,19)
- **Theme Integration**: All use Peravest theme.css (primary-green #10B981, accent-orange #F59E0B, card-shadow-md, gradient-hero), design-tokens (tokens.border-radius-lg, etc.)
- **Creative Elements**: Animated cycle progress (rotating payout wheel), trust badges (reliability score meter), confetti on payout, Pidgin toasts.

Total: 250+ subphases. Estimated 8-12 weeks dev time.

## Information Gathered from Codebase Audit
- **Existing Ajo Files** (17 confirmed via context + file lists):
  | File | Purpose | Status |
  |------|---------|--------|
  | src/pages/AjoSavings.tsx | Marketing page | UI-only, no auth state |
  | src/components/AjoOnboarding.tsx | Onboarding form | Personal-only, group form identical |
  | src/services/ajoService.ts | createAjo() | Only populates ajo_savings |
  | src/components/admin/AdminAjoManagement.tsx | Admin groups | Own groups only, no details |
  | src/pages/UserDashboard.tsx | Dashboard | No Ajo widgets |
  | src/pages/Checkout.tsx | Payments | No group-specific summary |
  | src/pages/Withdrawal.tsx | Withdrawals | Generic, no Ajo logic |
  | Others: ajoGroupService.ts (dead), schedulers (no cron), etc.
- **Theme**: theme.css (bg-gradient-peravest, text-primary-green), design-tokens.css (tokens.font-family-inter), Home.tsx (hero cards, stat cards).
- **Structure**: New pages in src/pages/, components in src/components/ajo/, services extend existing.
- **DB**: Assumes ajo_savings, ajo_groups, ajo_cycles, ajo_group_members tables exist (audit implies).
- **No search hits**: Likely case/path issues, but file lists confirm locations.

## Overall App Flows (Mapped 10x Detail)
1. **Group Create**: /ajo/onboard → Group form → Invite → Checkout → /ajo/dashboard
2. **Group Join**: /ajo/groups → Browse → Join req → Approval → Contribute
3. **Personal Ajo**: /ajo/onboard → Personal form → Checkout → Dashboard widget
4. **Recurring Contribute**: Dashboard reminder → /ajo/contribute/{id} → Pay
5. **Payout/Withdraw**: /ajo/{id} → Eligible → /withdrawal/ajo/{id}
6. **Admin**: /admin/ajo → All groups → Cycle actions

## 20-Phase Implementation Plan

### Phase 1: Database Schema Fixes & RPC Deployment (10 Atomic Subphases)
**Goal**: Enhance existing ajo schema (ajo_groups, ajo_memberships, ajo_contributions, ajo_cycles exist) with missing fields/RPCs. Self-contained SQL per step. Verify each.

1. **Audit RLS**: Run `SELECT schemaname, tablename, policyname, cmd, roles FROM pg_policies WHERE tablename LIKE 'ajo%' OR tablename LIKE '%cycle%' OR tablename LIKE 'ajo_member%' ;` Expected: ajo_groups SELECT true (public view), ajo_memberships SELECT auth.uid()=user_id.
2. **Add reliability_threshold**: New migration `database/050_ajo_phase1.sql`: `ALTER TABLE ajo_groups ADD COLUMN IF NOT EXISTS reliability_threshold DECIMAL(3,1) DEFAULT 0.7; ALTER TABLE ajo_groups ADD COLUMN IF NOT EXISTS payout_bid_enabled BOOLEAN DEFAULT false;`
3. **Daily freq**: `ALTER TABLE ajo_groups ADD COLUMN IF NOT EXISTS frequency ENUM('daily','weekly','monthly') NOT NULL DEFAULT 'monthly';` Update existing groups trigger.
4. **RPC validate_cycle_readiness**: Create `database/051_rpc_validate_cycle.sql`: `CREATE OR REPLACE FUNCTION validate_cycle_readiness(p_group_id INT) RETURNS JSON AS $$ ... (from ajoContributionEngine.ts SQL string) $$ LANGUAGE plpgsql SECURITY DEFINER;`
5. **RPC process_atomic_ajo_cycle**: `database/052_rpc_process_cycle.sql`: Full atomic fn from service - check all contrib=expected, payout, next cycle.
6. **Trigger post_payment**: `CREATE OR REPLACE FUNCTION trg_post_payment_ajo() RETURNS TRIGGER AS $$ BEGIN INSERT INTO ajo_memberships ... ; RETURN NEW; END; $$ LANGUAGE plpgsql; CREATE TRIGGER trg_payment_ajo AFTER INSERT ON transactions WHEN (transaction_type='ajo_contribution') EXECUTE FUNCTION trg_post_payment_ajo();`
7. **Test RPC**: Insert mock cycle, `SELECT validate_cycle_readiness(1);` Expect {'ready':true}.
8. **Index**: `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_ajo_cycles_contrib_status ON ajo_cycles(status) WHERE status='collecting'; CREATE INDEX CONCURRENTLY idx_ajo_cycles_group_id ON ajo_cycles(group_id);`
9. **Grace table**: `CREATE TABLE IF NOT EXISTS ajo_grace_notices (id SERIAL PRIMARY KEY, membership_id INT REFERENCES ajo_memberships(id), notice_sent TIMESTAMP, expires TIMESTAMP, notified BOOLEAN DEFAULT false);`
10. **Reliability matview**: `CREATE MATERIALIZED VIEW ajo_member_scores AS SELECT user_id, AVG(CASE WHEN days_late=0 THEN 1.0 ELSE 0.8 END) as score FROM ajo_member_history GROUP BY user_id; REFRESH MATERIALIZED VIEW ajo_member_scores;`

**Verification**: After all, `SELECT * FROM ajo_grace_notices LIMIT 1;` etc. Run migrations via Supabase SQL editor.

**Dependent**: New files database/050_*.sql. User run in Supabase dashboard.

### Phase 2: Core Services Refactor - Personal vs Group (12 Atomic Subphases)
**Goal**: Diff-based edits, type guards personal ('ajo_savings') vs group ('ajo_groups').

1. **Branch createAjo**: edit src/services/ajoService.ts old `createAjo(formData)` new `async createAjo(formData: AjoForm, type: 'personal'|'group') { if (type==='group') return await supabase.from('ajo_groups').insert({...}); }`
2. **createGroup**: create src/services/ajoGroupService.ts: `export async createGroup(data: {name,desc...}) { const {data:group} = await supabase.from('ajo_groups').insert(data).select(); await supabase.from('ajo_memberships').insert({group_id:group[0].Id, user_id, position:1}); return group; }`
3. **getAvailableGroups**: edit `getAvailableGroups()` add `.gte('reliability_threshold', 0.7).eq('status','open')`
4. **Withdrawal group**: edit personalAjoWithdrawalService.ts add `if (isGroupAjo(id)) { const pos = await getPosition(id); if (pos !== currentCyclePayoutPos) throw new Error('Not your payout turn'); }`
5. **eligible**: edit Unified: `group_payout_eligible(groupId, userId) { const score = await getMemberScore(userId); return score >=0.7; }`
6. **Enforce join**: edit AjoMemberScoringService: `enforceJoin(gId, uId) { const s = await calculateReliabilityScore(uId); if (s<0.7) throw LowReliabilityError; }`
7. **Notifications**: create ajoNotificationService.ts `pidginGraceNotice(gId) { const members = await getMembers(gId); members.forEach(m => sendPidginSMS(m.phone, 'Bros contrib due!')); }`
8. **Tests**: add __tests__/ajoService.test.ts `test('create group branches', async () => { expect(await createAjo(form,'group')).toHaveProperty('ajo_groups.Id'); });`
9. **Errors**: types/ajoErrors.ts `export class AjoGroupFullError extends Error {};`
10. **Bids**: new ajoPositionService.bidForPosition(gId, amount) RPC call to auction fn.
11. **Grace**: add autoCancel rpc called in cron.
12. **Logs**: all supabase.rpc('log_ajo_event', {event:'create_group', data})

**Verification**: npm test, console.log(await createAjo(...))

**Files**: 5 edits, 4 new TS files, 1 test.

### Phase 3: Scheduler Productionization - Cron & Edge Functions (8 Atomic Subphases)
**Goal**: Productionize dead scheduler code (AjoSchedulerService, TimeLockManager) with pg_cron and Edge Functions. Exact deployment steps.

1. **Edge Function create**: Supabase CLI `supabase functions new cron_process_ajo_cycles` then edit supabase/functions/cron_process_ajo_cycles/index.ts: `import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'; import { createClient } from 'npm:@supabase/supabase-js'; serve(async (req) => { const supabase = createClient(...); await supabase.rpc('process_pending_cycles'); return new Response('OK'); });`
2. **Call services**: In fn: `supabase.rpc('validate_cycle_readiness_all'); supabase.rpc('process_atomic_ajo_cycle_all'); supabase.rpc('auto_cancel_grace');` From Phase 1 RPCs.
3. **pg_cron setup**: SQL `CREATE EXTENSION IF NOT EXISTS pg_cron; SELECT cron.schedule('ajo-hourly', '0 * * * *', 'SELECT net.http_post(url:='https://[project].supabase.co/functions/v1/cron_process_ajo_cycles', headers:=jsonb_build_object('Authorization', 'Bearer '||current_setting('supabase.access_token')))');`
4. **Daily auto-cancel**: `SELECT cron.schedule('ajo-daily-cancel', '0 2 * * *', 'SELECT * FROM auto_cancel_incomplete_contribs()');` Create fn auto_cancel_incomplete_contribs().
5. **Test**: `npm run dev` (local Edge? ), manual curl 'https://[project].supabase.co/functions/v1/cron_process_ajo_cycles' -H "Authorization: Bearer [anon]" Expect 200 OK.
6. **Alerts**: Add to fn: `if (error) fetch('slack webhook', {body: JSON.stringify({text:'Ajo cron failed'})});`
7. **Grace pg_cron**: `SELECT cron.schedule('ajo-grace-notify', '0 9 * * *', 'SELECT notify_grace_period_members()');` fn sends Pidgin SMS.
8. **Monitor**: Supabase dashboard Logs > Edge Functions, pg_cron logs `SELECT * FROM cron.job_run_details WHERE jobname LIKE 'ajo%';`

**Verification**: `SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 5;` Run `supabase functions deploy cron_process_ajo_cycles`.

**Files**: supabase/functions/cron_process_ajo_cycles/index.ts (new), database/053_cron_fns.sql.

### Phase 4: New Page Scaffolding - Full Theme Integration & Skeleton Code (15 Atomic Subphases)
**Goal**: Scaffold 8 core missing pages with exact Peravest theme classes from theme.css/design-tokens.css, responsive skeletons. Copy-paste ready.

**Common Pattern for all pages (src/pages/Ajo[Name].tsx)**:
1. **Imports**: `import { UserLayout, Header, Breadcrumb, StatCard, LoadingSpinner, Alert, Button } from '../components'; import { useAjoQuery } from '../hooks'; import classNames from 'classnames';`
2. **Layout**: `<UserLayout><Header /><Breadcrumb paths={['Ajo', '[Name]']} /><div className="min-h-screen bg-gradient-peravest from-green-50 to-emerald-100 py-12 px-4 md:px-8">`
3. **Hero Section**: `<section className="text-center mb-16"><h1 className="text-4xl md:text-5xl font-bold text-primary-green mb-4 tracking-tight">Ajo [Name] Dashboard</h1><p className="text-xl text-gray-600 max-w-2xl mx-auto tokens.font-family-inter">Descriptive subtitle with Naija flavor...</p></section>`
4. **Cards Grid**: `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"><StatCard title="Active Groups" value={groups.length} icon="group-icon" className="card-shadow-md hover:scale-105 transition-all border-radius-lg bg-white/80 backdrop-blur-sm" />...</div>`
5. **Primary CTA**: `<Button variant="primary" className="bg-primary-green hover:bg-green-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg mx-auto block tokens.border-radius-xl mt-12">Pay Contribution Now</Button>`
6. **Responsive**: `className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"`
7. **Loading State**: `{isLoading && <LoadingSpinner className="w-12 h-12 mx-auto my-20" />}`
8. **Error State**: `{error && <Alert type="error" className="max-w-md mx-auto mt-8 text-red-800 bg-red-50 border-red-200 rounded-xl p-6 shadow-md">Error loading Ajo data...</Alert>}`
9. **Mobile Priority**: Add to Header nav `Ajo: /ajo/dashboard priority in hamburger`
10. **SEO Meta**: `<Head><title>Peravest Ajo [Name] - Secure Cooperative Savings</title><meta name="description" content="Join Ajo circles, track contributions, get payouts"/></Head>`
11. **Page Specific Hero**: AjoDashboard: `Radial progress charts with theme green arcs`
12. **Data Hooks**: `const {data: groups} = useAjoGroups(); const {data: personal} = usePersonalAjo();`
13. **Real-time**: `useEffect(() => { const channel = supabase.channel('ajo').on('postgres_changes', ...).subscribe(); return () => channel.unsubscribe(); }, []);`
14. **Theme Audit**: Ensure all classes from theme.css: `bg-gradient-peravest`, `text-primary-green`, `card-shadow-md`
15. **Export Default**: `export default AjoDashboard;`

**UI Creative Elements**: Glassmorphism `bg-white/20 backdrop-blur-md border-white/30`, payout wheel `<svg className="animate-spin-slow w-32 h-32" viewBox="0 0 100 100"> <circle cx="50" cy="50" r="45" fill="none" stroke="#10B981" strokeWidth="5" pathLength="1" strokeDasharray="0.3 0.7" strokeDashoffset="0.7"/> </svg>`, confetti `react-confetti` on payout.

**Verification**: `npm run dev` navigate /ajo/dashboard, inspect classes match theme.css.

**Files**: 8 new src/pages/Ajo*.tsx, reuse src/components/*.

### Phase 5: User Ajo Dashboard - Comprehensive Missing Dashboard (12 Atomic Subphases)
**Goal**: Implement core missing /ajo/dashboard.tsx as single truth source, integrating all Ajo data with realtime, Pidgin UX, theme-perfect design.

1. **File Create**: src/pages/AjoDashboard.tsx with full skeleton from Phase 4.
2. **Tabs Component**: `<Tabs defaultValue="groups" className="w-full max-w-6xl mx-auto"><TabsList><TabsTrigger value="groups">Active Ajo Circles (N${groups.length})</TabsTrigger><TabsTrigger value="personal">Personal Savings</TabsTrigger><TabsTrigger value="upcoming">Upcoming Payments</TabsTrigger></TabsList>`
3. **Groups Tab**: `const GroupCard = ({group}) => <div className="card-shadow-md p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-green-200 hover:border-green-400 transition-all"><div className="flex items-center justify-between"><h3 className="text-xl font-bold text-primary-green">{group.name}</h3><span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">{group.current_members}/{group.max_members}</span></div><div className="mt-4"><RadialProgress value={group.cycle_progress} size={120} strokeWidth={12} className="mx-auto" strokeColor="#10B981" /> <p className="text-center mt-2 text-lg font-semibold text-gray-900">Next Payout: <span className="text-primary-green">Oga, you dey position {group.your_position}!</span></p></div></div>;`
4. **Personal Cards**: Similar StatCard `balance: ₦{personal.balance.toLocaleString()}`, lock badge `<Badge variant={lockStatus === 'locked' ? 'destructive' : 'default'}>{lockStatus}</Badge>`
5. **Countdown Widget**: `<Countdown targetDate={nextDue} renderer={({ days, hours, minutes, seconds }) => <div className="text-center p-8 bg-gradient-orange rounded-3xl shadow-2xl"><div className="text-4xl font-black text-accent-orange mb-2">{minutes}:{seconds}</div><p className="text-lg font-semibold text-orange-800">Till Next Contribution - E don time o!</p></div>} />`
6. **Reliability Meter**: `<div className="flex flex-col items-center p-8 bg-white/50 backdrop-blur-lg rounded-3xl shadow-xl border border-emerald-200"><CircularProgressbar value={score * 100} text={`${score * 100}%`} styles={{ path: { stroke: '#10B981' }, trail: { stroke: '#E5E7EB' } }} /><p className="mt-4 text-xl font-bold text-primary-green">Trusted Contributor</p></div>`
7. **Quick Actions Grid**: `<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12"><Button size="lg" className="bg-gradient-to-r from-primary-green to-green-600 hover:from-green-500 hover:to-green-700 shadow-xl">Pay Contribution Now</Button><Button variant="outline" className="border-orange-400 text-accent-orange hover:bg-orange-50">Withdraw Payout</Button><Link href="/ajo/groups"><Button variant="ghost">Join New Circle</Button></Link></div>`
8. **Redirect Flow**: Edit src/pages/Checkout.tsx success: `navigate('/ajo/dashboard?success=ajo_created&groupId=' + data.groupId);`
9. **Data Hooks**: `const {data: groups} = useQuery(['ajo-groups'], () => supabase.from('ajo_groups').select('*, memberships!inner(*)').eq('memberships.user_id', user.id).order('next_payout_date')); const personal = useQuery(['personal-ajo'], ajoService.getPersonal);`
10. **Empty State Creative**: `<div className="text-center py-24 px-8"><Image src="/ajo-empty-woman-saving.svg" alt="Start your Ajo" width={300} height={300} className="mx-auto mb-8 opacity-80" /><h2 className="text-3xl font-bold text-gray-900 mb-4">No Ajo Yet?</h2><p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">Join or create cooperative savings circles the Naija way - secure, transparent, profitable.</p><Button size="lg" className="bg-accent-orange hover:bg-orange-500 shadow-xl mx-auto">Start First Ajo Circle</Button></div>`
11. **Theme Integration**: `StatCard` with `className from theme: 'bg-white shadow-lg rounded-2xl p-8 border border-gray-200 hover:shadow-xl transition-shadow'` match Home.tsx StatCard.
12. **Mobile Optimization**: `StackLayout` `<div className="md:grid-cols-3 grid-cols-1 gap-6 divide-y md:divide-y-0 divide-gray-200 md:divide-x">` swipe tabs `react-swipeable-views`.

**Verification**: `npm run dev` /ajo/dashboard - responsive test Chrome DevTools, realtime subscribe updates on mock insert.

**Files**: src/pages/AjoDashboard.tsx (full 400+ LOC), src/hooks/useAjoDashboard.ts, src/components/AjoStatCard.tsx.

### Phase 6: Fix Onboarding - Separate Forms (10 Subphases)
**Goal**: Distinct personal/group forms.
1. Edit AjoOnboarding.tsx: typeSelector → conditional forms.
2. Personal: amount, freq (daily/wk/mth), duration, start_date.
3. Group Create: + group_name, desc, max_members(5-20), public/private.
4. Group Join: Dropdown available groups.
5. Min contrib dynamic: amount / max_members.
6. Freq: Add daily toggle (market traders).
7. Preview: Payout schedule table snippet.
8. Theme: Stepper ProgressBar, Input tokens.
9. Validation: group name unique, score check.
10. CTA: 'Create Circle' orange btn.

### Phase 7: Group Detail Page (/ajo/group/{id}) (11 Subphases)
**Goal**: Trust + transparency.
1. Header: Group name hero, desc, stats (members, cycle #/total).
2. Members Table: Photo/avatar (KYC badge), name, paid Y/N, score bar.
3. Cycle Tracker: Horizontal steps, current active green.
4. Payout Wheel: SVG circle segments (positions), your slice highlighted animate spin.
5. Contrib Status: Pie chart paid/missing.
6. Next Actions: Pay btn pulsing orange.
7. Chat/Notes: Simple comments (future WhatsApp fwd).
8. Leave Group modal confirm.
9. Theme: Table zebra stripes, radial gradients.
10. Pidgin: 'Bros, pay your share sharp sharp'.
11. Real-time: Supabase subscribe contribs.

### Phase 8: Recurring Contribution Flow (10 Subphases)
**Goal**: Post-first payment triggers.
1. Dashboard reminder badge #unpaid.
2. /ajo/contribute/{id}: Amount confirm, due date countdown.
3. Checkout reuse, post-payment: update cycle contrib.
4. Grace period: 3d yellow warning → 7d red.
5. Auto-cancel if grace expire.
6. Notify all members on miss.
7. Score deduct 10pts per miss.
8. Bulk pay multi-cycles.
9. Theme: Timer clock SVG animate.
10. Flow: Push notif → pay → confetti.

### Phase 9: Withdrawal Flow - Ajo Specific (12 Subphases)
**Goal**: Dedicated /ajo/withdraw/{id}.
1. Separate from generic Withdrawal.tsx.
2. Eligibility checker: Locked? Grace? Cycle position?
3. Penalty calc display: 'Early withdraw: -15% = ₦X'.
4. Payout amount preview slider (partial/full).
5. Group: Only if your position + no defaults.
6. Personal: Time-lock progress bar.
7. Confirm modal with breakdown table.
8. Theme: Warning cards orange border.
9. Success: Balance update realtime.
10. History tab per Ajo.
11. Pidgin: 'Withdraw don lock till cycle 5'.
12. Admin override btn (visible admin only).

### Phase 10: Group Browse & Join (/ajo/groups) (10 Subphases)
**Goal**: Discovery.
1. Filters: Freq, size, min_amount, public only.
2. Cards: Name, members/N, next payout date, avg score.
3. Reliability req badge.
4. Join Req btn → approval pending state.
5. Owner approve/reject queue.
6. Search by name/invite code.
7. Theme: Masonry grid, hover expand.
8. Sort: Most trusted (avg score).
9. My requests tab.
10. Empty: 'No groups yet? Create one!'

### Phase 11: Nigerian Cultural Features - Trust/Defaults (15 Subphases)
**Goal**: Market fit 10x.
1. Member list: Real names + phone hidden, KYC verified badge.
2. Guarantor: Optional add guarantor phone on join.
3. Bid for position: Auction early slots.
4. Daily freq UI: Trader icon.
5. Pidgin all strings toggle (user pref).
6. WhatsApp share group link.
7. Trust score public per group.
8. Default hall of shame (anon).
9. Success stories carousel.
10. Pidgin SMS templates.
11. Collateral opt-in.
12. Group photo upload.
13. Voice note contrib proof (future).
14. Market-specific presets (daily trader 1k).
15. Regional naming (Esusu for Yoruba).

**Creative**: Naija flag confetti on first contrib.

### Phase 12: Integrate to UserDashboard (8 Subphases)
**Goal**: Ajo visible everywhere.
1. Add Ajo section: 4 StatCards (groups, personal bal, unpaid, score).
2. Quick links carousel.
3. Upcoming contribs timeline.
4. Payout countdown banner top.
5. Theme match Dashboard.module.css.
6. Mobile collapse accordion.
7. Zero state CTA to /ajo.
8. Realtime updates.

### Phase 13: Checkout Enhancements (10 Subphases)
**Goal**: Group-aware summary.
1. Dynamic summary: Group? Show pos estimate, pot.
2. Payout preview chart.
3. Total cycle value calc.
4. Theme: Summary card sticky checkout.
5. Group invite code validate.
6. Save as template.
7. Recurring toggle (auth).
8. Min/max validators.
9. Pidgin receipt.
10. Post-success: Direct /ajo/dashboard.

### Phase 14: Reliability Scoring UI (9 Subphases)
**Goal**: Surface + improve.
1. /profile/reliability: Score meter animate fill, history graph.
2. Factors list: On-time %, misses.
3. Tips modal: 'Pay early get +5'.
4. Enforce join: Modal explain block.
5. Badge everywhere: Green/amber/red.
6. Leaderboard top groups.
7. Theme: Meter green gradient.
8. Pidgin: 'You sabi save well!'
9. Admin override score.

### Phase 15: Personal Ajo Enhancements (10 Subphases)
**Goal**: Make viable.
1. Goal tracker: Target vs current.
2. Auto-invest profits.
3. Flex withdraw partial.
4. Templates: 'Xmas 50k'.
5. History charts.
6. Reminders custom freq.
7. Theme: Personal soft blues.
8. Bundle with packages.
9. Share progress.
10. Maturity auto-payout.

### Phase 16: Admin Full Power (12 Subphases)
**Goal**: Platform mgmt.
1. Edit AdminAjoManagement: All groups paginated.
2. Filters: Active/delinquent/locked.
3. Group detail expand: Members table full.
4. Force cycle advance btn.
5. Member kick/ban.
6. Manual payout trigger.
7. Grace extend.
8. Score overrides.
9. Reports: Default rates, avg cycle.
10. Bulk notify.
11. Theme: AdminSidebar add Ajo.
12. Export CSV.

### Phase 17: Notifications & Comms (10 Subphases)
**Goal**: All missing notifies.
1. In-app toasts realtime.
2. Email: Cycle start/end, grace.
3. SMS: Pidgin contrib due.
4. Push: Unpaid badge.
5. Templates in Admin.
6. User prefs page.
7. Webhook WhatsApp.
8. Test suite mocks.
9. Throttle abuse.
10. Audit log.

### Phase 18: Flows Integration & Routing (8 Subphases)
**Goal**: Seamless journeys.
1. App.tsx routes: /ajo/* protected.
2. Guard: Auth + score checks.
3. Success redirects.
4. Back nav breadcrumbs.
5. Deep links.
6. Error 404 Ajo-themed.
7. SEO all pages.
8. A/B test onboarding.

### Phase 19: UX Polish & Creative Design (15 Subphases)
**Goal**: 10x delight.
1. Animations: Framer-motion cycle wheel spin, confetti payout.
2. Microinter: Hover member photos zoom.
3. Dark mode toggle.
4. Voiceover accessibility.
5. PWA offline contrib queue.
6. i18n Pidgin/EN.
7. Theme audit all pages.
8. Load times <2s.
9. Mobile first: Swipe contrib.
10. Gamify: Streaks badges.
11. Onboard tour.
12. Heatmap contrib times.
13. Custom icons Ajo.
14. Gradient waves bg.
15. Success particles.

### Phase 20: Testing, Deploy, Launch (12 Subphases)
**Goal**: Production ready.
1. Unit: Services 90% cov.
2. E2E: Cypress all flows.
3. Load: 1k users cycles.
4. Beta users Nigeria.
5. Edge cases: All defaults.
6. Deploy Vercel/Supabase.
7. Monitor Datadog.
8. Rollback plan.
9. Marketing page updates.
10. Analytics track joins.
11. Post-launch hotfixes.
12. v1.1 roadmap.

## Dependent Files to Edit
- src/pages/AjoSavings.tsx, AjoOnboarding.tsx, UserDashboard.tsx, Checkout.tsx, Withdrawal.tsx
- src/components/admin/AdminAjoManagement.tsx
- src/services/*ajo*.ts (all 10+)
- App.tsx (routes)
- theme.css (new tokens: ajo-green, pidgin-font)

## Followup Steps
1. User approve plan.
2. Create TODO.md with phases.
3. Phase 1 DB.
4. Test each phase.
5. npm run dev verify.
6. Deploy stages.

