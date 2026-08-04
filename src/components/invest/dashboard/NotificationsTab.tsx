import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { formatDate } from "@/hooks/use-investor";
import { SectionCard, EmptyState } from "./shared";

const typeIcons: Record<string, { icon: React.ElementType; classes: string }> = {
  info: { icon: Info, classes: "bg-blue-100 text-blue-600" },
  success: { icon: CheckCircle, classes: "bg-green-100 text-green-600" },
  warning: { icon: AlertTriangle, classes: "bg-amber-100 text-amber-600" },
  error: { icon: XCircle, classes: "bg-red-100 text-red-600" },
};

export default function NotificationsTab({ onChanged }: { onChanged: () => void }) {
  const { data: notifications, refetch } = trpc.investor.notifications.useQuery(undefined, { retry: false, refetchInterval: 20_000 });

  const markRead = trpc.investor.markNotificationRead.useMutation({
    onSuccess: () => {
      refetch();
      onChanged();
    },
  });

  const markAll = trpc.investor.markAllNotificationsRead.useMutation({
    onSuccess: () => {
      refetch();
      onChanged();
    },
  });

  const unread = (notifications ?? []).filter((n: any) => n.isRead === "no").length;

  return (
    <SectionCard
      title="Notifications"
      subtitle={unread > 0 ? `${unread} unread` : "All caught up"}
      action={
        unread > 0 ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="border-[#1e3a5f] text-[#1e3a5f]"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        ) : undefined
      }
    >
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((n: any) => {
            const config = typeIcons[n.type] ?? typeIcons.info;
            const Icon = config.icon;
            return (
              <button
                key={n.id}
                onClick={() => n.isRead === "no" && markRead.mutate({ id: n.id })}
                className={`w-full text-left flex gap-4 p-4 rounded-xl border transition ${
                  n.isRead === "no"
                    ? "bg-[#faf8f5] border-[#c8956c]/30"
                    : "bg-white border-gray-100"
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.classes}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-semibold ${n.isRead === "no" ? "text-[#1e3a5f]" : "text-gray-600"}`}>
                      {n.title}
                    </p>
                    {n.isRead === "no" && <span className="w-2 h-2 rounded-full bg-[#c8956c] shrink-0" />}
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">{formatDate(n.createdAt)}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="No notifications"
          text="Account activity, deposit reviews, and earnings updates will appear here."
        />
      )}
    </SectionCard>
  );
}
