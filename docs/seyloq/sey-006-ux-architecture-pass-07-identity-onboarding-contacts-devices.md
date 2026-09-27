# SEY-006 - Complete Product UX Architecture

Pass 07: Identity, Onboarding, Contacts & Devices  
Base: SEY-006 Pass 01 through Pass 06, plus SEY-004/005 User/Device/Session/Connection contracts

## 01. Identity Design Laws

Seyloq identity should feel simple for ordinary users while keeping identity, discoverability, devices, and sessions conceptually separate underneath.

Laws:

- Primary navigation remains `Chats`, `Updates`, `Calls`.
- Do not add primary destinations for Contacts, People, Devices, Profile, Identity, Account, or QR.
- A User is not a Device.
- A Device is not a Session.
- A Session is not a realtime Connection.
- Phone number is not permanent internal identity.
- Username is not stable internal identity.
- Changing phone number, username, display name, avatar, device, or session must not create a new person.
- A person may use multiple authorized devices.
- Device linking is deliberate and understandable.
- Revoking a device does not mean deleting the account.
- Contact discovery minimizes unnecessary address-book exposure.
- Permission denial does not block basic use where alternatives exist.
- QR identity does not silently expose private information.
- Search and discovery respect privacy.
- Blocked users should not bypass blocking through alternate discovery surfaces.
- Profile data and authentication credentials are separate.
- Recovery is security-critical and must not be designed casually.
- No security claim without supporting architecture.
- Onboarding gets users to communication quickly.

## 02. Conceptual User/Device/Session/Connection Model

UX-level model:

```text
User
  Profile
  Identity handles
    Phone number
    Username
    QR identity representation
  Devices
    Device A
      Sessions
    Device B
      Sessions
  Contacts / relationships

Session
  Connection(s)
```

Connection is ephemeral runtime state and should generally not appear in account-management UI.

## 03. User Identity

A Seyloq User represents durable account/person identity.

User identity survives:

- Phone-number change.
- Username change.
- Profile-name change.
- Avatar change.
- Device replacement.
- Session rotation.
- Reinstall/reauthentication where recovery permits.

Do not expose internal UUIDs to ordinary users.

## 04. Identity Handles

Identity handles are separate from User identity.

Potential handles:

- Phone number.
- Username.
- QR identity.
- Future verified identity attributes.

Each handle needs purpose, visibility, discoverability, change semantics, conflict semantics, and privacy implications. Not every handle is public.

## 05. Phone-Number Role

Phone number may be:

- Bootstrap identifier.
- Authentication/recovery factor.
- Contact-discovery signal.

Phone number is not:

- Permanent account primary key.
- Mandatory public profile field.
- Universal discoverability mechanism.

UX remains compatible with communication without exposing phone numbers.

## 06. Username Role

Username is a human-shareable identity handle, such as `@younas`.

Requirements:

- Unique where applicable.
- Changeable according to policy.
- Searchable according to privacy.
- Shareable.
- Not internal identity.

Changing username must not break conversations, groups, Live Objects, Plans, Spaces, Channel authority, Community membership, or devices.

## 07. Username Creation/Change

Strong initial direction: username should not block basic onboarding unless Product Owner requires it.

Creation:

```text
enter -> availability check -> confirmation
```

Change:

```text
current username -> choose new username -> availability/validation -> confirm
```

Future policy questions include cooldown, old-handle reuse, impersonation, reserved names, and Channel/User namespace collision.

## 08. Display Name/Profile

Display name is presentation, not authentication.

Distinguish:

- User-selected display name.
- Local contact label.
- Username.
- Phone number.

Basic profile:

- Avatar.
- Display name.
- Username if configured.
- Bio/about optional.

Do not turn profiles into social-media pages.

## 09. Onboarding Goals

Onboarding answers, without technical language:

- Who are you?
- How should people recognize/find you?
- How do you want to find people?
- Can this device be trusted?

Success condition: user reaches usable Chats and can start/find a conversation.

## 10. Onboarding Architecture

State model:

```text
welcome -> identity_bootstrap -> verification/authentication -> profile_setup -> optional_contact_discovery -> ready
```

Branches:

- permission_denied.
- verification_failed.
- identity_conflict.
- recovery_required.
- existing_account_detected.
- device_linking.

Do not implement authentication in this pass.

## 11. Existing/New/Link-Device Paths

Onboarding distinguishes:

- Create/start account.
- Sign in/continue existing account.
- Link this device.

Device linking must not be confused with account creation.

## 12. Identity Bootstrap

Conceptual bootstrap:

```text
Enter identifier -> verify control -> determine existing/new identity
```

First release may use phone number, but the architecture must not freeze SMS OTP or permanent phone-bound identity.

## 13. Verification UX

Generic verification states:

- waiting.
- verifying.
- verified.
- invalid.
- expired.
- too_many_attempts.
- delivery_failed.

Copy stays human-readable and avoids provider/internal auth jargon.

## 14. Profile Setup

Profile setup:

- Photo optional.
- Name.
- Username optional/depending PO decision.

Do not require bio, interests, birthday, location, social links, or content preferences to use a private messenger.

## 15. Permission Timing

Request permissions contextually:

- Contacts for contact discovery.
- Camera for capture/QR scanning.
- Microphone for voice/call.
- Notifications after meaningful explanation.
- Location when sharing location.
- Photos/files when selecting media where platform requires.

Do not request every OS permission during onboarding.

## 16. Contact Permission/Denial

Contact permission is optional where possible.

Preferred primer:

```text
Find people you already know.
Seyloq can use your contacts to show which people are already here.

Continue
Not now
```

If denied:

- Search by username.
- Share QR/link.
- Enter number where supported.

Do not claim contacts stay on-device unless implementation proves it.

## 17. Contacts Conceptual Model

Distinguish:

- OS address-book contact.
- Seyloq User.
- Seyloq conversation participant.
- Saved Seyloq relationship/contact.

These may overlap but are not identical. Seyloq must not silently rewrite the OS address book.

## 18. Contact Discovery

Discovery methods:

- Address-book matching.
- Username.
- Phone number where permitted.
- QR.
- Invite/share link.
- Existing group/community relationship.
- Global Search where privacy allows.

Discovery does not automatically mean contact saved, conversation created, phone exposed, or mutual relationship established.

## 19. Address-Book Privacy Boundary

Privacy questions before implementation:

- Are raw numbers uploaded?
- Are normalized hashes used?
- Can hashes be enumerated?
- Is private contact discovery used?
- How often does sync occur?
- How is deletion handled?

Do not claim privacy-preserving discovery until security architecture selects a method.

## 20. Contact Sync States

States:

```text
not_enabled -> permission_required -> syncing -> available
```

Branches:

- partial.
- failed.
- disabled.

Failure copy:

```text
Couldn't refresh contacts. Search by username instead.
```

Contact sync failure does not block messaging.

## 21. Person Search

Person Search integrates with Pass 06 Global Search.

Example:

```text
Muhammad Younas
@younas
Mutual group: Developers
```

Only show metadata the viewer may see. Person Search is not top-level navigation.

## 22. Starting Conversation

From person result/profile:

- Message.
- Audio/video call where allowed.
- Add to group where allowed.

Unavailable actions are hidden/disabled. Starting conversation must not expose private handles beyond policy.

## 23. Unknown-Person UX

Unknown communication should show clear identity context:

```text
Ahmed Khan
@ahmedk
Not in your contacts
```

Actions:

- Accept/continue.
- Block.
- Report.

Do not pretend unknown identity is trusted.

## 24. Message Requests

Evaluate request boundary for:

- Unknown username contact.
- Unknown phone contact.
- Public Channel/community-originated contact.

Potential flow:

```text
Message request -> limited identity preview -> Accept / Block / Report
```

Do not automatically route unsolicited strangers into normal Chats without abuse review.

## 25. QR Identity

QR supports deliberate identity sharing.

Flow:

```text
Profile -> My QR
Scan QR -> identity preview -> Message / Add
```

QR should reference stable shareable identity and need not expose phone number. Payload format is out of scope.

## 26. Identity Links

Future-compatible identity link:

```text
Open link -> Seyloq identity preview -> Message / Add
```

Do not define URL/domain/protocol format here.

## 27. Blocking/Shared-Group Boundary

Blocking must be identity-level enough that superficial handle changes do not bypass it.

Consider impact on:

- Messages.
- Calls.
- Status visibility.
- Person search.
- Shared groups.
- Communities.
- Channels.

Blocking someone does not necessarily remove either person from a shared group. Group behavior is a Product Owner decision.

## 28. Identity Safety/Change Signals

Future needs:

- Impersonation reporting.
- Username abuse.
- Spam.
- Account takeover response.
- Device compromise response.
- Identity change signaling.

Some identity changes may need communication to existing contacts, such as phone number or security identity changes. Avoid noisy system messages for cosmetic changes.

## 29. Device Model

A Device is an authorized installation/device identity associated with a User.

User-facing data may include:

- Device name.
- Platform.
- Approximate last active.
- Current device indicator.
- Linked date.
- Security state where meaningful.

Do not expose internal device UUID.

## 30. Linked Devices

Surface likely lives behind:

```text
Profile / Settings -> Linked devices
```

Example:

```text
Linked devices

Windows PC
This device

iPhone
Active 12 min ago

MacBook
Active yesterday
```

Not primary navigation.

## 31. Device-Linking Flow

Entry:

```text
Linked devices -> Link a device
```

Secondary device:

```text
Link to existing Seyloq account
```

Conceptual flow:

```text
new device requests link -> trusted context approves -> new Device identity established -> sync begins -> device appears
```

No silent device enrollment.

## 32. Device-Link Review/Failure

Review surface identifies:

- Device/platform.
- Approximate request context where trustworthy.
- Time.

Example:

```text
Link Windows PC?
A Windows device is requesting access to your Seyloq account.

Cancel
Link device
```

Failures:

- request_expired.
- request_rejected.
- network_failed.
- already_used.
- unsupported_version.
- device_limit_reached.
- security_check_failed.

Use understandable language, not protocol jargon.

## 33. Device Revocation

For another device:

```text
Linked devices -> iPhone -> Log out / Remove device -> confirm
```

State:

```text
authorized -> revocation_pending -> revoked
```

Revocation must eventually terminate/deny associated sessions. Do not claim immediate guarantees before implementation exists.

## 34. Lost/Unknown Device

Lost device path:

```text
Lost a device? -> Linked devices -> select device -> remove access
```

Unknown device:

```text
Don't recognize this device?
Remove device
Review account security
```

Avoid panic-heavy copy. Security review details belong to Pass 08.

## 35. Session Model

Session is authenticated authorization context on a Device.

Ordinary users manage Devices, not low-level sessions. Future security screens may expose session information where useful.

Do not make users understand tokens or refresh sessions.

## 36. Device vs Session UX

Law:

> Device is the normal human-facing management unit; Session remains mostly an implementation/security concept.

Possible exceptions:

- Browser/web sessions.
- Temporary sessions.
- Security investigation.

Treat exceptions as future decisions.

## 37. Connection Boundary

Connection is runtime-only:

- WebSocket.
- Network connection.
- Call transport.

Do not expose a Connections account screen. Presence/network UI belongs to messaging/calling state.

## 38. Multi-Device Expectations

UX must anticipate cross-device:

- Messages.
- Draft behavior.
- Read state.
- Delivery state.
- Live Objects.
- Plans.
- Spaces.
- Call history.
- Status/Channel state.

This pass does not solve sync protocol.

## 39. Device-Local/Account-Synced State

Potential device-local:

- Recent search history initially.
- Downloaded media/cache.
- Some drafts depending final policy.
- Local UI preferences.
- OS-specific notification overrides.

Likely synchronized:

- Profile.
- Username.
- Conversation membership.
- Messages per sync architecture.
- Live Objects.
- Read/delivery semantics where appropriate.
- Blocks.
- Privacy settings where appropriate.
- Linked-device list.

## 40. Draft-Sync Decision

SEY-003/Pass 01 support durable local drafts.

Future decision:

- Drafts remain device-local.
- Drafts eventually sync.

Do not silently change current local-first behavior.

## 41. Device Status/Last Active

Device names:

- Windows PC.
- iPhone.
- Android phone.
- MacBook.

Avoid opaque hardware identifiers. User rename may be useful later.

Last active:

- Active now.
- 12 minutes ago.
- Yesterday.

This is account-owner security context, not social presence.

Statuses:

- current.
- active.
- offline.
- revocation_pending.
- revoked.
- unknown.

## 42. Session Expiry/Reauthentication

Session expired copy:

```text
Your session expired. Sign in again to continue.
```

Preserve local unsent/draft state where safely possible.

Sensitive actions may require reauthentication:

- Link device.
- Remove device.
- Change phone number.
- Change critical security settings.
- Account deletion.
- Recovery changes.

Mechanism is out of scope.

## 43. Recovery Boundary

Recovery requirements:

- Recover existing User identity.
- Prevent easy account takeover.
- Handle lost-phone scenario.
- Handle no-access-to-old-device scenario.
- Preserve or intentionally lose encrypted history depending future E2EE.

Do not invent security questions, recovery keys, email fallback, or support override without later research.

## 44. Lost Phone/Number Change

Separate:

- Lost device.
- Lost phone number.
- Changed phone number.

Changing phone number should attach a new handle to same User where verified and policy allows. Do not create a new account by default.

## 45. Visibility/Discoverability Boundary

Separate:

- Who can see my phone number?
- Who can find me by phone number?
- Who can find me by username?
- Who can message me?

These are distinct privacy questions. Detailed controls belong to Pass 08.

## 46. Contact Removal/Invites

Removing a Seyloq relationship/contact does not necessarily:

- Delete conversation.
- Block person.
- Delete history.
- Remove shared groups.

Invite non-user uses OS share conceptually. Do not implement SMS/email infrastructure or spammy automatic invitations.

## 47. New-User Empty State

After onboarding with no conversations:

```text
No conversations yet.
Find someone by username, scan a QR code, or start with people you know.
```

Actions:

- New chat.
- Search.
- Scan QR.

Do not expose advanced Seyloq concepts yet.

## 48. New Chat Architecture

Compact surface:

```text
New chat
  Search people
  Your contacts on Seyloq
  New group
  Scan QR
  Invite to Seyloq
```

Channels/Communities creation should not clutter New Chat.

## 49. Group Creation

Flow:

```text
New group -> select people -> group name -> optional avatar -> create
```

Do not require Community/Space decisions. A group starts as normal conversation.

## 50. Profile Surfaces

Own profile:

- Avatar.
- Display name.
- Username.
- QR.
- Bio/about.
- Account/settings entry.

Other-person profile:

- Identity.
- Username where visible.
- Mutual context where permitted.
- Message.
- Call.
- Media/context.
- Block/report.

No follower/following metrics.

## 51. Identity Across Groups/Channels/Communities/Calls/Search

Groups:

- Use local contact name if available; otherwise display name; username where useful/allowed; avatar.
- Avoid phone number as visible identity where hidden.

Channels:

- Channel identity separate from user/admin identity.

Communities:

- Membership exposes only permitted identity info.

Calls:

- Incoming call shows display name, avatar, conversation/group identity, unknown-caller state.

Search:

- People results use privacy-filtered metadata and never reveal hidden phone, private bio, unauthorized membership, or blocked metadata.

## 52. Identity Conflicts/Duplicate Contacts

Conflicts:

- username unavailable.
- phone already associated.
- account already exists.
- device already linked.
- identity link invalid.

Use recovery paths. Do not create duplicate accounts to escape conflict.

Address books may contain duplicates/old numbers/multiple labels. Avoid presenting duplicates as separate Seyloq people where stable identity proves same User.

## 53. Trust Indicators

Do not invent meaningless Trusted/Secure/Verified badges.

Future indicators must correspond to actual mechanisms:

- Verified organization.
- Security identity verified.
- Known contact.

Reserve until defined.

## 54. Safety/Abuse Boundary

Future requirements:

- Message requests.
- Spam limits.
- Username enumeration resistance.
- Phone-number enumeration resistance.
- QR abuse controls.
- Malicious invite links.
- Impersonation.
- Account takeover.
- Device-link phishing.
- Stolen-device response.
- Block/report enforcement.

No implementation in this pass.

## 55. Privacy Boundary

Future privacy architecture must define:

- Phone visibility/discoverability.
- Username discoverability.
- Profile-photo visibility.
- Bio visibility.
- Last-seen/online visibility.
- Read receipts.
- Group invitation permissions.
- Call permissions.
- Status audience.
- Contact sync retention.
- Blocked-user behavior.

Pass 08 owns detailed settings.

## 56. E2EE Boundary

Device identity is central to future E2EE.

Future architecture may require:

- Per-device keys.
- Device verification.
- Key change signals.
- History transfer.
- New-device bootstrap.
- Revocation.
- Session establishment.

Do not design cryptography here. Do not imply device linking automatically grants historical encrypted content.

## 57. Local-First/Logout Boundary

Auth failure should not unnecessarily destroy local state.

Preserve where safe:

- Drafts.
- Queued local operations.
- Cached history.
- Local settings.

Do not confuse signed out with erase local data.

Distinct actions:

- Log out current device.
- Remove another device.
- Delete account.

Never collapse these into one generic Remove action.

## 58. Responsive Architecture

Onboarding:

- Mobile: focused step flow.
- Tablet: centered narrow flow.
- Desktop: centered compact card/pane, not edge-to-edge.

Contacts/People:

- Mobile: pushed New Chat/person search.
- Tablet: list plus optional detail.
- Desktop: compact people/search pane with optional profile detail.

Linked devices:

- Mobile: Settings -> Linked devices -> detail.
- Desktop: settings content region with list/detail.

No CRM-like contact manager.

## 59. Accessibility

Onboarding:

- Proper form labels.
- Verification-code semantics.
- Error association.
- Focus progression.
- Keyboard completion.
- Screen-reader instructions.
- Large text.
- Reduced motion.
- Accessible permission explanation.

QR:

- QR is not the only path.
- Own QR includes accessible identity text.
- Scanner announces ready, recognized, invalid, permission unavailable.

Devices:

- Device status text: This device, Active, Last active, Revoked.
- Destructive removal confirmation has clear focus and labels.

## 60. Motion

Use restrained motion for:

- Onboarding transitions.
- Profile setup.
- QR recognition.
- Device-link success.
- Device removal.
- Permission sheets.

No celebratory/gamified identity animations. Respect reduced motion.

## 61. Component Hierarchy

Components:

```text
OnboardingShell
OnboardingStep
IdentityBootstrap
VerificationInput
ProfileSetup
AvatarEditor
UsernameField
PermissionPrimer
NewChat
PersonSearch
PersonResult
PersonProfile
UnknownPersonNotice
MessageRequest
ContactDiscovery
ContactSyncState
InvitePerson
IdentityQR
QRScanner
IdentityPreview
LinkedDevices
DeviceList
DeviceListItem
DeviceDetail
DeviceLinkRequest
DeviceLinkApproval
DeviceRevocationDialog
SessionExpired
ReauthenticationPrompt
IdentityErrorState
```

Reuse existing primitives. Do not build another component system.

## 62. Conceptual Data Model

UX concepts:

```text
User
Profile
IdentityHandle
PhoneHandle
UsernameHandle
Device
Session
Connection
ContactRelationship
ContactDiscoveryRecord
BlockRelationship
MessageRequest
DeviceLinkRequest
```

Relationship:

```text
User
  Profile
  IdentityHandle*
  Device*
    Session*
  ContactRelationship*
```

Conceptual only; not backend schema.

## 63. Identity State Machine

```text
unknown -> bootstrap -> verifying -> identified -> profile_ready -> ready
```

Branches:

- verification_failed.
- existing_identity.
- recovery_required.
- blocked/disabled future.

## 64. Contact-Permission State Machine

```text
not_requested -> primer -> requested
```

Branches:

```text
granted -> syncing -> available
denied
restricted
sync_failed
```

Denial permits alternate discovery.

## 65. Message-Request State Machine

If approved:

```text
incoming -> pending -> accepted
```

Branches:

- blocked.
- reported.
- deleted.
- expired later.

Accepted request transitions to normal conversation behavior.

## 66. Device-Linking State Machine

```text
unlinked -> request_created -> awaiting_approval -> approved -> establishing -> linked
```

Branches:

- rejected.
- expired.
- failed.
- cancelled.

No silent linking.

## 67. Device-Revocation State Machine

```text
linked -> revocation_requested -> revocation_pending -> revoked
```

Branch:

- revocation_failed.

UI must not show revoked until authoritative architecture confirms it.

## 68. Session State Machine

```text
unauthenticated -> authenticating -> active -> expired
```

Branches:

- revoked.
- signed_out.
- reauthentication_required.

Do not expose token lifecycle.

## 69. Interaction Matrix

| Interaction                 | Surface         | Immediate result    | Durable result                | Failure            | Offline                    | Privacy/security boundary |
| --------------------------- | --------------- | ------------------- | ----------------------------- | ------------------ | -------------------------- | ------------------------- |
| Start onboarding            | Welcome         | Onboarding begins   | None                          | None               | App may show offline state | Minimal data              |
| Continue existing account   | Onboarding      | Auth path           | Session/device authorization  | Auth fail          | Limited                    | Recovery/security policy  |
| Bootstrap identity          | Identifier step | Verification starts | User identified/created later | Conflict           | Usually unavailable        | Phone/handle privacy      |
| Verify identity             | Verification    | Verifying           | Auth state                    | invalid/expired    | No                         | Rate limiting             |
| Set display name            | Profile setup   | Name set            | Profile update                | Validation         | Queue?                     | Profile visibility        |
| Choose/change username      | Username field  | Availability check  | Handle update                 | unavailable        | No                         | Enumeration resistance    |
| Skip username               | Setup           | Continue            | No username                   | None               | Yes                        | Discoverability reduced   |
| Enable/deny contacts        | Primer          | Permission/result   | Contact sync state            | denied/failed      | Alternate discovery        | Contact privacy           |
| Search person               | New Chat/Search | Results             | None                          | no result          | Local/cached               | Privacy-filtered          |
| Open profile                | Result          | Profile opens       | None                          | unavailable        | cached                     | Handle visibility         |
| Start conversation          | Profile         | Conversation opens  | Conversation created          | not allowed        | Queue if supported         | Message-request policy    |
| Receive unknown message     | Chats/request   | Request shown       | Pending request               | unavailable        | Cached                     | Abuse boundary            |
| Accept/block/report request | Request         | State changes       | Relationship/report           | fail               | Queue if safe              | Safety                    |
| Show/scan QR                | Profile/scanner | QR/preview          | None/contact action later     | invalid/permission | Manual alternative         | No silent exposure        |
| Open identity link          | Link            | Preview             | None/action later             | invalid/expired    | Maybe no                   | Link privacy              |
| Invite non-user             | New Chat        | OS share            | Invitation sent by OS         | cancelled          | OS-dependent               | No spam automation        |
| Create group                | New Chat        | Flow starts         | Group conversation            | fail               | Queue?                     | Member visibility         |
| Open linked devices         | Settings        | Device list         | None                          | unavailable        | cached                     | Owner only                |
| Link new device             | Devices         | Link request        | Device linked                 | rejected/expired   | No                         | Reauth/approval           |
| Approve/reject link         | Approval        | Decision            | Link/reject                   | fail               | No                         | Phishing resistance       |
| Inspect/remove device       | Devices         | Detail/confirm      | Revocation                    | fail/pending       | pending                    | Sensitive action          |
| Session expires             | App shell       | Reauth prompt       | Session refreshed             | fail               | Local state preserved      | Auth boundary             |
| Log out current device      | Settings        | Confirm/logout      | Session ended                 | fail               | local pending?             | Local data policy         |
| Change phone number         | Future settings | Verification flow   | Handle update                 | conflict           | No                         | Sensitive action          |
| Recover account             | Future boundary | Recovery flow       | Account restored/failed       | fail               | No                         | Security-critical         |

## 70. Screen/Surface Inventory

Onboarding:

- Welcome.
- Identity bootstrap.
- Verification.
- Profile setup.
- Contact primer.
- Ready/empty Chats.

Identity/profile:

- Own profile.
- Other-person profile.
- Username editor.
- QR display.
- QR scanner.
- Identity preview/link preview.

People/contact:

- New Chat.
- Person search.
- Contact discovery state.
- Invite surface.
- Message request.

Devices:

- Linked devices list.
- Device detail.
- Link request.
- Link approval.
- Revocation dialog.
- Session expired / reauth prompt.

## 71. Empty/Error States

Required states:

- No contacts permission.
- No Seyloq contacts found.
- No person found.
- Username unavailable/invalid.
- Identity already exists.
- Verification failed/expired/too many attempts.
- Contact sync failed/stale.
- QR invalid/expired/unsupported.
- Camera permission denied.
- Identity link invalid.
- Message request unavailable.
- No linked devices beyond current.
- Device-link expired/rejected/failed.
- Device limit reached.
- Device unavailable.
- Device revocation failed.
- Unknown device warning.
- Session expired.
- Reauthentication required.
- Recovery unavailable.
- Account state unavailable.
- Offline identity action unavailable.

Each needs clear recovery or fallback.

## 72. Backend/Protocol Requirements

Future requirements:

- Stable User identity.
- Identity handles.
- Username uniqueness.
- Phone-handle verification.
- Profile.
- Contact-discovery protocol.
- Privacy-filtered people search.
- Message-request state.
- Block relationships.
- Device registration.
- Device authorization.
- Device-link request.
- Device revocation.
- Session lifecycle.
- Reauthentication.
- Identity-change events.
- Device-list synchronization.
- Account recovery.
- Idempotent identity mutations.
- Rate limiting / anti-enumeration.

No backend implementation.

## 73. Native Requirements

Future needs:

- Contacts permission/access.
- Camera/QR scanning.
- Secure credential storage.
- Device metadata.
- Biometrics/passkeys where supported.
- Deep links.
- OS share.
- Notification permission.
- App lifecycle.
- Device attestation only if justified.

No native plugins in this pass.

## 74. Security Requirements

Future requirements:

- Account takeover resistance.
- Credential/session protection.
- Secure local credential storage.
- Device-link phishing resistance.
- Replay-resistant link approval.
- Session revocation.
- Username/phone enumeration resistance.
- Contact-discovery privacy.
- Rate limiting.
- Suspicious-device review.
- Reauthentication for sensitive actions.
- Recovery security.

Do not choose auth/security protocols without research.

## 75. Privacy Requirements

Future requirements:

- Contact-upload minimization.
- Contact retention/deletion.
- Phone visibility/discoverability.
- Username discoverability.
- Profile visibility.
- QR information exposure.
- Mutual-group disclosure.
- Message-request privacy.
- Block behavior.
- Device metadata retention.
- Last-active device metadata.
- Identity-link privacy.

Pass 08 turns these into detailed controls where appropriate.

## 76. Open Product Owner Decisions

1. Is phone number required for initial account bootstrap?
2. Is username optional or required during onboarding?
3. Can users skip profile photo?
4. Can users skip contact permission?
5. When should notification permission be requested?
6. Does onboarding expose QR discovery immediately or later?
7. Are usernames globally unique and case-insensitive?
8. Is username exact-match search supported?
9. Is display-name search supported globally?
10. Can users disable username or phone-number discoverability?
11. Can phone number be hidden from everyone except chosen users?
12. Do existing contacts see phone-number changes?
13. Is Message Requests required for unknown people?
14. Which users can DM without a request?
15. Can shared-group or Community co-members DM without request?
16. Can Channel followers contact Channel admins?
17. Are QR identity codes permanent or rotatable?
18. Do identity links expire?
19. Does scanning QR add contact or only open profile?
20. What does Add contact mean inside Seyloq?
21. Does removing a contact affect conversation history?
22. What exactly syncs from OS contacts and how often?
23. Are recent person searches device-local?
24. Are drafts device-local or synchronized?
25. What information identifies a linked device?
26. Can users rename linked devices?
27. What device limit exists, if any?
28. Does device linking require approval from existing device?
29. What happens if no trusted device is available?
30. Which actions require reauthentication?
31. Does removing a device immediately remove access once online?
32. How should offline revocation be represented?
33. Are browser sessions Devices or Sessions?
34. How is lost phone distinct from lost phone number?
35. How is changing phone number represented to contacts?
36. Which identity changes generate system messages?
37. What happens to local data and queued unsent messages after logout?
38. Is account recovery possible without original phone number?
39. Which recovery decisions wait for E2EE architecture?
40. How should blocking behave inside shared groups?
41. Can a blocked user find the blocker by username?
42. Which profile fields are visible to unknown people?
43. Should mutual groups show in person search?
44. Which Identity/Contacts capabilities are MVP versus later?

## Human Review Boundary

This pass defines Identity, Onboarding, Contacts, and Devices UX architecture only. It does not implement authentication, auth providers, OTP, passkeys, recovery, contact sync/upload, people-search backend, username backend, QR scanner, deep links, device linking, session backend, secure credential storage, device revocation, E2EE/device keys, native plugins, production UI, Pass 01-06 redesign, primary navigation changes, Settings/Privacy/Security, or Pass 08.

SEY-006 UX Architecture Pass 07 - Identity, Onboarding, Contacts & Devices ready for Human Review.
