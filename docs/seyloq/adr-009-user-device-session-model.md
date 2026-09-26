# ADR-009: User, Device and Session Model

## Status

Proposed for SEY-004 human review.

## Decision

Identity, devices and sessions must be implemented before production realtime messaging.

Seyloq needs this hierarchy:

```text
User
  Device
    Session / Credential
      Connection
```

A message is authored by a user and produced by a device. The protocol must carry both `senderUserId` and `senderDeviceId` for client operations. A connection is transient and belongs to an authenticated session on a device.

## Model

`User` is the account and conversation membership subject.

`Device` is a durable installation or enrolled client. It has its own ID, authorization state, and future E2EE key material. One user can have multiple active devices.

`Session` is a revocable credential grant for a device. It can expire or rotate without changing the device's durable identity.

`Connection` is a WebSocket or HTTP request context authenticated by a session. It is not durable identity.

Conversation membership authorizes user participation. Device authorization determines whether a particular device may submit operations for that user and receive sync.

## Revocation

If a device is revoked, new submissions from that device fail with `device_revoked`. Offline operations created before revocation remain locally visible on the revoked device, but the backend must reject them unless a product decision later allows recovery/export. Other active devices learn revocation through sync.

## Evidence

OWASP MASVS storage guidance treats sensitive local data and credentials as mobile security concerns. Device private credentials, refresh tokens and future E2EE keys must not be ordinary SQLite data. They need OS secure storage or hardware-backed storage where available.

Realtime transport cannot safely precede device/session design because the backend would not know which durable device created an operation, whether that device is still authorized, or which other devices should receive the user's own sent messages.

## Alternatives

### User-Only Auth for Messaging

Rejected. User-only auth cannot answer which device produced an offline operation, how revocation works, or how future E2EE key ownership maps to devices.

### Session as Device

Rejected. Sessions rotate and expire; devices are durable principals for sync, revocation, notification, and future key ownership.

## Future Consequences

SEY-005 should implement identity/device/session foundations before real backend messaging. WebSocket authentication should require a valid session and bind each connection to a user ID, device ID, and session ID.
