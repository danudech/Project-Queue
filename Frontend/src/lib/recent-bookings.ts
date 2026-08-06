export type RecentBooking = {
  guid: string;
  managementHref: string;
  bookingPageHref: string;
  shopName: string;
  branchName: string;
  serviceName: string;
  date: string;
  startTime: string;
  status: string;
  createdAt: string;
};

const storageKey = "ezqueue.recentBookings";
const maximumBookings = 20;

const isRecentBooking = (value: unknown): value is RecentBooking => {
  if (!value || typeof value !== "object") return false;
  const booking = value as Partial<RecentBooking>;
  return Boolean(
    booking.guid && booking.managementHref && typeof booking.bookingPageHref === "string"
      && booking.shopName && booking.branchName && booking.serviceName
      && booking.date && booking.startTime && booking.status && booking.createdAt,
  );
};

export const readRecentBookings = (): RecentBooking[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isRecentBooking)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, maximumBookings);
  } catch {
    return [];
  }
};

export const saveRecentBooking = (booking: RecentBooking): RecentBooking[] => {
  const existing = readRecentBookings();
  const previous = existing.find((item) => item.guid === booking.guid);
  const next = [{
    ...previous,
    ...booking,
    bookingPageHref: booking.bookingPageHref || previous?.bookingPageHref || "",
    createdAt: previous?.createdAt || booking.createdAt,
  }, ...existing.filter((item) => item.guid !== booking.guid)].slice(0, maximumBookings);
  try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* optional device history */ }
  return next;
};

export const updateRecentBookingStatus = (guid: string, status: string) => {
  const next = readRecentBookings().map((booking) => booking.guid === guid ? { ...booking, status } : booking);
  try { window.localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* optional device history */ }
  return next;
};
