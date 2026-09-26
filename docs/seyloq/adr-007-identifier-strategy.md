# ADR-007: Identifier Strategy

## Status

Proposed for SEY-004 human review.

## Decision

Use UUIDv7 as Seyloq's permanent distributed identifier format for protocol-visible durable entities.

Primary entities use UUIDv7:

- user
- device
- session
- conversation
- message
- outbox operation
- attachment
- Live Object

Use canonical lowercase UUID text at protocol boundaries and in logs. Store as native `uuid` in PostgreSQL. Store as 16-byte big-endian `BLOB` in SQLite where practical, with canonical text acceptable in diagnostics and migration tooling.

## Evidence

RFC 9562 standardizes UUIDv7. UUIDv7 places a Unix millisecond timestamp in the high bits and random bits in the remaining space, making values time-ordered while preserving distributed generation. RFC 9562 also states UUIDv6 and UUIDv7 are designed to sort as opaque raw bytes and in textual representation.

PostgreSQL has a native `uuid` type and PostgreSQL 18 documentation describes built-in UUIDv4 and UUIDv7 generation support while allowing storage of any UUID version in the same `uuid` column.

Maintained ecosystem support exists across Seyloq's target languages:

- TypeScript: the `uuid` npm package exposes `v7()`.
- Rust: the `uuid` crate supports UUIDv7 with the `v7` feature.
- Go: `github.com/google/uuid` exposes `NewV7`.

SQLite has no UUID storage class. Its storage classes include `TEXT` and `BLOB`, so the native store should prefer 16-byte `BLOB` values for compact indexed storage while converting to canonical text at protocol boundaries.

## Alternatives

### ULID

ULID is compact, readable, lexicographically sortable, and widely implemented. The Go `oklog/ulid` package provides monotonic entropy helpers, but it also warns about entropy source and concurrency caveats. ULID is a strong format, but it is not an IETF/RFC UUID format and does not map into PostgreSQL's native `uuid` type.

### UUIDv4

UUIDv4 is mature and collision-resistant, but random primary keys are worse for database index locality than time-ordered IDs and do not help optimistic local ordering.

## Trade-Offs

UUIDv7 exposes creation-time shape in identifiers. It must not be treated as sensitive ordering truth. It is excellent for locality and correlation, not authorization or secrecy.

UUIDv7 time ordering is an identity convenience only. Authoritative message order remains a server-assigned conversation sequence.

## Future Consequences

SEY-005 should replace the SEY-003 temporary monotonic IDs with UUIDv7 across TypeScript and Rust before backend protocol lock-in. Go backend code should use the same UUIDv7 textual protocol representation and PostgreSQL `uuid` columns.
