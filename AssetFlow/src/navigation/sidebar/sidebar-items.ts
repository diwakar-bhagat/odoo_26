import {
  ArrowRightLeft,
  Bell,
  Box,
  Building2,
  CalendarDays,
  LayoutDashboard,
  type LucideIcon,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
}

export type NavMainItem = {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  subItems?: NavSubItem[];
  comingSoon?: boolean;
  newTab?: boolean;
  isNew?: boolean;
  badge?: number | string;
};

export type NavGroup = {
  id?: number;
  title?: string;
  label?: string;
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
  },
];
