import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileTypes } from "@/lib/fileTypes";

type FileTypeFilterProps = {
  filter: FileTypes | "all";
  setFilter: (filter: FileTypes | "all") => void;
};

const fileTypes = [
  {
    type: "all",
    label: "All",
  },
  {
    type: "image",
    label: "Images",
  },
  {
    type: "pdf",
    label: "PDFs",
  },
  {
    type: "csv",
    label: "CSVs",
  },
  {
    type: "other",
    label: "Other",
  },
] as const;

const FileTypeFilter = ({ filter, setFilter }: FileTypeFilterProps) => {
  return (
    <div className="flex items-center gap-2">
      <span>Filter files:</span>
      <Select onValueChange={setFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          {fileTypes.map(({ type, label }) => (
            <SelectItem key={type} onClick={() => setFilter(type)} value={type}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FileTypeFilter;
