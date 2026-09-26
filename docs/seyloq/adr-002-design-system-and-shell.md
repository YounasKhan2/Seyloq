# ADR-002: Compact Design System and Responsive Shell

## Status

Accepted for SEY-001.

## Decision

Seyloq uses semantic CSS tokens for colors, surfaces, foreground hierarchy, borders, spacing, radii, typography, control heights, pane dimensions, shadows, motion, and layers.

The initial shell implements:

- desktop: `NavigationRail | ChatList | Conversation | ContextPanel`
- tablet: `ChatList | Conversation`, with context as an overlay
- mobile: single conversation surface with bottom `Chats · Updates · Calls` navigation

Live Objects share one card grammar with header, body, and footer sections.

## Rationale

The shell gives messaging priority while allowing structured objects to appear naturally inside chat. Context is useful on desktop but collapses before the conversation becomes cramped. Mobile avoids a squeezed desktop layout and keeps primary navigation to the approved three destinations.
