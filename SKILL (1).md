---
name: seyloq-product-engineering
description: Governing implementation skill for Seyloq, a compact consumer-first communication app built with Tauri 2 + React/TypeScript, a Rust/native platform layer, and scalable backend boundaries. Apply to every Seyloq implementation, refactor, architecture decision, UX change, and review.
---

# Seyloq Product Engineering Skill

## 0. Mission

Build Seyloq as a **communication-first app that can become much more than chat without ever feeling like a complex work system**.

A first-time/basic user must be able to use Seyloq like a familiar messenger:

- chat
- voice notes
- photos/video/files
- audio/video calls
- static/live location
- groups
- updates/status

Advanced users progressively discover:

- Live Objects
- events
- polls
- lists
- expenses
- plans
- decisions/reminders
- shared spaces
- intelligent catch-up/search
- Together activities
- Mini Apps/integrations

**Complexity must emerge contextually. It must not dominate global navigation.**

The generated mobile and desktop reference screens approved by the product owner are the visual north star: compact, calm, clean, information-dense, consumer-friendly.

---

## 1. Non-negotiable product laws

### 1.1 Messaging owns the product

Seyloq is a messenger first. Never turn the primary shell into a project-management dashboard.

Default global mobile navigation:

1. Chats
2. Updates
3. Calls

Profile/settings live behind avatar/account affordances.
Search is globally accessible.
Creation/action entry points are contextual or use the universal composer.

Do not add a permanent top-level destination for Tasks, AI, Files, Events, Expenses, Plans, Apps, Calendar, or similar features without explicit product approval.

### 1.2 Progressive disclosure

Basic communication must require no understanding of Seyloq's advanced system.

Prefer:

- contextual suggestions
- long-press "Turn into..."
- universal `+` composer
- conversation info/context
- expandable Live Objects
- bottom sheets/popovers
- a group Space only when structured content exists

Avoid exposing every capability simultaneously.

### 1.3 Compactness is functional

Compact does NOT mean tiny or inaccessible. It means:

- high information utility per pixel
- short travel distances
- restrained padding
- clear hierarchy
- no gratuitous whitespace
- no giant SaaS hero/dashboard controls inside the app
- icon controls where universally understood
- text labels where ambiguity exists
- touch targets remain usable

### 1.4 One visual grammar

Do not invent a bespoke card/system for each feature.
Structured conversational content uses the shared Live Object grammar.

### 1.5 Feature addition must not increase cognitive load globally

When adding a feature, first ask:

1. Can it be invoked from the message composer?
2. Can it be suggested from conversation context?
3. Can it live in conversation info/Space?
4. Can it be represented as a Live Object?
5. Can search expose it?
   Only then consider new navigation.

---

## 2. UX architecture

### 2.1 Mobile

Single-primary-pane navigation.

Core shell:

- Chats
- Updates
- Calls

Conversation screen:

- compact header
- message stream
- contextual Live Objects
- composer fixed at bottom
- call/video affordances in header
- contextual actions in menus/sheets

Conversation context becomes a pushed screen or sheet.

### 2.2 Desktop

Use width intelligently:

`Navigation Rail | Chat List | Conversation | Context Panel`

Guidelines:

- navigation rail: narrow
- chat list: dense and scannable
- conversation: receives flexible width
- context panel: optional/collapsible
- hide/collapse context before harming conversation readability
- preserve hierarchy when window narrows

Do not simply stretch the mobile layout.

### 2.3 Tablet

Prefer two-pane layouts when space permits:
`Chat List | Conversation`
Context opens as overlay/pushed panel.

### 2.4 Chat → Context → Space

Layer 0 — Chat:
normal communication and Live Objects.

Layer 1 — Context:
media, files, links, events, places, expenses, lists, search, notifications, privacy.

Layer 2 — Space:
only for conversations/groups with enough structured state to justify it.
Space summarizes useful state; it is not a second project-management product.

---

## 3. Density system

All density values come from tokens. Do not scatter arbitrary spacing values.

Start approximately with:

- nav rail desktop: 52–60 px
- desktop chat list: 280–320 px
- desktop context panel: 300–340 px
- common desktop control height: 28–36 px
- mobile primary control height: 36–44 px where appropriate
- small internal gaps: 4–8 px
- section gaps: 10–16 px
- message grouping gap: 2–6 px

These are starting constraints, not excuses to violate accessibility.

Prefer an 8px-derived spacing scale with 2/4px optical exceptions.

Every change that increases global density/spacing must be checked at:

- compact desktop
- wide desktop
- tablet
- small mobile
- large mobile

---

## 4. Design-system-first rule

Before creating feature UI, determine whether an existing primitive or pattern can express it.

Core primitives:

- Button / IconButton
- Avatar / AvatarGroup
- Badge
- Tabs / SegmentedControl
- SearchField
- Input / Textarea
- Tooltip
- Popover / Menu / ContextMenu
- Dialog
- Sheet / Drawer
- ScrollArea
- VirtualList
- Divider
- Progress
- Skeleton
- EmptyState
- Toast
- PresenceIndicator

Messaging primitives:

- ChatList
- ChatListItem
- ConversationHeader
- MessageList
- MessageGroup
- MessageBubble
- ReplyPreview
- ReactionBar
- Attachment
- VoiceMessage
- Composer
- TypingIndicator
- DeliveryState

Shell primitives:

- AppShell
- NavigationRail
- PrimaryNavigation
- Pane
- ContextPanel
- ResponsivePaneController

Do not duplicate these inside feature folders.

---

## 5. Live Objects — core extensibility primitive

A Live Object is structured state embedded naturally in a conversation.

Initial types:

- poll
- event
- checklist/list
- expense
- static location
- live location
- plan
- decision
- reminder

Later:

- reservation
- ride
- order
- game/activity
- whiteboard
- Mini App

All Live Objects share:

- id
- type
- schema/version
- conversation id
- creator
- created/updated timestamps
- permissions
- lifecycle state
- summary
- type-specific payload

Visual contract:

1. `LiveObjectCard`
2. `LiveObjectHeader`
3. `LiveObjectBody`
4. optional compact preview/visual
5. `LiveObjectFooter` / contextual actions

Do not create unrelated visual systems for Event vs Expense vs Checklist.

Protocol rule:
Live Objects are versioned and evolvable. Unknown future object types must fail gracefully and render a safe unsupported/upgrade state rather than breaking the conversation.

---

## 6. Suggested repository architecture

Use boundaries similar to:

```text
apps/
  seyloq/
    src/
      app/
      routes/
      features/
        chats/
        calls/
        updates/
        search/
        settings/
      entities/
        user/
        conversation/
        message/
        live-object/
      components/
        primitives/
        messaging/
        live-objects/
        shell/
      design-system/
        tokens/
        typography/
        icons/
        motion/
      platform/
      lib/
      test/
    src-tauri/

packages/
  protocol/
  shared/
  ui-contracts/
  testing/

services/
  api/
  realtime/
  media/
  signaling/
  notifications/

infra/
docs/
```

Adapt to actual repository constraints; do not churn structure merely to match this example.

---

## 7. Tauri/native boundary

Treat Tauri as an application architecture, not merely a website wrapper.

Preferred responsibility split:

### React/TypeScript

- product UI
- presentation state
- navigation
- feature composition
- accessibility semantics
- responsive behavior

### Rust/Tauri

- secure platform bridge
- shared native-facing application logic where appropriate
- filesystem/native capabilities
- secure local operations
- IPC command boundary
- performance-sensitive local work where justified

### Kotlin/Swift native plugins

Use where mobile OS integration requires native behavior, including potentially:

- call integration
- background execution
- push/call notification integration
- contacts
- location/background location
- camera/media APIs
- secure storage/biometrics
- OS sharing/deep links

Do not force an OS-specific requirement through a brittle web workaround.

Use least-privilege Tauri capabilities. Never expose broad native commands to every webview/window by default.

---

## 8. Local-first client architecture

The UI should feel immediate even on weak networks.

Target flow:

1. user performs action
2. validate locally
3. persist local intent/message
4. render optimistic state
5. encrypt/prepare transport as required
6. enqueue/send
7. reconcile server acknowledgement
8. update delivery/read state

The local database is not an afterthought.

Design for:

- offline reads
- queued sends
- retries
- idempotency
- ordering
- reconciliation
- attachment upload state
- failed state
- multi-device sync

Never hide synchronization bugs with arbitrary timeouts.

---

## 9. Backend architecture rule

Design logical boundaries now; distribute physically only when needed.

Initial deployable boundaries may be:

- core API
- realtime gateway
- media pipeline
- calling/signaling plane

Logical domains include:

- identity
- users/devices
- contacts
- conversations
- groups
- messages
- Live Objects
- presence
- delivery/read state
- media
- notifications
- calls/signaling
- safety/abuse

Preferred direction:

- Go services/backend
- PostgreSQL
- Valkey/Redis where ephemeral/cache semantics are appropriate
- NATS/JetStream or equivalent event backbone when justified
- WebSockets for realtime application transport
- S3-compatible object storage
- WebRTC for calls
- TURN fallback
- SFU for group calls

Do not introduce Kafka/Kubernetes/multi-region complexity merely to appear scalable.

---

## 10. Provider abstraction / free-resource rule

Free-tier infrastructure is for development and early validation, not a permanent architectural contract.

External providers must sit behind explicit interfaces/adapters when replacement is plausible:

- database hosting
- object storage
- cache
- email/SMS
- push
- maps/geocoding
- AI
- observability
- CI/CD
- call infrastructure

Never scatter vendor SDK calls across product features.

Keep local/self-hosted development possible where practical.

Do not assume a service remains free. Verify current limits before depending on them.

---

## 11. Security and privacy

Communication software handles highly sensitive user data.

Rules:

- never invent cryptography
- never claim E2EE unless the implemented protocol actually provides it
- separate transport encryption from end-to-end encryption
- minimize plaintext server access
- use secure OS storage for secrets
- use least privilege
- protect local databases appropriately
- validate IPC boundaries
- validate uploaded content and metadata
- design abuse/report/block flows
- minimize location retention
- live location must have explicit duration and termination
- sensitive logs must be redacted
- secrets never enter source control
- security-sensitive architecture changes require research/review

Use OWASP MASVS/MASTG as a mobile security verification reference.

Cryptographic/E2EE protocol selection is a dedicated architecture decision and must be researched before implementation.

---

## 12. Accessibility

Compactness never removes accessibility.

Requirements:

- prefer semantic HTML/native controls before ARIA
- keyboard-operable desktop UI
- visible focus
- predictable focus order
- menus/dialogs/listboxes/toolbars follow established keyboard conventions
- accessible names for icon-only actions
- sufficient contrast
- scalable text
- reduced-motion support
- screen-reader meaningful message state
- don't encode status only by color
- touch targets remain usable

Use W3C ARIA Authoring Practices as interaction guidance. Do not add ARIA roles without implementing the behavior that role promises.

---

## 13. Performance

Messenger performance is a product feature.

Must design for:

- virtualized long chat lists
- virtualized long message histories where appropriate
- incremental pagination
- local caching
- thumbnail/preview-first media
- lazy heavy modules
- efficient image decoding
- background upload queues
- minimal rerenders in message streams
- stable list keys
- no entire-conversation rerender for typing/presence updates
- measured bundle growth

Do not optimize blindly; profile first.

---

## 14. State boundaries

Separate:

- server/realtime state
- durable local state
- ephemeral UI state
- navigation state
- optimistic mutation state

Do not create one global store containing the entire app.

Feature modules should expose intentional APIs rather than importing internal stores/components across domains.

---

## 15. Motion

Motion is restrained and functional:

- state continuity
- pane transitions
- sheet/dialog entry
- message insertion
- Live Object expansion
- call-state transitions

Avoid ornamental animation that slows messaging.
Respect reduced-motion preferences.

---

## 16. AI behavior

AI is a capability, not primary navigation.

Good entry points:

- Catch me up
- Transcribe
- Translate
- Summarize plan
- extract action/decision
- semantic search

AI features must:

- be optional
- disclose what content is processed
- respect E2EE/privacy architecture
- degrade cleanly when unavailable
- never block normal communication
- never silently perform consequential actions

---

## 17. Engineering workflow

For every implementation task:

### Step A — Inspect

Read relevant code, contracts, tests, docs, and existing primitives first.

### Step B — Classify

Identify:

- user problem
- affected domain
- UX entry point
- whether this is a primitive, feature, Live Object, platform capability, or backend concern
- mobile/desktop implications
- offline/realtime implications
- privacy/security implications

### Step C — Reuse

Search for existing primitives/contracts before creating new ones.

### Step D — Research when required

Research current official docs/standards before decisions involving:

- Tauri/native capabilities
- mobile OS behavior
- WebRTC/calling
- E2EE/cryptography
- background execution
- push notifications
- security
- accessibility patterns
- external provider limitations
- CI/CD platform constraints

Prefer official documentation and standards.

### Step E — Plan

State the smallest coherent change and acceptance criteria.

### Step F — Implement vertically

Prefer a thin working slice over many disconnected abstractions.

### Step G — Verify

Run relevant:

- format
- lint
- typecheck
- unit tests
- integration tests
- Rust checks/tests
- build
- visual/responsive review
- keyboard/accessibility review

### Step H — Report

Report:

- changed behavior
- architecture decisions
- tests/results
- known limitations
- screenshots/preview where UI changed
- next logical step

Do not silently continue into another phase after the requested scope is complete.

---

## 18. UX review gate for every feature

Before considering a UI feature complete, verify:

1. Does a normal chat-only user encounter unnecessary complexity?
2. Did global navigation grow?
3. Could this be contextual instead?
4. Is it compact at desktop and mobile sizes?
5. Is the primary action obvious?
6. Are secondary actions visually quieter?
7. Does it reuse existing primitives?
8. Does it preserve message readability?
9. Does it work by keyboard on desktop?
10. Does it remain usable with touch?
11. Does empty/loading/error/offline state exist?
12. Does dark mode/theme behavior remain coherent?
13. Does it work with long names/text/localization?
14. Does it degrade if the advanced capability is unavailable?

If several answers fail, redesign before expanding implementation.

---

## 19. Anti-patterns — reject these

- adding a sidebar item for every feature
- giant dashboard cards
- excessive whitespace marketed as "premium"
- feature-specific spacing/color systems
- hard-coded provider SDKs throughout features
- UI coupled directly to database records
- business logic buried in React components
- cryptography invented in application code
- fake E2EE claims
- arbitrary z-index values everywhere
- nested modals
- horizontal scrolling as a normal app layout
- desktop UI that is just enlarged mobile
- mobile UI that is a squeezed desktop grid
- duplicated primitives
- one massive global state store
- speculative microservices
- premature Kubernetes
- introducing dependencies without checking maintenance/security/need
- breaking offline behavior for online-only convenience
- adding AI where a deterministic interaction is better

---

## 20. Foundation implementation order

Unless current repository state requires otherwise:

### Foundation 01 — Shell + design system

- Tauri app boots
- React/TS foundation
- tokens
- typography
- icons
- primitives
- desktop shell
- mobile shell
- responsive pane behavior
- Chats / Updates / Calls
- deterministic mock data
- conversation screen
- context panel
- composer
- base Live Object card

### Foundation 02 — Messaging UI primitives

- grouping
- replies
- reactions
- delivery states
- media
- voice note shell
- menus
- virtualized histories

### Foundation 03 — Local data/state contracts

- local DB abstraction
- repositories
- outbox
- optimistic state
- sync state machine contracts

### Foundation 04 — Backend/realtime foundation

- identity/device contracts
- conversations/messages
- websocket gateway
- persistence
- acknowledgements/idempotency

Then implement real messaging before advanced product breadth.

---

## 21. Definition of done

A change is not done because it renders.

It is done when:

- architecture boundaries are respected
- compact UX is preserved
- responsive states work
- loading/empty/error/offline states are considered
- keyboard/accessibility behavior works where applicable
- security/privacy implications are handled
- tests cover important logic
- relevant checks pass
- no unexplained warnings/errors remain
- documentation/contracts are updated if behavior changed
- no unrelated scope was introduced

---

## 22. Product-owner escalation conditions

Stop and present evidence/options before proceeding when:

- a decision changes primary navigation
- a decision changes core protocol/schema compatibility
- choosing/changing E2EE design
- changing Tauri/native architecture
- introducing a major infrastructure dependency
- introducing a paid-only dependency into the baseline
- changing Live Object core contract
- making a privacy/security tradeoff
- choosing a workaround that conflicts with platform guidance
- a feature cannot fit compactly without degrading basic messaging

Do not make ad-hoc architectural fixes merely to unblock a task.

---

## 23. Guiding sentence

**Seyloq should reveal power without displaying complexity.**

When uncertain, choose the implementation that keeps ordinary communication obvious, fast, compact, private, and reliable while preserving clean extension points for advanced capabilities.
