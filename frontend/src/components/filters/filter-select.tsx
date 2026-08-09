import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterSelectProps {
  value?: string | undefined;
  onChange: (value: string) => void;
  options: readonly string[];
  label: string;
  allLabel?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
  allLabel = "All",
}: FilterSelectProps) {
  return (
    <Select value={value ?? "ALL"} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-full rounded-xl sm:w-[170px]" aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">
          {allLabel} {label.toLowerCase()}
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option.charAt(0) + option.slice(1).toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
