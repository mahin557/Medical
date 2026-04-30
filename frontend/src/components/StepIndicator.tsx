interface Props {
  steps: string[]
  current: number
}

export function StepIndicator({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((label, i) => (
        <div key={i} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                i < current
                  ? 'bg-blue-600 text-white'
                  : i === current
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i < current ? '✓' : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                i === current ? 'text-blue-700' : i < current ? 'text-slate-600' : 'text-slate-400'
              }`}
            >
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`mx-2 h-px w-8 sm:w-16 ${i < current ? 'bg-blue-600' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}
