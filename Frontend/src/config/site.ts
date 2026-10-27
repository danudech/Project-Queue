import { BRAND } from "@/config/brand";

export const siteConfig = {
  name: BRAND.name,
  url: "https://ezqueue.app",
  ogImage: BRAND.openGraphImage,
  description:
    "EZQueue helps service businesses manage bookings, live queues, staff workload, payments, and shop operations.",
  links: {
    twitter: "#",
    github: "#",
  },
}

export type SiteConfig = typeof siteConfig
