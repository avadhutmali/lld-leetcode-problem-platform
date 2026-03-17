import { cn } from '../../lib/cn';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegmentedOption<T>[];
  className?: string;
}) {
  return (
    <div className={cn('inline-flex rounded-md border border-slate-200 bg-white p-0.5', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'h-8 px-3 rounded-md text-sm transition-colors',
            value === opt.value ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

