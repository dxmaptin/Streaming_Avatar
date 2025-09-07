import * as SelectPrimitive from "@radix-ui/react-select";
import { useState } from "react";

import { ChevronDownIcon } from "./Icons";

interface SelectProps<T> {
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  onSelect: (option: T) => void;
  isSelected: (option: T) => boolean;
  value: string | null | undefined;
  placeholder?: string;
  disabled?: boolean;
}

export function Select<T>(props: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectPrimitive.Root
      disabled={props.disabled}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <SelectPrimitive.Trigger className="w-full text-white text-sm glass border border-white/10 py-2 px-4 rounded-lg cursor-pointer flex items-center justify-between h-fit disabled:opacity-50 min-h-[36px]">
        <div className={`${props.value ? "text-white" : "text-zinc-400"}`}>
          {props.value ? props.value : props.placeholder}
        </div>
        <ChevronDownIcon className="w-4 h-4" />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 w-[var(--radix-select-trigger-width)] max-h-[300px] overflow-y-auto"
          position="popper"
          sideOffset={5}
        >
          <SelectPrimitive.Viewport className="rounded-lg border border-white/10 glass shadow-lg py-1">
            {props.options.map((option) => {
              const isSelected = props.isSelected(option);

              return (
                <div
                  key={props.renderOption(option)?.toString()}
                  className={`py-2 px-4 cursor-pointer outline-none text-sm hover:bg-white/5 ${
                    isSelected ? "text-white bg-white/10" : "text-zinc-300"
                  }`}
                  onClick={() => {
                    props.onSelect(option);
                    setIsOpen(false);
                  }}
                >
                  {props.renderOption(option)}
                </div>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
