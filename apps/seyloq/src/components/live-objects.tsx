import { CalendarDays, CheckSquare, MapPin, ReceiptText, Vote } from "lucide-react";
import type { LiveObject } from "../entities/types";
import { Badge } from "./primitives";

const liveObjectIcons = {
  event: CalendarDays,
  "live-location": MapPin,
  expense: ReceiptText,
  checklist: CheckSquare,
  poll: Vote,
  decision: CheckSquare,
  location: MapPin,
};

export function LiveObjectCard({ object }: { object: LiveObject }) {
  const Icon = liveObjectIcons[object.type];

  return (
    <article className="live-object" tabIndex={0} aria-label={`${object.type}: ${object.title}`}>
      <LiveObjectHeader icon={<Icon size={15} />} title={object.title} status={object.status} />
      <LiveObjectBody object={object} />
      <LiveObjectFooter meta={object.meta} syncState={object.syncState} sourceMessageId={object.sourceMessageId} />
    </article>
  );
}

export function LiveObjectHeader({
  icon,
  title,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  status: string;
}) {
  return (
    <header className="live-object-header">
      <span className="live-object-icon">{icon}</span>
      <span className="live-object-title">
        <strong>{title}</strong>
        <Badge tone="accent">{status}</Badge>
      </span>
    </header>
  );
}

export function LiveObjectBody({ object }: { object: LiveObject }) {
  return (
    <div className="live-object-body">
      <p>{object.summary}</p>
      <ul>
        {object.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function LiveObjectFooter({
  meta,
  syncState,
  sourceMessageId,
}: {
  meta: string;
  syncState?: string;
  sourceMessageId?: string;
}) {
  const readableState =
    syncState === "locally-modified"
      ? "Waiting to sync"
      : syncState === "syncing"
        ? "Syncing"
        : syncState === "stale"
          ? "Needs refresh"
          : syncState === "unavailable"
            ? "Unavailable"
            : "Up to date";

  return (
    <footer className="live-object-footer">
      <span>{meta}</span>
      <span>{readableState}</span>
      {sourceMessageId ? <span>From message</span> : null}
    </footer>
  );
}
