import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLoginGate } from "@/hooks/use-login-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/booking")({
  head: () => ({ meta: [{ title: "Book a Service — ARJO X OB" }] }),
  component: BookingPage,
});

const SERVICES = ["General Tune-Up", "Engine Overhaul", "Custom Build", "Detailing & Polish", "Diagnostics", "Parts Installation"];

const schema = z.object({
  customer_name: z.string().trim().min(2).max(100),
  motorcycle_model: z.string().trim().min(2).max(100),
  service_type: z.string().min(1, "Please select a service"),
  preferred_date: z.string().min(1, "Pick a date"),
  preferred_time: z.string().min(1, "Pick a time"),
  notes: z.string().max(500).optional(),
});

function BookingPage() {
  const { user, profile } = useAuth();
  const { requireAuth } = useLoginGate();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customer_name: "", motorcycle_model: "", service_type: "", preferred_date: "", preferred_time: "", notes: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) { requireAuth(); return; }
    if (profile && !form.customer_name) setForm((f) => ({ ...f, customer_name: profile.full_name }));
  }, [user, profile]); // eslint-disable-line

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="font-display text-4xl">Login Required</h1>
        <p className="mt-2 text-muted-foreground">You must login or create an account to book a service.</p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { out[i.path[0] as string] = i.message; });
      setErrs(out); return;
    }
    setErrs({}); setLoading(true);
    const { error } = await supabase.from("bookings").insert({ ...parsed.data, user_id: user.id });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking submitted! We'll be in touch soon.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="font-display text-3xl">BOOK A SERVICE</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cn">Name</Label>
              <Input id="cn" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
              {errs.customer_name && <p className="text-xs text-destructive">{errs.customer_name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="mm">Motorcycle Model</Label>
              <Input id="mm" placeholder="e.g. Yamaha MT-15" value={form.motorcycle_model} onChange={(e) => setForm({ ...form, motorcycle_model: e.target.value })} />
              {errs.motorcycle_model && <p className="text-xs text-destructive">{errs.motorcycle_model}</p>}
            </div>
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select value={form.service_type} onValueChange={(v) => setForm({ ...form, service_type: v })}>
                <SelectTrigger><SelectValue placeholder="Choose a service" /></SelectTrigger>
                <SelectContent>{SERVICES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
              {errs.service_type && <p className="text-xs text-destructive">{errs.service_type}</p>}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pd">Preferred Date</Label>
                <Input id="pd" type="date" value={form.preferred_date} onChange={(e) => setForm({ ...form, preferred_date: e.target.value })} />
                {errs.preferred_date && <p className="text-xs text-destructive">{errs.preferred_date}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pt">Preferred Time</Label>
                <Input id="pt" type="time" value={form.preferred_time} onChange={(e) => setForm({ ...form, preferred_time: e.target.value })} />
                {errs.preferred_time && <p className="text-xs text-destructive">{errs.preferred_time}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-fire text-primary-foreground">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Booking
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
