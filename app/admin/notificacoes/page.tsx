import NotificationInbox from "@/components/NotificationInbox";
import PushSubscription from "@/components/PushSubscription";
export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Notificações</h1>
      <PushSubscription />
      <NotificationInbox />
    </div>
  );
}
