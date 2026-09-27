# SEY-006 - Complete Product UX Architecture

Pass 06: Global Search & Contextual AI  
Base: SEY-006 Pass 01, Pass 02, Pass 03, Pass 04, and Pass 05

## 01. Search Design Laws

Search helps users find what exists. AI helps users understand or transform what they are already looking at.

Product laws:

- Primary navigation remains `Chats`, `Updates`, `Calls`.
- Search is globally reachable but is not a navigation root.
- AI is contextual and never becomes a primary tab.
- Search works without AI.
- Basic search never depends on embeddings or LLMs.
- AI failure never breaks messaging or search.
- Privacy and authorization happen before retrieval, ranking, snippets, semantic answers, or AI summaries.
- Local-only results must be represented honestly.
- Semantic results must be distinguishable from exact/filter results when needed.
- AI output does not silently become shared truth.
- AI-created structure requires user confirmation before durable shared mutation.
- Results lead back to canonical source context.
- AI must not imply access to information it cannot see.
- No anthropomorphic AI persona is required.

Do not add permanent primary destinations for Search, AI, Assistant, Files, Places, Events, Expenses, Plans, or Knowledge.

## 02. Search Entry Architecture

Global Search entry points:

| Surface           | Entry direction                                                    |
| ----------------- | ------------------------------------------------------------------ |
| Desktop shell     | Navigation rail search affordance or top-level search button/field |
| Mobile Chats root | Header search affordance                                           |
| Updates root      | Search where relevant to Status/Channels/Communities               |
| Calls root        | Calls search within Calls Home                                     |
| Conversation      | Header search action scoped to conversation                        |
| Context           | Category-local search                                              |

Search must not require navigating to a Search tab.

## 03. Scope Model

Scopes:

| Scope            | Meaning                                       | Examples                                                         |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| Global           | Search across information the user may access | People, conversations, messages, files, Live Objects, Channels   |
| Conversation     | Search inside one conversation                | Messages, files, places, decisions in Hunza Trip                 |
| Context/category | Search inside one category or collection      | Files in Hunza Trip, places in Family, posts in followed Channel |

Scope must always be visible and understandable.

## 04. Search Taxonomy

Global Search may return:

- People
- Conversations
- Messages
- Media
- Files
- Links
- Voice notes
- Places
- Events
- Polls
- Checklists
- Expenses
- Decisions
- Reminders
- Plans
- Spaces
- Calls where useful
- Channels
- Channel updates
- Communities
- Community groups
- Community announcements
- Active Status where privacy permits

Do not display every category for every query.

## 05. Global Result Architecture

Use grouped results, not a giant undifferentiated feed.

Example:

```text
Search
hunza hotel

Top results

Messages
Ali
"Serena is booked for May 12"
Hunza Trip · May 2

Places
Serena Hotel
Hunza Trip

Files
booking-confirmation.pdf
Hunza Trip

Plans
Hunza Trip
May 12-17
```

Result rows show title, compact snippet/summary, provenance, and type.

## 06. Progressive Search

Empty search may show:

- Recent searches
- Recent conversations
- Useful filters
- Searchable categories

As user types:

```text
query -> immediate local/available results -> richer result groups
```

Do not wait for AI before showing basic results.

## 07. Ranking Principles

Conceptual ranking inputs:

- Exact match.
- Prefix match.
- Text relevance.
- Conversation recency.
- Relationship/context.
- Structured metadata.
- Result freshness.
- User-selected filters.

Authorization happens before ranking. Do not rank solely by engagement. Do not design a proprietary ranking algorithm in this pass.

## 08. Filter Architecture

Start with progressive filters:

- People
- Messages
- Media
- Files
- Links
- Places
- Events
- Other

After category selection, contextual filters may appear:

- Conversation
- Sender
- Date
- Type
- Upcoming/Past for Events
- Unsettled/Settled for Expenses
- File type for Files

Avoid giant advanced-search forms.

## 09. Query Understanding

Basic search supports literal queries:

- `Serena`
- `flight.pdf`
- `Ahmed`
- `May 12`

Future enhanced understanding may support:

- hotel Ali shared
- PDF from Ahmed last month
- places in Hunza Trip

Literal/filter search remains independent from semantic interpretation.

## 10. Conversation Search

Conversation search is invoked from conversation header/context and remains visibly scoped.

Example:

```text
Search in Hunza Trip
hotel
```

Results may include Messages, Files, Links, Places, Events, Decisions, Expenses, and Checklists. Selecting a result returns to canonical location.

## 11. Context Search

Conversation Context category search:

- Media
- Files & Links
- Places
- Events
- Lists
- Expenses
- Decisions
- Plans

Example:

```text
Context -> Files -> Search files
```

Do not create separate global mini-apps for categories.

## 12. Canonical-Source Navigation

Every result resolves to authoritative source:

| Result                 | Destination                  |
| ---------------------- | ---------------------------- |
| Message                | Conversation/message anchor  |
| File                   | Attachment/source message    |
| Event/Expense/Decision | Live Object in conversation  |
| Plan                   | Conversation Plan            |
| Space                  | Conversation Space           |
| Channel update         | Channel                      |
| Community group        | Canonical group conversation |
| Status                 | Active Status viewer         |

Search is a retrieval surface, not a duplicate content store.

## 13. Provenance

Results answer:

- Where did this come from?
- Who shared/created it?
- When?
- In which conversation/channel/community?

Example:

```text
booking.pdf
Ali · Hunza Trip · May 3
```

Use compact metadata; do not overload every row.

## 14. Visibility/Permissions

Search respects:

- Conversation membership.
- Group membership.
- Community membership.
- Channel visibility.
- Status audience.
- Blocked-user policy.
- Deleted content.
- Expired Status.
- Live Object permissions.
- Local availability.

Forbidden content must not leak through titles, snippets, counts, suggestions, semantic results, or AI summaries.

## 15. Deleted/Unavailable Handling

States:

- Message deleted.
- Content unavailable.
- Status expired.
- You no longer have access.
- Original source unavailable.

Do not retain sensitive snippets after access revocation unless explicit retention policy permits it.

## 16. Local Search

Before backend search exists, local retrieval covers locally available:

- People/groups.
- Conversations.
- Message text.
- Live Object metadata.
- Cached files/links metadata.
- Poll/Event/Checklist/Expense/Decision/Reminder/Location/Plan metadata.

Active Live Location remains context-first due to privacy sensitivity.

## 17. Offline/Completeness UX

Offline search works over available local data.

Copy:

```text
Offline
Showing results available on this device
```

If only partial history is present, avoid "No results found." Prefer:

```text
No results on this device.
```

or:

```text
Search results may be incomplete while offline.
```

## 18. Search History/Suggestions

Initial privacy-oriented direction:

- Recent searches are device-local.
- User can clear them.

Suggestions may include:

- Recent query.
- Recent person.
- Recent conversation.
- Exact entity match.

Avoid trending queries, viral searches, and engagement recommendations.

## 19. Empty/Loading/Error States

Before query:

```text
Search Seyloq
People, messages, files, places and more
```

No results:

```text
No results for "xyz"
```

Partial loading:

```text
Local results
Searching more history...
```

Error:

```text
Couldn't search more history.
Local results are still available.
```

Backend/semantic failure must not remove valid local results.

## 20. Responsive Search

| Viewport         | Search entry         | Surface                | Filters                                 | Result navigation           | AI answer placement           |
| ---------------- | -------------------- | ---------------------- | --------------------------------------- | --------------------------- | ----------------------------- |
| Mobile portrait  | Header/search button | Pushed full-screen     | Chips/sheets                            | Opens canonical route       | Below input above groups      |
| Mobile landscape | Header/search button | Pushed/overlay         | Chips                                   | Opens canonical route       | Compact card                  |
| Tablet portrait  | Header/rail          | Overlay or pushed pane | Chips/side filters                      | Opens pane/route            | Above results                 |
| Tablet landscape | Header/rail          | Overlay/result pane    | Filter bar                              | Opens adjacent/canonical    | Above grouped results         |
| Desktop compact  | Rail/top             | Overlay                | Filter bar                              | Opens canonical destination | Above groups                  |
| Desktop normal   | Rail/top/shortcut    | Overlay or result pane | Filter bar + quick scopes               | Keyboard open               | Above groups, never replacing |
| Desktop wide     | Rail/top/shortcut    | Overlay/pane           | Filter bar + side refinements if useful | Keyboard open               | Above groups with sources     |

Avoid permanent search dashboards.

## 21. AI Product Role

AI is contextual assistance.

AI is not:

- A fourth primary destination.
- A chatbot users must talk to.
- A separate workspace.
- A mandatory layer over search.

Potential capabilities:

- Catch me up.
- Summarize unread messages.
- Transcribe voice note.
- Translate message.
- Summarize shared document.
- Extract dates, places, expenses, decisions, checklist items, reminders.
- Create drafts for Live Objects.
- Semantic search.
- Writing assistance.

## 22. AI Entry Architecture

Contextual entries:

| Context                   | AI action                                          |
| ------------------------- | -------------------------------------------------- |
| Conversation unread state | Catch me up                                        |
| Voice message             | Transcribe                                         |
| Message                   | Translate, Turn into                               |
| Shared document           | Summarize                                          |
| Search                    | Ask naturally / semantic interpretation            |
| Conversation activity     | Create checklist/event/reminder draft              |
| Composer                  | Improve wording, shorten, translate before sending |

Never add AI to primary navigation.

## 23. Progressive Disclosure

AI appears through:

- Long press/right click.
- Context menu.
- Overflow.
- Contextual suggestion.
- Temporary chip.
- Search enhancement.

Do not permanently decorate every message with AI buttons. Suggestions are dismissible and should not nag.

## 24. Catch Me Up

Trigger example:

```text
42 unread messages
[Catch me up]
```

Output example:

```text
Catch up
- Trip moved to May 12.
- Ali booked the hotel.
- Everyone owes Rs 8,400.
- Meet at the airport at 4:30 AM.
- Passport checklist is incomplete.
```

Rules:

- Label as generated summary.
- Preserve source messages.
- Do not mark unread as read unless explicitly decided.
- Do not convert summary claims into shared structure automatically.
- AI failure leaves unread messages usable.

## 25. Summary Provenance/Scope

Summary scope must be explicit:

- 42 unread messages.
- Today.
- Since yesterday.
- Selected messages.
- This document.
- This voice note.

Generated statements support source access:

```text
Ali booked the hotel. View messages
```

Do not require academic citations everywhere, but important claims need traceability.

## 26. Voice Transcription

Voice action:

```text
Transcribe
```

State:

```text
not_transcribed -> processing -> available
```

Branches:

- failed.
- unsupported.
- language_unknown.

Transcript remains associated with voice message and never replaces original audio.

## 27. Translation

Message action:

```text
Translate
```

Output preserves:

- Original.
- Translated version.
- Source language if known.

State:

```text
not_translated -> processing -> translated
```

Branches: failed, unsupported_language. Original always remains available.

## 28. Document Summarization

Shared file/document action:

```text
Summarize
```

Scope is the selected document. Output may include Summary, Key points, Dates, Actions only where the source supports them.

Do not imply analysis of unavailable, encrypted, or unsupported content.

## 29. Extraction Architecture

Extraction may identify candidates:

- Dates.
- Places.
- Expenses.
- Decisions.
- Checklist items.
- Reminders.

Flow:

```text
Detected candidate -> user reviews -> prefilled creation surface -> user confirms -> durable Live Object
```

Suggestion is not yet a Live Object. This preserves Pass 02 Turn Into.

## 30. Decision Extraction

Example:

```text
We'll leave at 5:30 then.
```

Suggestion:

```text
Save as decision?
```

Never automatically declare a discussion a Decision. User confirmation is mandatory.

## 31. Checklist Extraction

Example:

```text
Bring:
- passport
- jackets
- medicine
```

Flow:

```text
detected items -> editable preview -> confirm -> Checklist Live Object
```

AI does not silently create shared tasks.

## 32. Expense Extraction

Example:

```text
Ground was Rs 6,000. Five people.
```

Prefill may suggest amount and participants. User confirms payer, participants, and split.

AI must not claim money was paid. Pass 02 non-custodial Expense semantics remain authoritative.

## 33. Event Extraction

Example:

```text
Football Sunday at 6.
```

Suggestion:

```text
Create event?
```

Ambiguous dates/time zones require confirmation. Never silently schedule.

## 34. Reminder Extraction

Example:

```text
Remind me tomorrow to call Ali.
```

Personal reminder is default. Group-wide reminders follow Pass 02 permissions.

## 35. Place Extraction

Example:

```text
Let's meet at Dolmen Mall Clifton.
```

Suggestion:

```text
Save place?
```

Do not pretend geocoding confidence. Confirmation/search/map selection may be required later.

## 36. Semantic Search

Semantic search enhances Search.

Examples:

- Where was that hotel Ahmed shared?
- What did we decide about the flight?
- Show me PDFs Ali sent last month.
- What expenses are still pending in Hunza Trip?

Distinguish query interpretation, retrieval, and generated answer. These are separate operations.

## 37. Semantic Retrieval

Natural-language query may resolve to structured retrieval:

```text
"PDFs Ali sent last month"
  -> Type: File
  -> Sender: Ali
  -> Date: last month
```

If filtering can answer the query, generated prose may not be needed. Prefer retrieval over generation.

## 38. Generated Search Answers

For synthesis questions:

```text
What did we decide about the flight?
```

Potential answer:

```text
You decided to take the 7:30 AM flight.

Sources
- Decision · Hunza Trip
- 3 related messages
```

Generated answers must link to supporting Seyloq sources and must acknowledge conflicting evidence.

## 39. Semantic Failure/Fallback

If interpretation fails:

```text
I couldn't interpret that request.
Search for exact words instead.
```

Fallback to ordinary search wherever possible. Never leave the user at a dead end.

## 40. AI Privacy/Processing Boundary

Potential processing modes:

- On-device.
- Server-side.
- External provider.
- Hybrid.

Future architecture must define for every capability:

- What data leaves device.
- What is retained.
- Who processes it.
- Whether content is used for training.
- How user is informed.
- What happens when unavailable.

Do not choose provider in this pass.

## 41. AI Consent/Controls

Strong initial direction:

- Transcribe: user invokes.
- Translate: user invokes.
- Summarize document: user invokes.
- Semantic answer: user asks.
- Catch me up: may be suggested, not automatic.
- Extraction suggestions: may be deterministic/local where safe, but durable actions always require confirmation.

No giant AI settings center. Future settings may include AI features, contextual suggestions, language preferences, and privacy information.

## 42. AI Error/Loading

Human-readable errors:

- Couldn't generate summary.
- Couldn't transcribe this message.
- Translation unavailable.
- Couldn't understand that search.
- This feature isn't available offline.

Loading:

- Summarizing...
- Transcribing...
- Translating...
- Searching...

Avoid fake conversational typing theater. Long-running actions should not block messaging.

## 43. AI Result Persistence/Editing

Persistence levels:

| Level          | Examples                                                                     |
| -------------- | ---------------------------------------------------------------------------- |
| Ephemeral      | Translation display, search answer, temporary summary                        |
| Cached/local   | Transcript or generated helper data, if policy allows                        |
| Durable shared | Event, Checklist, Decision, Expense, Reminder, Place after user confirmation |

Before generated content becomes durable, user can edit it. User owns final mutation.

## 44. AI Attribution/Trust

Generated content is labeled:

- AI summary / Generated summary.
- Transcript.
- Translation.
- Suggested.

Trust principles:

- Source available.
- Scope visible.
- Uncertainty acknowledged.
- Generated vs authored content distinct.
- No automatic durable truth.
- User confirmation for actions.
- Easy fallback to original content.

## 45. Suggestion-Frequency Model

Rules:

- Do not suggest on every message.
- Do not repeat dismissed suggestion immediately.
- Prefer high-confidence/high-value moments.
- Collapse or hide low-priority suggestions.
- Respect future contextual-suggestions setting.
- Never interfere with sending or reading.

Catch Me Up should require meaningful unread volume, time away, activity density, or structured changes. Do not show for two unread messages merely because AI exists.

## 46. Structured Context/Plan/Space AI Compatibility

AI may use authorized structured state:

- Events.
- Decisions.
- Expenses.
- Checklists.
- Plans.
- Places.

Plan/Space actions:

- Summarize changes.
- What changed?
- What's left?

Canonical Live Objects, Plans, and Spaces remain authoritative. No Space chatbot.

## 47. Calls/Updates AI Compatibility Boundary

Calls future:

- Call transcription.
- Call summary.
- Action extraction.

Requires separate consent, participant notice, retention, recording/transcription law, and E2EE compatibility. No automatic call transcription.

Updates future:

- Translate Channel update.
- Summarize long Channel update.

Do not summarize people's Status by default. Do not build AI feed ranking.

## 48. Writing Assistance

Composer actions:

- Improve wording.
- Shorten.
- Translate before sending.

Must be explicitly invoked. Generated draft remains editable. User must still send manually. AI never auto-sends.

## 49. Search + AI Visual Hierarchy

Ordinary results remain primary.

Example:

```text
Search: flight decision

Answer
You decided on the 7:30 AM flight.
View sources

Messages
...

Decisions
...
```

If evidence is weak, prioritize source results instead of producing an answer.

## 50. Search Component Hierarchy

Components:

```text
GlobalSearch
SearchInput
SearchScope
SearchFilterBar
SearchResultGroups
SearchResultSection
SearchResultItem
SearchEmptyState
SearchOfflineState
SearchPartialState
SearchErrorState
SearchHistory
SearchSuggestion
ConversationSearch
ContextSearch
SearchResultAnchor
SearchProvenance
```

Reuse existing primitives such as Avatar, IconButton, segmented controls, Popover, Sheet, Dialog, VirtualList, EmptyState, and Skeleton.

## 51. AI Component Hierarchy

Components:

```text
ContextualSuggestion
CatchMeUp
GeneratedContent
GeneratedContentLabel
SourceAnchor
SourceList
Transcript
Translation
ExtractionPreview
GeneratedActionDraft
AIProcessingState
AIUnavailableState
```

Avoid building a generic chatbot component unless a later approved need requires it.

## 52. Search State Machine

```text
idle -> typing -> local_results -> enriching -> complete
```

Branches:

- no_results.
- partial.
- offline.
- remote_failed.

Local results remain usable during enrichment failure.

## 53. Semantic Search State Machine

```text
query -> interpreting -> retrieving -> results
```

Optional synthesis:

```text
results -> generating_answer -> answer_with_sources
```

Branches:

- interpretation_failed.
- retrieval_failed.
- generation_failed.
- insufficient_evidence.

Fallback to ordinary search wherever possible.

## 54. AI Action State Machine

Generic:

```text
available -> invoked -> processing -> generated
```

Then:

```text
generated -> dismissed
generated -> copied/viewed
generated -> reviewed -> confirmed -> durable_action
```

Branches:

- failed.
- unsupported.
- offline_unavailable.
- permission/privacy_blocked.

## 55. Transcription/Translation State Machines

Transcription:

```text
not_transcribed -> processing -> available
```

Branches: failed, unsupported, unavailable.

Translation:

```text
original -> translating -> translated
```

Branches: failed, unsupported. Original always remains available.

## 56. Responsive AI

Mobile AI surfaces:

- Inline card.
- Bottom sheet.
- Pushed detail for complex review.

Desktop AI surfaces:

- Inline.
- Popover.
- Side/detail region.
- Dialog only when focused review is genuinely needed.

AI must not consume the entire app unless the task requires focused review.

## 57. Accessibility

Search:

- Label search input.
- Announce result counts and group headings.
- Support keyboard navigation.
- Restore focus after result navigation.
- Expose filter and scope state.
- Announce loading/partial state without excessive interruption.

AI:

- Label generated content.
- Announce processing changes appropriately.
- Make source references keyboard accessible.
- Expose original and translated text clearly.
- Keep transcripts associated with audio.
- Respect reduced motion.

## 58. Performance Requirements

Search must feel immediate.

Requirements:

- Debounce expensive search.
- Incremental results.
- Virtualized large result lists.
- Pagination/cursors.
- Local indexing later.
- Thumbnail-first media results.
- Lazy previews.
- Cancellation of stale queries.

AI requests must not block ordinary search or conversation interaction.

## 59. Privacy Requirements

Future implementation must define:

- Search index boundaries.
- Local vs server index.
- Deleted-data removal.
- Revoked-access removal.
- Search history retention.
- Semantic index authorization.
- AI provider boundaries.
- Transcript retention.
- Translation retention.
- Generated summary retention.
- Training/data-use policy.

No unsupported claims.

## 60. E2EE Boundary

Future E2EE may fundamentally constrain:

- Server-side indexing.
- Semantic retrieval.
- AI processing.
- Transcription.
- Summarization.

Do not solve E2EE here. Do not assume plaintext server access. This is a mandatory dependency of future E2EE architecture.

## 61. Security Requirements

Future needs:

- Authorization before search.
- Result filtering.
- Index deletion.
- Revocation propagation.
- AI prompt/data isolation.
- Tenant/user isolation.
- Malicious document handling.
- Prompt-injection resistance for document/content AI.
- Safe URL/file handling.
- Auditability for sensitive AI actions where appropriate.

No security implementation in this pass.

## 62. Backend/Protocol Requirements

Future requirements:

- Search API.
- Scoped search.
- Result pagination.
- Category filters.
- Conversation search.
- Structured-object search.
- Search visibility.
- Search cursors.
- Local/remote completeness metadata.
- Message anchors.
- Source provenance.
- Semantic retrieval later.
- AI task invocation later.
- AI source references.
- Generated result metadata.
- Transcription metadata.
- Translation metadata.
- Cancellation/retry.

Do not implement backend.

## 63. Native Requirements

Potential future:

- Local search index.
- Background indexing.
- File metadata extraction.
- Media metadata.
- On-device transcription where possible.
- On-device model support where appropriate.
- Secure local cache.
- OS search integration later.

Do not choose implementation now.

## 64. Interaction Matrix

| Interaction             | Scope        | Surface        | Immediate result       | Canonical destination     | Offline behavior                       | Failure behavior      | Privacy boundary          | Generated/deterministic   | Durable/ephemeral          |
| ----------------------- | ------------ | -------------- | ---------------------- | ------------------------- | -------------------------------------- | --------------------- | ------------------------- | ------------------------- | -------------------------- |
| Open global search      | Global       | Shell          | Search surface opens   | None                      | Available                              | None                  | User scope                | Deterministic             | Ephemeral                  |
| Search literal query    | Chosen scope | Search         | Local/grouped results  | Result anchor             | Local results                          | Partial/error copy    | Authorized only           | Deterministic             | Ephemeral                  |
| Filter search           | Chosen scope | Filter bar     | Narrowed results       | Result anchor             | Available if local                     | Unsupported hidden    | Authorized only           | Deterministic             | Ephemeral                  |
| Open result             | Any          | Result row     | Canonical source opens | Source surface            | Cached source                          | Unavailable state     | Rechecked                 | Deterministic             | None                       |
| Search conversation     | Conversation | Header search  | Scoped results         | Message/object anchor     | Local history                          | Partial copy          | Member only               | Deterministic             | Ephemeral                  |
| Search Context category | Category     | Context        | Category results       | Artifact/source           | Cached category                        | Partial copy          | Member only               | Deterministic             | Ephemeral                  |
| Clear search history    | Device       | Search history | History clears         | None                      | Local                                  | Retry                 | Device-local              | Deterministic             | Durable local              |
| Catch me up             | Conversation | Unread chip    | Summary processing     | Source messages           | Usually unavailable unless local model | Summary unavailable   | Authorized content only   | Generated                 | Ephemeral/cached decision  |
| Open summary source     | Conversation | Summary        | Source opens           | Message/object anchor     | Cached source                          | Source unavailable    | Rechecked                 | Generated with provenance | None                       |
| Transcribe voice note   | Message      | Voice action   | Processing             | Voice message             | Unavailable unless local               | Failed/unsupported    | Message access            | Generated                 | Cache decision             |
| Translate message       | Message      | Message action | Translation block      | Original message          | Unavailable unless local               | Failed/unsupported    | Message access            | Generated                 | Ephemeral/cache            |
| Summarize document      | File         | File action    | Processing             | File/source               | Unavailable unless local               | Unsupported           | File access               | Generated                 | Ephemeral/cache            |
| Detect/create Event     | Message      | Suggestion     | Draft preview          | Live Object after confirm | Queue after confirm                    | Draft fail            | Conversation permission   | Deterministic/AI          | Durable only after confirm |
| Detect/create Checklist | Message      | Suggestion     | Draft preview          | Live Object               | Queue after confirm                    | Draft fail            | Permission                | Deterministic/AI          | Durable after confirm      |
| Detect/create Expense   | Message      | Suggestion     | Draft preview          | Live Object               | Queue after confirm                    | Draft fail            | Permission                | Deterministic/AI          | Durable after confirm      |
| Detect/create Decision  | Message      | Suggestion     | Draft preview          | Live Object               | Queue after confirm                    | Draft fail            | Permission                | Deterministic/AI          | Durable after confirm      |
| Suggest Reminder        | Message      | Suggestion     | Draft preview          | Reminder                  | Local/queue                            | Fail                  | Personal/group permission | Deterministic/AI          | Durable after confirm      |
| Suggest Place           | Message      | Suggestion     | Draft preview          | Location object           | Queue after confirm                    | Uncertain place       | Permission                | Deterministic/AI          | Durable after confirm      |
| Semantic query          | Global/scope | Search         | Interpret/retrieve     | Result sources            | Fallback literal                       | Interpretation failed | Authorized only           | Generated/retrieval       | Ephemeral                  |
| Dismiss AI suggestion   | Context      | Suggestion     | Hidden                 | None                      | Local                                  | None                  | None                      | Deterministic             | Local preference           |
| Edit generated draft    | Draft        | Review surface | User edits             | Future object/message     | Local                                  | None                  | User-controlled           | Generated seed            | Durable only on confirm    |
| Retry AI action         | Context      | Error          | Processing             | Source/action             | Depends                                | Error persists        | Same scope                | Generated                 | Ephemeral                  |

## 65. Screen/Surface Inventory

Search surfaces:

- Global search overlay/screen.
- Conversation search bar.
- Context category search.
- Search filter bar.
- Search result groups.
- Result preview/anchor.
- Search history.
- Search empty/offline/partial/error states.

AI helper surfaces:

- CatchMeUpCard.
- GeneratedSummary.
- TranscriptPanel.
- TranslationBlock.
- AISearchAnswer.
- ExtractionSuggestion.
- GeneratedDraftPreview.
- AIErrorState.
- AIProcessingState.
- SourceReferenceList.

These are helper surfaces, not navigation destinations.

## 66. Error/Empty States

Required states:

- No results.
- No local results.
- Offline results incomplete.
- Search unavailable.
- Remote history unavailable.
- Some results missing.
- Content unavailable.
- Access revoked.
- Summary unavailable.
- Not enough content to summarize.
- Transcription unavailable.
- Unsupported audio.
- Translation unavailable.
- Unsupported language.
- Document unsupported.
- Semantic interpretation failed.
- Not enough evidence.
- AI unavailable offline.
- Generated action failed.
- Source unavailable.

Each state needs fallback: ordinary search, original content, source navigation, retry, or clear unavailable copy.

## 67. Open Product Owner Decisions

1. Where exactly is global Search invoked on mobile?
2. Where exactly is global Search invoked on desktop?
3. Should desktop support `Cmd/Ctrl + K`?
4. Does empty Search show recent searches?
5. Are recent searches device-local initially?
6. Which categories participate in first-release local search?
7. Should active Status be globally searchable at all?
8. Should Calls history participate in global Search?
9. How are grouped result sections ordered?
10. When should Search show filters?
11. Should search query history sync across devices?
12. How is local/remote completeness communicated after backend search exists?
13. Should semantic search be explicit or automatic for natural-language queries?
14. When should Search generate an answer versus only return sources?
15. Should generated Search answers always show sources?
16. What evidence threshold prevents an AI answer?
17. Does Catch Me Up require a minimum unread threshold?
18. Does Catch Me Up mark messages read?
19. How long are generated summaries retained?
20. Are voice transcripts persisted locally?
21. Are transcripts synchronized between devices?
22. Are translations ephemeral or cached?
23. Which AI features are enabled by default?
24. Is contextual suggestion generation enabled by default?
25. Which extraction suggestions may be deterministic without AI?
26. What dismissal cooldown prevents suggestion nagging?
27. Can AI use structured Live Object state in summaries?
28. Should document summaries be cached?
29. Should AI-generated content be labelled `AI` or task-specific terms like `Summary`, `Transcript`, `Translation`?
30. What user controls are required before external AI providers process message content?
31. Which AI features must remain on-device for privacy?
32. How does future E2EE constrain cloud AI?
33. Should writing assistance ship initially or later?
34. Is semantic search MVP, post-MVP, or experimental?
35. Is Catch Me Up MVP or post-MVP?
36. Which Search capabilities must work fully offline?
37. Should Search support saved queries later?
38. Should Channel/Community public discovery use the same global Search surface?
39. Should Search ever show recommended content without a query?
40. Which AI capabilities are blocked until Privacy/Security architecture is complete?

## Human Review Boundary

This pass defines Global Search and Contextual AI UX architecture only. It does not implement Search, local indexing, backend search, semantic search, embeddings, vector databases, RAG, LLM integration, AI vendor selection, transcription, translation, summarization, AI extraction, production UI, E2EE, primary navigation changes, an AI tab, Pass 01-05 redesign, Identity/Onboarding, or Pass 07.

SEY-006 UX Architecture Pass 06 - Global Search & Contextual AI ready for Human Review.
