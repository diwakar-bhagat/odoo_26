import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "AssetFlow ERP",
  version: packageJson.version,
  copyright: `© ${currentYear}, AssetFlow ERP Pvt. Ltd.`,
  meta: {
    title: "AssetFlow - Asset Management Dashboard",
    description:
      "Advanced enterprise asset management and tracking system for AssetFlow ERP. Manage assets, allocations, bookings, maintenance, audits, and performance reports in one integrated platform.",
  },
};
