# Tasks List

## Documentation loop
- Update [changelog.md](changelog.md) for every material change.
- Keep [readme.md](readme.md), [agent.md](agent.md), and [projectrules.md](projectrules.md) aligned with scope and decisions.

## Active
- (none)

## Next
- [ ] Add profile settings (timezone, default protocol) UI.
- [ ] Add validation for injection edit conflicts (duplicate same-day logs).

## Backlog
- [ ] Notifications or reminders for upcoming injections.
- [ ] Import or export injection history.

## Done
- [x] Confirm tech stack choices (React + TS + Vite, Tailwind + shadcn/ui, shadcn Calendar).
- [x] Define Firestore schema for users, protocols, and injection logs.
- [x] Build initial dashboard and calendar wireframe.
- [x] Wire Firebase Auth state and Firestore reads/writes.
- [x] Build log injection and protocol restart forms.
- [x] Sync schedule generation to active protocol and injection history.
- [x] Populate `.env.local` with Firebase project credentials.
- [x] Deploy Firestore rules and Hosting configuration.
- [x] Initialize project docs and documentation loop.
