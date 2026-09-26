# ADR-003: Messaging UI Primitives and Long-History Strategy

## Status

Accepted for SEY-002 implementation.

## Decision

Seyloq now treats messages as presentation-domain records with stable IDs, explicit message kinds, reply references, reactions, attachments, voice metadata, delivery state, and edited state.

Message rendering is isolated in `components/messaging.tsx`. The shell continues to own pane composition and primary navigation only.

For SEY-002, full virtualization is deferred. The deterministic fixture includes a longer history to exercise grouping, scrolling, mixed media, Live Objects, and stable message lookup without introducing variable-height virtualization risk. Future virtualization should be introduced behind the `MessageList` boundary after measuring real long histories and choosing a library that handles variable-height rows, jump-to-message, prepending older history, media loads, and Live Objects without scroll instability.

## Rationale

Messenger rows have naturally variable heights: text, galleries, files, voice messages, replies, Live Objects, and future structured cards. Premature virtualization would add complexity before the interaction model is stable. The current boundary keeps stable message IDs and scroll/jump behavior ready for a measured virtualization pass.
