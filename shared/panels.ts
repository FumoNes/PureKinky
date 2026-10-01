export type ActivePanel = "menu" | "cart" | "vip" | "campaign" | "maintenance" | null;

export function openPanel(panel: Exclude<ActivePanel, null>): ActivePanel {
  return panel;
}

export function closePanels(): ActivePanel {
  return null;
}
