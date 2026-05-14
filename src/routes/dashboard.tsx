import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLoginGate } from "@/hooks/use-login-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ARJO X OB" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { user, profile, roles } = useAuth();
  const { requireAuth } = useLoginGate();

  const { data: bookings, isLoading: bl } = useQuery({
    enabled: !!user,
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orders, isLoading: ol } = useQuery({
    enabled: !!user,
    queryKey: ["my-orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-4xl">DASHBOARD</h1>
        <p className="mt-2 text-muted-foreground">Login to access your dashboard.</p>
        <Button className="mt-6 bg-gradient-fire text-primary-foreground" onClick={() => requireAuth()}>Login</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <Card className="bg-gradient-hero border-primary/30">
        <CardContent className="p-8">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Welcome back</div>
          <h1 className="mt-1 font-display text-4xl tracking-wide">{profile?.full_name || profile?.username}</h1>
          <div className="mt-2 text-sm text-muted-foreground">@{profile?.username} · {user.email}</div>
          <div className="mt-3 flex gap-2">{roles.map((r) => <Badge key={r} className="bg-primary/20 text-primary">{r}</Badge>)}</div>
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>My Bookings</CardTitle><Button asChild size="sm" variant="outline"><Link to="/booking">New</Link></Button></CardHeader>
          <CardContent>
            {bl ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : !bookings?.length ? (
              <p className="text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="space-y-3">
                {bookings.map((b) => (
                  <li key={b.id} className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center justify-between"><span className="font-semibold">{b.service_type}</span><Badge variant="secondary">{b.status}</Badge></div>
                    <div className="mt-1 text-xs text-muted-foreground">{b.motorcycle_model} · {b.preferred_date} {b.preferred_time}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between"><CardTitle>My Orders</CardTitle><Button asChild size="sm" variant="outline"><Link to="/products">Shop</Link></Button></CardHeader>
          <CardContent>
            {ol ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : !orders?.length ? (
              <p className="text-sm text-muted-foreground">No orders yet.</p>
            ) : (
              <ul className="space-y-3">
                {orders.map((o: { id: string; total: number; status: string; created_at: string; order_items: { id: string; product_name: string; quantity: number }[] }) => (
                  <li key={o.id} className="rounded-lg border border-border bg-background/40 p-3">
                    <div className="flex items-center justify-between"><span className="font-semibold">₱{Number(o.total).toLocaleString()}</span><Badge variant="secondary">{o.status}</Badge></div>
                    <div className="mt-1 text-xs text-muted-foreground">{o.order_items?.length ?? 0} item(s) · {new Date(o.created_at).toLocaleDateString()}</div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
