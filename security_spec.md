# Security Specification for DCA TEC

## Data Invariants
1. **Leads**: Public creation is allowed for contact. Admin only for everything else.
2. **Acceptances**: Any user can create (proposal acceptance). Once created, only the client (matching email) or Admin can read. Status updates are restricted.
3. **Documents**: Linked to an `acceptance`. Access derived from the parent `acceptance` owner or Admin.
4. **Biddings**: Linked to an `acceptance`. Access derived from the parent `acceptance` owner or Admin. Admin only for writes.
5. **Acquisitions**: Proposals created by Admin. Viewable by ID (public/portal). Updates only for acceptance status fields.
6. **Users**: Self-read, Admin-all. role cannot be self-assigned.
7. **Messages**: Chat between client and admin. Ownership/Access strictly validated.

## The "Dirty Dozen" Payloads (Denial Expected)
1. **Leads**: Create with `admin: true` field.
2. **Leads**: Update existing lead as a non-admin.
3. **Acceptances**: Create with `status: 'signed'` skipping steps.
4. **Acceptances**: Update `clientEmail` of another user's acceptance.
5. **Documents**: Read document belonging to another `clientId` without being owner.
6. **Biddings**: Update `status` as a client.
7. **Acquisitions**: Create acquisition as non-admin.
8. **Acquisitions**: Update `valuation` as non-admin.
9. **Users**: Update own `role` to 'admin'.
10. **Users**: Read another user's profile.
11. **Messages**: Send message as user A with `senderId` of user B.
12. **Messages**: Send message with size > 1MB.

## Test Runner (firestore.rules.test.ts)
(To be implemented or provided as a reference)
