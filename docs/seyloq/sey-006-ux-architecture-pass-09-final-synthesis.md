# SEY-006 - Complete Product UX Architecture

Pass 09: Cross-Module Synthesis, Consistency & Final UX Freeze  
Base: SEY-006 Pass 01 through Pass 08

## 01. Final Product Definition

Seyloq is a private messenger where conversations do not just disappear into chat history; they can become plans, decisions, shared experiences, memories, and useful actions.

If a person who only wants WhatsApp-style messaging notices the complexity of Seyloq's advanced system, the product has over-exposed complexity.

Seyloq should reveal power without displaying complexity.

## 02. Product Hierarchy

Canonical hierarchy:

```text
Communication -> Context -> Structure -> Organization -> Memory
```

Concrete hierarchy:

```text
Chat -> Context -> Live Objects -> Plan -> Space -> Memory
```

Product truth:

- Chat is normal.
- Context is useful.
- Live Objects are contextual.
- Plans are occasional.
- Spaces are rare.
- Memory emerges later.

Most conversations remain ordinary conversations.

## 03. Complexity Gradient

| Level | Name                     | Contents                                                                                                              | Disclosure                                      |
| ----- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| 0     | Invisible infrastructure | Sync, delivery, identity, device/session, storage, permissions, security                                              | Hidden unless state/action needs user attention |
| 1     | Ordinary messenger       | Chats, messages, media, voice notes, calls, search, groups, Status                                                    | Baseline                                        |
| 2     | Contextual enhancement   | Poll, Event, Checklist, Expense, Decision, Reminder, Location, Live Location, Catch Me Up, Transcription, Translation | Contextual actions                              |
| 3     | Structured conversation  | Context, Plan, structured search, persistent decisions, shared organization                                           | Optional                                        |
| 4     | Rare organization        | Space, Memory, advanced shared experiences                                                                            | Explicit acceptance                             |

## 04. Primary Navigation Freeze

Frozen primary navigation:

```text
Chats
Updates
Calls
```

Not primary navigation:

```text
AI
Tasks
Plans
Spaces
Calendar
Files
Search
Communities
Channels
Contacts
Settings
Apps
```

Non-primary capabilities are reached contextually: Search from shell/header, Settings from avatar/profile, Plans/Spaces from conversations/context, Channels/Status inside Updates, Devices inside Settings, AI from contextual actions.

## 05. Navigation Ownership Matrix

| Surface      | Primary entry                   | Secondary entry       | Back destination           | Deep-link destination  | Mobile       | Desktop             | Persistent nav |
| ------------ | ------------------------------- | --------------------- | -------------------------- | ---------------------- | ------------ | ------------------- | -------------- |
| Chats        | Primary tab                     | Search/result         | Previous root              | Chat/conversation      | Root list    | Rail + list         | Yes            |
| Conversation | Chat list                       | Search, notification  | Chat list/root             | Message anchor         | Pushed route | Primary pane        | No             |
| Context      | Conversation info               | Search/result         | Conversation               | Context item           | Sheet/pushed | Right panel         | No             |
| Live Object  | Message card                    | Context/search        | Conversation/object source | Object card/detail     | Sheet/pushed | Inline/panel/dialog | No             |
| Plan         | Context/suggestion              | Search                | Conversation/context       | Plan detail            | Pushed       | Primary pane/detail | No             |
| Space        | Context/header after activation | Search                | Conversation               | Space overview         | Pushed       | Primary pane        | No             |
| Updates      | Primary tab                     | Notification          | Previous root              | Updates root/item      | Root list    | Rail + detail       | Yes            |
| Status       | Updates                         | Notification          | Updates                    | Status viewer          | Viewer       | Overlay/detail      | No             |
| Channel      | Updates/search/link             | Forwarded attribution | Updates                    | Channel detail         | Pushed       | Detail pane         | No             |
| Community    | Chats/search/invite             | Group context         | Prior surface              | Community detail/group | Pushed       | Detail pane         | No             |
| Calls        | Primary tab                     | Conversation header   | Previous root              | Call detail            | Root/list    | Rail + list/detail  | Yes            |
| Search       | Shell/header                    | Conversation/context  | Prior surface              | Result source          | Full-screen  | Overlay/pane        | No             |
| Profile      | Avatar/person row               | Search                | Prior surface              | Profile detail         | Pushed/sheet | Popover/detail      | No             |
| Settings     | Avatar/profile                  | Security prompts      | Profile/root               | Settings category      | Pushed       | Sidebar + detail    | No             |
| Devices      | Settings                        | Security prompt       | Settings                   | Device detail          | Pushed       | Settings detail     | No             |

## 06. Desktop Shell

Canonical desktop architecture:

```text
Navigation Rail | Chat / Surface List | Primary Content | Context Panel
```

Messaging:

```text
Navigation Rail | Chat List | Conversation | Context
```

Collapse priority:

```text
Context closes first -> Chat List compresses -> Chat List collapses -> single-route presentation
```

## 07. Tablet Shell

Canonical tablet behavior:

```text
Chat List | Conversation
```

Context uses overlay, full-height sheet, or pushed detail depending width. Tablet must not squeeze four desktop regions into one cramped layout.

## 08. Mobile Shell

Root:

```text
Header
Content
Bottom navigation: Chats | Updates | Calls
```

Active conversation:

```text
compact conversation header
message stream
composer
```

Bottom navigation is hidden inside conversation/detail routes. Back restores root/list state.

## 09. State-Restoration Law

Returning from Conversation, Search, Call, Settings, Live Object detail, Plan, Space, or Updates viewer should preserve relevant state where safe:

- Scroll.
- Draft.
- Selected conversation.
- Search query.
- Context open/closed state.
- Plan/Space location.
- Selection/composer mode where valid.

Do not reset users unnecessarily.

## 10. Conversation Model

Conversation is the canonical communication container. Messages, Live Objects, call activity, structured artifacts, media, and contextual AI remain anchored to a conversation whenever conceptually applicable.

No parallel communication silos.

## 11. Conversation Taxonomy

Canonical conversation-like taxonomy:

- Self / Me.
- 1:1.
- Group.
- Channel, a specialized broadcast conversation.
- Community announcement surface.

Space is not a conversation.

## 12. Me/Self-Chat

Self Chat supports personal notes, files, reminders, messages to self, and personal Live Objects where valid.

Shared-only objects such as group Expense splits or group RSVP Events should be constrained or adapted. Self Chat remains a conversation, not a productivity dashboard.

## 13. Message Taxonomy

Message stream may contain:

- Text.
- Image.
- Video.
- File.
- Audio.
- Voice note.
- Location.
- Live Object.
- Call activity.
- System/activity record.
- Reply/quote relationships.

Distinguish Message, Live Object, and Activity/System record.

## 14. Message Actions

Canonical action hierarchy:

- First-level common: Reply, React.
- Contextual/inline: Retry, Play, Open, Save/download where appropriate.
- Overflow: Copy, Forward, Edit, Delete, Turn Into, Info, More.
- Selection toolbar for multi-message actions.

Do not overload first-level action surface.

## 15. Composer Architecture

Canonical composer:

```text
Attachment / +
Text input
Contextual action
Voice
Send
```

States:

- Empty.
- Typing.
- Recording.
- Locked recording.
- Attachment staged.
- Reply.
- Editing.
- Offline queued.
- Sending.
- Failed.

Ordinary media/actions appear before advanced structure.

## 16. Turn Into Taxonomy

Initial Turn Into targets:

- Event.
- Poll.
- Checklist.
- Expense.
- Decision.
- Reminder.
- Location.

Canonical term is `Location`; use `Static Location` only when distinguishing from `Live Location`.

Not generic Turn Into targets:

- Task.
- Project.
- Document.
- Space.
- AI.

Plan is emergent/composite.

## 17. Live Object Set

Initial conceptual set:

- Poll.
- Event.
- Checklist.
- Expense.
- Decision.
- Reminder.
- Static Location.
- Live Location.

Decision is contextual by default. It may appear in Turn Into; it should not be prominent in ordinary `+` creation unless Product Owner later approves.

## 18. Live Object Grammar

Shared grammar:

```text
LiveObjectCard
  Header
  Body
  optional preview
  Summary / Progress
  Footer / Actions
```

All types share one grammar and must not become unrelated mini-applications.

## 19. Live Object State Model

Conceptual metadata:

- id.
- type.
- schema/version.
- conversation.
- creator.
- timestamps.
- permissions.
- lifecycle.
- sync state.
- summary.
- payload.

UX sync states:

- fresh.
- locally modified.
- syncing.
- stale.
- unavailable.

Unknown future types render safe unsupported summaries.

## 20. Poll Policy

Default: non-anonymous, immediate results, lightweight voting. Anonymous may be future/optional.

No election-grade polling or social analytics.

## 21. Event Policy

Confirmed date is required. Time may be optional/all-day. Ambiguous extracted dates/times require confirmation. RSVP is supported.

Events are conversation artifacts, not a Calendar product.

## 22. Checklist Policy

Checklist is a simple shared list. Optional assignees may exist but must not evolve into task/project management.

No Jira-style states.

## 23. Expense Policy

Supports equal split, custom split, payer, participants, and marked paid/unpaid state.

Creator/payer may mark another participant paid under initial policy. Ordinary participants can mark their own payment where allowed.

Seyloq does not imply money custody.

## 24. Decision Policy

Decision is durable shared context. Optional acknowledgement may exist.

Explicitly rejected:

- Approval workflow.
- Sign-off engine.
- Governance workflow.

## 25. Reminder Policy

Reminder is personal by default. Group reminder requires permission.

Do not allow ordinary participants to generate notification spam for everyone.

## 26. Location Policy

Static Location is a shared place.

Live Location is explicit, bounded, and easy to stop. Directional durations: 15m / 1h / 8h. No indefinite sharing.

Admins do not impersonate stopping another user's share.

## 27. Context Model

Context is derived from conversation state.

Canonical initial groups:

- Upcoming.
- Lists.
- Money.
- Decisions.
- Places.

Also participants, media, files, links, and settings where useful. Empty groups disappear.

Context is not a second conversation.

## 28. Context Panel

Desktop Context Panel is contextual, collapsible, and nonessential for basic messaging. Mobile uses sheet/pushed surfaces.

Conversation remains usable with Context hidden.

## 29. Plan Model

A Plan is a curated structured view over related conversation artifacts.

It is not a project, task board, document, workspace, folder, or separate conversation.

Plans can be manually created from existing material or subtly suggested after related structured activity.

## 30. Plan Lifecycle

Canonical:

```text
not applicable -> candidate -> suggested -> accepted -> active -> completed -> archived
```

Branch:

```text
dismissed
```

Suggestions are subtle, dismissible, and non-repetitive.

## 31. Space Model

Space is an optional organized view over persistent conversation state.

It is not a workspace, server, project, team, folder, or new conversation.

Initial conceptual navigation:

- Overview.
- Plans.
- Shared.
- Memories.

## 32. Space Eligibility

Space requires meaningful long-running structure:

- Multiple Plans.
- Sustained structured activity.
- Ongoing shared context.

Not enough:

- One poll.
- One event.
- One expense.
- High message volume.
- Old conversation age.

Most conversations never become Spaces.

## 33. Space Activation

Frozen direction:

- One Space maximum per conversation initially.
- Multiple Plans can exist without Space.
- Space activation requires explicit acceptance.
- Group Space activation requires appropriate admin/group acceptance.
- 1:1 Space is technically possible but lower priority.
- Do not show permanent Chat/Space switch in every conversation.
- Use contextual `Open Space` only when applicable.

## 34. Memory Boundary

Memory is a later historical layer over completed Plans, important decisions, shared media, events, and meaningful history.

Do not define Memory as AI-generated autobiography. Do not implement in SEY-006.

## 35. Calls Model

Calling is a natural extension of conversation.

Initial direction:

- 1:1 audio.
- 1:1 video.
- Group calling direction.

Future-compatible:

- Screen share.
- Call links.
- Device switching.
- PiP.
- Background continuation.
- Low-bandwidth modes.
- Together.

Future-compatible does not mean MVP.

## 36. Calls Root

Calls remains primary navigation.

Root:

- Recent.
- Missed.
- Search.
- New call.

No enterprise meeting dashboard.

## 37. Call Entry

Conversation header exposes audio/video where supported.

Call history row opens lightweight detail/context. Explicit call affordance initiates call. Avoid accidental dialing from row tap.

## 38. Call Activity

Call records belong to conversation activity/history. They are not Live Objects by default.

Missed calls may appear in Calls and Conversation, but attention must deduplicate.

## 39. Group Calls

Small groups may ring/invite. Larger groups favor joinable call activity.

Temporary call participation does not create group membership. Adding a third participant to a 1:1 call must not silently alter conversation membership.

## 40. Calls Security Boundary

No call E2EE claims before architecture exists.

No recording/transcription behavior before consent/privacy/security research.

Call AI remains future/contextual.

## 41. Updates Model

Updates remains primary navigation for asynchronous/social communication without becoming an engagement feed.

Conceptual sections:

- Status.
- Channels.
- Relevant Community announcements.

No For You, Trending, Discover feed, Creator feed, or viral ranking.

## 42. Status Model

Status is relationship-oriented ephemeral sharing.

Initial candidates:

- Text.
- Photo.
- Video.
- Link.

Default expiry direction: 24 hours.

Audience:

- My contacts.
- My contacts except.
- Only share with.

Replies/reactions are private. No public reaction counts. No Status inbox.

## 43. Status Viewer

Viewer:

- Progress.
- Content.
- Timestamp.
- Reply.
- Reaction.
- More.

Support pause and desktop keyboard interaction. Viewer analytics stay compact.

## 44. Status Notifications

New Status normally does not push. Direct reply/reaction may notify.

No FOMO notifications.

## 45. Channel Model

Channel is a one-to-many broadcast conversation intentionally followed by users.

Not a group, Community, public chat room, creator profile, or social feed.

Initial ordering: chronological.

## 46. Channel Interaction

Initial direction:

- Follow.
- Unfollow.
- Mute.
- Read.
- Share.
- Aggregate reaction if supported.

No public threaded comments initially. Important/Highlights notifications are reserved until deterministic semantics exist.

## 47. Channel Discovery

Initial deliberate discovery:

- Search.
- Shared link.
- Invite.
- Known handle/direct route.

No infinite recommendation feed.

Public Channels must wait for reporting, spam controls, impersonation controls, malicious-link handling, and moderation architecture.

## 48. Community Model

Community is a lightweight organizational container connecting related conversations and announcement surfaces.

Not a server, workspace, enterprise organization, public forum, or project hierarchy.

Canonical:

- Announcements.
- Groups.
- Info.

No dashboards, tasks, wiki, bots, apps, analytics, automations, or integrations.

## 49. Community Membership

Community membership is not Group membership.

Joining Community does not automatically join every Group. Leaving Community must not silently remove independently joined Groups.

Group list states:

- Joined.
- Available.
- Restricted.

## 50. Community Roles

Initial:

- Owner.
- Admin.
- Member.

No inherited enterprise RBAC. Announcements are one-to-many. Normal group conversations remain under Chats.

## 51. Group/Channel/Community/Space Comparison

| Concept   | Purpose                                      | Communication model   | Membership            | Primary location             | Structured state |
| --------- | -------------------------------------------- | --------------------- | --------------------- | ---------------------------- | ---------------- |
| Group     | Conversation                                 | Many-to-many          | Group members         | Chats                        | Contextual       |
| Channel   | Broadcast                                    | One-to-many           | Follower relationship | Updates                      | Limited          |
| Community | Organize related conversations               | Mixed                 | Community membership  | Chats/search/invites/context | Organizational   |
| Space     | Organize one conversation's structured state | Inherits conversation | Inherits conversation | Inside conversation          | High             |

## 52. Search Model

Global Search is reachable but not primary navigation.

Search works without AI.

Initial progressive coverage:

- People.
- Conversations.
- Messages.
- Media.
- Files.
- Links.
- Live Objects.
- Calls.
- Channels.
- Communities.

## 53. Search Scopes

Canonical scopes:

- Global.
- Conversation.
- Context category.

No separate Search products.

## 54. Search Result Law

Every result navigates to canonical source:

- Message -> conversation anchor.
- File -> attachment/source.
- Event/Expense/Decision -> Live Object.
- Plan -> Plan.
- Space -> Space.
- Channel update -> Channel.
- Community group -> Group.
- Status -> active viewer if authorized/available.

No shadow copies.

## 55. Search Authorization

Authorization happens before result disclosure/ranking.

Search must not leak inaccessible titles, snippets, counts, participants, metadata, semantic matches, or AI summaries.

Deleted/revoked content fails safely.

## 56. Local-Search Honesty

If only local data is available, UI says so:

- No results on this device.
- Searching downloaded messages.
- Some history may be unavailable.

Do not claim global completeness.

## 57. Search Ranking

Ordinary ranking may use exact match, prefix, text relevance, recency, context, metadata, filters, and freshness.

No engagement optimization. Semantic search is enhancement, not baseline dependency.

## 58. AI Role

AI has no primary navigation, AI tab, Assistant tab, chatbot persona, or AI workspace.

AI appears contextually.

## 59. AI Capability Set

Approved contextual directions:

- Catch Me Up.
- Summarize unread.
- Transcribe voice.
- Translate.
- Summarize document.
- Extract Event.
- Extract Checklist.
- Extract Expense.
- Extract Decision.
- Extract Reminder.
- Extract Place.
- Semantic search.
- Writing assistance.

Directions, not implementation commitments.

## 60. AI Confirmation Law

AI must not silently create durable shared truth.

Canonical:

```text
detect/extract -> candidate -> review -> editable prefill -> confirm -> durable object
```

## 61. AI Source Law

Generated summaries/answers identify scope, source, generated nature, and limitations where meaningful.

Canonical Live Objects remain authoritative over AI interpretation.

## 62. AI Failure Law

Turning off AI leaves a complete messenger:

- Messaging.
- Search.
- Calls.
- Live Objects.
- Plans.
- Spaces.
- Updates.
- Identity.
- Settings.

Ordinary search never requires embeddings or an LLM.

## 63. AI Privacy Boundary

Do not claim on-device, zero retention, never trained on, E2EE-compatible, or private by design without architecture.

Future implementation must define processing location, data leaving device, processor, retention, training/use policy, user notice, and unavailable behavior.

## 64. Identity Model

Canonical:

- User.
- Device.
- Session.
- Connection.

User is durable identity. Device is human-manageable endpoint. Session is authorization/runtime state. Connection is transient network state.

## 65. Handle Model

Phone number and username are handles, not stable internal User identity.

Changing phone, username, profile name, avatar, device, or session must not create a new User.

## 66. Username Direction

Username remains optional during basic onboarding initially. It supports deliberate discovery and is not account primary key.

Recommendation-driven people discovery is excluded. Exact lookup policy remains security/product dependent.

## 67. Contact Discovery

Contact permission is optional. Denial does not block messaging.

Alternatives: username, QR/link, known phone where policy allows, existing/shared context.

No privacy-preserving contact discovery claims until architecture selects a real mechanism.

## 68. Message Requests

Unknown direct contacts use Message Requests.

Default direction:

- Contacts can message directly.
- Username/QR/link strangers enter requests.
- Shared-group and Community co-member bypass remains open/safety-gated.

Existence of Message Requests is frozen; bypass rules remain open.

## 69. QR Identity

Scan/open QR:

```text
identity preview -> explicit next action
```

Never automatically add, message, join, or expose phone number.

## 70. Device Linking

Linked devices require explicit enrollment, review/approval, human-readable device identity, and revocation.

No silent enrollment. User manages Device, not token/session internals.

## 71. Logout/Revoke/Delete Distinction

Distinct operations:

- Log out current device.
- Remove/revoke another device.
- Erase local data.
- Delete account.

Do not collapse consequences.

## 72. Settings Architecture

Settings stays behind Avatar/Profile/Account.

Canonical first-level:

- Profile.
- Account.
- Privacy.
- Security & devices.
- Notifications.
- Chats.
- Calls.
- Updates.
- Storage & data.
- Appearance & accessibility.
- Help & safety.

## 73. Privacy Model

Keep independent:

- Phone visibility.
- Phone discoverability.
- Username discoverability.
- Profile visibility.
- Presence.
- Read receipts.
- Message requests.
- Call permissions.
- Group invitations.
- Community invitations.
- Status audience.
- Blocking.

No single generic privacy level.

## 74. Blocking Model

Blocking targets durable User identity and survives handle/profile changes.

Block and Report remain separate. Shared-group coexistence may remain possible. Direct cross-surface bypass must not.

## 75. App-Lock Boundary

App lock, if included, is local device privacy, not account authentication, E2EE, or session management.

Classification: later/MVP-compatible, not MVP-required.

## 76. E2EE Settings Law

Never provide casual `End-to-end encryption on/off`.

E2EE UX depends on dedicated research. Do not invent key/fingerprint/safety-number behavior.

## 77. Notification Philosophy

Notify for relevance and direct consequence, not return visits.

No streaks, trending alerts, FOMO, engagement reminders, "people are waiting", or algorithmic re-engagement.

## 78. Notification Hierarchy

Categories:

- Messages.
- Groups.
- Calls.
- Live Objects / reminders.
- Updates / Status.
- Channels.
- Communities.
- Security.

Settings remains compact.

## 79. Notification Consequence Model

Push-worthy: direct message, mention/reply, incoming call, Reminder due, material Event change, checklist assigned to user, Expense affecting user, important security event.

Usually ambient: poll vote, unrelated checklist completion, minor Plan update, new Status, passive Decision acknowledgement.

## 80. Notification Deduplication

Multiple representations of one event must not become multiple independent alerts across push, in-app banner, badge, conversation activity, Calls, Updates, and Community.

## 81. Delivery/Notification Distinction

Message delivery, push delivery, and notification display are different concepts. Never expose unsupported guarantees.

## 82. Badge Model

Initial:

- Chats: unread count.
- Calls: missed indicator.
- Updates: lightweight dot.

Avoid independent red-number badges for every subfeature.

## 83. Security Notifications

New device linked, device removed, and critical account/security changes should be difficult to suppress.

Routine session/token mechanics remain invisible.

## 84. Storage Semantics

Distinct:

- Clear cache.
- Delete downloaded files.
- Erase local data.
- Delete conversation/content.
- Delete account.

`Clear cache` never implies remote/shared deletion.

## 85. Cross-Device Settings

Settings classify as account-synchronized, device-local, or hybrid.

Critical privacy settings must not appear applied before authoritative confirmation.

## 86. Offline Product Law

Local-first where safe:

```text
user action -> local validation -> durable local intent/state -> optimistic UI -> enqueue/synchronize -> ACK -> reconcile
```

Security-sensitive operations wait for authority.

## 87. Offline Messaging

Expected:

- Read cached conversations.
- Draft offline.
- Send into outbox.
- Show pending/sending.
- Retry.
- Reconcile ACK.
- Show failure honestly.

## 88. Offline Structured Objects

Live Object changes may be local/pending where safe.

Conflict/stale state must remain visible. Do not silently overwrite newer state.

## 89. Offline Search

Local/cached content remains searchable. Remote completeness is not claimed. AI/semantic features may degrade independently.

## 90. Responsive Product Matrix

| Surface      | Mobile                            | Tablet                       | Desktop                |
| ------------ | --------------------------------- | ---------------------------- | ---------------------- |
| Chats        | Root list                         | List + conversation if width | Rail + list + content  |
| Conversation | Pushed route                      | Two pane when possible       | Primary content        |
| Context      | Sheet/pushed                      | Overlay/sheet                | Right panel            |
| Live Object  | Inline card + sheet/pushed detail | Sheet/detail                 | Inline/panel/dialog    |
| Plan         | Pushed detail                     | Detail pane                  | Primary content/detail |
| Space        | Pushed route                      | Section list + content       | Primary content        |
| Calls        | Root list/full call               | Adaptive call layout         | Call screen/panels     |
| Updates      | Root sections                     | List/detail                  | List + detail          |
| Status       | Viewer                            | Viewer/detail                | Overlay/detail         |
| Channel      | Pushed                            | List/detail                  | List/detail            |
| Community    | Pushed                            | List/detail                  | Detail shell           |
| Search       | Full screen                       | Overlay/pane                 | Overlay/pane           |
| Settings     | Pushed categories                 | List + detail                | Sidebar + detail       |
| Onboarding   | Focused steps                     | Centered steps               | Centered compact pane  |
| Devices      | Pushed detail                     | List/detail                  | Settings detail        |

## 91. Overlay/Sheet Taxonomy

| Container          | Use                                       |
| ------------------ | ----------------------------------------- |
| Popover            | Small desktop choices                     |
| Context menu       | Message/object secondary actions          |
| Bottom sheet       | Mobile quick choices/details              |
| Side sheet         | Tablet/desktop temporary detail           |
| Dialog             | Focused confirmation/complex desktop task |
| Full pushed screen | Mobile deep browsing/creation             |
| Panel              | Persistent desktop contextual area        |

## 92. Global Creation Architecture

Global/contextual creation:

- New chat: root/contextual.
- New group: New Chat.
- Status: Updates.
- Channel update: Channel authority.
- Community announcement: Community authority.
- `+`: conversation composer.
- Turn Into: message/object context.
- Live Object creation: conversation context.
- Plan creation: existing conversation structure.

Space has no generic global creation.

## 93. Global Action Hierarchy

Semantics are consistent across platforms:

- Primary action: visible and direct.
- Secondary action: quieter nearby affordance.
- Overflow: More/context menu.
- Mobile: long press/sheet where needed.
- Desktop: hover/right-click/keyboard menu.
- Keyboard shortcuts supplement visible UI.

## 94. Confirmation Philosophy

Require explicit confirmation for durable AI extraction, destructive actions, device revocation, account deletion, high-impact privacy/security changes, cross-surface public sharing, and live location start where needed.

Avoid confirmation fatigue for reversible low-risk actions.

## 95. Destructive Action Hierarchy

Canonical language:

- Remove: detach from a view/list.
- Leave: user exits membership/call.
- Delete: content/account-level destructive action.
- Clear: local history/cache/preference cleanup.
- Revoke: remove authorization/device/session.
- Unfollow: stop Channel relationship.
- Block: prevent direct interaction/discovery path.
- Report: send safety signal.
- Erase: destructive local data removal.

## 96. Audience Architecture

Reuse audience primitives across Status, profile visibility, group/community privacy where semantics fit.

Do not create incompatible audience pickers without real semantic difference.

## 97. Permission Architecture

Categories:

- OS permission.
- Seyloq privacy policy.
- Conversation permission.
- Role permission.
- Device capability.

UI must distinguish them. OS microphone denied is not another user's call permission denial.

## 98. Presence Architecture

Distinct:

- Online.
- Last seen.
- Typing.
- Recording.
- Call state.
- Device last active.

Online/last seen/typing/recording are social presence. Device last active is account-owner security context.

## 99. Activity Architecture

Conversation activity/system records for high-value events:

- Call completed/missed.
- Member joined/left.
- Group metadata changed.
- Live Object created/cancelled/deleted.
- Important Plan/Space transitions.

Avoid low-value system noise.

## 100. Error Language

Errors are human-readable, actionable, nontechnical, honest, and specific enough to recover.

Do not show HTTP/WebSocket/vector DB/LLM/token/session UUID/sync cursor/SQL to ordinary users.

## 101. Loading Language

Use precise states:

- Loading.
- Refreshing.
- Sending.
- Uploading.
- Syncing.
- Waiting for connection.
- Retrying.

Do not use Loading for every network state.

## 102. Empty-State Philosophy

Empty states explain what the surface is, why it is empty, and what meaningful action exists.

No marketing copy disguised as empty state.

## 103. Accessibility Architecture

System-wide:

- Semantic structure.
- Screen reader labels.
- Keyboard navigation.
- Visible focus.
- Large-text reflow.
- Contrast.
- No color-only state.
- Reduced motion.
- Touch targets.
- Captions/transcripts where available.
- Destructive-action clarity.
- Notification accessibility.
- Call accessibility.

Accessibility is baseline, not a separate mode.

## 104. Motion Principles

Motion is functional, fast, spatially explanatory, interruptible, and reduced-motion compatible.

Appropriate: panel transitions, message insertion, Live Object expansion, Context reveal, Plan/Space transition, call minimization, Status progression.

Avoid decorative motion that slows messaging.

## 105. Compactness

Functional density:

- Nav rail: about 52-60 px.
- Chat list: about 280-320 px.
- Context: about 300-340 px.
- Desktop controls: about 28-36 px.
- Mobile primary controls: about 36-44 px.
- Small gaps: about 4-8 px.
- Section gaps: about 10-16 px.

Design direction, not immutable pixels. No giant SaaS cards/headings or unnecessary whitespace.

## 106. Visual Hierarchy

Prioritize conversation, people, content, current action, and context over chrome, branding, dashboards, decorative containers, and metrics.

## 107. Component-System Synthesis

Canonical conceptual groups:

- Shared primitives: Button, IconButton, Avatar, Badge, SearchField, Menu, Sheet, Dialog, Panel, EmptyState, Skeleton, VirtualList.
- Shell: AppShell, NavigationRail, BottomNavigation, SurfaceList.
- Messaging: ConversationShell, ConversationHeader, MessageStream, Message, Composer.
- Live Objects: LiveObjectCard, LiveObjectDetail, Poll, Event, Checklist, Expense, Decision, Reminder, Location.
- Structure: ContextPanel, PlanView, SpaceView.
- Calls: CallsHome, CallScreen, CallActivity.
- Updates: UpdatesHome, StatusViewer, ChannelView, CommunityView.
- Search/AI: GlobalSearch, SearchResults, SearchFilters, GeneratedContent, SourceList.
- Identity: Profile, Onboarding, ContactDiscovery, MessageRequests, LinkedDevices.
- Settings: SettingsShell, PrivacySettings, NotificationSettings, SecuritySettings, StorageSettings.

## 108. Canonical Entity Map

Entities:

- User, Device, Session, Connection.
- Conversation, Membership, Message, Attachment, Reaction, Activity.
- LiveObject, Poll, Event, Checklist, Expense, Decision, Reminder, LocationShare.
- Plan, Space.
- Call, CallParticipant, CallActivity.
- Status, Channel, ChannelMembership, ChannelUpdate.
- Community, CommunityMembership, CommunityGroupReference, CommunityAnnouncement.
- Settings, PrivacyPolicy, NotificationPreference, BlockRelationship.

## 109. Ownership Map

| Capability           | Canonical owner         | Secondary views               |
| -------------------- | ----------------------- | ----------------------------- |
| Messages/media/files | Conversation            | Context, Search               |
| Live Objects         | Conversation            | Context, Plan, Space, Search  |
| Plans                | Conversation context    | Space, Search                 |
| Spaces               | Conversation            | Search, future Memory         |
| Calls                | Conversation/Calls root | Activity rows, Search         |
| Status               | Updates                 | Search if active/authorized   |
| Channels             | Updates                 | Search, forwarded attribution |
| Communities          | Chats/search/invite     | Updates announcements         |
| Identity/devices     | Profile/Settings        | Onboarding, Search            |
| Privacy/settings     | Settings                | Contextual shortcuts          |

## 110. Source-of-Truth Map

| Concept              | Source of truth                                     |
| -------------------- | --------------------------------------------------- |
| Conversation content | Conversation/message store                          |
| Live Object state    | Live Object store anchored to conversation          |
| Plan                 | References to existing artifacts                    |
| Space                | References to Plans/artifacts                       |
| Search result        | Canonical source object                             |
| AI summary           | Generated view over sources                         |
| Status               | Status entity                                       |
| Channel update       | Channel update                                      |
| Community group      | Conversation                                        |
| Device               | Device registry                                     |
| Settings             | Settings authority by account/device classification |

## 111. Derived-vs-Canonical Classification

Canonical: Conversation, Message, Live Object, Plan, Space, Call, Status, Channel update, Community group, User, Device, Settings.

Derived: Context, Search results, AI summaries, notification previews, badges, activity summaries, storage summaries, recent searches.

Derived views never become independent data silos.

## 112. Lifecycle Synthesis

Common lifecycle terms:

- Draft.
- Active.
- Pending.
- Failed.
- Completed.
- Cancelled.
- Expired.
- Archived.
- Revoked.
- Deleted.
- Unavailable.

Use terms consistently and avoid treating sync state as lifecycle.

## 113. Cross-Surface Sharing

Sharing private content to broader surfaces requires explicit user action and provenance.

Chat -> Status/Channel/Community requires audience/permission review.

Updates -> Conversation preserves attribution.

## 114. Public/Private Boundary

Private conversations are default. Public/discoverable Channels/Communities require moderation, abuse, impersonation, malicious-link, reporting, and privacy architecture.

Nothing becomes public silently.

## 115. Safety Synthesis

Safety covers unknown contacts, message requests, blocking, reporting, spam, call abuse, invite abuse, Channel/Community abuse, malicious links, location misuse, and notification abuse.

Technical mitigations are future architecture; UX must expose safe controls.

## 116. Privacy Synthesis

Privacy is per capability:

- Identity discoverability.
- Profile visibility.
- Presence/read receipts.
- Message requests.
- Calls.
- Status audience.
- Live location.
- Search/AI.
- Notifications.
- Devices.

No one generic privacy toggle.

## 117. Notification Synthesis

Notifications are consequence-focused, deduplicated, privacy-aware, and multi-device-aware.

Security and incoming calls are special categories. Updates remain low-pressure.

## 118. Search Synthesis

Search is global, scoped, permission-filtered, source-oriented, local-first where possible, and independent from AI.

## 119. AI Synthesis

AI is contextual, optional, source-bound, clearly labeled, editable before durable action, and privacy/research-gated.

## 120. Offline Synthesis

| Feature           | Offline read          | Offline create/edit        | Queued     | Conflict possible | Requires authority | User-visible state       |
| ----------------- | --------------------- | -------------------------- | ---------- | ----------------- | ------------------ | ------------------------ |
| Messages          | Cached                | Send/draft                 | Yes        | Ordering          | ACK                | pending/sending/failed   |
| Drafts            | Yes                   | Yes                        | Local      | Sync if enabled   | No                 | saved locally            |
| Media             | Cached                | Stage/upload later         | Yes        | Upload            | Server/media       | uploading/failed         |
| Live Objects      | Cached                | Safe edits                 | Yes        | Yes               | Reconcile          | locally modified/stale   |
| Plans             | Cached                | Limited                    | Yes        | Yes               | Reconcile          | pending/stale            |
| Spaces            | Cached                | Limited                    | Yes        | Yes               | Reconcile          | pending/stale            |
| Search            | Local                 | N/A                        | No         | No                | Remote for full    | local/incomplete         |
| Privacy settings  | Cached                | Risk-based                 | Maybe      | Yes               | Yes                | pending/unavailable      |
| Notifications     | Local prefs           | Local/device               | Maybe      | OS                | OS/server          | OS disabled/pending      |
| Profile           | Cached                | Maybe                      | Yes        | Yes               | Yes                | saving/failed            |
| Device management | Cached                | No/pending only            | No/limited | Yes               | Yes                | pending/failed           |
| AI                | No/local if available | No durable without confirm | N/A        | N/A               | Processing         | unavailable/offline      |
| Calls             | No active offline     | No                         | No         | N/A               | Network            | unavailable/reconnecting |

## 121. MVP Classification

Classification uses core messenger necessity, dependencies, risk, privacy/security dependency, UX complexity, and validation need.

## 122. MVP Baseline

MVP required / first usable Seyloq should include:

- Onboarding and identity.
- 1:1 messaging.
- Groups.
- Text/media/files.
- Voice notes.
- Replies/reactions.
- Local-first send/outbox states.
- Basic search.
- Basic calls direction.
- Core privacy/settings.
- Device/session basics.
- Basic Live Objects subset for validation.

## 123. Advanced-Feature Classification

MVP-compatible but later/prototype-visible:

- Full Live Object set.
- Plans.
- Status.
- Expanded Context.
- Basic Channel read/follow prototype.
- Settings breadth.

Post-MVP:

- Spaces.
- Memory.
- Communities.
- Advanced calling.
- Screen sharing.
- Together.
- Semantic search.
- Writing assistance.

Research-gated:

- E2EE.
- AI processing.
- Call security/recording/transcription.
- Public discovery/moderation.
- Large group calling/SFU.
- Account recovery.

## 124. Research-Gated Features

Must not implement before dedicated research/architecture:

- E2EE and encrypted multi-device history.
- Account recovery.
- Contact discovery privacy mechanism.
- Public Channel moderation.
- AI processing/privacy.
- Call security.
- Call recording/transcription.
- Large group calling/SFU.
- Push notification infrastructure.
- Media retention/deletion.
- Account deletion semantics.

## 125. Product Owner Decision Resolution

Safe defaults frozen where enough evidence exists:

- Primary nav stays Chats/Updates/Calls.
- AI has no nav.
- Search works without AI.
- Most conversations never become Spaces.
- Live location is bounded.
- Phone is not User identity.
- Message Requests exist.
- Device is management unit.

Policy/security decisions remain open when dependent on protocol, privacy, or legal/security research.

## 126. Frozen Decision Registry

| ID          | Decision                                                 | Origin     | Change authority             |
| ----------- | -------------------------------------------------------- | ---------- | ---------------------------- |
| SEY-UX-F001 | Primary nav is Chats / Updates / Calls                   | Pass 01    | Product architecture review  |
| SEY-UX-F002 | Conversation is canonical communication container        | Pass 01/09 | Product architecture review  |
| SEY-UX-F003 | AI has no top-level navigation                           | Pass 06    | Product/security review      |
| SEY-UX-F004 | Search works without AI                                  | Pass 06    | Product architecture review  |
| SEY-UX-F005 | Live Objects are conversation artifacts                  | Pass 02    | Product architecture review  |
| SEY-UX-F006 | Turn Into requires confirmation                          | Pass 02/06 | Product architecture review  |
| SEY-UX-F007 | Plan is curated view over artifacts                      | Pass 03    | Product architecture review  |
| SEY-UX-F008 | Space is optional and rare                               | Pass 03    | Product architecture review  |
| SEY-UX-F009 | Most conversations never become Spaces                   | Pass 03/09 | Product architecture review  |
| SEY-UX-F010 | Live Location has explicit bounded duration              | Pass 02    | Privacy/product review       |
| SEY-UX-F011 | Calls remain tied to conversation identity               | Pass 04    | Product architecture review  |
| SEY-UX-F012 | Channels are broadcast, not groups                       | Pass 05    | Product architecture review  |
| SEY-UX-F013 | Communities organize conversations, not structured state | Pass 05    | Product architecture review  |
| SEY-UX-F014 | User is not phone number/username                        | Pass 07    | Identity/security review     |
| SEY-UX-F015 | Device is human-facing management unit                   | Pass 07    | Security architecture review |
| SEY-UX-F016 | Message Requests exist for unknown direct contacts       | Pass 07/09 | Safety/product review        |
| SEY-UX-F017 | Blocking targets durable identity                        | Pass 08    | Safety/security review       |
| SEY-UX-F018 | Notifications serve consequence, not engagement          | Pass 08/09 | Product review               |
| SEY-UX-F019 | Settings is behind profile/avatar, not nav               | Pass 08    | Product architecture review  |
| SEY-UX-F020 | No casual E2EE toggle                                    | Pass 08    | Security architecture review |
| SEY-UX-F021 | Derived views do not become data silos                   | Pass 09    | Product architecture review  |
| SEY-UX-F022 | Authorization precedes Search/AI disclosure              | Pass 06/09 | Security architecture review |
| SEY-UX-F023 | Clear cache does not delete shared/remote content        | Pass 08    | Product/security review      |
| SEY-UX-F024 | Public discovery is deliberate and limited               | Pass 05    | Safety/product review        |
| SEY-UX-F025 | Accessibility is baseline behavior                       | All        | Product/design review        |

Frozen decision count: 25.

## 127. Open Decision Registry

| ID          | Question                                 | Why unresolved                       | Required gate        | Blocks             |
| ----------- | ---------------------------------------- | ------------------------------------ | -------------------- | ------------------ |
| SEY-UX-O001 | Exact Live Object MVP subset             | Needs validation/implementation cost | SEY-007/SEY-008      | MVP scope          |
| SEY-UX-O002 | Username exact/prefix discoverability    | Enumeration/privacy risk             | Security/privacy     | People search      |
| SEY-UX-O003 | Shared-group bypass for Message Requests | Safety tradeoff                      | Safety/product       | Unknown contact UX |
| SEY-UX-O004 | Contact discovery method                 | Privacy/security architecture        | Security/backend     | Contacts           |
| SEY-UX-O005 | E2EE model and device verification       | Dedicated cryptography research      | E2EE gate            | Security claims    |
| SEY-UX-O006 | Account recovery model                   | Account takeover risk                | Security/recovery    | Recovery           |
| SEY-UX-O007 | Push notification provider/model         | Platform/backend research            | Notifications gate   | Push               |
| SEY-UX-O008 | Public Channel launch criteria           | Moderation/abuse risk                | Safety/moderation    | Public discovery   |
| SEY-UX-O009 | AI processing/provider policy            | Privacy/security/vendor              | AI privacy gate      | AI features        |
| SEY-UX-O010 | Calls media/security architecture        | WebRTC/SFU/TURN/E2EE                 | Calls architecture   | Calls release      |
| SEY-UX-O011 | Call recording/transcription policy      | Consent/legal/security               | Calls + AI gate      | Call AI            |
| SEY-UX-O012 | Large group calling threshold            | Infrastructure/product               | Calls architecture   | Group calls        |
| SEY-UX-O013 | App lock MVP inclusion                   | Native/security value                | Product/security     | Settings           |
| SEY-UX-O014 | Disappearing messages protocol           | Retention/sync/security              | Messaging backend    | Privacy feature    |
| SEY-UX-O015 | Account deletion semantics               | Legal/backend/product                | Privacy/backend      | Account deletion   |
| SEY-UX-O016 | Draft sync                               | Cross-device UX vs privacy           | Sync architecture    | Multi-device       |
| SEY-UX-O017 | Status viewer/read receipt coupling      | Privacy/product                      | Product/privacy      | Status             |
| SEY-UX-O018 | Channel comments                         | Moderation/product                   | Product/safety       | Channels           |
| SEY-UX-O019 | Community membership cascade rules       | Product/safety                       | Product architecture | Communities        |
| SEY-UX-O020 | Space activation authority               | Group governance/product             | Product review       | Spaces             |

Open decision count: 20.

## 128. Contradiction Audit

No blocking contradictions found.

Resolved clarifications:

- Context closes before Chat List collapse.
- `Location` is canonical user-facing term; `Static Location` is technical distinction from `Live Location`.
- `Checklist` is canonical over generic `List` for Live Object type; `Lists` may be Context grouping label.
- `Channel update` is canonical over `post` in product architecture.
- Device/Session/Connection distinctions preserved.

Files that may later receive terminology corrections: none required for acceptance; optional doc polish can align `Location`/`Checklist` labels in earlier pass prose.

## 129. Terminology Audit

Canonical terms:

- Location, Live Location.
- Checklist, not Task.
- Status for ephemeral personal sharing.
- Updates for primary destination.
- Channel update, not Post.
- Community announcement.
- Context.
- Plan.
- Space.
- Memory.
- Device vs Session vs Connection.
- User vs Contact vs Participant.
- Mute vs Block.
- Remove vs Delete vs Revoke vs Clear.
- Archive vs Complete.

## 130. Feature-Duplication Audit

| Capability           | Canonical owner     | Secondary views                    |
| -------------------- | ------------------- | ---------------------------------- |
| Search               | Search surface      | Conversation/context scoped search |
| Media/files          | Conversation        | Context/Search/Storage             |
| Events/expenses/etc. | Live Objects        | Context/Plan/Space/Search          |
| Notifications        | Settings/system     | Per-surface overrides              |
| Participants         | Conversation/group  | Context/call/community views       |
| AI                   | Contextual action   | Search enhancement                 |
| Location             | Live Object/message | Context/Search/Plan                |

No duplicate product silos accepted.

## 131. Navigation Dead-End Audit

All key surfaces have clear entry/exit:

- Search result opens canonical source; Back returns to Search/prior surface.
- Live Object detail returns to conversation/context.
- Plan/Space return to conversation.
- Status viewer closes to Updates.
- Channel returns to Updates/search.
- Community group opens canonical conversation.
- Call detail returns to Calls/conversation.
- Settings detail returns to Settings root.
- Linked Device returns to Security & devices.
- Message Request resolves to accept/block/report/back.

## 132. Permission Dead-End Audit

Permission denial alternatives:

- Contacts denied -> username/QR/link/manual invite.
- Notifications denied -> messaging still works; Settings shows OS handoff.
- Camera denied -> QR manual/link; video fallback audio where possible.
- Microphone denied -> calls/voice unavailable with settings path.
- Location denied -> manual place/search; no live share.
- Photos/media denied -> files/camera alternatives where supported.
- Biometrics denied/unavailable -> app lock unavailable; account remains usable.

## 133. Offline Dead-End Audit

Offline states must avoid endless spinners, fake success, disappearing drafts, or dropped sends.

Core recovery:

- Drafts persist.
- Outbox shows pending/failed.
- Search says local/incomplete.
- Settings distinguishes pending/unavailable.
- AI/calls can be unavailable without breaking app.

## 134. Privacy-Leak Audit

Mitigation requirements:

- Search/AI authorization before disclosure.
- Notification previews respect privacy.
- Status audience enforced.
- Channel/Community visibility filtered.
- Message Requests hide excess identity.
- QR preview before action.
- Calls show only permitted identity.
- Shared groups do not leak hidden handles by default.
- Live Location explicit and bounded.
- Device list owner-only.

## 135. Complexity Audit

A normal messaging user can ignore Live Objects, Context, Plans, Spaces, AI, Channels, Communities, and advanced Settings.

If any of these appear globally or interruptively by default, future implementation violates SEY-006.

## 136. Messenger-Purity Scenarios

Scenario A: 1:1-only user can onboard, chat, send media, search, and call without understanding Plan, Space, AI, Community, Channel, or Live Object architecture. Pass.

Scenario B: family football group can naturally create Event, Poll, Location, Checklist, Expense from chat. Pass.

Scenario C: multi-day trip can evolve Chat -> Context -> Live Objects -> Plan -> optional Space -> Memory. Pass.

Scenario D: following Channel creates no contact/group/social graph. Pass.

Scenario E: unknown username contact enters Message Requests/safety boundary. Pass, bypass rules open.

Scenario F: AI disabled leaves product usable. Pass.

Scenario G: network loss shows honest pending/offline states. Pass.

Scenario H: linking another device preserves same User and explicit security. Pass.

## 137. SEY-007 Prototype Scope

Prototype priority flows:

1. Onboarding -> empty Chats -> New Chat.
2. 1:1 and group conversation.
3. Send/reply/react/voice/attachment.
4. Turn Into -> Poll/Event/Checklist/Expense/Decision/Reminder/Location.
5. Context panel/sheet.
6. Plan suggestion and compact Plan.
7. Space suggestion/open, low fidelity.
8. Calls root and conversation call entry.
9. Updates with Status and Channel skeleton.
10. Global Search and conversation search.
11. Catch Me Up as contextual AI card.
12. Message Request.
13. Profile/Privacy/Linked Devices.
14. Offline send/retry.

Do not prototype every screen exhaustively.

## 138. Prototype Validation Questions

SEY-007 must test:

- Does Seyloq still feel like a messenger?
- Can users discover Live Objects without overwhelm?
- Do users understand Context?
- Does Plan avoid feeling like project management?
- Does Space feel optional?
- Can users distinguish Group, Channel, Community, and Space?
- Can they find Search?
- Does AI feel contextual rather than dominant?
- Do privacy controls make sense?
- Can users recover from offline/failure?
- Does desktop remain compact?
- Does mobile remain simple?

## 139. Prototype Success Criteria

Observable criteria:

- Users start normal chat without encountering advanced concepts.
- Users turn conversation content into useful object without explanation.
- Users identify where structured conversation information lives.
- Users do not mistake Space for a new chat/workspace.
- Users distinguish Channel from Group.
- Users understand unknown Message Requests.
- Users locate privacy controls.
- Users understand pending/offline send state.

No arbitrary percentage targets yet.

## 140. Implementation Handoff Boundaries

UX architecture provides surface model, interaction contracts, states, navigation, permission expectations, responsive behavior, failure behavior, conceptual entities, and MVP classification.

Engineering still owns protocol, storage, sync, E2EE, auth, realtime, media, calling, push, search indexing, AI processing, native capabilities, and deployment.

## 141. Architecture Dependency Map

Recommended ordering:

```text
SEY-007 UX validation
-> backend foundation
-> realtime messaging
-> media
-> security/E2EE gates
-> calls
-> advanced structured/AI/public capabilities
```

Identity/auth and local-first sync remain prerequisites for most production breadth.

## 142. Final Screen Inventory

MVP/root: Chats, Conversation, Calls, Updates, Onboarding, Settings root.

MVP details: Message detail/actions, Context, Live Object detail, Search, Profile, New Chat, Message Requests, Linked Devices, Privacy.

Later: Plan detail, Space, Channel detail, Community detail, Status viewer, Storage management, advanced Settings.

Research-gated: E2EE/security verification, account recovery, call links, AI processing surfaces, public discovery moderation surfaces.

## 143. Final Component Inventory

Deduplicated component groups are listed in section 107. SEY-007 should instantiate only prototype-needed subsets, using shared primitives before feature-specific components.

## 144. Final State Inventory

Consistent states:

- loading.
- empty.
- offline.
- pending.
- sending.
- uploading.
- syncing.
- failed.
- stale.
- unavailable.
- permission denied.
- blocked.
- deleted.
- expired.
- archived.
- completed.
- cancelled.
- revoked.
- unsupported.

## 145. Final Interaction Inventory

Major actions:

- Start chat/group.
- Send/edit/delete/reply/react/forward.
- Add attachment/voice.
- Turn Into object.
- Vote/RSVP/toggle/mark paid/acknowledge/remind/share location.
- Open Context/Plan/Space.
- Start/answer/end call.
- View Status/follow Channel/open Community.
- Search/open result.
- Invoke AI helper/confirm generated draft.
- Manage profile/privacy/devices/notifications.
- Block/report/message request.

Each follows immediate state, durable consequence, failure, offline, permission, and canonical destination principles from prior passes.

## 146. Final Responsive Matrix

Authoritative matrix is section 90. Feature-specific implementations must not contradict it.

## 147. Final Accessibility Matrix

| Area                 | Requirement                                                     |
| -------------------- | --------------------------------------------------------------- |
| Keyboard             | All desktop functionality reachable; shortcuts supplemental     |
| Screen reader        | Labels, headings, state announcements, generated-content labels |
| Focus                | Visible and restored after navigation/dialogs                   |
| Touch                | Usable targets; long-press alternatives                         |
| Text scaling         | No overlap; compact layouts reflow                              |
| Contrast             | Semantic states not color-only                                  |
| Motion               | Reduced-motion honored                                          |
| Captions/transcripts | Supported where media/AI capability exists                      |
| Notifications        | Understandable without sound/color/avatar                       |
| Calls                | Accessible mute/camera/end/screen-share states                  |
| Drag/swipe           | Accessible alternatives                                         |

## 148. Final Privacy Matrix

| Area          | Privacy rule                                                    |
| ------------- | --------------------------------------------------------------- |
| Identity      | Phone/username are handles; visibility/discoverability separate |
| Search        | Authorization before disclosure                                 |
| AI            | Scope/source visible; no unsupported processing claims          |
| Status        | Audience before publish                                         |
| Channels      | Following is not contact relationship                           |
| Communities   | Membership does not expose phone/contact info automatically     |
| Notifications | Preview policy controls sensitive content                       |
| Live Location | Explicit bounded sharing                                        |
| Calls         | Hidden handles stay hidden                                      |
| Devices       | Device list owner-only                                          |
| Blocks        | Durable identity target                                         |

## 149. Final Safety Matrix

| Risk                           | UX mitigation                                    |
| ------------------------------ | ------------------------------------------------ |
| Unknown contact                | Message Requests                                 |
| Spam/harassment                | Block/report, request boundaries                 |
| Call abuse                     | Call privacy, block, report                      |
| Group invite abuse             | Invitation policy                                |
| Community abuse                | Membership controls, report                      |
| Channel abuse                  | Follow/mute/unfollow/report; public launch gated |
| Malicious links                | Future safety architecture, reporting            |
| Live Object notification abuse | Permission-aware reminders/notifications         |
| Location misuse                | Bounded explicit sharing and visible stop        |
| Device-link phishing           | Explicit review/approval                         |

## 150. Final Failure Matrix

| Failure                     | Recovery expectation                    |
| --------------------------- | --------------------------------------- |
| Offline                     | cached/local mode, pending states       |
| Send failure                | retry/edit/delete local attempt         |
| Upload failure              | retry/remove attachment                 |
| Sync conflict               | preserve intent, review when meaningful |
| Search unavailable          | local results remain                    |
| AI unavailable              | ordinary source/search remains          |
| Call failure                | try again/audio-only/message            |
| Permission denied           | alternative path/settings               |
| Notifications disabled      | OS handoff, messaging works             |
| Device-link failure         | retry/new request                       |
| Privacy-setting failure     | do not show applied                     |
| Content unavailable/deleted | safe tombstone/fallback                 |
| Stale Live Object           | refresh/stale label                     |

## 151. Final Product Laws

1. Messaging first.
2. Power stays contextual.
3. Primary navigation remains Chats / Updates / Calls.
4. Conversation is canonical.
5. Most conversations never become Spaces.
6. Live Objects are structured conversation artifacts.
7. Plans organize related artifacts; Spaces organize persistent conversation state.
8. AI is optional and contextual.
9. Search works without AI.
10. Private content never broadens audience silently.
11. User identity is not a phone number.
12. Device is the human management unit.
13. Offline state is honest.
14. Security claims require real architecture.
15. Notifications serve consequence, not engagement.
16. Derived views do not become data silos.
17. Public discovery is deliberate and safety-gated.
18. Location sharing is explicit and bounded.
19. Settings expose human choices, not internals.
20. Accessibility is baseline.

## 152. Final Architecture Summary

Seyloq is a compact private messenger. The app opens around Chats, Updates, and Calls. Chats contain ordinary messages, media, voice notes, files, calls, and groups. When useful, a conversation can reveal Context: participants, media, files, links, places, events, decisions, expenses, and other structured artifacts.

Live Objects let structure emerge without leaving chat: Polls, Events, Checklists, Expenses, Decisions, Reminders, Static Locations, and Live Locations share one visual grammar and lifecycle. Plans summarize related conversation artifacts. Spaces are rare, explicit, optional organized views over persistent conversation state. Memory is future historical presentation.

Updates contains Status, Channels, and selected Community announcements without becoming an engagement feed. Calls remains a primary destination for call history and returning calls. Search is globally reachable but not a tab. AI is contextual, source-bound, optional, and never a primary destination.

Identity separates User, Device, Session, and Connection. Settings expose profile, account, privacy, security/devices, notifications, storage/data, and accessibility without technical internals. Privacy, safety, offline, notifications, and accessibility are product-wide constraints.

## 153. SEY-006 Completion Checklist

- [x] Pass 01 synthesized
- [x] Pass 02 synthesized
- [x] Pass 03 synthesized
- [x] Pass 04 synthesized
- [x] Pass 05 synthesized
- [x] Pass 06 synthesized
- [x] Pass 07 synthesized
- [x] Pass 08 synthesized
- [x] Primary navigation frozen
- [x] Messaging model frozen
- [x] Live Object model frozen
- [x] Context model frozen
- [x] Plan model frozen
- [x] Space model frozen
- [x] Calls model frozen
- [x] Updates model frozen
- [x] Search model frozen
- [x] AI role frozen
- [x] Identity model frozen
- [x] Device model frozen
- [x] Settings architecture frozen
- [x] Privacy model frozen
- [x] Notification philosophy frozen
- [x] Terminology audited
- [x] Duplication audited
- [x] Contradictions audited
- [x] Navigation dead ends audited
- [x] Permission dead ends audited
- [x] Offline dead ends audited
- [x] Privacy leaks audited
- [x] Complexity audited
- [x] MVP classification complete
- [x] Research-gated features identified
- [x] Frozen Decision Registry complete
- [x] Open Decision Registry complete
- [x] Screen inventory complete
- [x] Component inventory complete
- [x] State inventory complete
- [x] Interaction inventory complete
- [x] Responsive matrix complete
- [x] Accessibility matrix complete
- [x] Privacy matrix complete
- [x] Safety matrix complete
- [x] Failure matrix complete
- [x] SEY-007 prototype scope defined
- [x] Prototype validation questions defined
- [x] Prototype success criteria defined
- [x] Engineering handoff boundaries defined

## Human Review Boundary

This pass is synthesis and freeze only. It does not implement UI, prototype, production components, backend, WebSockets, media pipeline, calling, authentication, recovery, contact sync, notification infrastructure, search indexing, semantic search, embeddings, vector database, AI, AI provider selection, E2EE, cryptography, device linking, moderation backend, account deletion, native plugins, SEY-007, or SEY-008.

SEY-006 UX Architecture Pass 09 - Cross-Module Synthesis, Consistency & Final UX Freeze ready for Human Review.
