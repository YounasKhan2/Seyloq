# SEY-006 - Complete Product UX Architecture

Pass 04: Calls & Realtime Communication  
Base: SEY-006 Pass 01, Pass 02, and Pass 03

## 01. Calling Design Laws

Calling is a natural extension of conversation. Seyloq should support modern consumer audio/video communication without becoming enterprise conferencing software.

Product laws:

- Calling is communication, not meeting management.
- Starting a normal call should take very little effort.
- Audio and video calls share one conceptual call model.
- 1:1 and group calling share primitives but may differ where necessary.
- Network degradation must never make UI dishonest.
- Camera and microphone permission failures must be understandable.
- Ending a call must always be easy.
- Calls remain connected to conversation identity.
- Group calls do not create a second membership system.
- Advanced capabilities stay progressively disclosed.
- Mobile and desktop call UX should respect platform differences.
- Safety and privacy controls remain reachable during calls.
- Future Together Mode builds on calling instead of replacing calling.

Global navigation remains:

- Chats
- Updates
- Calls

`Calls` remains primary because users need call history, missed calls, returning calls, and starting calls outside an open conversation.

## 02. Capability Model

Capability categories:

| Capability                        | Architecture status   | Initial-release candidacy             |
| --------------------------------- | --------------------- | ------------------------------------- |
| 1:1 audio                         | Required              | Yes                                   |
| 1:1 video                         | Required              | Yes                                   |
| Group audio                       | Required              | Likely                                |
| Group video                       | Required              | Likely, size-limited                  |
| Screen sharing                    | Future-compatible     | Later unless product approves         |
| Call links                        | Future-compatible     | Later                                 |
| Add participant                   | Future-compatible     | Later or limited                      |
| Device switching                  | Required architecture | Desktop likely; mobile platform-aware |
| Picture-in-picture/minimized call | Required architecture | Yes, platform-dependent               |
| Background calls                  | Required architecture | Native/platform work later            |
| Low-bandwidth mode                | Required architecture | UX support early                      |
| Together Mode                     | Future-compatible     | Later                                 |

Do not promise unsupported participant counts, media quality, or platform capabilities before backend/native architecture exists.

## 03. Entry-Point Architecture

Valid call entry points:

| Entry                   | Purpose                                          | Expected behavior                                                               |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------- |
| Conversation header     | Fast call from active chat                       | One tap starts audio/video flow unless permission/meaningful choice is required |
| Calls destination       | History, missed calls, returning calls, new call | Search and recent/missed list                                                   |
| Contact/profile context | Call from person detail                          | Resolves to same call model                                                     |
| Conversation info       | Call from group/person context                   | Resolves to conversation call                                                   |
| Search result           | Call found person/conversation                   | Uses same permission and identity checks                                        |
| Call link               | Future join path                                 | Join preview then join                                                          |

Conversation header examples:

```text
Ahmed       Audio  Video  More
Hunza Trip  Audio  Video  More
```

Avoid confirmation unless permissions are missing, user must choose a meaningful option, or calling would have unusual consequences.

## 04. Calls Home

Calls Home composition:

```text
CallsHeader
CallSearch
CallFilter
CallHistoryList
CallHistoryItem
NewCallAction
```

Initial filters:

- All
- Missed

Do not start with extra filters such as Incoming, Outgoing, Video, Audio, Groups, Recorded, or Scheduled unless consumer usage proves the need.

Empty states:

- No call history
- No missed calls
- No matching people/calls

Calls Home should remain a compact communication surface, not analytics/history dashboard.

## 05. Call-History Grammar

Call history item grammar:

```text
Avatar / group avatar
Name
Direction/status
Audio/video indicator
Timestamp
Return-call action
```

Examples:

```text
Ahmed
Missed audio
10:42 AM                 Call
```

```text
Hunza Trip
Group video · 5 participants
Yesterday                Video
```

Status must not rely on color alone.

Visible user distinctions:

- Missed
- Answered
- Outgoing
- Declined
- Failed
- Group call joined
- Group call missed

Protocol details and media transport failures remain hidden behind human-readable labels.

## 06. Call Lifecycle

Canonical lifecycle:

```text
idle
  -> preparing
  -> ringing / incoming
  -> connecting
  -> connected
  -> reconnecting
  -> ended
```

Alternative terminal branches:

```text
declined
missed
cancelled
failed
busy_unavailable
permission_blocked
```

Group-call additions:

```text
available_to_join
  -> joining
  -> joined
  -> left
  -> call_continues
```

Lifecycle state is separate from media state and network state. A call can be connected while camera is off. A call can be reconnecting while microphone permission remains granted.

## 07. Media-State Model

Media states:

| Media          | States                                                   |
| -------------- | -------------------------------------------------------- |
| Microphone     | on, muted, unavailable, permission_denied                |
| Camera         | on, off, unavailable, permission_denied                  |
| Speaker/output | selected_device, unavailable                             |
| Screen share   | inactive, selecting_source, active, interrupted, stopped |
| Network        | good, degraded, poor, reconnecting, offline              |

Rules:

- Connected call with camera off is still connected.
- Muted microphone is different from microphone unavailable.
- Camera permission denied can still allow audio call.
- Screen sharing must always show a clear active indicator and stop action.

## 08. 1:1 Audio Architecture

Outgoing audio flow:

```text
Tap audio call
  -> preparing
  -> calling Ahmed
  -> ringing
  -> connected
```

Surface includes:

- Identity
- Call type
- Status
- Mute
- Speaker/output
- Add video
- More
- End call

Keep initial UI light. Advanced controls move behind More or device surface.

Failure paths:

- Microphone permission blocked.
- Remote unavailable.
- Network failure.
- User cancels before answer.
- Remote declines.

## 09. 1:1 Video Architecture

Outgoing video flow:

```text
Tap video
  -> permission/readiness check when needed
  -> calling
  -> remote answer
  -> connected video
```

Graceful degradation:

| Condition                 | UX                                    |
| ------------------------- | ------------------------------------- |
| Camera permission denied  | Offer audio-only if microphone works  |
| Camera unavailable        | Continue with audio                   |
| Weak network              | Reduce video quality or suggest audio |
| User disables camera      | Show avatar/camera-off state          |
| Remote answers audio-only | Stay connected as audio-focused call  |

Do not fail the entire call when audio can continue and user consent allows it.

## 10. Incoming-Call Architecture

Incoming call surfaces must account for:

- App foreground.
- App background.
- Device locked.

Future native behavior is required for background/locked-device incoming calls. This pass only defines UX requirements.

Incoming audio:

```text
Ahmed
Seyloq audio call

Decline    Answer
```

Incoming video:

```text
Ahmed
Seyloq video call

Decline    Answer audio    Answer
```

`Answer audio` is useful where video privacy matters and should remain a Product Owner decision for first release.

Foreground in-app incoming call must not destroy current draft, scroll position, Context, Plan, or Space state.

## 11. Connected-Call Architecture

Connected audio default controls:

- Mute
- Audio output / speaker
- Video
- More
- End

Connected video structure:

```text
Remote participant/video
Local preview
Call status
Compact controls
```

Connected video controls:

- Mute
- Camera
- Switch camera on mobile
- Audio output
- More
- End

Advanced controls:

- Add person
- Screen share
- Chat
- Safety
- Together Mode later

Controls may auto-hide on video surfaces but must be easy to recover.

## 12. Group-Call Architecture

Group call entry from a group:

```text
Hunza Trip -> Start audio/video call
```

Size-aware behavior:

| Group size/context           | Recommended behavior                        |
| ---------------------------- | ------------------------------------------- |
| Small trusted group          | Ring or invite participants                 |
| Larger group                 | Start joinable call activity                |
| Very large community/channel | Future voice-room/live-session architecture |

Joinable group call card:

```text
GROUP CALL
Ahmed, Ali + 2 others
00:18:42

Join
```

Ended group call row:

```text
Group call ended · 42 min
5 participants
```

Treat call cards/rows as conversation activity/system records unless future architecture finds a strong reason to model them as Live Objects.

## 13. Group Participant Model

Participant properties:

- Identity.
- Speaking state.
- Muted state.
- Camera state.
- Screen sharer state.
- Connection quality only when useful.
- You/current user marker.

Expanded participant list example:

```text
Participants · 6

Ahmed      Speaking
Ali        Muted
Younas     You
Sara       Camera off
```

Avoid enterprise host controls unless group moderation later requires them.

## 14. Group Video Layouts

Responsive layout direction:

| Call size           | Layout                         |
| ------------------- | ------------------------------ |
| 2-4 participants    | Balanced grid                  |
| 5-8 participants    | Active speaker plus strip/grid |
| Larger future calls | Speaker-focused pagination     |

Active speaker:

- Visually clear.
- Does not rely only on color.
- Avoids constant disruptive resizing.
- Respects reduced motion.
- Tolerates background noise.

Do not design a conferencing control room.

## 15. Add-Participant Model

Add participant flow:

```text
Add person
  -> search conversation/contact
  -> invite
```

Architecture decisions:

- 1:1 becoming group call needs explicit identity/membership behavior.
- Temporary call participant is different from group member.
- Do not silently add a temporary call participant to the underlying group.
- Product Owner must decide whether add-person ships initially.

## 16. In-Call Chat

Do not create separate ephemeral meeting chat by default.

Recommended direction:

```text
1:1 call -> existing 1:1 conversation
group call -> existing group conversation
```

During call, Chat opens or overlays the canonical conversation. Messages remain normal conversation messages and can include Live Objects, Plans, or Space references according to existing architecture.

## 17. Screen Sharing

Future-compatible screen-sharing states:

```text
inactive
  -> selecting_source
  -> active
  -> paused_or_interrupted
  -> stopped
```

Requirements:

- Clear active indicator: "You're sharing your screen".
- Obvious Stop sharing action.
- Source selection on desktop where needed.
- Privacy warning when appropriate.
- Interrupted state if OS/source revokes sharing.

Never make screen sharing difficult to stop.

## 18. Device/Audio Routing

Desktop device selection:

```text
Audio & video
Microphone  USB Mic
Speaker     Headphones
Camera      Webcam
```

Desktop handles:

- Microphone selection.
- Camera selection.
- Speaker/output selection.
- Device disappearance while active.

Mobile routing:

- Earpiece.
- Speaker.
- Bluetooth.
- Wired device.

Rules:

- Do not expose unavailable routes.
- Mobile camera switching uses front/rear metaphor.
- Desktop normally uses camera device picker instead of switch-camera metaphor.

## 19. Permission Architecture

Possible permissions:

- Microphone.
- Camera.
- Notifications.
- Bluetooth/device access where platform requires.
- Screen capture.

Permission state machine:

```text
not_requested
  -> requesting
  -> granted
  -> denied
  -> blocked_system_settings_required
```

Rules:

- Permission requests are contextual.
- Audio call asks for microphone when needed.
- Video asks for camera when needed.
- Screen share asks for screen capture when needed.
- Do not request camera, microphone, notifications, and contacts at install time.

Failure UX example:

```text
Microphone access is off.
Seyloq needs microphone access for calls.

Open Settings
```

If video permission fails but microphone works, offer Continue with audio where appropriate.

## 20. Network/Degradation UX

User-facing network states:

- Good.
- Degraded.
- Poor.
- Reconnecting.
- Offline.

Possible copy:

- Connection is unstable.
- Video quality reduced.
- Reconnecting...
- Call ended because the connection was lost.

Adaptive degradation hierarchy:

```text
high-quality video
  -> reduced video quality
  -> reduced frame rate/resolution
  -> audio-focused
  -> reconnecting
```

Do not claim exact codec or transport behavior before media architecture exists.

## 21. Reconnection/Failure UX

Reconnecting:

- Preserve call UI.
- Show clear status.
- Do not instantly show "Call ended" until termination is authoritative.
- Let user end manually.

Human-readable failures:

- Couldn't connect.
- Ahmed is unavailable.
- Call ended because the connection was lost.
- Microphone isn't available.
- Camera isn't available.

Recovery actions:

- Try again.
- Call audio-only.
- Check settings.
- Return to conversation.

Avoid technical labels such as ICE failed, TURN timeout, SFU unavailable, or DTLS error.

## 22. End/Post-Call Behavior

Ending call:

- One obvious End control.
- Usually no confirmation.
- Confirmation only when ending a large group call for everyone exists as a distinct authority.

Differentiate when necessary:

- Leave call.
- End call for everyone.

Post-call:

```text
Call ends -> originating context restored
```

Preserve:

- Draft.
- Scroll.
- Context state.
- Plan/Space state.

Call activity may appear in conversation and Calls history.

## 23. Conversation Activity Integration

Conversation call rows:

```text
Audio call · 18 min
Missed video call
Group call · 5 participants · 42 min
```

Rules:

- Rows are conversation activity/system records.
- Do not clutter chat with connection events.
- Significant call activity only.
- Joinable group call card can appear temporarily while active.
- Activity row links to call detail when useful.

## 24. Missed-Call Model

Missed calls surface in:

- Calls tab.
- Relevant conversation, optionally.
- System notification, when infrastructure exists and settings allow.

Badge policy:

| Signal                         | Purpose                                   |
| ------------------------------ | ----------------------------------------- |
| Calls tab badge                | User has missed call(s) to review         |
| Conversation unread/system row | Conversation-specific missed call context |
| Push/native notification       | Timely alert while away                   |

Avoid duplicate noise. Muted conversations, blocked users, and platform Do Not Disturb affect call notifications and badges according to future policy.

## 25. Notification Concepts

Notification concepts:

- Incoming call.
- Missed call.
- Group call started.
- Call invitation.
- Call link invitation future.

Notification behavior respects:

- Conversation mute.
- Do Not Disturb/platform rules.
- Blocked users.
- Conversation notification settings.
- Group size behavior.

Push/native notification infrastructure is out of scope.

## 26. Safety/Privacy Model

Safety:

- Blocked users cannot initiate normal calls.
- During a call, Block, Report, and Leave remain reachable behind safety/more controls.
- Group-call moderation needs later dedicated architecture.

Privacy indicators:

- Camera active.
- Microphone active.
- Screen sharing active.
- Live participant presence.

Rules:

- Never hide capture/sharing state.
- Do not claim E2EE for calls until implemented protocol guarantees it.
- Future encryption indicators must reflect real implementation guarantees.

## 27. Minimized/PiP Architecture

Calls must coexist with messaging.

Flow:

```text
Full call
  -> minimized call
  -> continue using Seyloq
  -> restore call
```

Mini call surface:

```text
Ahmed · 12:41    Muted?    Restore
```

Rules:

- Mini surface shows essential state only.
- Call persists across conversation, Context, Plan, and Space navigation.
- Mobile may rely partly on OS PiP/native behavior later.
- Seyloq-owned mini call should remain accessible and non-obstructive.

## 28. Messaging/Space Coexistence

Users should be able to:

- Minimize call.
- Open conversation.
- Send message.
- View Live Object.
- Open Context.
- Open Plan.
- Open Space.
- Return to call.

Calls launched from a Space should preserve Space state. Whether call end returns to Space or canonical Chat is a Product Owner decision.

Call state must not be tightly coupled to a single screen.

## 29. Together Mode Compatibility

Together Mode is future scope.

Compatibility model:

```text
Call Session
  Media
  Participants
  Optional Shared Surface
```

Potential future shared surfaces:

- Checklist.
- Trip Plan.
- Poll.
- Shared photos.
- Whiteboard later.

Reserve future contextual action labels such as Together or Share activity, but do not expose them before the feature exists.

## 30. Call-Link Compatibility

Future call-link flow:

```text
Create call link
  -> Share through Seyloq or externally
  -> Recipient opens
  -> Identity/join preview
  -> Join
```

Future decisions:

- Authentication required?
- Guest joining?
- Expiry?
- Revocation?
- Group association?
- Abuse controls?

Do not implement call-link infrastructure in this pass.

## 31. Large-Group Behavior

Size-aware behavior:

```text
small group -> ring/invite participants
larger group -> joinable call activity
very large community/channel -> future voice-room/live-session architecture
```

Consumer safety:

- A 200-member group should not ring 200 devices without deliberate policy.
- Participant limits must be honest.
- If capacity exists later, UI can show "Call is full".

Very large live-session architecture is out of scope.

## 32. Low-Bandwidth Model

Low-bandwidth UX:

- Turn off video.
- Use audio.
- Retry.
- Continue reconnecting.
- Optional future "Use less data for calls" setting.

Rules:

- Do not assume specific codecs or media routing.
- UI should support graceful degradation.
- The user should understand what changed and why.

## 33. Background Behavior

Desired behavior:

```text
active call
  -> app backgrounded
  -> call continues where platform permits
```

Platform requirements:

| Platform | Future requirement                                              |
| -------- | --------------------------------------------------------------- |
| Android  | Foreground service/notification, audio focus, background limits |
| iOS      | Call/background audio integration where allowed                 |
| Windows  | Audio device handling, background window behavior               |
| macOS    | Audio/video permissions, screen capture, PiP/window behavior    |
| Linux    | Device permissions and desktop-environment variability          |

Do not pretend platforms behave identically. Native integration comes later.

## 34. Multi-Device Boundary

Future multi-device expectations:

```text
incoming call rings eligible devices
  -> one device answers
  -> other devices stop ringing
```

Potential future:

- Move call to another device.
- Continue call from desktop after answering on mobile.

Do not design full cross-device handoff now. Record protocol requirement for answer race, device identity, and call ownership.

## 35. Accessibility

Call accessibility requirements:

- Keyboard controls.
- Screen reader announcements.
- Visible focus.
- Accessible mute/camera state.
- Captions compatibility later.
- Large text.
- High contrast.
- Reduced motion.
- Non-color indicators.
- Touch targets.

Semantic examples:

- "Mute microphone" then "Unmute microphone".
- "Turn camera off" then "Turn camera on".
- "End call".
- "Stop sharing screen".

All critical actions must have accessible labels.

Keyboard shortcuts may exist for mute, camera, end call, and focus controls only if justified. All functionality remains reachable without shortcuts.

## 36. Responsive Architecture

Responsive call layout:

| Viewport         | Participant layout             | Local preview                 | Controls        | Panels                          | Chat access           | Screen sharing       | Minimized call          | Device controls |
| ---------------- | ------------------------------ | ----------------------------- | --------------- | ------------------------------- | --------------------- | -------------------- | ----------------------- | --------------- |
| Mobile portrait  | Single focus or compact grid   | Corner, avoids controls/faces | Bottom controls | Sheet                           | Minimize then chat    | Future limited       | Mini overlay/native PiP | Route picker    |
| Mobile landscape | Wider video focus              | Corner/side                   | Edge controls   | Sheet                           | Minimize              | Future limited       | Mini overlay/native PiP | Route picker    |
| Tablet portrait  | Focus + strip                  | Movable constrained           | Bottom/side     | Sheet/panel                     | Split if width allows | Future               | Floating mini           | Compact picker  |
| Tablet landscape | Grid/focus layout              | Corner                        | Bottom/side     | Temporary panel                 | Side panel possible   | Future               | Floating mini           | Picker          |
| Desktop compact  | Focus layout                   | Floating preview              | Bottom controls | Popover/panel                   | Conversation switch   | Source dialog future | Mini window/bar         | Device picker   |
| Desktop normal   | Focus/grid                     | Floating preview              | Bottom controls | Optional participant/chat panel | Side panel            | Source dialog future | Mini window/bar         | Device picker   |
| Desktop wide     | Grid/focus plus optional panel | Floating preview              | Bottom controls | Participant/chat panel          | Side panel            | Source dialog future | Mini window/bar         | Device picker   |

Do not surround video with permanent unused chrome.

## 37. Component Hierarchy

Reusable components:

```text
CallsHome
  CallsHeader
  CallSearch
  CallFilter
  CallHistoryList
  CallHistoryItem
  NewCallFlow

CallShell
  CallHeader
  CallStage
  CallControls
  CallControl
  CallStatus
  CallTimer

ParticipantTile
ParticipantGrid
ParticipantStrip
ParticipantList
LocalPreview
ActiveSpeakerIndicator

IncomingCallSurface
OutgoingCallSurface
JoinCallSurface
PreJoinSurface

DevicePicker
AudioRoutePicker
PermissionState
NetworkState
ReconnectingState

ScreenShareSurface
MinimizedCall
CallActivityRow
CallDetail
```

Avoid duplicated component systems for audio and video when shared primitives work.

## 38. Conceptual Data Model

UX entities:

```text
Call
CallParticipant
CallMediaState
CallHistoryEntry
CallInvitation
CallLink
CallActivity
```

Relationship:

```text
Conversation
  Call
    Participants
    Media states
    Lifecycle
    Activity/history
```

Group membership and call participation are different concepts. A temporary call participant is not automatically a group member.

## 39. State Machines

Outgoing call:

```text
idle
  -> preparing
  -> calling
  -> ringing
  -> connecting
  -> connected
  -> ended
```

Branches:

```text
preparing -> permission_blocked
calling -> cancelled
ringing -> declined / unavailable / missed_timeout
connecting -> failed
```

Incoming call:

```text
incoming
  -> answered
  -> connecting
  -> connected
```

Branches:

```text
incoming -> declined
incoming -> missed
incoming -> answered_audio_only
```

Connected call:

```text
connected
  -> reconnecting
      -> connected
      -> failed_ended
  -> ended
```

Group call:

```text
available
  -> joining
  -> joined
  -> left
```

Call may continue after one participant leaves.

Screen share:

```text
inactive -> selecting_source -> active -> interrupted -> stopped
                                active -> stopped
```

Permission:

```text
not_requested -> requesting -> granted
                           -> denied
                           -> blocked_system_settings_required
```

Minimized/full:

```text
full -> minimizing -> minimized -> restoring -> full
```

Media:

```text
microphone: on <-> muted -> unavailable / permission_denied
camera: on <-> off -> unavailable / permission_denied
```

## 40. Interaction Matrix

| Interaction           | Trigger            | Surface            | Immediate result     | Durable/history result | Failure                | Permission           | Network behavior            | Mobile               | Desktop                | Safety                    |
| --------------------- | ------------------ | ------------------ | -------------------- | ---------------------- | ---------------------- | -------------------- | --------------------------- | -------------------- | ---------------------- | ------------------------- |
| Start audio call      | Header/calls row   | Conversation/Calls | Preparing/calling    | History entry          | Couldn't connect       | Mic                  | Reconnect/fail              | One tap + permission | One click + permission | Blocked users blocked     |
| Start video call      | Header/calls row   | Conversation/Calls | Preparing/calling    | History entry          | Audio fallback         | Mic/camera           | Degrade to audio            | Camera prompt        | Camera/device prompt   | Camera indicator          |
| Answer                | Incoming surface   | Native/in-app      | Connecting           | History answered       | Failed                 | Mic/camera as needed | Reconnect if needed         | Answer control       | Answer control         | Caller identity visible   |
| Answer audio-only     | Incoming video     | Incoming surface   | Audio connect        | History answered       | Mic fail               | Mic                  | Audio reconnect             | Optional action      | Optional action        | Avoids unwanted camera    |
| Decline               | Incoming surface   | Incoming           | Dismiss              | Declined/missed record | None                   | None                 | None                        | Decline              | Decline                | User control              |
| Cancel outgoing       | Calling surface    | Outgoing           | Stops call           | Cancelled record       | None                   | None                 | None                        | Cancel/end           | Cancel/end             | None                      |
| End call              | Call controls      | Call               | Ends/leaves          | Duration row/history   | Retry cleanup          | None                 | Ends authoritative          | Red control          | Red control            | Always easy               |
| Join group call       | Activity card      | Conversation       | Joining              | Joined record          | Ended/full             | Mic/camera           | Reconnect/fail              | Join                 | Join                   | Membership check          |
| Leave group call      | Controls           | Call               | User leaves          | Left/duration          | None                   | None                 | None                        | Leave/end            | Leave/end              | Distinguish end-for-all   |
| Mute/unmute           | Control            | Call               | Mic state toggles    | None                   | Mic unavailable        | Mic                  | No lifecycle impact         | Button               | Button/shortcut        | State announced           |
| Camera on/off         | Control            | Call               | Camera state toggles | None                   | Camera unavailable     | Camera               | May improve network         | Button               | Button/shortcut        | State visible             |
| Switch camera         | Control            | Call               | Front/rear swap      | None                   | Camera unavailable     | Camera               | None                        | Switch button        | Device picker instead  | None                      |
| Change microphone     | Device picker      | Settings           | Device selected      | Preference optional    | Device gone            | Device access        | None                        | Usually native route | Picker                 | None                      |
| Change output         | Route picker       | Settings           | Output selected      | Preference optional    | Device gone            | Device access        | None                        | Route picker         | Picker                 | None                      |
| Add participant       | More               | Call               | Invite flow          | Invitation             | Not allowed            | Contacts/search      | Invite may fail             | Sheet                | Popover/dialog         | Membership implication    |
| Open chat             | Control/minimize   | Call               | Conversation opens   | None                   | None                   | None                 | Call persists               | Minimize/pushed      | Side panel/switch      | None                      |
| Minimize call         | Control/nav        | Call               | Mini call            | None                   | None                   | None                 | Continues                   | Mini/native PiP      | Mini window/bar        | Capture indicators remain |
| Restore call          | Mini surface       | App shell          | Full call            | None                   | None                   | None                 | State current               | Tap mini             | Click mini             | None                      |
| Start screen share    | More               | Call               | Source selection     | Share activity maybe   | Permission/source fail | Screen capture       | May degrade                 | Future limited       | Source dialog          | Strong privacy indicator  |
| Stop screen share     | Prominent control  | Call               | Sharing stops        | Activity maybe         | Retry/force stop       | Screen capture       | None                        | Stop visible         | Stop visible           | Critical                  |
| Retry connection      | Failure/reconnect  | Call               | Reattempt            | History if connected   | Failed                 | Existing             | Reconnect                   | Button               | Button                 | None                      |
| Return missed call    | Calls row icon     | Calls              | Starts call          | History entry          | Unavailable            | Mic/camera           | As normal                   | Explicit icon        | Explicit icon          | Avoid accidental row call |
| Block/report          | More/safety        | Call               | Safety flow          | Safety record          | Error                  | None                 | Ends or continues by policy | Sheet                | Dialog                 | Required                  |
| Open call history     | Calls tab          | Primary nav        | Calls list           | None                   | Empty/error            | None                 | Cached                      | Root tab             | Rail/tab               | None                      |
| Open call detail      | Row tap            | Calls/history      | Detail opens         | None                   | Missing record         | None                 | Cached                      | Pushed               | Panel/dialog           | No analytics              |
| Create/open call link | Future action/link | Future             | Join/create preview  | Link record            | Expired/revoked        | Identity             | Join fails gracefully       | Pushed               | Dialog                 | Abuse controls            |

## 41. Screen/Surface Inventory

Seyloq-owned screens:

- Calls Home.
- Call Detail.
- Full Call screen.
- Group join screen.
- Future call-link join preview.

Overlays/sheets/dialogs:

- Incoming in-app call overlay.
- Device picker.
- Audio route picker.
- Permission recovery sheet.
- Network failure sheet.
- Add participant sheet/dialog.
- Participant list sheet/panel.
- Safety actions sheet/dialog.
- Future screen-source picker wrapper.

Panels:

- Desktop participant panel.
- Desktop in-call chat panel.
- Desktop call detail panel.

Native/OS-owned surfaces:

- Background/lock-screen incoming call UI future.
- OS permission dialogs.
- Screen capture picker where OS-owned.
- Native PiP where supported.
- System audio route picker where platform-owned.

States:

- Empty call history.
- No missed calls.
- Permission denied.
- Device unavailable.
- Connection unstable.
- Reconnecting.
- Call failed.
- Call ended.
- Call full future.
- Call link expired/revoked future.

## 42. Error/Empty States

Required states:

| State                        | User-facing recovery                               |
| ---------------------------- | -------------------------------------------------- |
| No call history              | Start new call                                     |
| No missed calls              | No action                                          |
| Contact unavailable          | Message or try later                               |
| Call failed                  | Try again                                          |
| Permission denied            | Open Settings / continue audio-only where possible |
| Camera unavailable           | Continue audio                                     |
| Microphone unavailable       | Check settings/device                              |
| Audio output unavailable     | Choose another route                               |
| Connection unstable          | Continue, video reduced                            |
| Reconnecting                 | Wait or end                                        |
| Connection lost              | Try again/message                                  |
| Call full future             | Try later                                          |
| Call link expired future     | Ask for new link                                   |
| Call link revoked future     | Return to chat                                     |
| Group call ended before join | Return to conversation                             |
| Participant removed/left     | Update participant list                            |
| Screen share interrupted     | Share again / stop                                 |

## 43. Backend/Protocol Requirements

Future backend/protocol architecture must define:

- Call identity.
- Conversation association.
- Participant identity.
- Device identity.
- Call lifecycle events.
- Signaling.
- Ringing semantics.
- Answer race across devices.
- Group-call membership.
- Join/leave semantics.
- Media capability negotiation.
- Reconnect semantics.
- Call history.
- Missed-call determination.
- Idempotent call actions.
- Call activity records.
- Call links.
- Link expiry/revocation.
- Abuse controls.
- Notification routing.
- Multi-device coordination.
- Capacity policy.
- Together Mode session relationship.

No backend/protocol implementation is part of Pass 04.

## 44. Native-Platform Requirements

Future native/platform requirements:

- Microphone access.
- Camera access.
- Audio routing.
- Bluetooth.
- Background execution.
- Incoming-call presentation.
- Lock-screen behavior.
- System call integration where appropriate.
- Screen capture.
- Picture-in-picture.
- Notifications.
- Audio focus.
- Device changes.
- OS-specific permission recovery.

Separate platform requirement from web/Tauri UI implementation. Do not choose brittle workarounds merely to avoid native integration.

## 45. Security/Privacy Requirements

Future security/privacy architecture must define:

- Call encryption architecture.
- Identity verification.
- Signaling authentication.
- Media authorization.
- Blocked-user enforcement.
- Call-link abuse protection.
- Screen-share privacy.
- Device authorization.
- Minimal metadata retention.
- Call history privacy.
- Reporting/blocking evidence policy.
- Permission minimization.

Do not claim E2EE. E2EE remains a dedicated architecture decision and must reflect actual protocol guarantees.

## 46. Open Product Owner Decisions

1. Should 1:1 calls ring all linked devices?
2. Can users answer video calls as audio-only?
3. Does tapping a Calls history row open detail or immediately call?
4. Should missed calls create both conversation rows and Calls badges?
5. Should group calls ring everyone or become joinable sessions?
6. At what group size should behavior change?
7. Can non-group members temporarily join group calls?
8. Does adding someone to a 1:1 call create a temporary call or new group conversation?
9. Should group calls have host/moderator controls?
10. Can someone end a group call for everyone?
11. Is call waiting supported initially?
12. Should screen sharing ship with first calling release?
13. Should call links ship initially or later?
14. Are unauthenticated guests ever allowed through call links?
15. Should ordinary 1:1 calls have a pre-join screen?
16. Should desktop call controls auto-hide?
17. Should mobile support in-app mini-call plus OS PiP where available?
18. Should active speaker automatically change large-call layout?
19. What call history retention policy should exist?
20. Should call activity rows show duration?
21. Should group call participant lists remain visible after call ends?
22. Which call actions generate notifications?
23. Should "Use less data for calls" be user-controlled?
24. Which capabilities belong to the first calling release versus later?
25. When should Together Mode become discoverable?
26. Should calls launched from a Space return to Space or canonical Chat after ending?
27. Which call failures should create conversation activity rows?
28. Should Calls Home include contact search in the first release?
29. Should declined calls be visible to the caller as declined or simply unanswered?
30. What participant limit should initial group calls present, if any?

## Human Review Boundary

This pass defines Calls and Realtime Communication UX architecture only. It does not implement WebRTC, SFU, TURN, signaling, Go backend, WebSockets, call persistence, native call integration, push notifications, E2EE, call links, Together Mode, screen sharing, production UI, Pass 01-03 redesign, primary navigation changes, Updates, or Pass 05.

SEY-006 UX Architecture Pass 04 - Calls & Realtime Communication ready for Human Review.
