# SEY-006 - Complete Product UX Architecture

Pass 02: Live Objects & Turn Into  
Base: SEY-006 UX Architecture Pass 01

## 01. Live Object Design Laws

Live Objects are structured conversation artifacts. They let useful shared state emerge from chat without making Seyloq feel like a productivity suite.

Product laws:

- Live Objects belong to conversations first.
- Live Objects do not create new primary navigation destinations.
- Live Objects use one shared visual and interaction grammar.
- Live Objects remain compact in the message stream and richer only on demand.
- Live Objects are stateful, but the UI must describe human outcomes instead of database concepts.
- Live Objects preserve conversation memory; they do not erase the messages that created them.
- Live Objects must work under local-first, offline, stale, and unsupported conditions.
- Live Objects must degrade safely when the client does not understand a newer object type or version.

Primary navigation remains frozen:

- Chats
- Updates
- Calls

Disallowed primary destinations:

- Tasks
- Events
- Expenses
- Plans
- Polls
- Objects
- Calendar
- Spaces

Initial first-class types:

- Poll
- Event
- Checklist
- Expense
- Decision
- Reminder
- Static Location
- Live Location
- Plan

`Plan` is not a basic form. It is a higher-level summary of useful shared state that has emerged from multiple related conversation artifacts.

## 02. Shared Card Grammar

All Live Objects share one recognizable card grammar:

```text
LiveObjectCard
  LiveObjectHeader
    Type / icon
    Title
    Lifecycle state
    Overflow
  LiveObjectBody
    Type-specific content
  OptionalVisual
  LiveObjectSummary / Progress
  LiveObjectFooter
    Participants / context
    Contextual actions
```

Shared card zones:

| Zone             | Purpose                                   | Required behavior                                               |
| ---------------- | ----------------------------------------- | --------------------------------------------------------------- |
| Header           | Identify object type, title, lifecycle    | Always visible                                                  |
| Body             | Show the useful type-specific state       | Visible in compact and expanded forms, with density differences |
| Visual           | Map, media, chart, or preview when useful | Optional; must not dominate chat                                |
| Summary/progress | Human-readable state                      | Always understandable without color                             |
| Footer           | Participants and actions                  | Contextual; avoids crowded action bars                          |
| Overflow         | Secondary actions                         | Consistent menu placement                                       |

Shared lifecycle labels:

- Active
- Completed
- Cancelled
- Expired

Shared sync labels are separate:

- Fresh
- Locally modified
- Syncing
- Stale
- Failed
- Unavailable

Never conflate lifecycle state with synchronization state. A completed checklist can still be syncing. A stale event can still be active.

## 03. Lifecycle Model

Generic lifecycle:

```text
draft
  -> active
      -> completed
      -> cancelled
      -> expired
      -> archived
```

Lifecycle meanings:

| State     | User meaning                            | Examples                                |
| --------- | --------------------------------------- | --------------------------------------- |
| Draft     | Not yet posted to conversation          | Creation sheet before confirm           |
| Active    | Still useful/actionable                 | Open poll, upcoming event, active split |
| Completed | Outcome reached                         | Checklist complete, decision accepted   |
| Cancelled | Intentionally stopped before outcome    | Cancelled event                         |
| Expired   | Time window passed                      | Past event, expired live location       |
| Archived  | Kept for memory but no longer prominent | Settled expense, old plan               |

Object-specific lifecycle mapping:

| Object          | Completed means                                   | Cancelled means                | Expired means                      |
| --------------- | ------------------------------------------------- | ------------------------------ | ---------------------------------- |
| Poll            | Closed with results                               | Withdrawn by creator/moderator | Close time passed                  |
| Event           | Event happened or manually marked done            | Event cancelled                | Start/end time passed              |
| Checklist       | All required items complete or manually completed | List abandoned                 | Optional due window passed         |
| Expense         | Settled/archived                                  | Split abandoned                | Optional due window passed         |
| Decision        | Agreed or recorded                                | Withdrawn                      | Superseded by later decision       |
| Reminder        | Done/dismissed                                    | Cancelled before due           | Due time passed without completion |
| Static Location | No natural completed state                        | Removed                        | Not usually applicable             |
| Live Location   | Sharing ended normally                            | User stopped sharing           | Duration ended                     |
| Plan            | Trip/activity completed or archived               | Plan abandoned                 | Date range passed                  |

## 04. Synchronization/Stale Model

Synchronization runs independently from lifecycle:

```text
fresh
  -> locally_modified
  -> queued
  -> syncing
      -> fresh
      -> failed
      -> stale
      -> conflicted
      -> unavailable
```

User-facing translation:

| Technical sync state | User-facing copy      | UI pattern                                  |
| -------------------- | --------------------- | ------------------------------------------- |
| fresh                | Up to date            | Usually hidden                              |
| locally_modified     | Saved on this device  | Subtle inline marker                        |
| queued               | Will sync when online | Offline badge/queued row                    |
| syncing              | Updating              | Small spinner or "Updating..."              |
| failed               | Couldn't update       | Retry affordance                            |
| stale                | May be out of date    | Refresh/update prompt                       |
| conflicted           | Needs review          | Conflict sheet only for meaningful conflict |
| unavailable          | Not available         | Safe fallback summary                       |

Principles:

- Optimistic changes are visible immediately after local validation.
- Local mutations must persist before being shown as durable local state.
- Reconciliation updates the object without erasing important local intent.
- Conflict UI appears only when the user must decide.
- Protocol terminology such as ACK, outbox, version vector, or server sequence is hidden from product UI.

## 05. Creation Architecture

Live Objects can originate from four entry families:

| Entry                 | Best for                                     | Surface                                             |
| --------------------- | -------------------------------------------- | --------------------------------------------------- |
| Composer `+`          | Intentional creation before a message exists | Menu plus sheet/dialog                              |
| Turn Into             | Structure extracted from existing message(s) | Message action menu plus prefilled creation surface |
| Contextual suggestion | Low-friction optional extraction             | Inline suggestion chip near message                 |
| Object expansion      | Follow-up object from existing object        | Contextual action inside object detail              |

Direct composer `+` candidates:

- Poll
- Event
- Checklist
- Expense
- Static Location
- Live Location
- Reminder

Usually not direct composer candidates:

- Decision, because it is most valuable when preserving an existing conclusion.
- Plan, because it should emerge from multiple related artifacts or explicit context summary.

Composer `+` menu target:

```text
+ Photo / Video
  Camera
  File
  Location
  Contact
  ---
  Poll
  Event
  Checklist
  Expense
  Reminder
  Live Location
```

Creation surfaces:

| Complexity   | Mobile                                | Desktop                       |
| ------------ | ------------------------------------- | ----------------------------- |
| Very small   | Bottom sheet                          | Popover                       |
| Medium       | Bottom sheet or pushed focused screen | Sheet/dialog                  |
| Complex      | Pushed focused screen                 | Dialog or context panel       |
| Requires map | Pushed map surface                    | Dialog/panel with map preview |

Avoid giant universal forms. Shared primitives are allowed; one generic schema-form engine is not justified at this stage.

## 06. Turn Into Architecture

Turn Into flow:

```text
Source message
  -> Turn into...
  -> Candidate object types
  -> Prefilled creation surface
  -> User confirms/edits
  -> Live Object appears in conversation
  -> Source message receives linked state
```

Candidate ranking:

| Source pattern                     | Suggested candidates |
| ---------------------------------- | -------------------- |
| Question with options              | Poll                 |
| Date/time/place                    | Event, Reminder      |
| Commitment/conclusion              | Decision             |
| List-like message                  | Checklist            |
| Money/split language               | Expense              |
| Place/address                      | Static Location      |
| Multiple related objects in thread | Plan-related item    |

Message-object relationship:

- Source message and created object remain separate durable artifacts.
- Creating an object must not replace or delete the source message.
- The new object appears near the source message, normally directly after it.
- The source message may show subtle linked text such as "Created event" or "Created decision".
- The object can navigate back to its source message.
- Deleting the source message does not delete the object.
- Deleting the object does not delete the source message.
- If the source becomes unavailable, the object shows "Source message unavailable" in details.

Turn Into surfaces:

| Step         | Mobile                            | Desktop                                |
| ------------ | --------------------------------- | -------------------------------------- |
| Open actions | Long press sheet                  | Hover menu, right-click, keyboard menu |
| Choose type  | Nested sheet or picker            | Menu submenu or popover                |
| Confirm/edit | Bottom sheet or pushed screen     | Popover, sheet, or dialog              |
| Result       | Object card inserted into history | Object card inserted into history      |

## 07. Poll Architecture

Poll payload:

- Question
- Options
- Multiple answers allowed
- Anonymous/non-anonymous, if supported
- Close time, optional
- Creator controls

Compact card:

```text
POLL
Where should we eat?

○ Burns Road      5
○ Boat Basin      3
○ DHA             2

10 votes
```

Interactions:

| Interaction        | Behavior                                                      |
| ------------------ | ------------------------------------------------------------- |
| Vote               | Selecting an option queues an optimistic vote                 |
| Change vote        | Allowed while poll is active unless locked by product policy  |
| Multiple selection | Uses checkboxes and explicit Submit/Update vote               |
| Result visibility  | Immediate by default; anonymous only hides voter identity     |
| Voter details      | Expanded surface only                                         |
| Close poll         | Creator/moderator action                                      |
| Offline vote       | Shows "Vote will sync" and can be changed locally before sync |
| Stale count        | Shows "Results may be out of date"                            |

Poll states:

```text
draft -> active -> closed
                -> cancelled
                -> expired
```

Accessibility:

- Single-choice poll options behave like radio controls.
- Multi-choice poll options behave like checkboxes.
- Vote counts are text, not chart-only.
- Selection state is announced.

## 08. Event Architecture

Event payload:

- Title
- Date
- Time
- Timezone
- Optional end time
- Location
- Description
- Participants
- RSVP
- Reminder

Compact card:

```text
EVENT
Football
Sun · 6:00 PM
DHA Sports Club

Going 5 · Maybe 2
[Going] [Maybe] [Can't]
```

RSVP states:

- Going
- Maybe
- Can't
- No response

Event interactions:

| Interaction           | Behavior                                                       |
| --------------------- | -------------------------------------------------------------- |
| RSVP                  | Optimistic participant state update                            |
| Update event          | Shows "Updated by..." and highlights changed fields            |
| Cancel event          | Lifecycle becomes Cancelled; history preserved                 |
| Reminder              | Creates personal reminder unless shared reminders are approved |
| Open location         | Uses map surface or external map                               |
| View participants     | Expanded surface                                               |
| Changed time/location | Compact card shows changed marker until viewed                 |
| Past event            | Becomes expired/past; RSVP actions quiet or hidden             |
| Offline RSVP          | Shows queued local RSVP                                        |

Timezone behavior:

- Store and display timezone explicitly when it matters across regions.
- Local display may show user's local time with event timezone detail in expanded view.
- Ambiguous date/time extracted from messages must be confirmed before creation.

Avoid calendar-app behavior: no full calendar grid, recurrence editor, or availability scheduler in this pass.

## 09. Checklist Architecture

Checklist payload:

- Title
- Items
- Item completion state
- Optional assignee
- Optional due hint
- Item order

Compact card:

```text
CHECKLIST
Hunza Packing

✓ Tent
✓ Power bank
○ Medicine
○ Jackets

2 of 4 complete
```

Interactions:

| Interaction        | Behavior                                                 |
| ------------------ | -------------------------------------------------------- |
| Add item           | Expanded surface; compact quick add only if space allows |
| Complete item      | Safe direct compact interaction                          |
| Reopen item        | Same control toggles back, with transparency if remote   |
| Assign item        | Expanded surface only unless required at launch          |
| Reorder            | Expanded surface                                         |
| Delete/edit item   | Expanded item menu                                       |
| Complete checklist | Manual or automatic when all required items done         |

Concurrent behavior:

- Two people checking the same item is naturally safe and should merge.
- Item text edits that collide may show latest authoritative state plus "Your edit could not be applied" when necessary.
- Removed items should not silently swallow a user's attempted change.

Disallowed concepts:

- Sprints
- Kanban
- Dependencies
- Story points

## 10. Expense Architecture

Expense payload:

- Title
- Total
- Currency
- Payer
- Participants
- Equal split
- Custom split
- Paid/unpaid state
- Notes
- Optional receipt later
- Optional payment link later

Compact card:

```text
EXPENSE
Ground booking
Rs 6,000

Rs 1,200 each
3 marked paid · 2 pending

[View split]
```

Language rules:

- Use "Marked paid" or "Marked settled".
- Do not say "Payment completed by Seyloq" unless Seyloq processes payment in a future architecture.
- Do not imply wallet, escrow, banking, or transfer infrastructure.

Interactions:

| Interaction       | Behavior                                   |
| ----------------- | ------------------------------------------ |
| View split        | Opens expanded participant split           |
| Mark self paid    | Direct action where permitted              |
| Mark another paid | Requires product owner decision            |
| Edit total/split  | Creator/moderator action with transparency |
| Custom split      | Expanded editor                            |
| Archive/settle    | Marks lifecycle completed/archived         |

Offline:

- Mark-paid can be optimistic and queued.
- Editing total while others mark paid may require refresh or conflict explanation.

## 11. Decision Architecture

Decision is intentionally lightweight. It captures important conclusions before they vanish in chat.

Decision payload:

- Decision text
- Source message link, optional but preferred
- Agreed/acknowledged participants, optional
- Superseded-by relationship, optional

Compact card:

```text
DECIDED
Leave at 5:30 AM

Agreed by 4 people
```

Interactions:

| Interaction         | Behavior                                   |
| ------------------- | ------------------------------------------ |
| Create from message | Best path; preserves source                |
| Create manually     | Allowed from composer only if approved     |
| Acknowledge         | Lightweight "I agree/acknowledged"         |
| Edit                | Shows updated marker                       |
| Supersede           | Links to newer decision                    |
| Reopen              | Returns to active if product policy allows |
| View source         | Jumps to source message                    |

Decision is not approval workflow software. No mandatory multi-step approvals, signatures, or enterprise audit UI.

## 12. Reminder Architecture

Reminder is personal by default.

Reminder payload:

- Title/body
- Time
- Source message or object link
- Audience: me or everyone where permitted
- Completion/dismissal state
- Optional snooze

Compact representation:

```text
REMINDER
Bring passport

Tomorrow · 8:00 PM
```

Rules:

- "Remind me" is the default.
- "Remind everyone" appears only where conversation permissions allow it.
- Reminder creation must be extremely fast.
- Recurrence is out unless product review justifies it.
- Notification permission unavailable state must be explicit.

States:

```text
draft -> scheduled -> due -> completed
                  -> snoozed
                  -> cancelled
                  -> expired
```

## 13. Location Architecture

Static Location is a durable place reference.

Payload:

- Place name
- Coordinates or provider place id
- Optional address
- Optional distance
- Source message link
- Preview availability

Creation paths:

- Current location
- Search place
- Dropped pin
- Turn Into from address/place text

Compact card:

```text
LOCATION
DHA Sports Club
4.2 km away

[Open map]
```

Privacy:

- Sending current location must be explicit.
- The UI must distinguish current location from searched/dropped locations.
- Unavailable map preview falls back to text and Open map action where possible.
- Provider details remain behind a platform/maps adapter.

## 14. Live Location Architecture

Live Location is privacy-sensitive and distinct from Static Location.

Payload:

- Sharer
- Duration
- Audience
- Last update time
- Approximate ETA/distance when available
- Active/stopped/expired state

Required lifecycle:

```text
draft -> active -> expiring -> stopped
                 -> expired
                 -> unavailable
```

Compact card:

```text
LIVE LOCATION
Younas

8 min away
Sharing for 42 more min

[View map] [Stop sharing]
```

Rules:

- Sharing always has an explicit duration.
- Indefinite passive tracking is not allowed.
- Stop sharing must be easy to find on compact and expanded surfaces.
- Location unavailable is distinct from stopped sharing.
- The sharer sees stronger controls than viewers.

Smart Meet Up compatibility:

- Live Location should later support meeting point, multiple participants, ETA, arrived, unavailable, and temporary room concepts.
- Pass 02 does not design Smart Meet Up as a full feature.

## 15. Plan Architecture

Plan is a higher-level structured object. It answers:

> What useful shared state has emerged from this conversation?

It must not turn a group into project management.

Plan may emerge when a conversation accumulates related:

- Events
- Places
- Checklists
- Expenses
- Decisions
- Participants

Compact card:

```text
HUNZA TRIP
May 12-17
6 people

3 events
7 places
4/7 checklist
Rs 38,400 expenses
2 decisions
```

Creation:

| Path            | Behavior                                                      |
| --------------- | ------------------------------------------------------------- |
| Suggested       | Appears after enough related artifacts exist                  |
| User-created    | Starts from selected messages/objects, not blank project form |
| Context-created | From conversation context summary                             |

Expanded representation:

- Summary
- Timeline/events
- Places
- Active checklists
- Expenses summary
- Decisions
- Recent updates

Relationship to future Space:

- Plan can become one input into a future Space.
- Space is not designed in Pass 02.
- A Plan qualifies for Space only after product review decides thresholds and user benefit.

Completion/archive:

- A Plan can be completed/archived after date range passes or user action.
- Completed plans remain durable conversation memory.

## 16. Compact/Expanded Behavior

Every Live Object has at least:

```text
Compact conversation card
  -> Expanded interaction surface
```

Optional:

```text
Context summary row
```

Compact direct actions:

| Object          | Safe compact actions                  | Expanded-only actions                   |
| --------------- | ------------------------------------- | --------------------------------------- |
| Poll            | Vote, view top results                | Voters, settings, close                 |
| Event           | RSVP, open location                   | Edit time/location, participant details |
| Checklist       | Toggle visible item                   | Add/reorder/assign/edit items           |
| Expense         | View split, mark self paid if allowed | Edit split, mark others paid            |
| Decision        | Acknowledge, view source              | Supersede/edit                          |
| Reminder        | Complete/dismiss personal reminder    | Change time/audience                    |
| Static Location | Open map                              | Edit/search alternate place             |
| Live Location   | View map, stop own sharing            | Audience/duration detail                |
| Plan            | Open summary                          | Manage included objects                 |

Expanded surfaces must preserve message context and provide a clear path back to the source conversation.

## 17. Context Integration

Conversation Context includes Live Objects without creating eight permanent tabs.

Recommended organization:

```text
Conversation Info
  Participants
  Media
  Files & Links
  Shared
    Upcoming Events
    Active Lists
    Expenses
    Decisions
    Places
    Plans
```

Aggregation rules:

- Show active/upcoming items first.
- Completed/expired items collapse under history or "Past".
- Limit each group to a compact preview with "View all" only when needed.
- If only one type exists, avoid empty categories for other types.
- Context sections should summarize; full editing belongs to object detail surfaces.

Context row contract:

- Type icon
- Title
- One-line summary
- Lifecycle state
- Sync warning if needed
- Jump to conversation anchor

## 18. Discovery/Search Model

Object discovery paths:

- Conversation context
- Conversation search
- Future global search
- Future Plan/Space summary

Searchable metadata:

| Object          | Metadata                                            |
| --------------- | --------------------------------------------------- |
| Poll            | Question, options, voters if permitted, status      |
| Event           | Title, date, time, place, participants, status      |
| Checklist       | Title, item text, assignees, completion             |
| Expense         | Title, notes, payer, participants, amount, currency |
| Decision        | Decision text, source message, participants         |
| Reminder        | Text, due time, source                              |
| Static Location | Place name, address, source                         |
| Live Location   | Sharer, meeting label, status, source               |
| Plan            | Title, date range, included objects, participants   |

Search result behavior:

- Selecting an object result opens the conversation at the object anchor.
- Expanded details can open from the anchored object.
- Unsupported objects show a safe summary result.

Backend search is out of scope.

## 19. Notification Model

Notification priority:

| Notification                | Default priority                                    |
| --------------------------- | --------------------------------------------------- |
| Personal reminder due       | High-value notification                             |
| Event reminder              | High-value notification                             |
| Live location expiring      | High-value notification for sharer                  |
| Event changed               | High-value if user RSVP'd; otherwise silent update  |
| Poll closed                 | Silent conversation update unless user participated |
| Checklist assigned          | High-value if assigned; otherwise silent            |
| Checklist item completed    | Silent conversation update                          |
| Expense marked paid         | High-value for payer/creator; silent for others     |
| Decision updated/superseded | High-value if user acknowledged; otherwise silent   |
| Object sync failed          | Local user notification or inline warning           |

Rules:

- Avoid repeated suggestion or reminder spam.
- Prefer silent conversation updates for low-stakes changes.
- Notify only affected users where possible.
- Notification infrastructure is out of scope.

## 20. Permission Model

Live Objects inherit conversation membership.

Conceptual roles:

- Creator
- Participant/member
- Group admin/moderator where relevant

Default permission direction:

| Action                            | Default                                                        |
| --------------------------------- | -------------------------------------------------------------- |
| View object                       | Conversation members                                           |
| Interact with own contribution    | Conversation members                                           |
| Edit core object fields           | Creator, group admin/moderator, or explicit shared-edit policy |
| Delete object                     | Creator/admin, with confirmation                               |
| Cancel object                     | Creator/admin                                                  |
| Close poll                        | Creator/admin                                                  |
| Mark self paid                    | Participant                                                    |
| Mark another paid                 | Open product decision                                          |
| Stop own live location            | Sharer always                                                  |
| Stop another user's live location | Not allowed except safety/moderation policy                    |

Creator leaves:

- Object remains in conversation memory.
- Admin/moderator or shared policy decides future edit authority.

Member leaves:

- Their past contributions remain unless privacy/deletion policy says otherwise.
- They lose access to future updates.

No enterprise RBAC in this pass.

## 21. Edit/Transparency Model

Shared object changes need enough transparency to prevent confusion.

Show compact transparency when:

- Event time changed
- Event location changed
- Expense total changed
- Checklist item removed
- Decision updated or superseded
- Live location stopped
- Poll closed

Transparency levels:

| Level          | Surface                          | Use                          |
| -------------- | -------------------------------- | ---------------------------- |
| Inline label   | "Updated" / "Edited"             | Small non-critical edits     |
| Actor label    | "Updated by Ahmed"               | Important shared-state edits |
| Change summary | "Time changed from 5:30 to 6:00" | Important field changes      |
| View changes   | Expanded detail                  | Complex changes              |

Avoid full audit-log UI unless security, money, or trust requirements later justify it.

## 22. Offline/Concurrency UX

Offline mutation flow:

```text
User changes object
  -> local validation
  -> optimistic UI update
  -> local mutation persists
  -> queued/syncing state
  -> network reconciliation
  -> fresh or failed/stale/conflicted
```

Concurrent expectations:

| Scenario                                          | UX expectation                                                            |
| ------------------------------------------------- | ------------------------------------------------------------------------- |
| Two people vote                                   | Merge naturally; counts refresh                                           |
| Two people check same item                        | Merge safely                                                              |
| Event edited while RSVP occurs                    | Preserve RSVP intent; refresh event fields                                |
| Expense updated while member marks paid           | Preserve mark-paid if still valid; otherwise show review                  |
| Decision superseded while user views old decision | Show superseded state and link to newer decision                          |
| Item deleted while user edits it                  | Explain item changed/removed; do not silently discard important user text |

Conflict rules:

- Merge when naturally safe.
- Refresh when authoritative state arrives.
- Preserve user intent where possible.
- Show conflict only when meaningful.
- Never silently discard an important user change.

## 23. Message-to-Object Relationship

Architecture decision:

Source messages and created objects remain separate durable conversation artifacts linked together.

Recommended rendering:

```text
Ahmed
Let's leave at 5:30.

        Created a decision

DECIDED
Leave at 5:30 AM
```

Relationship rules:

- Object has a source message anchor when created through Turn Into.
- Source message has a subtle linked state if policy allows.
- Object updates appear as object state changes, not repeated full messages.
- Significant object updates may create small system/update rows in conversation history.
- Source deletion does not delete object.
- Object deletion does not delete source.
- Object details can navigate to source.
- Source details can list created object links.

Deletion semantics:

| Action                 | Meaning                                                   |
| ---------------------- | --------------------------------------------------------- |
| Delete object          | Remove/withdraw structured artifact per permission policy |
| Cancel object          | Object remains visible as cancelled                       |
| Complete object        | Outcome reached; object remains visible                   |
| Expire object          | Time window passed; object remains visible quietly        |
| Remove my contribution | Remove vote/RSVP/paid mark/etc. where allowed             |

## 24. Accessibility Model

Live Objects must support:

- Keyboard operation
- Screen readers
- Text scaling
- Visible focus
- Non-color state indicators
- Touch targets
- Reduced motion
- Understandable progress
- Accessible results/charts

Semantic requirements:

| Object                   | Semantic control                       |
| ------------------------ | -------------------------------------- |
| Poll single choice       | Radio group                            |
| Poll multiple choice     | Checkbox group                         |
| Checklist item           | Checkbox with checked state            |
| RSVP                     | Segmented radio-style control          |
| Expense paid state       | Button/checkbox depending on policy    |
| Decision acknowledgement | Button with pressed/acknowledged state |
| Reminder complete        | Button/checkbox                        |
| Live location stop       | Clearly labelled button                |

Do not build custom div interactions unless the full semantic behavior is implemented.

## 25. Component Hierarchy

Live Object component hierarchy:

```text
LiveObjectCard
  LiveObjectHeader
    LiveObjectType
    LiveObjectTitle
    LiveObjectStatus
    LiveObjectMenu
  LiveObjectBody
  LiveObjectVisual
  LiveObjectSummary
  LiveObjectParticipants
  LiveObjectSyncState
  LiveObjectActions
```

Type renderers:

```text
PollObject
EventObject
ChecklistObject
ExpenseObject
DecisionObject
ReminderObject
LocationObject
LiveLocationObject
PlanObject
UnsupportedObject
```

Creation primitives:

```text
ObjectCreationSheet
ObjectTypePicker
ObjectTitleField
ParticipantPicker
DateTimePicker
LocationPicker
CurrencyInput
SplitEditor
ReminderPicker
CreationPreview
TurnIntoPicker
SourceMessagePreview
```

Rules:

- Shared shell, header, lifecycle, sync, menu, and accessibility behavior live in reusable primitives.
- Type renderers own type-specific payload display and actions.
- Shared primitives do not imply one universal form.

## 26. State Machines

Live Object lifecycle:

```text
draft -> active -> completed -> archived
                -> cancelled
                -> expired
```

Turn Into:

```text
idle
  -> message_selected
  -> type_picker
  -> prefilled_draft
  -> confirming
      -> created
      -> cancelled
      -> failed
```

Poll:

```text
draft -> active -> closed
                -> cancelled
                -> expired
```

Event:

```text
draft -> active -> updated -> active
                -> completed/past
                -> cancelled
```

Checklist:

```text
draft -> active -> partially_complete -> active
                              -> completed
                              -> cancelled
```

Expense:

```text
draft -> active -> partially_marked_paid -> settled
                                  -> archived
                                  -> cancelled
```

Live Location:

```text
draft -> active -> expiring -> expired
                 -> stopped
                 -> unavailable
```

Plan emergence:

```text
not_applicable
  -> candidate_detected
  -> suggested
  -> accepted
  -> active
      -> completed
      -> archived
      -> dismissed
```

Object synchronization:

```text
fresh
  -> locally_modified
  -> queued
  -> syncing
      -> fresh
      -> failed
      -> stale
      -> conflicted
      -> unavailable
```

## 27. Interaction Matrix

| Interaction          | Trigger               | Surface                         | Optimistic result                | Durable result            | Failure               | Offline behavior                         | Mobile            | Desktop              | Permission                      |
| -------------------- | --------------------- | ------------------------------- | -------------------------------- | ------------------------- | --------------------- | ---------------------------------------- | ----------------- | -------------------- | ------------------------------- |
| Create               | Composer `+`          | Creation sheet/dialog           | Draft preview                    | Object card posted        | Draft retained        | Queue object create                      | Sheet/pushed      | Popover/dialog       | Member                          |
| Turn Into            | Message action        | Type picker + prefilled surface | Prefilled draft                  | Linked object posted      | Source unchanged      | Queue create                             | Long press sheet  | Menu/right-click     | Member                          |
| Edit                 | Object menu           | Detail surface                  | Object updates locally           | Fresh updated object      | Revert/explain        | Queue mutation                           | Sheet/pushed      | Dialog/panel         | Creator/admin/shared            |
| Delete               | Object menu           | Confirm                         | Object hidden/tombstoned locally | Deleted/withdrawn         | Restore/explain       | Queue where safe                         | Confirm sheet     | Confirm dialog       | Creator/admin                   |
| Complete             | Object action         | Card/detail                     | Completed label                  | Lifecycle completed       | Restore/explain       | Queue mutation                           | Card/sheet        | Card/panel           | Creator/admin or member by type |
| Cancel               | Object action         | Confirm                         | Cancelled label                  | Lifecycle cancelled       | Restore/explain       | Queue mutation                           | Confirm sheet     | Confirm dialog       | Creator/admin                   |
| Vote                 | Poll option           | Poll card                       | Vote count updates               | Vote persisted            | Vote marked failed    | Queue vote                               | Radio/checkbox    | Radio/checkbox       | Member                          |
| RSVP                 | Event buttons         | Event card                      | RSVP selected                    | RSVP persisted            | RSVP marked failed    | Queue RSVP                               | Segmented buttons | Segmented buttons    | Member                          |
| Toggle checklist     | Checkbox              | Card/detail                     | Item toggles                     | Item persisted            | Item restores/failed  | Queue toggle                             | Checkbox          | Checkbox             | Member                          |
| Mark paid            | Expense action        | Expense detail                  | Paid marker updates              | Paid marker persisted     | Marker failed         | Queue marker                             | Sheet/detail      | Panel/dialog         | Participant/policy              |
| Acknowledge decision | Decision action       | Card/detail                     | Acknowledged count updates       | Acknowledgement persisted | Marker failed         | Queue ack                                | Button            | Button               | Member                          |
| Set reminder         | Object/message action | Reminder sheet                  | Reminder scheduled locally       | Reminder persisted        | Permission/time error | Local notification if possible           | Sheet             | Popover/sheet        | Member                          |
| Start live location  | Composer/location     | Location surface                | Sharing card posts               | Sharing active            | Permission error      | Cannot start without location permission | Pushed/sheet      | Dialog               | Member                          |
| Stop live location   | Card action           | Card/detail                     | Sharing stopped                  | Stop persisted            | Retry visible         | Stop queued and local sharing stops      | Prominent button  | Prominent button     | Sharer                          |
| Expand               | Tap/click card        | Detail surface                  | Expanded state                   | None needed               | Fallback summary      | Works from local cache                   | Sheet/pushed      | Panel/popover/dialog | Viewer                          |
| Find source message  | Object detail         | Anchor action                   | Scroll to source                 | None needed               | Source unavailable    | Works if cached                          | Sheet action      | Detail action        | Viewer                          |
| Open context         | Conversation info     | Context panel/sheet             | Shared section opens             | None needed               | Details unavailable   | Cached summary                           | Sheet/pushed      | Context panel        | Member                          |

## 28. Screen/Surface Inventory

New surfaces introduced by Pass 02:

Screens:

- Object detail pushed screen, mobile only for complex objects
- Plan expanded summary screen, future-compatible but not a primary nav destination

Sheets:

- Object creation sheet
- Turn Into picker sheet
- Poll detail sheet
- Event detail sheet
- Checklist detail sheet
- Expense split sheet
- Reminder creation sheet
- Location picker sheet
- Live Location sharing sheet
- Object conflict/review sheet

Dialogs:

- Desktop object creation dialog
- Desktop complex event dialog
- Desktop expense split dialog
- Confirm delete/cancel dialog

Popovers:

- Desktop quick poll creation
- Desktop reminder picker
- Desktop Turn Into candidate picker
- Desktop object overflow menu

Inline expansions:

- Expanded compact card state for simple poll, checklist, RSVP, and source preview

Context sections:

- Shared
- Upcoming Events
- Active Lists
- Expenses
- Decisions
- Places
- Plans

States:

- Active
- Completed
- Cancelled
- Expired
- Locally modified
- Syncing
- Stale
- Failed
- Conflicted
- Unsupported
- Source unavailable

## 29. Backend/Protocol Requirements Discovered

Future architecture must define:

- Versioned Live Object schemas.
- Unknown object fallback payload with type, summary, creator, timestamp, and optional upgrade/open hint.
- Object identity separate from message identity.
- Source message to object linkage.
- Object mutation ids for idempotent local-first sync.
- Permission rules per object and conversation role.
- Lifecycle state separate from sync state.
- Field-level or operation-level conflict semantics for safe merges.
- Mutation transparency events for significant changes.
- Offline queue support for create, edit, vote, RSVP, checklist toggle, mark paid, acknowledge, stop live location.
- Location privacy contract, retention policy, duration limits, and stop-sharing guarantee.
- Notification event taxonomy without requiring notification infrastructure in UI code.
- Map/geocoding provider adapter boundary.
- Expense wording and data model that does not imply money custody.
- Plan emergence inputs and thresholds before Space design.

These are requirements for later architecture. They are not implementation work in Pass 02.

## 30. Open Product Owner Decisions

1. Which objects are directly creatable from composer `+` at first release?
2. Which objects only originate through Turn Into or contextual suggestion?
3. Should Poll votes support anonymity in the initial release?
4. Are Poll results visible before a user votes?
5. Can Events exist without a date/time, or must vague plans remain messages until confirmed?
6. Are Checklist assignees included in the initial release?
7. Does Expense support unequal/custom split initially?
8. Who can mark another member paid?
9. Is Decision acknowledgement required, optional, or hidden in the first version?
10. Are reminders personal by default in all conversations?
11. Is "Remind everyone" allowed for all members, only creators, or admins?
12. What is the maximum Live Location duration?
13. Can admins stop another member's Live Location for safety/moderation reasons?
14. Who can edit shared object core fields?
15. What happens when an object creator leaves a conversation?
16. What happens to a member's votes/RSVPs/payment marks when they leave?
17. When should Seyloq suggest creating a Plan?
18. When does a Plan qualify for a future Space?
19. What history should object edits expose by default?
20. Which object notifications are push-worthy versus silent conversation updates?
21. Are contextual suggestions deterministic, AI-assisted, or both in the first implementation?
22. Should object deletion leave a tombstone in conversation history?
23. Which Live Object types must be searchable before backend search exists?
24. What are the privacy rules for location retention and map provider metadata?

## Human Review Boundary

This pass defines Live Objects and Turn Into UX architecture only. It does not implement UI, production components, backend services, PostgreSQL schemas, WebSockets, synchronization protocol, AI, E2EE, payment processing, maps infrastructure, notifications, Spaces, Smart Meet Up, or Pass 03.

SEY-006 UX Architecture Pass 02 - Live Objects & Turn Into ready for Human Review.
