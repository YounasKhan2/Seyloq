import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/App";

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
});
