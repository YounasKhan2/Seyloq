# ADR-001: Tauri 2 + React + TypeScript Foundation

## Status

Accepted for SEY-001.

## Context

Seyloq must become a cross-platform communication app for Windows, macOS, Linux, Android, and iOS. The client direction is Tauri 2, React, TypeScript, Rust, and later native Kotlin/Swift plugins where operating-system integration requires them.

## Decision

Use a Vite-powered React/TypeScript frontend under `apps/seyloq/src` and a Tauri 2 Rust application under `apps/seyloq/src-tauri`.

The React layer owns product UI, responsive composition, accessibility semantics, and deterministic presentation state. The Rust/Tauri layer owns the secure platform bridge and is currently limited to a tiny command surface plus Tauri core defaults.

## Trade-offs

Electron would have broader desktop ecosystem familiarity, but it conflicts with the project direction and carries a heavier runtime. A web-only PWA would be simpler now, but would not establish the native platform boundary needed for future desktop/mobile integrations. Tauri 2 introduces more Rust/toolchain complexity, but it aligns with future mobile and least-privilege native access.
