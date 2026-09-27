# SEY-007 - UX Prototype & Validation

Pass 01: Core Messenger Golden Flow  
Baseline: `d0590d4aa44a81110957b5a47b9a4a1370ea2711`  
Branch: `design/sey-007-prototype-validation-pass-01`

## Golden Flow Implemented

The prototype validates:

```text
Launch -> Chats -> Conversation -> Message interaction -> Composer -> Turn Into -> Live Object -> Context -> ordinary chat
```

The implementation remains in the existing Seyloq React/Tauri app and reuses the established shell, messaging, primitive, fixture, and Live Object components. It does not introduce backend, auth, realtime infrastructure, encryption, media backend, AI provider, semantic search, call infrastructure, or notification services.

## Desktop Screens

- `Navigation Rail | Chat List | Conversation | Context Panel` is the primary review layout.
- Chats root includes avatar identity, global search affordance, New Chat, filters, realistic rows, unread, muted, pinned, draft, pending, timestamp, preview, and archived entry.
- Conversation shows the Hunza Trip group with text, reply, reactions, image/media, file, voice note, delivery/read state, queued offline message, Live Objects, and activity records.
- Context panel contains Participants, Upcoming, Lists, Money, Places, Media, Files/Links, Settings, and a quiet dismissible Plan teaser.

## Mobile Screens

- Mobile root shows `Header | Chats | Bottom navigation`.
- Active conversation is a pushed route with compact header, message stream, composer, hidden bottom nav, and Back to Chats.
- Long press opens the same message actions as desktop context menu.
- Context uses the existing sheet-style overlay at mobile width.

## Responsive Notes

- Desktop preserves the SEY-006 four-region shell.
- At tablet width the rail disappears and the app uses `Chat List | Conversation`; Context becomes an overlay.
- At mobile width the app uses route-like list/conversation states; Context and Turn Into use sheet-style overlays.

## Component Reuse

- Reused: `AppShell`, `NavigationRail`, `ChatList`, `ConversationPane`, `MessageItem`, `MessageMenu`, `MessageComposer`, `LiveObjectCard`, `Avatar`, `Badge`, `IconButton`, `SearchField`.
- Extended: `LiveObjectCard` footer now displays friendly sync/source state; `MessageMenu` now launches the Turn Into candidate flow.
- Added prototype-only state in `App.tsx` for created Live Object messages from Turn Into.

## Interaction And State Inventory

- Message actions: Reply, React, Copy, Forward, Star, Select, Edit, Delete, Turn Into.
- Desktop message menu: hover button and right-click.
- Mobile message menu: long press.
- Composer states represented: empty, typing, reply/edit hooks, attachment menu, voice button, sending/queued/offline, failed retry.
- Offline validation: queued message says `Waiting for connection`; banner can simulate offline and reconnect.
- Turn Into: source message remains visible; Event candidate must be confirmed before a Live Object appears.

## Fixture Inventory

- Primary group: Hunza Trip.
- Source message: `Let's leave for Hunza Friday morning and come back Monday.`
- Event result: `Hunza weekend trip`.
- Contrasting object: `Breakfast stop` poll.
- Existing structured objects: checklist, expense, live location, event.
- Media fixtures: Rakaposhi image preview, itinerary PDF, route video, voice note.
- Chat rows include Family, Design Circle, Omar, draft, pinned, muted, unread, and pending examples.

## Accessibility Notes

- Primary nav, mobile nav, conversation, context, message list, menu, and dialog use semantic labels/roles.
- Keyboard escape exits open menus, selection, and composer mode.
- Focus outlines remain global and visible.
- Touch and pointer affordances are represented for long press and context menu.
- Status and sync states include text, not color alone.
- Reduced-motion preference disables typing animation.

## Architecture Compliance Matrix

| SEY-006 rule                                                      | Prototype status |
| ----------------------------------------------------------------- | ---------------- |
| Primary nav is Chats, Updates, Calls                              | Implemented      |
| Desktop shell is Rail/List/Conversation/Context                   | Implemented      |
| Mobile hides bottom nav inside conversation                       | Implemented      |
| Chat remains normal first                                         | Implemented      |
| Message actions keep Reply/React common and Turn Into in overflow | Implemented      |
| Live Objects share one grammar                                    | Implemented      |
| Context is derived, not a second conversation                     | Implemented      |
| Plan is only a subtle teaser                                      | Implemented      |
| Offline messaging shows pending/retry honestly                    | Implemented      |
| Backend/auth/realtime/security scope excluded                     | Preserved        |

## UX Risks

- The Turn Into candidate form is intentionally constrained and needs future extraction confidence states.
- Mobile Back is prototype-local state, not real router history yet.
- Context grouping is fixture-driven; later work must derive categories from native state.
- Poll/checklist interactions are display-level only in this pass.

## Frozen Rules Touched

- Primary navigation freeze.
- Desktop/tablet/mobile shell behavior.
- Message taxonomy and action hierarchy.
- Composer state model.
- Turn Into taxonomy.
- Live Object grammar and sync language.
- Context group model.
- Offline product law.

## Architecture Rules Not Exercised Yet

- Calls root and call lifecycle.
- Updates/Status/Channels/Communities.
- Identity onboarding, contact discovery, and device management.
- Settings/privacy/security flows.
- Search overlays and result-source navigation.
- Real backend acknowledgement protocol.
- Native SQLite runtime exposure for structured prototype state.

## Screenshot Targets

Expected review captures:

- Desktop golden flow: `docs/seyloq/screenshots/sey-007-pass-01-desktop.png`
- Mobile chats root: `docs/seyloq/screenshots/sey-007-pass-01-mobile-chats.png`
- Mobile conversation: `docs/seyloq/screenshots/sey-007-pass-01-mobile-conversation.png`

## Verification Evidence

- `npm run typecheck`
- `npm run build`
- Targeted Prettier on changed source and documentation
- Browser preview screenshots at desktop and mobile widths

## Git Report

- Parent SHA: `d0590d4aa44a81110957b5a47b9a4a1370ea2711`
- Branch: `design/sey-007-prototype-validation-pass-01`
- Main is not modified directly.
