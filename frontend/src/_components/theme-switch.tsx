"use client";

import * as React from "react";
import { useTheme } from "next-themes";

import { Button } from "~/_components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "~/_components/ui/tooltip";
import { cn } from "~/lib/utils";
import { Moon, SunIcon } from "lucide-react";

export default function ThemeSwitch(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>,
) {
  const { setTheme, theme } = useTheme();

  return (
    <TooltipProvider disableHoverableContent>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <Button
            className={cn(
              "bg-background h-8 w-8 rounded-full transition-all",
              props.className,
            )}
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <SunIcon className="h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-transform duration-500 ease-in-out dark:scale-100 dark:rotate-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-transform duration-500 ease-in-out dark:scale-0 dark:-rotate-90" />
            <span className="sr-only">Switch Theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Switch Theme</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
