/**
 * Shared formatting utilities across the application
 */

/**
 * Format numeric value as Thai Baht currency (e.g. ฿1,500 or 1,500 ฿)
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  options: { includeSymbol?: boolean; decimals?: number; locale?: string } = {}
): string {
  if (amount === null || amount === undefined || amount === "") return "-";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return "-";

  const { includeSymbol = true, decimals = 0, locale = "th-TH" } = options;

  if (includeSymbol) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "THB",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format queue display number (e.g., prefix 'A' + 5 => 'A-005')
 */
export function formatQueueNumber(
  number: number | string | null | undefined,
  prefix?: string | null,
  padLength = 3
): string {
  if (number === null || number === undefined) return "-";
  const cleanPrefix = (prefix || "").trim().toUpperCase();
  const numStr = String(number).padStart(padLength, "0");
  return cleanPrefix ? `${cleanPrefix}-${numStr}` : numStr;
}

/**
 * Format standard date string (e.g., 2026-10-27 => 27 ต.ค. 2569 or 27 Oct 2026)
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  locale = "th",
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  };

  const intlLocale = locale === "en" ? "en-US" : "th-TH";
  return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(date);
}

/**
 * Format time (e.g. "09:30:00" or ISO string => "09:30")
 */
export function formatTime(timeInput: string | Date | null | undefined): string {
  if (!timeInput) return "-";
  if (typeof timeInput === "string") {
    // If format is "HH:mm:ss" or "HH:mm"
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(timeInput)) {
      const [h, m] = timeInput.split(":");
      return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
    }
    const d = new Date(timeInput);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
    }
    return timeInput;
  }
  return timeInput.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", hour12: false });
}

/**
 * Format Thai phone number (e.g., 0812345678 => 081-234-5678)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  return phone;
}
