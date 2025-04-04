"use client";

import { useEffect } from "react";

export function useDocumentTitle(
  title: string = "Notion Clone",
  suffix?: string,
): void {
  useEffect(() => {
    document.title = suffix ? `${title} - ${suffix}` : title;

    return () => {
      document.title = "Notion Clone";
    };
  }, [title, suffix]);
}

export function useFavicon(
  iconPath: string,
  type: string = "image/x-icon",
): void {
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = iconPath;
    link.type = type;
  }, [iconPath, type]);
}

export function useEmojiAsFavicon(
  icon?: string,
  fallbackPath: string = "/favicon.ico",
): void {
  useEffect(() => {
    if (!icon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = fallbackPath;
      return;
    }

    const isEmoji = /\p{Emoji}/u.test(icon);

    if (isEmoji) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.font = "28px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(icon, 16, 16);

        const faviconUrl = canvas.toDataURL("image/png");

        let link = document.querySelector(
          "link[rel~='icon']",
        ) as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.type = "image/png";
        link.href = faviconUrl;
      }
    } else {
      useFavicon(icon.startsWith("/") ? icon : fallbackPath);
    }
  }, [icon, fallbackPath]);
}
