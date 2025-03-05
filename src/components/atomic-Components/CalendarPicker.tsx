import { Button } from "../ui/button";



import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "../ui/calendar";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";


interface CalendarFunctionProps {
selectedDate : Date;
onSelect: (date: Date) => void; // Accepts a Date object directly
}

const CalendarFunction: React.FC<CalendarFunctionProps> = ({selectedDate, onSelect}) => {
    return (
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date)=>onSelect(date!)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };


  interface DatePickerProps {
    label: string;
    name: string;
    selectedDate: Date;
    onSelect: (date: Date) => void;
  }
  
  const DatePicker: React.FC<DatePickerProps> = ({ label, name, selectedDate, onSelect }) => {
    return (
      <div className="grid gap-2 mt-4">
        <Label htmlFor={name}>{label}</Label>
        <CalendarFunction selectedDate={selectedDate} onSelect={onSelect} />
      </div>
    );
  };

export default DatePicker;