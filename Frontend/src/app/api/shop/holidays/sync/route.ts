import { NextRequest, NextResponse } from "next/server";

type SyncedHoliday = {
  date: string;
  name: string;
  type: "government";
};

function normalizeDate(value: string) {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return value;

  const compactMatch = value.match(/^(\d{4})(\d{2})(\d{2})$/);
  if (compactMatch) {
    return `${compactMatch[1]}-${compactMatch[2]}-${compactMatch[3]}`;
  }

  return "";
}

function uniqueByDate(items: SyncedHoliday[]) {
  return Array.from(
    new Map(
      items
        .filter((item) => item.date && item.name)
        .map((item) => [item.date, item]),
    ).values(),
  ).sort((a, b) => a.date.localeCompare(b.date));
}

function decodeIcsText(value: string) {
  return value
    .replace(/\\n/gi, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .trim();
}

function parseGoogleCalendar(
  calendar: string,
  year: number,
  locale: string,
): SyncedHoliday[] {
  const unfolded = calendar.replace(/\r?\n[ \t]/g, "");
  const events = unfolded.match(/BEGIN:VEVENT[\s\S]*?END:VEVENT/g) ?? [];
  const publicHolidayMarker =
    locale === "th" ? "วันหยุดนักขัตฤกษ์" : "Public holiday";

  return uniqueByDate(
    events.flatMap((event) => {
      const dateValue = event.match(/DTSTART(?:;VALUE=DATE)?:(\d{8})/)?.[1];
      const summary = event.match(/SUMMARY:(.*?)(?:\r?\n)/)?.[1];
      const description = event.match(/DESCRIPTION:(.*?)(?:\r?\n)/)?.[1] ?? "";

      if (
        !dateValue?.startsWith(String(year)) ||
        !summary ||
        !decodeIcsText(description).includes(publicHolidayMarker)
      ) {
        return [];
      }

      return [
        {
          date: normalizeDate(dateValue),
          name: decodeIcsText(summary).replace(/[\u200B-\u200D\uFEFF]/g, ""),
          type: "government" as const,
        },
      ];
    }),
  );
}

async function fetchGovernmentHolidays(year: number, locale: string) {
  const calendarLocale = locale === "th" ? "th.th" : "en.th";
  const sourceUrl = `https://calendar.google.com/calendar/ical/${calendarLocale}%23holiday%40group.v.calendar.google.com/public/basic.ics`;
  const response = await fetch(sourceUrl, {
    cache: "no-store",
    headers: { Accept: "text/calendar" },
  });

  if (!response.ok) {
    throw new Error(`Holiday calendar returned ${response.status}`);
  }

  return {
    items: parseGoogleCalendar(await response.text(), year, locale),
    source:
      locale === "th"
        ? "ปฏิทินวันหยุดในไทยของ Google"
        : "Google Holidays in Thailand calendar",
    sourceUrl,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const locale = searchParams.get("locale") === "th" ? "th" : "en";
  const year = Number(searchParams.get("year"));

  if (
    type !== "government" ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    return NextResponse.json(
      { status: false, message: "Invalid holiday type or year" },
      { status: 400 },
    );
  }

  try {
    const result = await fetchGovernmentHolidays(year, locale);

    return NextResponse.json({
      status: true,
      data: {
        type,
        year,
        ...result,
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sync holidays";
    return NextResponse.json({ status: false, message }, { status: 502 });
  }
}
