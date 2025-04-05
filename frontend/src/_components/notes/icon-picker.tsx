import { useTheme } from "next-themes";

import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import type {
  ComponentProps,
  ForwardRefExoticComponent,
  RefAttributes,
} from "react";
import type { PopoverTriggerProps } from "@radix-ui/react-popover";

type Props = ComponentProps<
  ForwardRefExoticComponent<
    PopoverTriggerProps & RefAttributes<HTMLButtonElement>
  >
> & {
  onChange: (icon: string) => Promise<void>;
  asChild?: boolean;
};

export default function IconPicker({ onChange, children, ...props }: Props) {
  const { resolvedTheme } = useTheme();
  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";

  const themeMap = {
    dark: Theme.DARK,
    light: Theme.LIGHT,
  };

  const theme = themeMap[currentTheme] || Theme.DARK;

  return (
    <Popover>
      <PopoverTrigger
        className="cursor-pointer"
        asChild={props.asChild}
        {...props}
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-full border-none p-0 shadow-none">
        <EmojiPicker
          height={500}
          theme={theme}
          onEmojiClick={(data) => onChange(data.emoji)}
        />
      </PopoverContent>
    </Popover>
  );
}
