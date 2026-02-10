import { Panel } from "react-resizable-panels";
import { GripVertical, GripHorizontal } from "lucide-react";

interface ResizeHandleProps {
  className?: string;
  direction?: "horizontal" | "vertical";
  id?: string; // v4 sometimes expects IDs
}

export default function ResizeHandle({ className = "", direction = "horizontal", id }: ResizeHandleProps) {
  return (
    <Panel
      className={`relative flex items-center justify-center transition-colors bg-[#1a1a1a] hover:bg-blue-600 group outline-none
        ${direction === "horizontal" ? "w-1.5 h-full cursor-col-resize" : "h-1.5 w-full cursor-row-resize"}
        ${className}
      `}
      id={id}
    >
      <div className={`absolute z-10 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100
        ${direction === "horizontal" ? "inset-y-0 -left-1 w-4" : "inset-x-0 -top-1 h-4"}
      `}>
         <div className="bg-blue-600 rounded-full p-0.5">
            {direction === "horizontal" 
                ? <GripVertical className="w-3 h-3 text-white" /> 
                : <GripHorizontal className="w-3 h-3 text-white" />
            }
         </div>
      </div>
    </Panel>
  );
}