# SEY-006 - Complete Product UX Architecture

Pass 01: Global Shell + Chats/Messaging  
Base: SEY-005 native client foundation, `main` HEAD `606d7ec0f8eb167b99bdebc30e09ea1c0841840c`

## 1. Global IA

Seyloq remains messenger-first. The primary navigation is frozen as:

- Chats
- Updates
- Calls

All future complexity must emerge inside conversations, conversation context, search, or contextual creation flows. Tasks, AI, files, events, polls, payments, decisions, spaces, and shared objects must not become permanent primary navigation entries in this phase.

Global IA:

| Area                 | Purpose                                                                  | Allowed surface                                                 | Explicitly excluded           |
| -------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------- | ----------------------------- |
| Chats                | Direct and group conversations                                           | Primary tab, conversation list, conversation route              | Dashboard-style chat home     |
| Updates              | Personal and social update stream                                        | Primary tab placeholder only                                    | Implementation in SEY-006     |
| Calls                | Audio/video history and entry points                                     | Primary tab placeholder only plus conversation header actions   | Full calling stack            |
| Search               | Find conversations, messages, files, people, and objects                 | Global search entry, chat-list search, conversation search      | Search backend implementation |
| Conversation context | Details, participants, shared media, structured items, settings          | Desktop right panel, tablet overlay, mobile sheet/pushed screen | Permanent global object nav   |
| Structured objects   | Events, polls, checklists, reminders, expenses, decisions, live location | Message attachments/cards and context panel collections         | Standalone app modules        |
| Account/settings     | Profile, theme, privacy, devices                                         | Avatar/menu and settings routes                                 | Primary nav entries           |

IA law: if a capability begins as a message, attachment, or conversation artifact, it stays reachable from that conversation first. Global access can exist through search or aggregated views only after product review.

## 2. Desktop Shell

Desktop composition:

```text
NavigationRail | ChatListPane | ConversationPane | ContextPanel
```

Target behavior:

| Region           | Default width | Min/collapse rule                                  | Contents                                        |
| ---------------- | ------------: | -------------------------------------------------- | ----------------------------------------------- |
| NavigationRail   |         64 px | Remains visible on desktop                         | Profile, Chats, Updates, Calls, theme/settings  |
| ChatListPane     |    320-380 px | Collapses first on compact desktop                 | Header, search, filters, conversation list      |
| ConversationPane |         Fluid | Always primary                                     | Header, history, transient bars, composer       |
| ContextPanel     |    320-380 px | User-toggleable; closes before chat list collapses | Participants, media, structured items, settings |

Desktop interaction rules:

- Rail items are icon-first with accessible labels and selected, hover, focus, disabled, and notification states.
- Chat list is keyboard navigable with roving selection. `Enter` opens the focused conversation.
- Conversation header exposes search, audio call, video call, and context toggle.
- Right context panel is persistent only on desktop widths where it does not crush message readability.
- Selection toolbar appears above history when one or more messages are selected.
- Message menus open from hover action, keyboard menu key, or right-click.

Desktop density should remain compact and functional. The shell should feel like a communication tool, not a SaaS dashboard.

## 3. Tablet Shell

Tablet shell uses adaptive two-pane behavior.

| Tablet state        | Shell                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Portrait            | Conversation list pushes into conversation. Context opens as full-height sheet. Bottom primary nav is allowed.                                          |
| Landscape           | Rail may appear if width allows. Chat list + conversation are visible. Context opens as overlay or third panel only when message width remains healthy. |
| Split-screen narrow | Use mobile shell rules. Preserve active conversation state when panes appear/disappear.                                                                 |

Tablet gestures:

- Back from conversation returns to chat list.
- Context opens from header info action as a sheet.
- Long press opens message action sheet.
- Horizontal layout changes must not reset draft, scroll position, selected messages, or composer mode.

## 4. Mobile Shell

Mobile composition:

```text
Chats list route
  Top app bar
  Search/filter row
  Conversation list
  Bottom primary nav: Chats | Updates | Calls

Conversation route
  Conversation header
  Message history
  Composer
```

Mobile rules:

- Bottom primary nav appears on root primary tabs, not while deep inside an active conversation unless product review approves it.
- Conversation opens as a pushed route.
- Context opens as a bottom sheet for quick info or as a pushed detail screen for deeper settings/media.
- Composer is pinned to bottom above safe area.
- Message actions use long press, selection mode, and bottom sheets. Hover-only affordances are invalid.
- Search can start at chat list and narrow into in-conversation results.

## 5. Responsive Matrix

| Breakpoint class | Approx width | Primary shell                                 | Context behavior             | Composer                                   | Nav                                  |
| ---------------- | -----------: | --------------------------------------------- | ---------------------------- | ------------------------------------------ | ------------------------------------ |
| Mobile narrow    |     < 390 px | Single route                                  | Bottom sheet/pushed          | Full width, compact tools                  | Bottom nav on roots                  |
| Mobile large     |   390-599 px | Single route                                  | Bottom sheet/pushed          | Full width, expanded attachment affordance | Bottom nav on roots                  |
| Tablet portrait  |   600-839 px | List or conversation route                    | Full-height sheet            | Full width                                 | Bottom nav or compact rail by review |
| Tablet landscape |  840-1023 px | Two pane                                      | Overlay sheet                | Conversation width guarded                 | Optional rail                        |
| Desktop compact  | 1024-1279 px | Rail + list + conversation                    | Overlay or closed by default | Standard                                   | Rail                                 |
| Desktop normal   | 1280-1599 px | Rail + list + conversation + optional context | Persistent toggle            | Standard                                   | Rail                                 |
| Desktop wide     |   >= 1600 px | Four regions visible when enabled             | Persistent                   | Standard with wider history                | Rail                                 |

Collapse priority:

1. Close context panel.
2. Reduce chat list width to minimum.
3. Collapse chat list into route.
4. Switch to mobile route model.

## 6. Chats Architecture

Chats screen regions:

- Header: product/account affordance, title, new chat action.
- Search: conversation search entry with keyboard focus and recent queries.
- Filter row: All, Unread, Groups, People, Archived. Filters are local UI concepts until search/index architecture lands.
- Conversation sections: pinned first, then recent. Muted/archive states remain visible through filter or explicit archived route.
- Empty states: no chats, no matching search, no unread, archived empty.

Conversation list item contract:

| Element        | Required behavior                                                |
| -------------- | ---------------------------------------------------------------- |
| Avatar         | Person/group initials or image; status ring only when useful     |
| Title          | Single line, strongest text in item                              |
| Preview        | Last message, draft, typing, attachment, call, or system preview |
| Timestamp      | Right aligned; absolute or relative by recency                   |
| Badge          | Unread count, mention, muted, pinned, failed outbox              |
| State priority | Draft > typing > failed send > mention > unread > last message   |

List item truncation:

- Title truncates before timestamp.
- Preview truncates after badges are preserved.
- Multi-line list items are allowed only for accessibility text scaling or explicit density setting.

## 7. Conversation Architecture

Conversation composition:

```text
ConversationHeader
MessageHistory
TransientBars
Composer
ContextSurface
```

Header variants:

| Conversation type | Header content                                                       |
| ----------------- | -------------------------------------------------------------------- |
| 1:1               | Avatar, display name, presence/last seen, search, call actions, info |
| Group             | Group avatar, title, participant summary, search, call actions, info |
| Unknown/deleted   | Safe title, limited actions, recovery/error affordance               |

Message history:

- Virtualized history is required before high-volume production use.
- Date separators and unread separators are first-class history rows.
- Replies jump to referenced messages when present; missing references render a safe unavailable state.
- New incoming messages auto-scroll only when the user is near the bottom.
- A "New messages" affordance appears when the user is reading older history.

Transient bars:

- Selection toolbar
- Offline banner
- Sync/retry banner
- Search-in-conversation result controls
- Call-in-progress banner, future phase

Context surface:

- Participants
- Shared media/files/links
- Structured items created from messages
- Notification, privacy, and safety settings

## 8. Message Taxonomy

| Kind        | Required rendering                                              | Required states                              |
| ----------- | --------------------------------------------------------------- | -------------------------------------------- |
| Text        | Bubble, links, mentions, line breaks                            | edited, deleted, failed, selected            |
| Image       | Thumbnail/media card, caption                                   | loading, ready, failed, unavailable          |
| Video       | Preview, duration, caption                                      | loading, ready, failed, unavailable          |
| File        | File row, name, size/type, save/open action                     | scanning, ready, failed, unavailable         |
| Voice       | Play/pause, waveform, duration, speed                           | recording, uploading, ready, failed          |
| Location    | Map/static preview, expiry when live                            | live, expired, unavailable                   |
| Live object | Compact card for event/poll/checklist/expense/decision/reminder | active, completed, cancelled, stale          |
| System      | Centered or subtle row                                          | date, unread, membership, security, call     |
| Deleted     | Tombstone                                                       | deleted by me, deleted by other, unavailable |
| Unsupported | Safe fallback                                                   | unsupported client/version                   |

Message grouping:

- Consecutive non-system messages from the same sender within a short window may group.
- Sender labels are shown at group starts for non-mine group messages.
- Meta is shown at group ends unless selection or expanded detail is active.

## 9. Message Action Model

Primary actions:

| Action    | Applies to                                        | Permission rule              | Mobile surface                  | Desktop surface        |
| --------- | ------------------------------------------------- | ---------------------------- | ------------------------------- | ---------------------- |
| Reply     | All normal messages                               | Anyone in conversation       | Long press sheet                | Hover/menu/right-click |
| React     | Normal messages                                   | Anyone in conversation       | Long press sheet/quick reaction | Hover/menu             |
| Copy      | Text, supported captions                          | Anyone                       | Sheet                           | Menu/keyboard          |
| Forward   | Non-system supported messages                     | Anyone unless restricted     | Sheet/selection toolbar         | Menu/selection toolbar |
| Star/save | Normal messages                                   | Local user                   | Sheet/selection toolbar         | Menu/selection toolbar |
| Edit      | Own text messages                                 | Author, within policy window | Sheet                           | Menu                   |
| Delete    | Own messages and allowed moderator actions        | Policy dependent             | Confirm sheet                   | Menu + confirm         |
| Info      | Own sent messages and supported received messages | Membership dependent         | Sheet/detail                    | Menu/detail            |
| Retry     | Own failed outbound messages                      | Local user                   | Inline button                   | Inline button          |
| Turn into | Supported message content                         | Product-gated                | Sheet submenu                   | Menu submenu           |
| Select    | Normal messages                                   | Anyone                       | Long press selection            | Menu/keyboard          |

Action priority:

- Inline: retry for failed outbound messages, play for voice, open/save for attachments.
- Quick: reply, react, edit own recent text.
- Overflow: forward, star, info, delete, turn into.
- Destructive actions require confirmation and must preserve local rollback semantics.

## 10. Composer State Machine

Composer states:

```text
default
  -> typing
  -> replying
  -> editing
  -> attachment_staged
  -> voice_recording
  -> voice_preview
  -> offline_queued
  -> sending
  -> failed
```

State rules:

| State             | Entry                             | Exit                                           |
| ----------------- | --------------------------------- | ---------------------------------------------- |
| Default           | Conversation opened, mode cleared | Type, attach, record, reply/edit action        |
| Typing            | Text input non-empty              | Send, clear, attach, navigate with draft saved |
| Replying          | Reply action                      | Send, cancel, switch target                    |
| Editing           | Edit own message                  | Save edit, cancel                              |
| Attachment staged | Attachment chosen                 | Send, remove, add caption                      |
| Voice recording   | Mic hold/tap                      | Stop, cancel                                   |
| Voice preview     | Recording completed               | Send, delete, replay                           |
| Offline queued    | Submit while offline              | Connectivity returns, user deletes queued item |
| Sending           | Submit accepted by local store    | ACK, failure                                   |
| Failed            | Send or edit rejected             | Retry, edit draft, delete local attempt        |

Composer controls:

- `+` or attachment menu: photos/video, camera, document, location, contact, poll, event.
- Emoji/reaction entry remains separate from attachments.
- Send button replaces voice note button when text or staged content exists.
- Drafts are per conversation and survive route/layout changes.
- Reply/edit context appears above the text field with a clear cancel action.

## 11. Offline/Delivery State Model

State progression for own outbound message:

```text
local -> queued -> sending -> acknowledged/sent -> delivered -> read
                    \-> failed
```

User-facing mapping:

| Technical state     | User label/icon | Interaction                          |
| ------------------- | --------------- | ------------------------------------ |
| local               | Preparing       | No server claims                     |
| queued              | Queued          | Visible if offline or pending outbox |
| sending             | Sending         | Spinner/subtle label                 |
| acknowledged + sent | Sent            | Single check                         |
| delivered           | Delivered       | Double check                         |
| read                | Read            | Read indicator where enabled         |
| failed              | Failed to send  | Retry/delete/edit available          |

Offline rules:

- Global offline banner appears when transport is unavailable.
- Sending remains local-first. Accepted local messages appear immediately with queued/pending state.
- ACK reconciliation is atomic with outbox mutation, per SEY-003.
- Failed mutations must not silently no-op; edit, delete, and reaction errors are surfaced.
- Reconnect retries should be visible but not noisy.

## 12. Search Architecture

Search entry points:

| Entry                        | Scope                                          | Expected result                                   |
| ---------------------------- | ---------------------------------------------- | ------------------------------------------------- |
| Chat list search             | Conversations, people, groups, recent messages | Filtered list and recent queries                  |
| Conversation header search   | Current conversation                           | Result count, next/previous, highlighted messages |
| Future global command/search | Cross-app search                               | Conversations, messages, files, objects           |

Search model:

- Local search can start with indexed conversation metadata and message text.
- Attachments and structured object search require indexed names, summaries, and object types.
- Results must preserve conversation context: selecting a result opens the conversation and scrolls to the message/object anchor.
- Empty search states distinguish no query, no local results, and search unavailable.
- Server-backed search is out of scope for SEY-006.

## 13. Empty/Error States

Required states:

| Surface                    | Empty state                               | Error state                                 |
| -------------------------- | ----------------------------------------- | ------------------------------------------- |
| Chats list                 | No conversations yet; start chat action   | Failed to load conversations; retry         |
| Chat search                | No results                                | Search unavailable                          |
| Conversation               | No messages yet                           | Failed to load history                      |
| Message history pagination | Older history unavailable                 | Retry load older                            |
| Composer                   | Disabled for blocked/deleted conversation | Send failed, edit failed, attachment failed |
| Context panel              | No shared media/items yet                 | Failed to load details                      |
| Attachments                | No preview available                      | Upload/download failed                      |
| Offline                    | Queued changes visible                    | Reconnect failed or auth expired            |

Tone:

- Empty states should be concise and action-oriented.
- Error states should explain what can be retried and what is preserved locally.
- Destructive failures should say whether data was unchanged.

## 14. Accessibility Model

Keyboard:

- `Tab` moves across major controls.
- Arrow keys navigate chat list and menu groups where roving focus is active.
- `Enter` opens focused conversation or sends when composer uses single-line submit behavior.
- `Shift+Enter` inserts newline in composer.
- `Escape` closes menus, sheets, selection mode, reply/edit mode, and search mode in that order.
- Context menus must be reachable by keyboard.

Screen reader:

- Primary nav has a labelled navigation region.
- Conversation list is announced as a selectable list.
- Active conversation header names the current conversation.
- Message history has an accessible label with conversation title.
- Delivery indicators expose text labels, not icon-only meaning.
- Typing and connection state updates use polite live regions.

Touch/motor:

- Mobile tap targets are at least 44 x 44 px.
- Long press must have a non-gesture alternative through visible actions where needed.
- Destructive confirmations must not rely on color alone.

Visual:

- Text scaling must not overlap controls.
- Focus rings must be visible in both themes.
- Badges, delivery states, and presence must have text labels.

## 15. Component Hierarchy

Target component hierarchy:

```text
AppShell
  NavigationRail
    RailItem
    AccountEntry
  PrimaryNavigation
  ChatListPane
    ChatListHeader
    ConversationSearch
    ConversationFilters
    ConversationList
      ConversationListItem
  ConversationPane
    ConversationHeader
      HeaderIdentity
      HeaderActions
    MessageHistory
      HistorySeparator
      MessageGroup
        MessageItem
          ReplyPreview
          MessageContent
          ReactionBar
          MessageMeta
          MessageActionMenu
      TypingIndicator
      NewMessagesButton
    TransientBars
      SelectionToolbar
      OfflineBanner
      ConversationSearchBar
    MessageComposer
      ComposerContext
      AttachmentMenu
      TextInput
      VoiceRecorder
  ContextPanel
    ParticipantsSection
    SharedMediaSection
    StructuredItemsSection
    ConversationSettingsSection
```

Boundary rule: app state and persistence adapters remain outside presentational components. UI components consume typed conversation/message/domain models and emit typed actions.

## 16. Screen/State Inventory

Screens:

- Chats root
- Conversation detail
- Conversation info/context
- Chat search results
- Conversation search results
- New chat flow placeholder
- Updates root placeholder
- Calls root placeholder
- Account/settings placeholder

Core UI states:

- Loading
- Ready
- Empty
- Searching
- Search empty
- Offline
- Syncing
- Failed
- Selection mode
- Reply mode
- Edit mode
- Attachment staged
- Voice recording
- Permission denied
- Conversation unavailable
- Unsupported message/object

State preservation requirements:

- Draft text per conversation
- Reply/edit mode per active composer
- Scroll position per conversation
- Search query and active result
- Selected message IDs
- Context panel open/closed preference by viewport class

## 17. Interaction Matrix

| Interaction         | Trigger                       | Surface      | Result                                   | Failure handling                          |
| ------------------- | ----------------------------- | ------------ | ---------------------------------------- | ----------------------------------------- |
| Open conversation   | Click/tap/list keyboard enter | Chat list    | Conversation route/pane opens            | Show load failure with retry              |
| New chat            | Header plus                   | Chats        | New chat flow                            | Permission/unavailable state              |
| Search chats        | Search field                  | Chats        | Filtered conversations/results           | Search unavailable state                  |
| Search conversation | Header search                 | Conversation | Search bar/results                       | No results/unavailable                    |
| Send text           | Composer send/Enter           | Composer     | Local message queued                     | Inline failed state with retry            |
| Reply               | Message menu/long press       | Message      | Composer reply mode                      | Missing source fallback                   |
| Edit                | Own message menu              | Message      | Composer edit mode                       | Structured error; message unchanged       |
| Delete              | Message menu                  | Message      | Confirm then tombstone/remove per policy | Structured error; message unchanged       |
| React               | Quick reaction/menu           | Message      | Reaction toggled                         | Structured error; previous state restored |
| Retry send          | Failed message button         | Message      | Outbox retries                           | Remains failed with reason                |
| Select messages     | Long press/menu/keyboard      | Message      | Selection toolbar                        | Escape/clear exits                        |
| Forward             | Selection/menu                | Message(s)   | Forward target flow                      | Unsupported items marked                  |
| Open attachment     | Tap/click                     | Message      | Preview/download                         | Failed/unavailable state                  |
| Open context        | Header info toggle            | Conversation | Panel/sheet opens                        | Details error inside surface              |
| Toggle theme        | Rail/account                  | Shell        | Theme updates                            | Falls back to current theme               |
| Navigate tabs       | Rail/bottom nav               | Shell        | Chats/Updates/Calls root                 | Preserve draft and active route state     |

## 18. Open Product Owner Decisions

1. Should the mobile bottom nav hide on conversation detail, or remain visible for fast tab switching?
2. Which conversation filters are required for first production release: All, Unread, Groups, People, Archived, Mentions, or Drafts?
3. What is the edit/delete policy window for messages, and do group admins have elevated delete rights?
4. Which structured objects are allowed in the first "Turn into..." release: event, poll, reminder, expense, decision, checklist, location?
5. Should read receipts be always visible, privacy-controlled, or conversation-specific?
6. What is the minimum viable global search scope before backend search exists?
7. Should archived and muted conversations be discoverable from default search?
8. How should unknown or revoked devices be surfaced in message info and safety UI?
9. What is the product stance on mobile voice-note recording: press-and-hold, tap-to-record, or both?
10. Which context panel sections are required at launch: participants, media, files, links, structured items, settings?
11. Should group calls be exposed in the conversation header before the calling stack is production-ready?
12. How should Live Objects signal stale data when offline or after protocol changes?

## Review Boundary

This pass defines product UX architecture only. It does not implement UI components, backend services, WebSocket transport, native database redesign, Live Objects workflows, AI surfaces, or future primary navigation.

SEY-006 UX Architecture Pass 01 ready for Human Review.
