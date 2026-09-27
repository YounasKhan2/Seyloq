# SEY-006 - Complete Product UX Architecture

Pass 03: Conversation Context, Plans & Spaces  
Base: SEY-006 Pass 01 and Pass 02

## 01. Organization Design Laws

Seyloq organizes conversation only when organization helps the conversation.

Core laws:

- Chat remains the canonical communication stream.
- Context, Plans, Spaces, and future Memories are organization levels, not separate applications.
- Primary navigation remains `Chats`, `Updates`, `Calls`.
- A chat-only user can ignore Context, Plans, and Spaces almost completely.
- Context is derived from conversation artifacts.
- Plans summarize related structured activity.
- Spaces are optional organized views over persistent shared state.
- Memories are future historical presentations, not part of this pass.
- No organizational layer should feel like project-management software.

Disallowed primary destinations:

- Spaces
- Plans
- Files
- Events
- Tasks
- Expenses
- Places
- Memories
- Calendar
- AI

Guiding principle:

> Structure should emerge because the conversation needs it, not because Seyloq wants users to organize their lives.

## 02. Chat to Context to Plan to Space Model

Organization model:

```text
Chat
  -> Context
  -> Plan
  -> Space
  -> Memory
```

Layer comparison:

| Layer   | Purpose                                         | Exists when                      | User effort         | Feels like             |
| ------- | ----------------------------------------------- | -------------------------------- | ------------------- | ---------------------- |
| Chat    | Communication                                   | Always                           | None                | Messenger              |
| Context | Find conversation information                   | Always available                 | Open info/context   | Conversation info      |
| Plan    | Summarize related structured activity           | When useful                      | Optional            | Organized summary      |
| Space   | Organize substantial persistent shared activity | Only after meaningful complexity | Explicit acceptance | Conversation-local hub |
| Memory  | Preserve historical completed activity          | Future phase                     | Optional            | Shared album/record    |

Boundary rules:

- Context is retrieval. It answers "what was shared here?"
- Plan is synthesis. It answers "what related activity are we coordinating?"
- Space is organization. It answers "what ongoing shared state matters enough to revisit?"
- Memory is history. It answers "what should we remember after this activity ends?"

## 03. Context Architecture

Conversation Context is the primary retrieval layer for information buried in chat.

Starting architecture:

```text
Conversation Info
  Identity / Participants

  Shared
    Media
    Files & Links

  Activity
    Events
    Lists
    Expenses
    Decisions
    Places
    Plans

  Settings
    Notifications
    Privacy / Safety
```

Context is:

- Summary
- Discovery
- Navigation
- Lightweight actions

Context is not:

- Dashboard
- Admin console
- Project sidebar
- Database browser

Context answers:

- Where was that PDF?
- What events do we have?
- What did we decide?
- Which places were shared?
- How much are the trip expenses?
- Where are the photos?

Empty categories disappear. Context should not mechanically show every object type.

## 04. Context Responsive Model

Context follows the Pass 01 shell model.

Desktop:

```text
Navigation Rail | Chat List | Conversation | Context Panel
```

Desktop rules:

- Context panel is optional and collapsible.
- Conversation remains primary.
- Context closes before chat readability is harmed.
- Context can show grouped summaries and source navigation.

Tablet:

- Use overlay, full-height sheet, or temporary panel depending on width.
- Do not permanently crush the conversation.
- Preserve scroll, draft, and active detail state when context opens/closes.

Mobile:

- Context starts from conversation info.
- Quick information uses bottom sheets.
- Deeper browsing uses pushed screens.
- Do not reproduce a desktop sidebar on mobile.

## 05. Participants Architecture

Conversation info header:

| Conversation | Header contents                                                                     |
| ------------ | ----------------------------------------------------------------------------------- |
| 1:1          | Avatar, name, username/identity if applicable, audio call, video call, search, mute |
| Group        | Group avatar, group name, participant count, audio/video entry, search, mute        |

Participant section supports:

- Participant list
- Role where meaningful
- Presence where permitted
- Search participant
- Add participant
- Remove or leave actions according to permissions

Rules:

- Avoid giant profile headers.
- Avoid enterprise role-management UX.
- Future safety/device identity work belongs to a later architecture gate.
- Participant actions must respect conversation permissions.

## 06. Media Architecture

Context includes a compact media browser.

Possible organization:

```text
Recent
Photos
Videos
```

or:

```text
Unified media grid
  Filter: All / Photos / Videos
```

Media item metadata:

- Thumbnail or preview
- Sender
- Date
- Type
- Source message

Supported actions:

- Preview
- Open
- Jump to message
- Select
- Save/share where platform permits

Rules:

- Context must not become a gallery application.
- Recent media appears before complete browsing.
- Missing thumbnails use safe placeholders.
- Source navigation is always preferred when available.

## 07. Files/Links Architecture

Files and links are retrieval-focused.

Files metadata:

- Name
- Type
- Size
- Sender
- Date
- Source message

Links metadata:

- Domain
- Title
- Preview
- Sender
- Date
- Source message

Actions:

- Open
- Copy link
- Save/share where platform permits
- Jump to source message

Rules:

- Sort recent first by default.
- Group by type only when volume justifies it.
- Link previews must degrade to domain and URL title when unavailable.
- Deleted source messages show "Source message unavailable" while preserving the artifact when policy allows.

## 08. Structured-State Aggregation

Context aggregates Live Objects from Pass 02 without creating permanent sections for every object type.

Avoid:

```text
Events
Polls
Checklists
Expenses
Decisions
Reminders
Locations
Live Locations
Plans
```

Preferred adaptive grouping:

```text
Shared
  Upcoming
    Football · Sunday
    Flight · May 12

  Lists
    Hunza Packing · 4/7

  Money
    Trip expenses · Rs 38,400

  Decisions
    Leave at 5:30 AM

  Places
    Serena Hotel
    Passu
```

Aggregation rules:

- Show only groups containing useful information.
- Active/upcoming items outrank completed/historical items.
- Similar object types can be grouped into human categories such as Upcoming, Lists, Money, Decisions, Places.
- Plans appear as summaries, not nested dashboards.
- Every aggregated item can jump to source or open detail.

## 09. Context Prioritization

Ranking principles:

```text
currently actionable
  -> upcoming
  -> recent
  -> completed/history
```

Examples:

- Active Live Location ranks highly while sharing.
- Tomorrow's Event ranks above an event from last year.
- Unpaid Expense ranks above settled Expense.
- Incomplete Checklist ranks above completed Checklist.
- Current Plan ranks above archived Plan.
- Recently updated Decision may rank above older Decisions briefly.

Keep ranking understandable. Avoid opaque algorithmic complexity in early implementation.

## 10. Context Source Navigation

Everything derived from conversation preserves provenance.

Navigation examples:

```text
File -> View message
Decision -> View source
Event -> View in conversation
Place -> View shared message
Plan item -> View source artifact
```

Rules:

- Context item opens the relevant message, object, or plan anchor.
- If source exists locally, scroll and highlight it.
- If source exists but is not loaded, load nearby history where possible.
- If source no longer exists, show "Source message unavailable".
- The artifact may remain available even when the source is unavailable, according to Pass 02 rules.

## 11. Plan Eligibility Model

Plan is a higher-level structured object summarizing useful shared state emerging from multiple related artifacts.

Plan is not:

- Project
- Board
- Workspace
- Folder
- Task database

Plan relevance uses qualitative signals, not a simplistic threshold.

Good signals:

- Multiple related structured artifacts.
- Shared subject/topic.
- Ongoing or upcoming activity.
- Clear benefit from summary.
- Repeated user return to the same related items.

Candidate example:

```text
Hunza Event
Hotel Location
Packing Checklist
Fuel Expense
Departure Decision
  -> possible Hunza Trip Plan
```

Counterexample:

```text
Birthday poll from January
Restaurant location from March
Random reminder from June
  -> not a Plan
```

Relationship matters more than count.

## 12. Plan Suggestion Model

Plan suggestions must be subtle.

Example:

```text
You've planned several parts of the Hunza trip.

[Organize trip] [Not now]
```

Rules:

- Never interrupt messaging.
- Dismissible.
- No repeated nagging.
- Explain why the suggestion appeared.
- No automatic conversion.
- User explicitly accepts.
- Deterministic grouping must be possible.
- Future AI may improve suggestions behind the same UX.

Suggestion states:

```text
candidate -> suggested -> accepted
                      -> dismissed
                      -> snoozed
```

## 13. Manual Plan Creation

Manual Plan creation starts from existing conversation material.

Entry paths:

```text
Context -> Select related items -> Organize as Plan
```

or:

```text
Select messages/objects -> Create Plan
```

Allowed sources:

- Messages
- Live Objects
- Places
- Media/files when relevant
- Decisions
- Existing smaller Plans only if product review approves

Avoid blank project-style forms:

```text
New Plan
Name:
Description:
Status:
Owner:
Project type:
...
```

Creation surface:

- Mobile: pushed focused flow for selection-heavy creation.
- Desktop: sheet/dialog with source selection and preview.

## 14. Plan Compact Representation

Compact conversation card:

```text
HUNZA TRIP
May 12-17 · 6 people

3 events · 7 places
Checklist 4/7
Rs 38,400 expenses

[Open plan]
```

Rules:

- Keep concise in message history.
- Show the plan's useful summary, not a dashboard.
- Compact card may appear where the Plan was accepted or created.
- Updates to Plan can update the card summary.
- Significant changes may create small activity rows, not repeated full cards.

## 15. Plan Expanded Architecture

Expanded Plan feels like an organized conversation summary.

Potential structure:

```text
Hunza Trip
May 12-17

Overview

Upcoming
  May 12 · Flight
  May 13 · Passu

Places
  Serena Hotel
  Attabad Lake

Checklist
  4 / 7

Expenses
  Rs 38,400

Decisions
  Leave airport at 5:30
```

Allowed sections:

- Overview
- Timeline/Upcoming
- Places
- Checklist
- Expenses
- Decisions
- Memories later

Avoid seven permanent product-style tabs unless density truly requires them. Prefer compact section navigation and hide empty sections.

## 16. Plan Membership

A Plan belongs to its conversation.

Default:

```text
Conversation membership -> Plan visibility
```

Rules:

- Do not create a separate Plan member system by default.
- Plan-specific participation may exist only when useful for an artifact, such as Event RSVP or Checklist assignee.
- Leaving a conversation removes access to Plan updates.
- Past contributions remain according to conversation privacy/deletion policy.

## 17. Plan Lifecycle

Plan lifecycle:

```text
not_applicable
  -> candidate
  -> suggested
  -> accepted
  -> active
  -> completed
  -> archived
```

Alternative:

```text
suggested -> dismissed
```

Lifecycle meanings:

| State          | Meaning                                                   |
| -------------- | --------------------------------------------------------- |
| Not applicable | Conversation has no related structured activity           |
| Candidate      | System can explain why a Plan may help                    |
| Suggested      | User sees optional suggestion                             |
| Accepted       | User chooses to create Plan                               |
| Active         | Plan is useful ongoing structure                          |
| Completed      | Activity outcome is finished                              |
| Archived       | Plan remains discoverable as history                      |
| Dismissed      | Suggestion suppressed unless conditions materially change |

Plan completion does not close the conversation.

## 18. Space Eligibility Model

A Plan does not automatically become a Space.

Space eligibility signals:

- Multiple Plans.
- Long-running shared activity.
- High structured-object density.
- Persistent recurring coordination.
- Significant shared media/memory.
- Users repeatedly return to structured state.
- Chat + Context + Plan becomes cumbersome.

Signals are not automatic thresholds. Space activation requires explicit user acceptance.

Non-eligible examples:

- A single poll.
- One short event.
- A few unrelated artifacts.
- Old completed activity that no one revisits.

## 19. Space Definition

A Space is:

> An optional organized view over a conversation's persistent shared state.

Conceptual model:

```text
Conversation
  Chat
  Space
    Overview
    Plans
    Shared state
    Memories
```

Rules:

- Conversation remains canonical communication stream.
- Space does not replace Chat.
- Space remains conversation-local.
- Space is not an independent project workspace.
- Space references existing artifacts instead of copying them.

## 20. Space Activation

Space must require explicit acceptance.

Suggestion example:

```text
Hunza Trip has several plans and shared items.

[Create Space] [Not now]
```

Context entry example:

```text
Organize this group
```

Rules:

- Do not silently transform a group.
- Do not automatically change global navigation.
- Do not ask users to choose "Create Group or Create Space?" at group creation.
- Create a normal group first; Space emerges later if useful.

Activation states:

```text
not_available -> eligible -> suggested -> activation -> active
                                      -> dismissed
```

## 21. Space Entry/Navigation Model

Space remains conversation-local.

Entry options:

| Model                      | Benefits                     | Risks                          |
| -------------------------- | ---------------------------- | ------------------------------ |
| Header switch `Chat        | Space`                       | Fast, clear after Space exists | Can make chat feel like a workspace |
| Header action `Open Space` | Less intrusive               | Slower switching               |
| Context entry row          | Preserves messenger identity | Less discoverable              |

Recommended initial direction:

- Before Space exists: context suggestion/action only.
- After Space exists: conversation header may show a compact `Space` action or `Chat | Space` switch if product review approves.
- Mobile should prefer `Open Space` pushed route before permanent segmented switching.

Space navigation should stay compact:

```text
Overview
Plans
Shared
Memories
```

Avoid:

- Dashboard
- Tasks
- Calendar
- Files
- Wiki
- Members
- Reports
- Analytics
- Automations

## 22. Space Overview

Overview summarizes useful current state.

Example:

```text
Hunza Trip
May 12-17 · 6 people

NEXT
Flight · May 12 · 7:30 AM

PLAN
4 / 7 packing items complete

PLACES
7 saved

EXPENSES
Rs 38,400
Rs 8,400 unsettled

DECISIONS
Leave for airport at 5:30 AM

RECENT
Hotel changed
Ali added Passu
```

Every section should answer:

> What do people in this conversation need to know or do?

This is not a metrics dashboard.

## 23. Space Shared State

Context and Space are distinct:

| Layer   | Question                                                      |
| ------- | ------------------------------------------------------------- |
| Context | What has been shared in this conversation?                    |
| Space   | What organized shared state matters to this ongoing activity? |

Example:

- Context may show all 37 locations ever shared.
- Space may show only 7 places included in the active trip.

Rules:

- Space selects meaningful artifacts.
- Context remains broader retrieval.
- Space sections should not duplicate every Context category.
- Every Space item retains source navigation and shared identity.

## 24. Multiple Plans

Space may contain multiple Plans.

Example:

```text
Wedding Group Space

Plans
  Venue
  Guest Travel
  Shopping
  Reception
```

Rules:

- Plans emerge from conversation artifacts.
- One level of Plan organization is enough initially.
- Do not introduce nested project hierarchies.
- Multiple Plans can exist before a Space, if the conversation benefits from them.
- A single artifact belonging to multiple Plans is an open PO decision.

Avoid:

```text
Space
  Project
    Folder
      Subproject
        Board
```

## 25. Live Object Integration

Space does not create a second copy of Live Objects.

Same object may appear in:

- Conversation history
- Context
- Plan
- Space
- Search

Identity rule:

> One conceptual object, multiple views.

Updating an Event in Space updates that Event everywhere. Removing an Event from a Plan or Space does not delete the Event from the conversation unless the user explicitly deletes the object and has permission.

## 26. Chat Activity Integration

Significant Space activity may surface in conversation.

Examples:

- Ali updated the trip dates.
- Ahmed added Serena Hotel to Hunza Trip.
- Packing checklist completed.
- Trip Space archived.

Usually silent:

- Checkbox toggled.
- Section reordered.
- Place moved between sections.
- Metadata refreshed.
- Preview generated.

Significance rules:

- Surface changes that alter shared understanding.
- Do not flood chat with every organizational action.
- Prefer grouped activity summaries for bursts.
- Preserve source links from activity rows.

## 27. Responsive Space Model

Mobile:

```text
Conversation -> Space -> Overview / selected section
```

- Pushed screens.
- No dense desktop dashboards.
- Clear back to conversation.

Tablet:

```text
Space section list | Content
```

when width allows; otherwise mobile-style navigation.

Desktop:

```text
Chat List | Conversation or Space | Context
```

- Space uses the primary content region.
- Do not create five-column layouts.
- Context may remain available if width allows.

## 28. Chat to Space Transition

Switching must feel effortless.

Requirements:

- Current chat draft preserved.
- Chat scroll preserved.
- Space state preserved.
- Switching is fast.
- Back behavior predictable.
- Mobile navigation understandable.

Potential states:

```text
chat_active -> opening_space -> space_active -> returning_to_chat -> chat_active
```

Recommended behavior:

- Desktop can support a compact switch or Space action in the conversation header.
- Mobile opens Space as a pushed route.
- Returning to Chat restores the previous message position and composer draft.

## 29. Completion/Archive Model

Space can become inactive without deleting the conversation.

Examples:

- Trip finished.
- Event ended.
- Wedding completed.
- Temporary coordination finished.

Potential state:

```text
active -> completed -> archived -> memory_ready
```

Terminology:

| Term     | Meaning                                                  |
| -------- | -------------------------------------------------------- |
| Complete | Activity has ended                                       |
| Archive  | Organized view becomes quieter but remains available     |
| Memory   | Future historical presentation of the completed activity |

Conversation may continue after Space activity ends.

## 30. Memories Compatibility

Pass 03 does not design Memories fully.

Architecture must support:

```text
Active Space
  -> Activity completes
  -> Useful structured state + media remain
  -> Memory
```

Future Memory example:

```text
Hunza Trip · May 2027

186 photos
14 videos
7 places
6 people

Trip plan
Expenses
Decisions
Highlights
```

Rules:

- Do not implement automatic highlight generation.
- Do not erase old organization.
- Completed Space becomes quieter.
- Context still exposes conversation artifacts.
- Chat remains available.

## 31. Search Compatibility

Context, Plans, and Spaces must be compatible with future Search.

Search result targets may include:

- Message
- File
- Media
- Live Object
- Plan
- Space
- Place
- Decision

Opening a result should preserve conversational context:

```text
Search result -> Conversation -> Artifact anchor/detail
```

Do not design search engine or backend indexing in this pass.

## 32. Permission Model

Start with conversation permissions.

Conceptual roles:

- Conversation member
- Group admin/moderator
- Plan creator
- Space organizer

Default permission direction:

| Action                 | Default direction                                     |
| ---------------------- | ----------------------------------------------------- |
| Open Context           | Conversation members                                  |
| Create Plan            | Conversation members or admins, PO decision           |
| Edit Plan organization | Plan creator/admin/shared policy                      |
| Activate Space         | Group admin or explicit group acceptance, PO decision |
| Reorganize Space       | Space organizer/admin/shared policy                   |
| Archive Space          | Space organizer/admin                                 |
| View historical Space  | Members with conversation access                      |

Organizer leaves:

- Space remains.
- Admin/moderator or shared policy takes ownership.
- If no eligible organizer remains, Space becomes read-mostly until reassigned.

Avoid enterprise RBAC.

## 33. Offline/Concurrency UX

Offline user-facing states:

- Available offline
- Updating
- Changes will sync
- May be out of date
- Couldn't update

Rules:

- Context works from locally available information.
- Plans and Spaces remain useful offline when cached.
- Offline Plan/Space changes use same mutation/reconciliation architecture as Live Objects.
- Do not expose server sequence, outbox, ACK, CRDT, or protocol terms.

Concurrent examples:

| Scenario                                       | UX expectation                                             |
| ---------------------------------------------- | ---------------------------------------------------------- |
| Ahmed adds Event to Plan while Ali removes it  | Preserve intent where possible; show review if conflicting |
| Younas reorganizes Space while Ahmed adds Plan | Merge independent changes                                  |
| Space archived while user edits overview       | Explain state changed; preserve user's text if possible    |
| Artifact deleted while Plan references it      | Show unavailable reference and allow removal               |

Never silently destroy meaningful organization.

## 34. Notification Model

Do not notify users about organizational noise.

High-value notifications:

- Trip dates changed.
- Plan cancelled.
- Space archived.
- User assigned to important shared item.
- Major shared expense/status changed.

Usually silent:

- Plan section reordered.
- Place moved between sections.
- Object metadata refreshed.
- Context category updated.
- Space overview recalculated.

Notification policy:

- Notify affected users, not necessarily all conversation members.
- Prefer chat activity rows for low-stakes updates.
- Group bursts into summaries.
- Notification infrastructure is out of scope.

## 35. Accessibility

Context, Plans, and Spaces must support:

- Keyboard navigation.
- Screen readers.
- Semantic headings.
- Visible focus.
- Text scaling.
- Touch targets.
- Reduced motion.
- Predictable back navigation.

Rules:

- Do not rely only on drag-and-drop.
- Every reorder interaction needs an accessible alternative.
- Space section navigation uses appropriate navigation/tab semantics depending on final behavior.
- Source navigation buttons have explicit labels.
- Context sections use meaningful headings and counts.
- Empty hidden sections should not create confusing screen reader noise.

## 36. Component Hierarchy

Reusable components:

```text
ConversationContext
  ContextHeader
  ContextSection
  ContextItem
  ContextSharedSummary
  ContextSourceAction

PlanCard
  PlanSummary
  PlanSection
  PlanItem
  PlanSuggestion
  PlanCreationFlow

SpaceEntry
  SpaceShell
  SpaceHeader
  SpaceSectionNavigation
  SpaceOverview
  SpaceSection
  SpaceActivitySummary
  SpaceCompletionState

SourceAnchor
SharedArtifactReference
```

Rules:

- Do not duplicate Live Object components from Pass 02.
- Plans and Spaces reference Live Objects.
- Context item rows are summaries, not full object renderers.
- Shared artifact references carry source navigation and identity.

## 37. Data/View Relationship

Conceptual identity:

```text
Conversation
  Messages
  Live Objects
  Media / Files / Links
  Plans
    references existing artifacts
  Space
    references Plans
    references existing artifacts
```

Critical law:

> Plan and Space organize shared artifacts; they do not create unnecessary copies of them.

View relationship:

| View    | Data relationship                                   |
| ------- | --------------------------------------------------- |
| Chat    | Canonical chronological stream                      |
| Context | Derived retrieval index over conversation artifacts |
| Plan    | Curated references to related artifacts             |
| Space   | Organized view over Plans and selected artifacts    |
| Search  | Query view resolving back to conversation context   |

## 38. State Machines

Context:

```text
closed
  -> loading
  -> ready
  -> filtered
  -> error
  -> closed
```

Plan:

```text
not_applicable
  -> candidate
  -> suggested
      -> accepted
      -> dismissed
  -> active
  -> completed
  -> archived
```

Space:

```text
not_available
  -> eligible
  -> suggested
      -> activation
      -> dismissed
  -> active
  -> completed
  -> archived
  -> memory_ready
```

Chat to Space:

```text
chat_active
  -> opening_space
  -> space_active
  -> returning_to_chat
  -> chat_active
```

State preservation:

- Chat draft.
- Chat scroll.
- Active conversation.
- Active Space section.
- Context filter.
- Plan expanded section.

## 39. Interaction Matrix

| Interaction               | Trigger             | Surface                   | Result                   | Durable effect        | Failure            | Offline behavior  | Mobile             | Desktop                   | Permission            |
| ------------------------- | ------------------- | ------------------------- | ------------------------ | --------------------- | ------------------ | ----------------- | ------------------ | ------------------------- | --------------------- |
| Open Context              | Header info         | Panel/sheet/screen        | Context visible          | None                  | Error state        | Cached context    | Sheet/pushed       | Right panel               | Member                |
| Open source artifact      | Context/item action | Context/Plan/Space        | Scroll/open anchor       | None                  | Source unavailable | Use cached source | Pushed/detail      | Highlight in conversation | Member                |
| Create Plan               | Select items        | Context or selection flow | Plan draft               | Plan created          | Draft retained     | Queue create      | Pushed flow        | Dialog/sheet              | Member/admin decision |
| Accept Plan suggestion    | Suggestion CTA      | Chat/Context              | Plan created             | Plan active           | Suggestion remains | Queue create      | Inline/sheet       | Inline/dialog             | Member/admin decision |
| Dismiss Plan suggestion   | Suggestion CTA      | Chat/Context              | Suggestion hidden        | Dismissal stored      | Can retry          | Store locally     | Inline             | Inline                    | Member                |
| Add artifact to Plan      | Object action       | Detail/Context            | Artifact appears in Plan | Reference added       | Restore/explain    | Queue mutation    | Sheet/detail       | Menu/panel                | Plan editor           |
| Remove artifact from Plan | Plan item action    | Plan detail               | Item removed from Plan   | Reference removed     | Restore/explain    | Queue mutation    | Sheet/detail       | Menu/panel                | Plan editor           |
| Complete Plan             | Plan action         | Plan detail               | Completed state          | Lifecycle completed   | Restore/explain    | Queue mutation    | Confirm sheet      | Confirm dialog            | Plan editor/admin     |
| Archive Plan              | Plan action         | Plan detail               | Plan quieter             | Archived              | Restore/explain    | Queue mutation    | Confirm sheet      | Confirm dialog            | Plan editor/admin     |
| Activate Space            | Suggestion/context  | Context/Plan              | Activation flow          | Space active          | Suggestion remains | Queue if safe     | Pushed flow        | Dialog/sheet              | Admin/PO decision     |
| Dismiss Space suggestion  | Suggestion CTA      | Context                   | Suggestion hidden        | Dismissal stored      | Can retry          | Store locally     | Inline             | Inline                    | Member/admin          |
| Open Space                | Header/context      | Conversation-local entry  | Space opens              | None                  | Error state        | Cached Space      | Pushed route       | Primary pane              | Member                |
| Return to Chat            | Back/header         | Space                     | Chat restored            | None                  | None               | Works offline     | Back action        | Header switch/action      | Member                |
| Add Plan to Space         | Space action        | Space detail              | Plan listed              | Reference added       | Restore/explain    | Queue mutation    | Sheet/detail       | Panel/dialog              | Space organizer       |
| Reorganize Space          | Reorder/action      | Space detail              | Order/sections update    | Organization mutation | Conflict/review    | Queue mutation    | Accessible reorder | Drag + accessible reorder | Space organizer       |
| Complete Space            | Space action        | Space detail              | Completed state          | Lifecycle completed   | Restore/explain    | Queue mutation    | Confirm sheet      | Confirm dialog            | Space organizer/admin |
| Archive Space             | Space action        | Space detail              | Space quieter            | Archived              | Restore/explain    | Queue mutation    | Confirm sheet      | Confirm dialog            | Space organizer/admin |
| Open historical Space     | Context/memory link | Context                   | Historical Space opens   | None                  | Unavailable        | Cached summary    | Pushed screen      | Primary pane              | Member                |

## 40. Screen/Surface Inventory

New screens:

- Mobile Context pushed screen.
- Mobile Plan detail screen.
- Mobile Plan creation flow.
- Mobile Space pushed route.
- Mobile historical Space screen.

Panels:

- Desktop Context panel.
- Desktop Space in primary content region.
- Tablet temporary Context panel.

Sheets:

- Context quick info sheet.
- Plan suggestion sheet.
- Plan creation sheet.
- Add to Plan sheet.
- Space activation sheet.
- Space completion/archive sheet.

Dialogs:

- Desktop Plan creation dialog.
- Desktop Space activation dialog.
- Confirm archive/complete dialog.
- Conflict review dialog.

Popovers/menus:

- Context filter popover.
- Plan item menu.
- Space section menu.
- Source artifact action menu.

Inline expansions:

- Plan suggestion.
- Space suggestion.
- Context group expansion.
- Plan compact card expansion.

States:

- Loading.
- Empty.
- Filtered.
- Error.
- Offline.
- May be out of date.
- Source unavailable.
- No useful shared state yet.
- Completed/archived.
- Permission denied.

## 41. Backend/Protocol Requirements

Future architecture must define:

- Plan identity.
- Space identity.
- Artifact reference model.
- Membership inheritance.
- Organization mutations.
- Idempotency for Plan/Space mutations.
- Versioning.
- Offline reconciliation.
- Permissions.
- Significant-change event taxonomy.
- Archive/completion state.
- Search indexing targets.
- Source anchor resolution.
- Plan suggestion inputs.
- Space eligibility inputs.
- Historical Space/Memory transition.
- Conflict semantics for organization changes.
- Notification event classification.

These are discovered requirements only. No implementation is part of Pass 03.

## 42. Open Product Owner Decisions

1. Can Plans exist in 1:1 conversations?
2. Can Spaces exist in 1:1 conversations?
3. Who may create a Plan?
4. Who may activate a Space?
5. Does activating Space require group-admin approval?
6. Should Space be represented by `Chat | Space` switching or contextual `Open Space` action?
7. What minimum signals make a Space eligible?
8. Should Seyloq ever automatically suggest Space?
9. Can multiple Plans exist without Space?
10. Can one artifact belong to multiple Plans?
11. Can one conversation have multiple Spaces?
12. Who can reorganize Space?
13. What happens when Space organizer leaves?
14. What does completing Space mean?
15. Is Archive different from Memory?
16. Which organizational changes create chat activity rows?
17. Which organizational changes generate notifications?
18. Which Context categories should exist at launch?
19. How much Context information should be cached offline?
20. When should completed Space become a Memory?
21. Should Context filters launch with All/Media/Files/Shared or remain section-only?
22. Should Plan suggestions appear in chat, Context, or both?
23. Should Space suggestions appear only in Context to avoid cluttering chat?
24. Can users manually hide Context groups they do not care about?
25. How much Plan/Space organization can non-admin members change?

## Human Review Boundary

This pass defines Conversation Context, Plans, Spaces, and Memory compatibility architecture only. It does not implement UI, production components, backend services, Plan/Space persistence, realtime, search backend, AI, Memories, maps, payments, notifications, Pass 01 redesign, Pass 02 redesign, global navigation changes, Calls, Updates, or Pass 04.

SEY-006 UX Architecture Pass 03 - Conversation Context, Plans & Spaces ready for Human Review.
