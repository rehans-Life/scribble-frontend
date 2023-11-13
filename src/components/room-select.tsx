import { ReactNode } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function RoomSelect({
  label,
  children,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  children: ReactNode;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-1 justify-center items-center">
      <div className="flex md:w-1/2 w-full items-start gap-2 text-white">
        {children}
        <div className="md:text-md text-xs">{label}</div>
      </div>
      <div className="w-full md:w-1/2">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[var(--radix-select-content-available-height)] z-[100]">
            {options.map((val, index) => (
              <SelectItem key={index} value={val.toString()}>
                {val}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
