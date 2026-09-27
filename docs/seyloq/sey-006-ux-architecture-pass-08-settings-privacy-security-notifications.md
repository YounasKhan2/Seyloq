# SEY-006 - Complete Product UX Architecture

Pass 08: Settings, Privacy, Security & Notifications  
Base: SEY-006 Pass 01 through Pass 07

## 01. Settings Design Laws

Settings exposes meaningful human choices, not implementation details.

Laws:

- Settings is not primary navigation.
- Entry stays behind profile/avatar/account affordance.
- Privacy/security defaults should make ordinary use safe without requiring expertise.
- Profile, Account, and Privacy are distinct.
- Device remains the human-facing management unit; Session remains mostly implementation/security.
- Notification settings reduce anxiety rather than manufacture engagement.
- Technical diagnostics are not part of ordinary Settings.
- Destructive actions require clear consequence and confirmation.
- E2EE/security claims require real architecture.

## 02. Settings Entry

Entry:

```text
Avatar -> Profile/account surface -> Settings
```

Desktop may use account popover. Mobile may use profile/account screen. Do not add Settings, Privacy, Security, or Notifications to `Chats / Updates / Calls`.

## 03. Settings IA

Recommended first-level IA:

- Profile
- Account
- Privacy
- Security & devices
- Notifications
- Chats
- Calls
- Updates
- Storage & data
- Appearance & accessibility
- Help & safety

The IA should be compact and Seyloq-specific, not copied wholesale from other messengers.

## 04. Progressive Disclosure Model

Do not expose immediately:

- Session tokens.
- Cryptographic keys.
- WebSocket state.
- Database state.
- Sync cursors.
- Push tokens.
- Device UUIDs.
- Contact hashes.
- AI provider details.
- Protocol versions.

Diagnostics, if needed later, belong in a separate future diagnostic/developer surface.

## 05. Profile/Account/Privacy Distinction

Profile: how others recognize the user.

- Avatar.
- Display name.
- Username.
- Bio/about.
- QR.

Account: durable identity/lifecycle.

- Identity handles.
- Change identifier.
- Recovery entry.
- Account information.
- Delete account.

Privacy: who can find, see, contact, call, invite, view presence, and view Status.

## 06. Profile Settings

Profile settings include:

- Avatar.
- Display name.
- Username.
- Bio/about.
- QR identity.

Changing presentation does not create a new User. Profile fields are not authentication credentials.

## 07. Account Settings

Conceptual account controls:

- Current identity handle(s).
- Change phone/primary bootstrap identifier where applicable.
- Recovery/security entry.
- Account information.
- Delete account.

Changing phone/identifier preserves the same durable User where policy allows.

## 08. Account Deletion Boundary

Account deletion is distinct from:

- Log out.
- Remove device.
- Clear cache.
- Delete conversation.
- Delete local data.

Requires:

- Clear destructive explanation.
- Future reauthentication.
- Explicit confirmation.
- Ownership consequences.
- Data-retention explanation.

Unresolved consequences: Groups, Channels, Communities, Live Objects, Plans, Spaces, message history, shared media, Expenses.

## 09. Privacy Dashboard

Privacy sections:

- Discoverability.
- Profile visibility.
- Presence.
- Messaging.
- Calls.
- Groups & Communities.
- Status.
- Blocked people.
- Read receipts.
- Location.
- AI/data controls where applicable.

Avoid an undifferentiated toggle list.

## 10. Phone Visibility

Question:

```text
Who can see my phone number?
```

Potential options later:

- Everyone.
- My contacts.
- Nobody.

Communication does not automatically grant phone-number visibility.

## 11. Phone Discoverability

Question:

```text
Who can find me using my phone number?
```

Visibility and discoverability are independent. Hidden does not automatically mean undiscoverable; visible does not automatically mean discoverable.

## 12. Username Discoverability

Question:

```text
Who can find me by username?
```

Evaluate Everyone, known relationships, Nobody, and exact username lookup behavior. Do not introduce recommendation-driven people discovery.

## 13. Profile Visibility

Controls may cover:

- Profile photo.
- Bio/about.

Audience concepts should reuse familiar audience primitives where appropriate: Everyone, Contacts, Contacts except, Nobody.

## 14. Presence

Controls:

- Online.
- Last seen.

Questions:

- Who can see last seen?
- Who can see online?
- Does online follow last-seen policy?

Do not confuse social presence with linked-device last-active.

## 15. Read Receipts

Settings architecture:

```text
Read receipts: on/off
```

Must document effects on:

- 1:1 conversations.
- Groups.
- Status viewers.
- Channels.
- Live Objects.

Do not assume one toggle applies identically everywhere.

## 16. Typing/Recording Indicators

Evaluate whether typing/recording indicators are:

- Always part of realtime messaging.
- Privacy-controlled.
- Future-only.

Do not add controls only because competitors have them.

## 17. Message Requests Policy

Unknown direct contacts use a Message Requests boundary.

Settings questions:

- Who can message me directly?
- Who goes to requests?

Relationship categories:

- Contacts.
- Shared-group members.
- Community co-members.
- Username/QR strangers.

Avoid ACL-editor complexity.

## 18. Calls Privacy

Question:

```text
Who can call me?
```

Potential policies:

- Everyone allowed by messaging policy.
- Contacts.
- Known relationships.
- Silence unknown callers.

Integrates with Pass 04. Avoid unclear semantics that block important communication unexpectedly.

## 19. Group Invitation Privacy

Question:

```text
Who can add me to groups?
```

If direct addition is disallowed, use invite/request semantics. Do not automatically extend group policy to Communities without analysis.

## 20. Community Invitation Privacy

Question:

```text
Who can invite me to Communities?
```

Community membership is not group membership. Preserve Pass 05 distinctions.

## 21. Status Privacy

Settings defines default Status audience. Per-publish audience remains visible before publishing.

Potential default:

- My contacts.
- My contacts except.
- Only share with.

No follower-based Status privacy.

## 22. Channel Privacy

Following a Channel is not a contact relationship.

Channel settings:

- Follow state.
- Mute.
- Notification level.
- Follower identity visibility where applicable.

Following must not expose private user information.

## 23. Blocking

Central surface:

```text
Blocked people
```

Capabilities:

- Review blocked identities.
- Unblock.
- Understand effects.

Blocking survives username, phone, and profile changes because it targets durable identity.

## 24. Blocking Semantics

Document impact across:

- Direct messages.
- Calls.
- Status.
- Person search/discovery.
- Shared groups.
- Communities.
- Channels.

Shared-group coexistence may remain possible, but blocking must not be trivially bypassed through another surface.

## 25. Reporting

Blocking and reporting are separate:

- Block.
- Report.
- Block and report.

Reporting may need reason, optional recent-message context, and confirmation. Do not imply reports expose E2EE plaintext unless future security architecture supports it.

## 26. Safety Center

Lightweight Help & safety may contain:

- Blocked people.
- Report/help guidance.
- Account security guidance.
- Privacy guidance.
- Support.

Avoid fear-driven copy and large trust/safety dashboard for MVP.

## 27. Security Settings

Human-facing security area:

- Linked devices.
- Security notifications.
- Reauthentication/security controls.
- Future passkey/biometric options.
- Recovery entry.

No implementation internals.

## 28. Linked Devices Integration

Settings provides:

```text
Security & devices -> Linked devices
```

Do not redesign Pass 07. Preserve Device/Session/Connection distinction.

## 29. Security Notifications

Meaningful events:

- New device linked.
- Device removed.
- Suspicious/unknown device event if future backend can establish it.
- Important identity/security change.

Avoid notifications for routine token/session rotation.

## 30. Security Identity-Change Boundary

Future E2EE may introduce security identity/device key changes. Reserve human-readable notification model but do not invent safety numbers, fingerprints, or key verification before E2EE research.

## 31. Reauthentication

Sensitive actions may require future reauthentication:

- Change phone/critical identifier.
- Link/remove device.
- Recovery changes.
- Account deletion.
- Critical privacy/security changes where justified.

Do not choose OTP/password/passkey/biometric mechanism.

## 32. App Lock

Optional local privacy feature:

```text
Lock Seyloq with device authentication
```

It is not account authentication.

Future policy:

- Lock timing.
- Notification preview behavior.
- Call behavior while locked.
- Background behavior.

No biometric implementation.

## 33. E2EE Settings Boundary

Do not expose an End-to-end encryption toggle.

If E2EE is core security later, users should not casually disable it. Future surfaces may expose verification, device/key changes, and encrypted backup/recovery controls only after E2EE architecture exists.

## 34. Disappearing Messages

Evaluate conversation-level feature:

- Off.
- 24 hours.
- 7 days.
- 90 days.

Do not freeze durations. Distinguish from manual deletion, Status expiry, and Live Object lifecycle.

## 35. Default Message Timer

If Settings offers default timer, it applies to new eligible conversations only unless user explicitly changes existing conversations. Document group-admin implications.

## 36. Location Privacy

Pass 02 rules remain:

- Explicit sharing.
- Bounded live-location duration.
- No indefinite sharing.
- Obvious Stop.
- Minimization.

Settings may explain controls. Active live location stop must remain in conversation/context. Active live locations in Settings is optional if multiple active shares justify it.

## 37. AI Privacy Controls

Pass 06 remains authoritative.

Potential future controls:

- Contextual AI features.
- AI data/privacy information.

Do not claim on-device, zero retention, never used for training, or E2EE compatibility without implementation.

## 38. AI-Disable Behavior

If optional AI is disabled:

- Ordinary search remains.
- Literal filters remain.
- Manual Live Object creation remains.
- Normal messaging remains.

Core messenger behavior cannot depend on AI.

## 39. Search Privacy

Pass 06 recent searches are device-local initially.

Settings may expose:

- Clear recent searches.
- Future search history controls.

Clearing search history does not delete messages/content.

## 40. Contact-Sync Controls

Settings may expose:

- Contact discovery enabled.
- Refresh/sync.
- Disable contact discovery.

Do not imply server-side deletion unless backend/privacy architecture guarantees it.

## 41. Notification Design Laws

Notifications help users notice meaningful communication without anxiety or engagement pressure.

No:

- Engagement reminders.
- "People are waiting for you."
- Trending alerts.
- Streaks.
- FOMO nudges.
- Algorithmic re-engagement.

## 42. Global Notification IA

Categories:

- Messages.
- Groups.
- Calls.
- Live Objects / reminders.
- Updates / Status.
- Channels.
- Communities.
- Security.

Keep first-level presentation compact with sensible defaults.

## 43. Message Notifications

Controls may include:

- Direct message notifications.
- Sound.
- Vibration where supported.
- Preview.

Avoid dozens of sound-level settings. Delegate OS-specific controls where sensible.

## 44. Group Notifications

Support:

- Group notifications.
- Mentions/replies.
- Mute.

Muted groups may be mentions/replies only or fully muted depending user choice. Exact behavior must be explicit.

## 45. Per-Conversation Notifications

From conversation info/context:

```text
Notifications -> Default / Mute
```

Potential mute durations:

- 1 hour.
- 8 hours.
- 1 week.
- Always.

Do not freeze presets unnecessarily.

## 46. Call Notifications

Incoming call signaling differs from ordinary notification delivery.

Settings may control:

- Call permissions/privacy.
- Ringtone/OS behavior where supported.
- Silence unknown callers.

Ordinary notification mute should not break call semantics without clear policy.

## 47. Live Object Notifications

Push-worthy candidates:

- Reminder due.
- Event changed materially.
- Direct checklist assignment.
- Expense/payment action directly involving user.
- Live-location safety/end state where appropriate.

Usually ambient:

- Someone voted in poll.
- Someone checked unrelated item.
- Minor Plan update.
- Passive Decision acknowledgement.

Avoid notification explosion.

## 48. Event Notifications

Distinguish:

- Event reminder.
- Event update.
- Event cancellation.
- RSVP change.

Not every RSVP by another participant should notify everyone.

## 49. Expense Notifications

Potential:

- You were added to an expense.
- Your amount changed.
- Payment marked paid involving you.
- Expense resolved.

Avoid notifying everyone for every payment mutation.

## 50. Checklist Notifications

Potential direct notifications:

- Item assigned to you.
- Assignment changed.
- Due reminder if due dates later exist.

Do not notify entire conversation for every checked item by default.

## 51. Reminder Notifications

Personal reminders notify their owner. Group reminders remain permission-aware. Ordinary participants must not spam everyone with reminders.

## 52. Status Notifications

Status is generally passive in Updates.

Do not push every new Status. Exceptions may include direct Status reply/reaction or explicit future favorite/subscription policy.

## 53. Channel Notifications

Following does not automatically mean high-volume push.

Potential levels:

- All updates.
- Important/highlights later.
- Muted.

Prefer deterministic behavior. Do not introduce recommendation/engagement ranking.

## 54. Community Notifications

Community notifications derive from:

- Announcement surface.
- Joined groups.
- Direct mentions/replies.

Do not create duplicate notifications for same event across Community and Group.

## 55. Security Notifications

Important security notifications should be difficult to suppress:

- New device linked.
- Device removed.
- Critical account/security change.

Determine mandatory in-app events even when push is disabled. Avoid fake urgency.

## 56. Notification Previews

Potential states:

- Always.
- When unlocked.
- Never.

Consider sender name, message content, Live Object details, and call identity. Do not expose sensitive lock-screen content against policy.

## 57. Badges

Conservative badges:

- Chats unread count.
- Calls missed indicator.
- Updates lightweight dot.

Evaluate Channel/Community badge semantics. Avoid red-number proliferation.

## 58. Notification Deduplication

Global law:

> Multiple representations of one event must not become multiple independent alerts.

Deduplicate across push, in-app banner, conversation badge, Calls history, Updates, and Community.

## 59. Foreground Behavior

Notification behavior adapts when:

- Same conversation active.
- Different conversation active.
- Calls active.
- Settings open.

If user is viewing same conversation, avoid redundant push-style interruption.

## 60. Permission Timing

Do not request OS notification permission immediately without context.

Potential timing:

- After onboarding explanation.
- After first meaningful communication.

Denial does not block messaging.

## 61. Notification Failure Semantics

Push delivery is not message-delivery truth.

Separate:

- Message delivered.
- Notification delivered.
- Notification displayed.

Only expose states supported by future architecture.

## 62. Multi-Device Notifications

Expected UX:

- Eligible devices may receive event.
- Active/read state reconciles.
- Other-device alerts may clear/suppress.

Do not design protocol. Calls follow Pass 04 answer race.

## 63. Notification Quieting

Evaluate:

- Mute conversation.
- Mute Channel.
- Mute Community.
- Silence unknown callers.
- OS Focus/DND integration.

Do not build enterprise notification schedules initially. Quiet hours may be future.

## 64. Chats Settings

Keep limited:

- Default disappearing-message timer.
- Media behavior.
- Enter-to-send on desktop.
- Chat appearance where relevant.
- Archive behavior if needed.

Challenge every setting.

## 65. Archive Settings

Archived remains secondary. Evaluate "Keep chats archived" only if behavior genuinely needs user control.

## 66. Media Settings

Potential:

- Automatic media download.
- Save received media to device/gallery.
- Upload quality later.

Platform-aware; do not imply media exists locally before download.

## 67. Automatic Downloads

Potential compact control:

- Wi-Fi only.
- Wi-Fi + mobile.
- Never.

Challenge complexity and avoid overdesign before media architecture.

## 68. Storage & Data

Surface:

- Local cache usage.
- Downloaded media.
- Clear cache.
- Network/media preferences.
- Future per-conversation storage.

Distinguish Clear cache, Delete downloaded files, Delete conversation content, Delete cloud/server content.

## 69. Storage Management

Future compact view:

- Seyloq storage.
- Media.
- Files.
- Cache.

Per-conversation breakdown only if useful. Do not build filesystem manager.

## 70. Clear Cache

Safe meaning:

```text
Clear cached/downloadable local copies
```

Does not delete messages, Live Objects, account state, or other participants' content.

## 71. Local Data Deletion

Separate destructive operation:

```text
Erase local data on this device
```

Requires sync/recovery semantics before implementation.

## 72. Data Usage

Potential:

- Media auto-download.
- Call data-saving mode.

Avoid exact bandwidth controls without implementation evidence.

## 73. Calls Settings

Potential:

- Silence unknown callers.
- Low-data mode.
- Device routing entry where platform supports.

Contextual in-call controls remain primary for microphone/camera selection.

## 74. Updates Settings

Potential:

- Status privacy default.
- Muted Status.
- Channel notification defaults.
- Community announcement preferences.

No feed/recommendation controls.

## 75. Appearance

Potential:

- System.
- Light.
- Dark.

Extensive theming is not required unless product strategy needs it.

## 76. Personalization

Accent/personalization is optional/later unless justified. It must not undermine contrast, semantic states, Live Object grammar, or brand consistency.

## 77. Text Size

Prefer OS/system accessibility scaling. If Seyloq adds internal text-size adjustment, compact responsive layouts must still work.

## 78. Accessibility Settings

Most accessibility is built in, not an accessible mode.

Possible settings only where OS is insufficient:

- Reduced motion.
- High contrast support if needed.
- Text scaling integration.
- Captions/transcripts behavior.

## 79. Language

Initial behavior may follow system language. Future manual override can live here. Do not conflate app language with message translation.

## 80. Translation Preferences

Future:

- Preferred translation language.

Translation remains explicit/contextual unless later decided otherwise. Do not auto-translate private messages by default.

## 81. Accessibility Behavior

Settings requirements:

- Semantic headings.
- Keyboard navigation.
- Visible focus.
- Screen-reader labels.
- Large-text reflow.
- Destructive-action clarity.
- Toggle state announcements.
- No color-only state.
- Reduced motion.

Notifications must be understandable without relying on avatar, color, or sound.

## 82. Responsive Settings

Mobile:

```text
Settings root -> category -> detail
```

Tablet:

```text
Settings category list | detail pane
```

Desktop:

```text
Settings sidebar | settings content
```

Keep density compact. No giant dashboard cards.

## 83. Settings Search Decision

MVP likely does not need Settings search if IA remains compact. Do not add search merely because operating systems have it.

## 84. Save Behavior

Prefer immediate persistence for simple reversible toggles.

Use explicit confirmation for destructive actions, identity changes, device revocation, and high-consequence privacy changes.

Do not add generic Save to every page.

## 85. Optimistic Setting Behavior

Local-first where safe:

```text
change -> local pending UI -> durable request -> acknowledge/reconcile
```

Security-sensitive settings may require authoritative confirmation before success.

## 86. Settings Sync State

Avoid sync indicators everywhere. Show only meaningful:

- Saving.
- Couldn't save.
- Retry.

Privacy/security changes must not falsely appear applied after rejection.

## 87. Cross-Device Setting Classification

Account-synchronized potential:

- Privacy.
- Blocks.
- Profile.
- Status default audience.
- Message-request policy.

Device-local potential:

- Download/cache behavior.
- OS notification details.
- Local app lock.
- Appearance override.
- Recent search history.

Hybrid:

- Notification preferences.
- Language.
- Chat appearance.

## 88. Offline Settings

Local settings can change offline. Server-authoritative settings may be queued, pending, or unavailable depending risk.

Never claim a critical privacy change has taken effect remotely if it has not.

## 89. Settings Provenance

Distinguish:

- Seyloq setting.
- Device/OS setting.
- Conversation-specific override.
- Channel-specific override.
- Community-specific override.

If OS notifications are disabled, provide route to system settings where supported.

## 90. Component Hierarchy

Components:

```text
SettingsShell
SettingsNav
SettingsSection
SettingsRow
SettingsToggle
SettingsChoice
SettingsDisclosure
SettingsStatus
ProfileSettings
AccountSettings
PrivacySettings
SecuritySettings
NotificationSettings
ChatSettings
CallSettings
UpdateSettings
StorageSettings
AccessibilitySettings
HelpSafetySettings
AudiencePicker
PrivacyRule
BlockedPeople
MessageRequestPolicy
LinkedDevicesEntry
NotificationCategory
MutePicker
StorageSummary
ClearCacheDialog
DestructiveAction
ConfirmationDialog
PendingSettingState
SettingError
```

Reuse existing primitives.

## 91. Conceptual Data Model

UX-level concepts:

```text
UserSettings
ProfileSettings
PrivacyPolicy
DiscoverabilityPolicy
PresencePolicy
MessagingPolicy
CallPolicy
StatusAudienceDefault
BlockRelationship
SecurityPreference
DeviceSecurityEvent
NotificationPreference
ConversationNotificationOverride
ChannelNotificationOverride
CommunityNotificationOverride
ChatPreference
MediaPreference
StoragePreference
AccessibilityPreference
AppearancePreference
LanguagePreference
```

Not backend schema.

## 92. Privacy State Model

```text
authoritative -> local_edit -> pending -> applied
```

Branches:

- failed.
- conflict.
- reauthentication_required.
- offline_pending.

Security-sensitive privacy settings must not falsely display applied.

## 93. Notification Preference Model

Effective behavior derives from:

```text
global default -> category default -> surface/conversation override -> OS capability
```

Example:

```text
OS notifications disabled > Seyloq global enabled > conversation enabled = no OS notification
```

## 94. Block State Machine

```text
unblocked -> block_requested -> blocked
blocked -> unblock_requested -> unblocked
```

Branches:

- pending.
- failed.
- offline_pending if safe.

Reporting is separate.

## 95. Mute State Model

```text
default -> muted_until(time) -> default
default -> muted_indefinitely
```

Applies to conversation, Status person, Channel, Community where appropriate. Semantics may differ per surface.

## 96. App-Lock State Model

If approved:

```text
disabled -> enable_requested -> enabled
```

Runtime:

```text
unlocked -> background/timeout -> locked -> device authentication -> unlocked
```

App lock is local protection, not logout.

## 97. Interaction Matrix

| Interaction                   | Surface           | Immediate result     | Durable result   | Failure     | Offline behavior    | Cross-device   | Privacy/security implication           |
| ----------------------------- | ----------------- | -------------------- | ---------------- | ----------- | ------------------- | -------------- | -------------------------------------- |
| Open Settings                 | Avatar/account    | Settings opens       | None             | None        | cached/local        | N/A            | No primary nav change                  |
| Edit profile                  | Profile           | Local edit           | Profile updated  | Save fail   | pending if safe     | sync           | Visibility applies                     |
| Change username               | Profile/Account   | Availability check   | Handle update    | unavailable | unavailable         | sync           | Discoverability                        |
| Change phone                  | Account           | Verification flow    | Handle update    | conflict    | unavailable         | sync           | Sensitive action                       |
| Change phone visibility       | Privacy           | Pending setting      | Applied policy   | fail        | pending/unavailable | sync           | High privacy                           |
| Change discoverability        | Privacy           | Pending setting      | Applied policy   | fail        | pending/unavailable | sync           | Search impact                          |
| Change presence               | Privacy           | Setting changes      | Applied policy   | fail        | pending             | sync           | Social presence                        |
| Toggle read receipts          | Privacy           | Setting changes      | Applied policy   | fail        | pending             | sync           | Conversation semantics                 |
| Change message-request policy | Privacy           | Policy changes       | Applied policy   | fail        | pending             | sync           | Abuse boundary                         |
| Change call policy            | Privacy/Calls     | Policy changes       | Applied policy   | fail        | pending             | sync           | Incoming call reachability             |
| Change Status audience        | Privacy/Updates   | Default changes      | Default saved    | fail        | pending             | sync           | Does not alter old posts unless policy |
| Block/unblock                 | Privacy/profile   | State changes        | Block relation   | fail        | pending if safe     | sync           | Durable identity                       |
| Report                        | Safety/menu       | Flow opens           | Report submitted | fail        | draft maybe         | server         | Safety evidence                        |
| Open linked devices           | Security          | List opens           | None             | unavailable | cached              | sync           | Owner-only                             |
| Remove device                 | Security          | Confirm/pending      | Revoked          | fail        | pending             | sync           | Sensitive                              |
| App lock                      | Security          | Local setting        | Local lock       | unavailable | local               | device-local   | Local only                             |
| Notification settings         | Notifications     | Category opens       | Preference       | fail        | local/pending       | hybrid         | OS dependency                          |
| Mute conversation             | Conversation info | Muted                | Override saved   | fail        | pending             | sync/hybrid    | Attention control                      |
| Mute Status/Channel           | Updates           | Muted                | Preference saved | fail        | pending             | sync/hybrid    | Attention control                      |
| Notification previews         | Notifications     | Choice changes       | Preference       | fail        | local/pending       | hybrid         | Lock-screen privacy                    |
| OS notifications disabled     | Notifications     | Show state           | None             | N/A         | local               | device-local   | OS provenance                          |
| Clear searches                | Privacy/Search    | History clears       | Local cleared    | fail        | local               | device-local   | Does not delete content                |
| Contact discovery             | Privacy/Contacts  | Enabled/disabled     | Policy/sync      | fail        | pending             | sync           | Contact retention                      |
| Clear cache                   | Storage           | Confirm/delete local | Cache cleared    | fail        | local               | device-local   | Does not delete messages               |
| Appearance/language           | Appearance        | Updates UI           | Preference       | fail        | local               | hybrid         | Accessibility                          |
| Log out                       | Account           | Confirm              | Session ended    | fail        | limited             | current device | Local data policy                      |
| Account deletion              | Account           | Warning flow         | Future deletion  | unavailable | no                  | account        | Destructive                            |

## 98. Screen/Surface Inventory

Surfaces:

- Settings root.
- Profile settings.
- Account settings.
- Privacy root.
- Discoverability.
- Profile visibility.
- Presence.
- Messaging privacy.
- Calls privacy.
- Groups/Communities privacy.
- Status privacy.
- Blocked people.
- Block confirmation.
- Report flow.
- Security & devices.
- Security event.
- App lock.
- Reauthentication.
- Linked-device entry.
- Notifications root.
- Notification category.
- Mute picker.
- Notification override.
- Chats settings.
- Calls settings.
- Updates settings.
- Storage & data.
- Storage management.
- Clear cache confirmation.
- Appearance.
- Accessibility.
- Language.
- Help & safety.
- Logout confirmation.
- Account deletion warning.
- Error/offline/pending/OS handoff states.

## 99. Empty/Error States

Required:

- No blocked people.
- Privacy settings unavailable.
- Couldn't save privacy setting.
- Setting pending.
- Offline privacy change.
- Reauthentication required.
- No additional linked devices.
- Security information unavailable.
- Unknown device state.
- Notifications disabled by OS.
- Push unavailable.
- Notification setting couldn't save.
- No cached media.
- Storage information unavailable.
- Clear-cache failed.
- Contact discovery unavailable.
- Search history already empty.
- Account information unavailable.
- Logout failed.
- Account deletion unavailable.
- Unsupported device capability.
- Biometrics unavailable.
- System settings unavailable.

## 100. Backend/Protocol Requirements

Future requirements:

- Account-level settings persistence.
- Privacy-policy enforcement.
- Discoverability enforcement.
- Presence policy.
- Message-request policy.
- Call policy.
- Group/community invitation policy.
- Status default audience.
- Block enforcement.
- Report submission.
- Security event model.
- Notification preference synchronization.
- Per-conversation overrides.
- Channel/Community notification overrides.
- Device revocation integration.
- Setting versioning/conflict handling.
- Idempotent settings mutations.
- Account deletion lifecycle.
- Data-retention policy.

No backend implementation.

## 101. Notification Infrastructure Requirements

Future requirements:

- Push registration.
- Per-device push capability.
- Notification fanout.
- Deduplication.
- Read/active suppression.
- Multi-device reconciliation.
- Mute enforcement.
- Priority/category model.
- Security notifications.
- Call signaling separation.
- Deep-link routing.
- Notification preview privacy.
- Delivery observability.

No provider selection.

## 102. Native Requirements

Future:

- OS notification permission.
- Notification channels/categories.
- Badge APIs.
- Sound/vibration.
- Focus/DND awareness where allowed.
- System settings deep link.
- Biometrics/device authentication.
- Secure local preferences.
- Storage usage APIs.
- Cache deletion.
- Network type awareness.
- System theme/language.
- Accessibility preferences.

## 103. Security Requirements

Future:

- Privacy-setting authorization.
- Reauthentication.
- Device revocation.
- Secure local settings.
- Block enforcement.
- Report integrity.
- Security-event authenticity.
- Account deletion authorization.
- App-lock secure integration.
- Sensitive-setting audit/evidence where justified.

## 104. Privacy Requirements

Future:

- Data minimization.
- Contact-discovery retention.
- Phone visibility/discoverability.
- Username discoverability.
- Profile visibility.
- Presence.
- Read receipts.
- Message requests.
- Call permissions.
- Group/community invitations.
- Status audience.
- Blocking.
- Reporting data.
- Notification previews.
- AI processing controls.
- Search history.
- Location state.
- Storage/local deletion.
- Account deletion.

Avoid unsupported guarantees.

## 105. Accessibility Requirements

System-wide requirements:

- Reduced motion.
- Text scaling.
- Screen-reader semantics.
- Keyboard navigation.
- Focus visibility.
- Contrast.
- Captions/transcripts.
- Notification accessibility.
- Call accessibility.
- Touch targets.
- Destructive action clarity.

Feed Pass 09 synthesis.

## 106. Open Product Owner Decisions

1. Final Settings first-level IA?
2. Profile and Account separate or combined?
3. Who can see phone number?
4. Who can discover by phone number?
5. Who can discover by username?
6. Is exact username lookup always possible?
7. Profile-photo and bio audience options?
8. Last-seen and online visibility relationship?
9. Read receipts global toggle and exceptions?
10. Typing/recording indicators privacy-controlled?
11. Confirm Message Requests for unknown contacts?
12. Can shared-group or Community co-members bypass requests?
13. Who can call directly and support silence unknown callers?
14. Who can add user to groups or invite to Communities?
15. Exact blocking behavior in shared groups/search?
16. Does reporting include recent messages, and how with E2EE?
17. Support local app lock, and when does it engage?
18. Notification content while locked?
19. Support disappearing messages/default timer initially?
20. Expose active live locations in Settings?
21. Can contextual AI be disabled?
22. Does disabling contact discovery delete uploaded discovery data?
23. When request notification permission?
24. Direct/group notification defaults and muted mention behavior?
25. Status, Channel, Community notification policy?
26. Which security notifications cannot be muted?
27. Notification-preview defaults and badge semantics?
28. Multi-device notification suppression policy?
29. Quiet hours initially?
30. Archive/media auto-download/gallery defaults?
31. What exactly does Clear cache remove?
32. Per-conversation storage?
33. Low-data calls setting?
34. Appearance/personalization options at MVP?
35. System language only or manual override?
36. Translation preferred language?
37. Which settings sync, remain local, or can change offline?
38. What happens to local data on logout?
39. Account deletion consequences across Groups, Channels, Communities, Live Objects, Plans, Spaces?
40. Which settings/features belong to MVP versus later?

## Cross-Pass Consistency

Verified design intent:

- Primary navigation remains `Chats / Updates / Calls`.
- Archived remains secondary.
- Live Object notification semantics align with Pass 02.
- Location controls preserve Pass 02 explicit bounded sharing and easy stop.
- Plan/Space settings do not become project-management settings.
- Call controls and notification distinctions align with Pass 04.
- Status/Channel/Community notification/privacy concepts align with Pass 05.
- Search/AI controls preserve Pass 06: AI optional, Search works without AI.
- User/Device/Session/Connection distinctions preserve Pass 07.
- Linked Devices is integrated, not redesigned.
- No E2EE claims or implementation mechanisms are introduced.

No contradictions found in this pass.

## Human Review Boundary

This pass defines Settings, Privacy, Security, and Notifications UX architecture only. It does not implement Settings UI, privacy backend, authentication, recovery, device revocation, block/report backend, push notifications, notification service/provider, storage management, media pipeline, biometrics, app lock, E2EE, cryptography, disappearing-message protocol, account deletion, contact sync, AI, native plugins, production UI, Pass 01-07 redesign, primary navigation changes, final prototype, backend foundation, or Pass 09.

SEY-006 UX Architecture Pass 08 - Settings, Privacy, Security & Notifications ready for Human Review.
