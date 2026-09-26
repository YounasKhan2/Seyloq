import { CalendarDays, CheckSquare, MapPin, ReceiptText } from "lucide-react";
import type { LiveObject } from "../entities/types";
import { Badge } from "./primitives";

const liveObjectIcons = {
  event: CalendarDays,
  "live-location": MapPin,
  expense: ReceiptText,
  checklist: CheckSquare,
};

export function LiveObjectCard({ object }: { object: LiveObject }) {
  const Icon = liveObjectIcons[object.type];

  return (
    <article className="live-object" tabIndex={0} aria-label={`${object.type}: ${object.title}`}>
      <LiveObjectHeader icon={<Icon size={15} />} title={object.title} status={object.status} />
      <LiveObjectBody object={object} />
      <LiveObjectFooter meta={object.meta} />
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
      <strong>{title}</strong>
      <Badge tone="accent">{status}</Badge>
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

export function LiveObjectFooter({ meta }: { meta: string }) {
  return <footer className="live-object-footer">{meta}</footer>;
}
