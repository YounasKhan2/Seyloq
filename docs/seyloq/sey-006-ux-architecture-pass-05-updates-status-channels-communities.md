# SEY-006 - Complete Product UX Architecture

Pass 05: Updates, Status, Channels & Communities  
Base: SEY-006 Pass 01, Pass 02, Pass 03, and Pass 04

## 01. Updates Design Laws

Updates is the asynchronous/social communication destination inside Seyloq's frozen primary navigation.

Primary navigation remains:

- Chats
- Updates
- Calls

Do not add permanent top-level destinations for Status, Channels, Communities, Discover, Following, For You, Trending, or Creators.

Product laws:

- Seyloq remains a private messenger before it becomes a content platform.
- Updates must not become an infinite engagement feed by default.
- Status is relationship-oriented.
- Channels are broadcast-oriented.
- Communities are organization-oriented.
- Communities do not replace Groups.
- Channels do not behave like ordinary group chats.
- Following a Channel does not make someone a contact.
- Status viewers do not become followers.
- Public discovery must be deliberate and limited.
- Algorithms must not be required for the basic Updates experience.
- Privacy and audience must be understandable before publishing.
- Muting and unfollowing must be easy.
- Creation should remain compact.
- Advanced creator/community administration stays progressively disclosed.

Core law:

> Updates should help people keep up with people and conversations they intentionally care about, not maximize time spent scrolling.

## 02. Updates Information Architecture

Updates contains distinct capabilities without merging them into one generic feed:

```text
Updates
  Status
    My status
    Recent
    Viewed

  Channels
    Following
    Suggested later

  Community activity
    Announcement surfaces where appropriate
```

Communities generally surface through associated conversations and invitations rather than becoming a permanent Updates section.

Avoid default structures such as:

- For You
- Following as algorithmic feed
- Trending
- Explore
- Popular
- Recommended

The initial architecture should privilege intentional relationships and followed sources.

## 03. Updates Home

Updates Home answers:

- What have people I care about shared?
- What have Channels I intentionally follow published?
- Are there important Community announcements relevant to me?

It does not answer:

- What content can keep me scrolling?

Composition:

```text
UpdatesHeader
StatusSection
ChannelUpdates
CreationAffordance
SearchDiscoveryEntry where justified
```

Density rules:

- Keep layout compact and scannable.
- Avoid giant social-media cards.
- Avoid excessive whitespace.
- Show empty sections only when helpful.

## 04. Status Capability Model

Initial Status candidates:

- Text.
- Photo.
- Video.
- Link.

Future-compatible capabilities:

- Music reference/integration.
- Voice status.
- Poll/status interaction.
- Multiple-item story collections.

Rules:

- Do not assume every media format ships initially.
- Status is personal and temporary.
- Status creation should remain lightweight.
- Timed media must have accessibility controls.

## 05. Status Lifecycle

Canonical lifecycle:

```text
draft
  -> audience_selection
  -> publishing
  -> active
  -> expired
```

Branches:

```text
publishing -> failed
active -> deleted
```

Default expiration direction is 24 hours unless Product Owner decides otherwise.

Expired Status disappears from normal viewers. Whether authors keep private archives is a separate product decision.

## 06. Status Creation

Entry:

```text
My Status +
```

or a contextual create affordance inside Updates.

Text flow:

```text
Create -> type -> audience -> share
```

Photo/video flow:

```text
Create -> capture/select -> optional caption -> audience -> share
```

Disallowed in ordinary Status creation:

- Campaign editor.
- Post settings dashboard.
- Content scheduler.
- Analytics configuration.

Drafts and selected media must not be silently discarded.

## 07. Status Audience/Privacy

Audience is visible before publishing.

Possible audience model:

- My contacts.
- My contacts except...
- Only share with...

Example:

```text
Share with: My contacts
```

Tapping opens audience selection.

Privacy behavior to define:

| Case                               | Required UX stance                                   |
| ---------------------------------- | ---------------------------------------------------- |
| Blocked users                      | Cannot view Status                                   |
| Muted contacts                     | Muting their Status does not affect own audience     |
| Unknown users                      | Not included unless explicit public model exists     |
| Deleted contacts                   | Visibility follows audience snapshot/policy decision |
| Audience changed after publication | Must be explicit whether it applies retroactively    |
| View receipts disabled             | Product decision; copy must be clear                 |

Do not infer social relationships from incidental interaction.

## 08. Status Viewing/Navigation

Status viewer supports:

- Person identity.
- Progress.
- Content.
- Timestamp.
- Reply.
- Reaction.
- More/safety.

Viewer concept:

```text
Ahmed                         2h
Progress

Status media/text

Reply...                  Reaction
```

Navigation:

- Next item from same person.
- Previous item.
- Next person.
- Previous person.
- Pause.
- Close.

Mobile may use tap/swipe gestures. Desktop must provide explicit controls and keyboard accessibility. Gestures must never be the only interaction.

## 09. Status Replies/Reactions

Status replies resolve into the existing 1:1 conversation.

```text
Status -> Reply -> Existing conversation
```

Reply message may preserve a Status preview/reference.

Status reactions should be private lightweight responses by default, not public engagement.

Rules:

- Do not create a separate Status inbox.
- Do not create public reaction counts unless explicitly approved.
- Replies and reactions remain relationship-oriented.

## 10. Status Viewers

Author viewer model:

```text
Viewed by 18
```

Expanded:

```text
Ahmed
Ali
Sara
...
```

Rules:

- Viewer list depends on privacy policy.
- Do not expose retention, completion rate, reach graphs, or engagement score to ordinary users.
- Viewer state should be understandable if read/view receipts are disabled.

## 11. Status Mute

Users can mute Status from a person:

```text
Mute status from Ahmed
```

Muted Status behavior:

- Moves out of prominent Recent placement.
- Can be shown in a collapsed/muted area if PO approves.
- Does not mute messages.
- Does not mute calls.
- Does not mute conversation notifications unless explicitly selected.

## 12. Status Offline/Failure

Status publication states:

- Draft preserved.
- Uploading.
- Publishing.
- Waiting to publish.
- Failed.
- Retry.

Offline behavior:

```text
Waiting to publish
```

where queued publication is supported.

Rules:

- Never silently discard media/draft.
- Failed Status can be retried or deleted.
- Viewer sees unavailable/expired copy when content cannot be loaded.

## 13. Status Accessibility

Status accessibility requirements:

- Screen reader labels.
- Keyboard navigation.
- Pause controls.
- Captions/text alternatives where available.
- Visible focus.
- Reduced motion.
- Large touch targets.
- Progress semantics.

Timed visual presentation must be controllable. Users requiring more time can pause or navigate explicitly.

## 14. Channel Definition

A Channel is:

> A one-to-many broadcast conversation that people intentionally follow.

Channels are not:

- Normal groups.
- Communities.
- Public chat rooms.
- Creator social profiles.

Channel content may include:

- Text.
- Images.
- Video.
- Files.
- Links.
- Polls.
- Announcements.

Future structured content may reuse selected Live Object primitives where appropriate.

## 15. Channel Relationship Model

Conceptual roles:

- Owner.
- Admin/editor if needed.
- Follower.

Followers primarily consume. Publishing is controlled by Channel authority.

Rules:

- Avoid enterprise RBAC.
- Channel permissions do not leak into normal group architecture.
- Following does not create a contact.
- Following does not expose phone number.
- Following does not create a 1:1 chat.
- Following does not join unrelated groups.

## 16. Channel Follow/Mute/Unfollow

Follow flow:

```text
Open Channel -> Preview -> Follow
```

After following:

- Channel appears in Updates / Following.
- Channel may become searchable elsewhere.

Mute/unfollow:

- Mute keeps following but reduces/no notifications.
- Unfollow stops following.
- Unfollow must avoid dark patterns.

Notification preference can start simple:

- Notifications on.
- Notifications off.

More advanced Highlights requires recommendation or editorial logic and should be deferred unless justified.

## 17. Channel Update Grammar

Channel update grammar is denser than a generic social post.

Example:

```text
Seyloq Engineering
2h

Desktop beta available today.

Image

Read more
```

Possible actions:

- React.
- Share/forward.
- Open link.
- Vote in poll where supported.

Rules:

- Avoid public comment threads initially unless explicitly approved.
- Updates are persistent unless deleted/retracted.
- Channel history is not 24-hour Status.

## 18. Channel Reactions/Replies

Recommended reaction model:

```text
aggregate only
```

Example:

```text
Like 214   Heart 87
```

Do not turn Channels into follower-ranking or public social-status systems.

Replies/comments:

- Recommended initial direction: no public threaded comments.
- Later alternatives: Contact, linked discussion group, or moderated discussion.
- Do not accidentally create Reddit/Discord under every Channel.

## 19. Channel Notifications

Potential notification models:

Simple initial:

- Notifications on.
- Notifications off.

Future:

- All.
- Highlights.
- Muted.

Rules:

- Challenge Highlights because it may require recommendation infrastructure.
- Do not invent opaque ranking algorithms.
- Important announcements may require explicit publisher/Channel semantics later.

## 20. Channel Identity

Channel identity may include:

- Name.
- Avatar.
- Description.
- Handle/identifier.
- Verification state later.
- Follower count if useful.

Rules:

- User identity and Channel identity are separate concepts.
- Do not expose personal owner contact information by default.
- Never show a verification badge without real verification policy.

## 21. Channel Creation

Compact creation flow:

```text
Create Channel
  -> Name
  -> Avatar optional
  -> Description optional
  -> Visibility
  -> Create
```

Advanced settings happen after creation.

Product decision:

- Available to everyone?
- Limited during initial release?
- Requires trust/safety gate?

Do not design a creator studio.

## 22. Channel Visibility

Possible visibility:

- Private/unlisted.
- Public/discoverable.

Definitions:

| Visibility          | Meaning                                                              |
| ------------------- | -------------------------------------------------------------------- |
| Private/unlisted    | Accessible by invitation/link/search constraints depending on policy |
| Public/discoverable | Eligible for search/discovery                                        |

Channels must not silently become publicly discoverable.

## 23. Channel Discovery/Search

Preferred initial discovery:

- Search.
- Shared Channel link.
- Invitation.
- Known Channel identity/handle.

Avoid:

- Infinite recommended feed.
- Trending.
- Viral ranking.
- Engagement recommendations.

Search fields:

- Channel name.
- Handle.
- Description.

Ranking/search backend is out of scope.

## 24. Channel Safety

Channel safety actions:

- Report Channel.
- Block/hide Channel.
- Report update.
- Unfollow.

Future public Channel requirements:

- Moderation.
- Abuse handling.
- Spam prevention.
- Impersonation handling.
- Malicious link handling.
- Ownership disputes.

Do not implement moderation systems in this pass.

## 25. Community Definition

A Community is:

> A lightweight organizational container connecting related Seyloq groups and announcement surfaces.

Examples:

```text
University Society
  Announcements
  General
  Events
  Volunteers
```

```text
Apartment Community
  Announcements
  Residents
  Maintenance
  Buy & Sell
```

Community is not:

- Another group.
- Project workspace.
- Server with dozens of channels.
- Enterprise organization.
- Public forum.

## 26. Group vs Channel vs Community vs Space

Comparison:

| Concept   | Purpose                                          | Communication shape                 | Primary location             |
| --------- | ------------------------------------------------ | ----------------------------------- | ---------------------------- |
| Group     | Many-to-many conversation                        | Members message each other          | Chats                        |
| Channel   | One-to-many broadcast                            | Publishers post, followers consume  | Updates                      |
| Community | Organizes related conversations                  | Container over groups/announcements | Chats/search/invites/context |
| Space     | Organizes structured state inside a conversation | View over artifacts                 | Conversation-local           |

Critical distinction:

- Community organizes conversations.
- Space organizes shared state inside a conversation.
- Channel broadcasts updates.
- Group hosts normal conversation.

## 27. Community IA

Potential structure:

```text
Community
  Announcement surface
  Groups
  Community info
```

Avoid:

- Dashboard.
- Roles.
- Apps.
- Bots.
- Analytics.
- Integrations.
- Automations.
- Wiki.
- Tasks.

unless future evidence justifies them.

## 28. Community Entry

Communities are reached through:

- Chats.
- Search.
- Invitation.
- Associated group context.

Do not add `Communities` to primary navigation.

If a user belongs to a Community, related groups still behave as normal conversations in Chats.

## 29. Community Membership

Distinguish:

- Community membership.
- Group membership.

Potential model:

```text
Join Community
  -> Announcements available
  -> Choose/eligible groups
```

Rules:

- Joining a Community does not necessarily join every group.
- Joining a group may require group-level permission.
- Exact membership semantics require Product Owner decision.

## 30. Community Announcements

Options:

| Model                                | Benefits                             | Risks                                 |
| ------------------------------------ | ------------------------------------ | ------------------------------------- |
| Special announcement group           | Reuses group/conversation primitives | May allow too much chat-like behavior |
| Community-owned Channel-like surface | Reuses broadcast model               | Adds Channel dependency/permissions   |

Preferred direction:

- Reuse existing communication primitives.
- Keep announcements one-to-many.
- Avoid inventing another post model.

## 31. Community Group Discovery

Community group list:

```text
Groups
  General        Joined
  Events         Available
  Volunteers     Restricted
  Buy & Sell     Available
```

Each group clearly shows:

- Joined.
- Available to join.
- Restricted.

Do not automatically subscribe users to every conversation.

## 32. Community Creation/Roles

Compact creation:

```text
Create Community
  -> Name
  -> Description
  -> Add existing/new groups
  -> Create
```

Initial conceptual roles:

- Owner/admin.
- Member.

Group-level roles remain group-level.

Do not introduce complex inherited RBAC unless later requirements demand it.

## 33. Community Privacy/Leaving

Privacy models:

- Private.
- Invite-based.
- Discoverable later if approved.

Privacy requirements:

- Membership visibility is explicit.
- Phone number/personal identity exposure is explicit.
- Community members do not automatically see personal contact info unless policy allows.

Leaving requires clear semantics:

- Does user leave every related group?
- Do independently joined groups remain?
- Does announcement access disappear?

Do not silently cascade destructive membership changes.

## 34. Updates + Community Relationship

Updates may surface:

- Community announcement.
- Important Community update if settings allow.

Ordinary Community group messages remain in Chats.

Rules:

- Do not mix every Community message into Updates.
- Updates must not become a duplicate inbox.
- Community announcement visibility follows membership/privacy rules.

## 35. Ordering/Read-State/Badges

Ordering:

- Status: recent active Status from known relationships.
- Channels: chronological updates from followed Channels.
- Community announcements: according to relevance/settings, likely chronological.

Avoid opaque recommendation ranking initially.

Independent state:

- Status seen/unseen.
- Channel update read/unread if needed.
- Community announcement read/unread.

Badges:

- Use conservative Updates dot for meaningful unseen activity.
- Avoid large accumulating counts from every Status, Channel post, or Community announcement.
- Avoid notification anxiety.

## 36. Notification Concepts

Potentially notification-worthy:

- Direct Status reply/reaction received.
- Important Channel update when explicitly subscribed.
- Community announcement according to settings.

Usually silent:

- Ordinary new Status.
- Routine Channel post.
- New public recommendation.

Notifications respect mute, unfollow, block, conversation settings, and platform rules. Infrastructure is out of scope.

## 37. Creation Architecture

Updates create affordance adapts to permissions:

```text
+
  Status
  Channel update, if user manages Channel
  Community announcement, if authorized
```

Rules:

- Ordinary users should not see irrelevant creator/admin options.
- Creation surfaces stay compact.
- Audience/visibility must be visible before publish.
- Advanced settings are progressively disclosed.

## 38. Cross-Surface Sharing

Sharing from Chat into:

- Status.
- Channel, if authorized.
- Community announcement, if authorized.

Sharing from Updates into:

- Conversation.
- Group.
- External OS share where supported.

Rules:

- Preserve attribution/provenance where appropriate.
- Do not silently republish private content publicly.
- Sharing private content to a broader audience requires explicit user confirmation.

## 39. Conversation Relationships

Status to conversation:

- Replies resolve to existing 1:1 conversation.
- Reactions can become private lightweight conversation responses.
- Status itself does not become a conversation.

Channel to conversation:

- Channel update can be forwarded into conversation.
- Forwarded message preserves Channel attribution.
- Opening attribution returns to Channel where permitted.

Community to conversation:

- Community groups remain ordinary conversation identities.
- Existing message, calls, Live Object, Context, Plan, and Space architecture continues inside eligible Community groups.

## 40. Calls Compatibility

Channel posts do not automatically imply calling.

Community groups use normal calling according to Pass 04.

Future out of scope:

- Community-wide calls.
- Voice rooms.
- Channel live audio/video.

Do not design those in this pass.

## 41. Live Object Compatibility

Groups inside Communities continue supporting Live Objects.

Channels may later reuse selected read-oriented objects:

- Poll.
- Event.

Do not automatically enable these in broadcast Channels:

- Expense.
- Checklist.
- Decision.
- Plan.

Capability must fit the communication semantics and permissions.

## 42. Search Compatibility

Future global Search may resolve:

- Status, active only depending on privacy.
- Channel.
- Channel update.
- Community.
- Community group.
- Community announcement.

Privacy and visibility filter results.

Search backend/ranking is out of scope.

## 43. Offline Architecture

Status:

- Draft locally.
- Queued publication if supported.
- Cached recently viewed content where appropriate.

Channels:

- Cached followed updates.
- Offline history where locally available.

Communities:

- Cached metadata.
- Normal group offline behavior inherited from Chats.

User-facing copy:

- Waiting to publish.
- May be out of date.
- Couldn't refresh.
- Available offline.

Do not expose transport internals.

## 44. Deletion/Provenance

Deletion semantics:

| Content                | Meaning                                         |
| ---------------------- | ----------------------------------------------- |
| Status                 | Delete removes it from normal viewer visibility |
| Channel update         | Authorized publisher deletes/retracts           |
| Community announcement | Authorized admin removes/retracts               |

Forwarded copies:

- Deleting original content may not delete forwarded copies from conversations.
- Forwarded content should retain provenance where possible.
- Deleted/unavailable original shows safe attribution fallback.

## 45. Reporting/Moderation Boundary

Reporting/blocking actions:

- Block person.
- Report Status.
- Report Channel.
- Report Channel update.
- Report Community.
- Report Community group.

Blocking a user does not necessarily equal leaving a Community.

Future moderation requirements:

- Spam.
- Harassment.
- Illegal content.
- Impersonation.
- Malicious links.
- Mass messaging abuse.
- Public discovery abuse.
- Channel ownership disputes.
- Community abuse.

Do not implement moderation in this pass.

## 46. Responsive Architecture

Responsive behavior:

| Viewport         | Updates nav                              | Status                         | Channels                      | Communities             | Creation/search |
| ---------------- | ---------------------------------------- | ------------------------------ | ----------------------------- | ----------------------- | --------------- |
| Mobile portrait  | Single-column Updates                    | Tray/list + full viewer        | Stacked list/detail           | Pushed detail           | Bottom sheets   |
| Mobile landscape | Single-column with wider viewer          | Focused viewer                 | List/detail as route          | Pushed detail           | Sheets          |
| Tablet portrait  | List plus selected detail where possible | Viewer sheet/detail            | Two-pane if width allows      | Detail route/panel      | Sheets/dialogs  |
| Tablet landscape | Two-pane Updates                         | Focused overlay/detail         | List + detail                 | List/detail             | Dialog/sheet    |
| Desktop compact  | Updates list + selected content          | Focused overlay/content region | List + detail                 | Detail shell            | Dialog/popover  |
| Desktop normal   | List + detail                            | Overlay/content region         | List + detail + optional info | Community nav + content | Dialog/popover  |
| Desktop wide     | Wider detail, optional info              | Focused viewer                 | Optional info panel           | Community nav + content | Dialog/popover  |

Do not simply enlarge mobile layouts on desktop.

## 47. Accessibility/Motion

Accessibility requirements:

- Keyboard navigation.
- Screen readers.
- Semantic controls.
- Status pause.
- Visible focus.
- Captions compatibility.
- Text scaling.
- Reduced motion.
- Non-color state.
- Touch targets.
- Accessible audience selection.
- Accessible reaction state.

Motion:

- Status transitions.
- Status progress.
- Updates section changes.
- Channel follow/unfollow.
- Community group join.
- Creation sheets.

Avoid addictive swipe animation and excessive motion. Respect reduced motion.

## 48. Component Hierarchy

Reusable components:

```text
UpdatesHome
  UpdatesHeader
  UpdatesSection
  UpdatesCreateMenu

StatusTray
  StatusAvatar
  StatusViewer
  StatusProgress
  StatusComposer
  StatusAudiencePicker
  StatusReply
  StatusViewerList

ChannelList
  ChannelListItem
  ChannelView
  ChannelHeader
  ChannelUpdate
  ChannelComposer
  ChannelFollowControl
  ChannelNotificationControl
  ChannelInfo

CommunityView
  CommunityHeader
  CommunityAnnouncement
  CommunityGroupList
  CommunityGroupItem
  CommunityMembershipControl

ContentReportMenu
ContentEmptyState
UpdatesOfflineState
```

Reuse existing primitives rather than creating another design system.

## 49. Conceptual Data Model

UX concepts:

```text
Status
StatusItem
StatusAudience
StatusView
StatusReaction

Channel
ChannelMembership / Follow
ChannelUpdate

Community
CommunityMembership
CommunityGroupReference
CommunityAnnouncement
```

Relationships:

```text
User
  Status
  Channel authority where applicable

Channel
  Updates

Community
  Announcement surface
  Conversation references
```

These are conceptual UX entities, not backend schema commitments.

## 50. State Machines

Status publication:

```text
draft
  -> audience_selection
  -> publishing
      -> active
      -> failed
  -> expired
  -> deleted
```

Status viewer:

```text
unseen -> viewing -> seen
```

Channel follow:

```text
not_following
  -> following
  -> muted
  -> not_following
```

Channel update publication:

```text
draft
  -> publishing
      -> published
      -> failed
  -> deleted_retracted
```

Community membership:

```text
not_member
  -> invited / restricted / eligible
  -> joining
  -> member
  -> leaving
  -> not_member
```

## 51. Interaction Matrix

| Interaction           | Trigger           | Surface        | Immediate result       | Durable result        | Failure             | Offline             | Privacy               | Permission      | Mobile        | Desktop         | Safety                    |
| --------------------- | ----------------- | -------------- | ---------------------- | --------------------- | ------------------- | ------------------- | --------------------- | --------------- | ------------- | --------------- | ------------------------- |
| Create Status         | My Status +       | Updates        | Composer opens         | Draft                 | Media fail          | Draft local         | Audience visible      | User            | Sheet/screen  | Dialog/panel    | None                      |
| Choose audience       | Audience row      | Composer       | Picker opens           | Audience set/snapshot | Invalid audience    | Local               | Critical              | User            | Sheet         | Dialog          | Prevent overshare         |
| Publish Status        | Share             | Composer       | Publishing             | Active Status         | Failed              | Waiting to publish  | Enforced              | User            | Button        | Button          | Visibility clear          |
| Retry Status          | Failed state      | Status draft   | Publishing             | Active/failed         | Failed              | Queue               | Same audience         | User            | Inline        | Inline          | None                      |
| Delete Status         | More              | Status         | Removed locally        | Deleted               | Restore/explain     | Queue if safe       | Removes viewer access | Author          | Sheet         | Menu/dialog     | None                      |
| View Status           | Tray/list         | Updates        | Viewer opens           | Seen state            | Expired/unavailable | Cached if available | Audience checked      | Viewer          | Full viewer   | Overlay/detail  | Report available          |
| Pause Status          | Viewer control    | Viewer         | Paused                 | None                  | None                | Local               | None                  | Viewer          | Tap/control   | Button/key      | Accessibility             |
| Reply to Status       | Reply field       | Viewer         | Message composer/reply | 1:1 message           | Send fail           | Queue msg           | Private               | Viewer          | Field         | Field           | Abuse controls            |
| React to Status       | Reaction          | Viewer         | Reaction sent          | Private response      | Send fail           | Queue               | Private               | Viewer          | Button        | Button          | Abuse controls            |
| View viewers          | Viewer count      | Own Status     | Viewer list            | None                  | Unavailable         | Cached maybe        | Receipt policy        | Author          | Sheet         | Panel           | Privacy copy              |
| Mute Status author    | More              | Viewer/list    | Status hidden          | Muted status setting  | Fail                | Store local         | Does not mute chat    | Viewer          | Sheet         | Menu            | None                      |
| Open Channel          | Channel row/link  | Updates/search | Channel preview/detail | None                  | Unavailable         | Cached              | Visibility checked    | Viewer          | Pushed        | Detail pane     | Report available          |
| Follow Channel        | Follow            | Channel        | Following              | Follow record         | Fail                | Queue if safe       | No contact created    | User            | Button        | Button          | None                      |
| Mute Channel          | Bell/menu         | Channel        | Notifications off      | Mute pref             | Fail                | Local pref          | None                  | Follower        | Sheet         | Menu            | None                      |
| Unfollow Channel      | Menu              | Channel        | Removed from following | Unfollow              | Fail                | Queue               | None                  | Follower        | Confirm sheet | Menu/dialog     | No dark pattern           |
| React to update       | Reaction          | Update         | Aggregate updates      | Reaction record       | Fail                | Queue               | Aggregate default     | Follower        | Button        | Button          | Abuse controls            |
| Share update          | Share             | Update         | Share picker           | Message/share         | Fail                | Queue msg           | Attribution preserved | Viewer          | Sheet         | Dialog          | Prevent private leak      |
| Report Channel/update | Report            | Menu           | Report flow            | Report submitted      | Fail                | Save draft maybe    | Evidence policy       | Viewer          | Sheet         | Dialog          | Required                  |
| Create Channel        | Create menu       | Updates        | Creation flow          | Channel created       | Fail                | Draft               | Visibility explicit   | PO policy       | Screen        | Dialog          | Abuse gating              |
| Publish update        | Channel composer  | Channel        | Publishing             | Update published      | Failed              | Queue               | Channel visibility    | Publisher       | Composer      | Composer        | Moderation                |
| Open Community        | Link/search/group | Chats/search   | Community opens        | None                  | Unavailable         | Cached              | Visibility checked    | Member/eligible | Pushed        | Detail          | Report                    |
| Join Community        | Join              | Community      | Joining                | Membership            | Restricted/fail     | Queue maybe         | Identity rules        | Eligible        | Button        | Button          | Safety                    |
| Leave Community       | Menu              | Community      | Confirm                | Membership removed    | Fail                | Queue               | Cascade clear         | Member          | Confirm sheet | Dialog          | Avoid destructive cascade |
| Open Community group  | Group row         | Community      | Conversation opens     | None                  | Restricted          | Cached metadata     | Group policy          | Eligible/member | Pushed chat   | Canonical shell | Normal chat safety        |
| Join Community group  | Group row         | Community      | Joining                | Group membership      | Restricted          | Queue maybe         | Group policy          | Eligible        | Button        | Button          | Safety                    |
| Create Community      | Create flow       | App/search     | Flow opens             | Community created     | Fail                | Draft               | Visibility explicit   | PO policy       | Screen        | Dialog          | Abuse gating              |
| Publish announcement  | Authorized create | Community      | Publishing             | Announcement          | Failed              | Queue               | Membership checked    | Admin           | Composer      | Composer        | Moderation                |
| Report Community      | Menu              | Community      | Report flow            | Report submitted      | Fail                | Save draft maybe    | Evidence policy       | Viewer/member   | Sheet         | Dialog          | Required                  |

## 52. Screen/Surface Inventory

New Updates surfaces:

- Updates Home.
- Status viewer.
- Status composer.
- Status audience picker.
- Status viewer list.
- Channel list.
- Channel detail.
- Channel creation flow.
- Channel update composer.
- Channel info.
- Community detail.
- Community group list.
- Community creation flow.
- Community membership confirmation.
- Community announcement composer.

Sheets/dialogs/popovers:

- Updates create menu.
- Status mute/report menu.
- Channel follow/mute/unfollow menu.
- Channel report menu.
- Community join/leave dialog.
- Community report menu.
- Share/forward picker.

Reused canonical surfaces:

- Existing 1:1 conversation for Status replies/reactions.
- Existing conversation shell for Community groups.
- Existing media/file primitives where applicable.

## 53. Error/Empty States

Required states:

| State                           | Recovery                            |
| ------------------------------- | ----------------------------------- |
| No Status updates               | Create Status / wait                |
| No followed Channels            | Search/follow Channel               |
| No Channel updates              | Empty following state               |
| Status unavailable/expired      | Close viewer                        |
| Status failed to publish        | Retry/delete                        |
| Status media unavailable        | Show text/fallback                  |
| Channel unavailable             | Return to Updates                   |
| Channel update deleted          | Show removed state                  |
| Channel follow failed           | Retry                               |
| Community unavailable           | Return/search                       |
| Community invitation expired    | Ask for invite                      |
| Community membership restricted | Explain/request access if supported |
| Community has no visible groups | Show announcements/info             |
| Announcement unavailable        | Removed/unavailable state           |
| Offline/stale Updates           | Show cached + "May be out of date"  |
| Content removed                 | Safe tombstone                      |
| Content reported                | Confirmation                        |

## 54. Backend/Protocol Requirements

Future architecture must define:

- Status identity.
- Status expiry.
- Audience snapshots/rules.
- View receipts.
- Reaction semantics.
- Media lifecycle.
- Channel identity.
- Follow membership.
- Publisher authority.
- Persistent update history.
- Visibility/discovery.
- Notification preference.
- Community identity.
- Community membership.
- Group references.
- Announcement authority.
- Idempotent publication.
- Offline retry.
- Deletion/retraction.
- Blocking/reporting.
- Privacy filtering.
- Search visibility.
- Notification routing.

No backend/protocol implementation is part of this pass.

## 55. Native-Platform Requirements

Future native/platform requirements:

- Camera.
- Photo/video picker.
- Media compression.
- Background upload.
- Notifications.
- Deep links.
- OS sharing.
- Media playback.
- Audio focus where relevant.
- Permission recovery.

Do not solve these in this pass.

## 56. Privacy/Safety Requirements

Future requirements:

- Status audience enforcement.
- Audience changes.
- View-receipt privacy.
- Blocked-user behavior.
- Public Channel identity separation.
- Channel spam controls.
- Community membership privacy.
- Public discovery abuse prevention.
- Reporting evidence.
- Content retention.
- Media deletion.
- Forwarding provenance.
- Impersonation handling.
- Malicious-link handling.

Do not make unsupported privacy guarantees.

## 57. Open Product Owner Decisions

1. Does Status expire at exactly 24 hours?
2. Are expired Status items privately archived for the author?
3. Are Status reactions private conversation responses?
4. Are public Status reactions/counts prohibited initially?
5. Can users disable Status view receipts?
6. Does disabling read receipts affect Status viewers?
7. Which Status formats ship initially?
8. Should music integration ship later?
9. Should Updates show muted Status in a collapsed section?
10. Should Channels support public comments initially?
11. Should Channel reactions expose identities or only aggregate counts?
12. Who can create Channels initially?
13. Are public Channels supported at initial release?
14. Should Channel discovery initially be search/link only?
15. Should Channels have handles?
16. Should follower counts be visible?
17. Should Channel notifications be binary or support levels?
18. Can Channels use Poll/Event Live Objects initially?
19. Should Channel admins see analytics?
20. Should Communities use a Channel-like announcement surface or announcement group?
21. Does joining a Community automatically join announcements?
22. Does joining Community auto-join any groups?
23. Can Community groups also exist independently outside the Community?
24. What happens to group membership when leaving Community?
25. Who can create Communities?
26. Are Communities discoverable or invite-only initially?
27. Can one group belong to multiple Communities?
28. Can one Channel belong to a Community?
29. Should Community announcements appear in Updates?
30. Should Updates have an unseen dot/count?
31. How are Status and Channel updates ordered relative to each other?
32. Should followed Channels be chronological initially?
33. Is algorithmic recommendation explicitly excluded from MVP?
34. What creator/admin tools are needed before public Channels launch?
35. Which safety/moderation capabilities block public discovery from shipping?
36. Which Updates capabilities belong to the first release versus later?

## Human Review Boundary

This pass defines Updates, Status, Channels, and Communities UX architecture only. It does not implement Status, Channels, Communities, production UI, feeds, media pipeline, recommendation engine, public discovery, moderation backend, backend APIs, WebSockets, notifications, media storage, search backend, AI, Pass 01-04 redesign, primary navigation changes, Search/AI architecture, or Pass 06.

SEY-006 UX Architecture Pass 05 - Updates, Status, Channels & Communities ready for Human Review.
