# CivicAI Firebase role setup

## What changed
- Removed hardcoded authority-email checks from the React app.
- Firebase Authentication continues to manage email/password identity.
- Role is read from Cloud Firestore at `users/{Firebase Auth UID}`.
- New registrations get `role: "citizen"` by default.
- To assign authority, the project owner changes the profile document in the Firebase Console.

## Configure Cloud Firestore
1. Open Firebase Console and select `civicai-portal`.
2. Go to Build → Firestore Database and create a database if one does not exist.
3. Open the Rules tab, replace the rules with the contents of `firestore.rules`, and click Publish.
4. In Firestore Data, create a collection named `users` if needed.
5. Open Build → Authentication → Users and copy the exact UID for the account that should be authority.
6. In the `users` collection, create a document whose document ID is that exact UID.
7. Add fields such as `uid` (string, same UID), `email` (string), `fullName` (string), `phone` (string), and `role` (string). Set `role` to `authority` (or `admin`).
8. Sign out of CivicAI and sign back in so the app reloads the role document.

## Important
- Do not set `role: "authority"` from the public registration form. The provided rules allow self-registration only with `role: "citizen"` and prevent users from changing their own role.
- If a user's Firestore profile document is missing, the app treats the user as a citizen.
- This protects the profile role field under these Firestore rules, but route checks in a React client are not a complete production authorization boundary. Grievances are still stored in localStorage; server-side authority permissions and complaint data security need a backend/Firestore migration before real public deployment.
- Firebase Auth does not automatically send a verification email just because an account is created. This source still does not require email verification.
