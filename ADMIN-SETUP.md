# LUCOMI Admin Setup

1. Open Firebase Console → Authentication → Users.
2. Open the LUCOMI account that should be the administrator.
3. Copy that user's **User UID**.
4. Open Firestore Database → Data.
5. Create a collection named **admins**.
6. Create a document whose **Document ID is exactly the user's Firebase UID**.
7. Add:
   - `role` — string — `admin`
   - `email` — string — the admin's Firebase email
   - `name` — string — the admin's display name
   - `createdAt` — timestamp — current date/time
8. Publish the Firestore rules from `firestore.rules`.
9. Sign out and sign back in on the LUCOMI website, then open `/admin`.

The client cannot create or edit documents in `admins`, so ordinary users cannot promote themselves. Admin accounts are also excluded from the one-year customer-data retention policy.
