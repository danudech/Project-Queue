"use client";
import { useEffect } from "react";

export default function BodyClass({
  className,
  elementid,
}: {
  className: string;
  elementid: boolean | null;
}) {
  useEffect(() => {
    const html = document.documentElement;
    const originalBodyClass = document.body.className;
    const originalLang = html.lang;

    document.body.className = className;
    const theme = localStorage.getItem("theme") || "light";

    if (elementid) {
      html.id = "previewPage";
      html.dataset.theme = theme;
      html.lang = "en";
    } else {
      html.removeAttribute("id");
      html.removeAttribute("data-theme");
      html.lang = "th";
    }

    return () => {
      document.body.className = originalBodyClass;
      html.removeAttribute("id");
      html.removeAttribute("data-theme");
      html.lang = originalLang;
    };
  }, [className, elementid]);

  return null;
}
