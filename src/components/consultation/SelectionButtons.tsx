
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectionButtonProps {
  value: string;
  currentValue: string;
  onChange: (value: string) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const SelectionButton = ({ 
  value, 
  currentValue, 
  onChange, 
  label, 
  description,
  disabled = false 
}: SelectionButtonProps) => {
  const isSelected = currentValue === value;
  
  return (
    <button
      onClick={() => onChange(value)}
      disabled={disabled}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
        "flex items-center justify-between",
        isSelected
          ? "bg-green-50 border-green-500 text-green-900"
          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex-1">
        <div className="font-medium text-base">{label}</div>
        {description && (
          <div className="text-sm opacity-75 mt-1">{description}</div>
        )}
      </div>
      {isSelected && (
        <div className="ml-4 flex-shrink-0">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </button>
  );
};

interface MultiSelectButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export const MultiSelectButton = ({ 
  checked, 
  onChange, 
  label, 
  description,
  disabled = false 
}: MultiSelectButtonProps) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={cn(
        "w-full p-4 rounded-lg border-2 text-left transition-all duration-200 hover:shadow-md",
        "flex items-center justify-between",
        checked
          ? "bg-green-50 border-green-500 text-green-900"
          : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex-1">
        <div className="font-medium text-base">{label}</div>
        {description && (
          <div className="text-sm opacity-75 mt-1">{description}</div>
        )}
      </div>
      {checked && (
        <div className="ml-4 flex-shrink-0">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        </div>
      )}
    </button>
  );
};
