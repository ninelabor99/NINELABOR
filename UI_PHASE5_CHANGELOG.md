# NINELABOR UI renewal phase 5 — shared member navigation

- Company: role-specific fixed mobile navigation (home/workers/attendance/payroll/messages), filtered by existing subscription entitlement.
- Worker: distinct fixed mobile navigation for affiliated vs individual worker, using existing tab keys and existing handlers.
- Existing horizontal navigation remains available for less frequent functions; no new server endpoints or permissions.
- Mobile safe-area padding, touch targets, keyboard focus states, and portal content bottom spacing.
- Admin screens and existing Firestore/auth/payroll logic unchanged.

## Verification
- TypeScript/TSX syntax parser: 125 files, 0 syntax errors.
- Local import check: 419 imports resolved.
- Browser rendering, Firebase integration, full TypeScript typecheck and production build not verified in this environment.
