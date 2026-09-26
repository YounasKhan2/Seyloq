import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";
import { groupMessages } from "../src/components/messaging";
import { messages } from "../src/data/seed";

describe("Seyloq shell", () => {
  it("renders compact primary navigation without advanced global destinations", () => {
    render(<App />);

    expect(
      screen.getAllByRole("button", { name: "Chats" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "Updates" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByRole("button", { name: "Calls" }).length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText("Tasks")).not.toBeInTheDocument();
    expect(screen.queryByText("AI")).not.toBeInTheDocument();
  });

  it("embeds deterministic Live Objects in the conversation", () => {
    render(<App />);

    expect(screen.getByText("Altit Fort golden-hour walk")).toBeInTheDocument();
    expect(screen.getByText("Van pickup route")).toBeInTheDocument();
    expect(screen.getAllByText("Fuel + snacks split").length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText("Altit Fort quick checklist")).toBeInTheDocument();
  });

  it("groups consecutive messages from the same sender", () => {
    const grouped = groupMessages(messages);
    const first = grouped.find((item) => item.message.id === "m1");
    const second = grouped.find((item) => item.message.id === "m2");

    expect(first?.groupPosition).toBe("first");
    expect(first?.showSender).toBe(true);
    expect(second?.groupPosition).toBe("last");
    expect(second?.showSender).toBe(false);
  });

  it("renders replies, reactions, delivery state, media, file, voice, and unread primitives", () => {
    render(<App />);

    expect(screen.getByText("Final headcount is five...")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /okay, 3/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Failed to send")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Rakaposhi viewpoint/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("trip-itinerary.pdf")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play voice message" }),
    ).toBeInTheDocument();
    expect(screen.getByText("12 unread messages")).toBeInTheDocument();
  });

  it("supports deterministic retry and reactions", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(
      screen.queryByRole("button", { name: "Retry" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Failed to send")).not.toBeInTheDocument();

    const reaction = screen.getByRole("button", { name: /okay, 3/i });
    fireEvent.click(reaction);
    expect(
      screen.getByRole("button", { name: /okay, 2/i }),
    ).toBeInTheDocument();
  });

  it("sends with Enter and keeps Shift+Enter as multiline composer input", () => {
    render(<App />);

    const input = screen.getByLabelText("Message");
    fireEvent.change(input, { target: { value: "Line one" } });
    fireEvent.keyDown(input, { key: "Enter", shiftKey: true });
    expect(
      screen.queryByText("Line one", { selector: ".message-bubble" }),
    ).not.toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("Line one")).toBeInTheDocument();
  });

  it("opens message menus for reply, edit, selection, and voice controls", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("More actions for message m9"));
    fireEvent.click(screen.getByRole("menuitem", { name: /Edit/i }));
    expect(screen.getByText("Editing message")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Cancel composer mode"));
    fireEvent.click(screen.getByLabelText("More actions for message m1"));
    fireEvent.click(screen.getAllByRole("menuitem", { name: /Select/i })[0]);
    expect(screen.getByText("1 selected")).toBeInTheDocument();

    const voice = screen.getByRole("button", { name: "Play voice message" });
    fireEvent.click(voice);
    expect(
      screen.getByRole("button", { name: "Pause voice message" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "1x" }));
    expect(screen.getByRole("button", { name: "1.5x" })).toBeInTheDocument();
  });

  it("opens the attachment menu without adding permanent navigation", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Add attachment" }));
    const menu = screen.getByRole("menu");
    expect(
      within(menu).getByRole("menuitem", { name: "Photos & Video" }),
    ).toBeInTheDocument();
    expect(
      within(menu).getByRole("menuitem", { name: "Event" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Files" }),
    ).not.toBeInTheDocument();
  });
});
