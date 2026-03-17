import { Separator } from "react-resizable-panels";

interface ResizeHandleProps {
  className?: string;
  direction?: "horizontal" | "vertical";
  id?: string;
}

export default function ResizeHandle({ className = "", direction = "horizontal", id }: ResizeHandleProps) {
  return (
    <Separator
      className={[
        'relative group outline-none',
        direction === 'horizontal' ? 'w-px cursor-col-resize bg-[#30363d]' : 'h-px cursor-row-resize bg-[#30363d]',
        className,
      ].join(' ')}
      id={id}
    >
      <div
        className={[
          'absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity',
          direction === 'horizontal'
            ? 'inset-y-0 -left-2 w-4 flex items-center justify-center'
            : 'inset-x-0 -top-2 h-4 flex items-center justify-center',
        ].join(' ')}
      >
        <div
          className={[
            'rounded-md border border-[#30363d] bg-[#161b22] text-[#8b949e]',
            direction === 'horizontal' ? 'px-1 py-2' : 'px-2 py-1',
          ].join(' ')}
        >
          <div className={direction === 'horizontal' ? 'flex flex-col gap-0.5' : 'flex flex-row gap-0.5'}>
            <span className="h-1 w-1 rounded-full bg-[#8b949e]" />
            <span className="h-1 w-1 rounded-full bg-[#8b949e]" />
            <span className="h-1 w-1 rounded-full bg-[#8b949e]" />
          </div>
        </div>
      </div>
    </Separator>
  );
}