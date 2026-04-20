import { track } from "@vercel/analytics";
import { z } from "zod";

const eventSchema = z.object({
  name: z.enum([
    "copy_npm_command",
    "copy_usage_import_code",
    "copy_usage_code",
    "copy_primitive_code",
    "copy_theme_code",
    "copy_block_code",
    "copy_chunk_code",
    "enable_lift_mode",
    "copy_chart_code",
    "copy_chart_theme",
    "copy_chart_data",
    "copy_color",
  ]),
  properties: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
    .optional(),
});

export type Event = z.infer<typeof eventSchema>;

export function trackEvent(input: Event): void {
  // ✅ ใช้ safeParse เพื่อป้องกันแอปพัง (Crash) หากส่งข้อมูลผิดประเภท
  const result = eventSchema.safeParse(input);
  
  if (result.success) {
    const { name, properties } = result.data;
    track(name, properties);
  } else {
    console.error("Invalid analytics event:", result.error.format());
  }
}