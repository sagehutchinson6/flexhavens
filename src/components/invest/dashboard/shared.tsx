import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg",
        accent
          ? "bg-gradient-to-br from-[#c8956c] to-[#b07d52] border-transparent text-white"
          : "bg-white border-gray-200",
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("text-sm font-medium", accent ? "text-white/80" : "text-gray-500")}>
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold font-serif mt-1.5",
              accent ? "text-white" : "text-[#1e3a5f]",
            )}
          >
            {value}
          </p>
          {sub && (
            <p className={cn("text-xs mt-1.5", accent ? "text-white/70" : "text-gray-400")}>
              {sub}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
            accent ? "bg-white/20" : "bg-[#1e3a5f]/5",
          )}
        >
          <Icon className={cn("w-5 h-5", accent ? "text-white" : "text-[#1e3a5f]")} />
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    matured: "bg-blue-100 text-blue-800",
    cancelled: "bg-gray-100 text-gray-700",
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    paid: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    credited: "bg-green-100 text-green-800",
    verified: "bg-green-100 text-green-800",
    unverified: "bg-gray-100 text-gray-700",
    open: "bg-blue-100 text-blue-800",
    funding: "bg-yellow-100 text-yellow-800",
    funded: "bg-green-100 text-green-800",
    suspended: "bg-red-100 text-red-800",
    liquidated: "bg-purple-100 text-purple-800",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize",
        styles[status] ?? "bg-gray-100 text-gray-700",
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("bg-white rounded-2xl border border-gray-200 p-6", className)}>
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-[#1e3a5f] font-serif">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: React.ElementType;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 bg-[#1e3a5f]/5 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-[#1e3a5f]/40" />
      </div>
      <p className="font-semibold text-[#1e3a5f]">{title}</p>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("w-full h-2 bg-gray-100 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-gradient-to-r from-[#1e3a5f] to-[#c8956c] rounded-full transition-all duration-500"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}
