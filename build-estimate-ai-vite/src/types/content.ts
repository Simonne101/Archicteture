import type { LucideIcon } from "lucide-react";

export interface NavLinkItem {
  label: string;
  href: string;
}

export interface IconTile {
  icon: LucideIcon;
  title: string;
  description: string;
  iconClassName: string;
  bgClassName: string;
}

export interface MaterialItem {
  icon: LucideIcon;
  label: string;
  value: string;
  unit: string;
  iconClassName: string;
}

export interface RebarRow {
  size: string;
  count: string;
}
