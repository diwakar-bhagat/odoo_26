import {
  LayoutDashboard,
  Box,
  ArrowRightLeft,
  CalendarDays,
  Wrench,
  ShieldCheck,
  Building2,
  Bell,
  type LucideIcon
} from "lucide-react";

export type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
};

export type NavGroup = {
  title: string;
  items: NavMainItem[];
};

export const sidebarItems: NavGroup[] = [
  {
    title: "Core",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Asset Registry",
        url: "/dashboard/assets",
        icon: Box,
      },
      {
        title: "Allocations",
        url: "/dashboard/allocations",
        icon: ArrowRightLeft,
      },
    ],
  },
  {
    title: "Workflows",
    items: [
      {
        title: "Bookings",
        url: "/dashboard/bookings",
        icon: CalendarDays,
      },
      {
        title: "Maintenance",
        url: "/dashboard/maintenance",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Administration",
    items: [
      {
        title: "Audits",
        url: "/dashboard/audits",
        icon: ShieldCheck,
      },
      {
        title: "Organization",
        url: "/dashboard/organization",
        icon: Building2,
      },
    ],
  }
];
