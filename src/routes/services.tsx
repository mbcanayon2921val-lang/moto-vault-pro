import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Wrench, Gauge, Settings, Sparkles, ShieldCheck, Cog } from "lucide-react";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "Motorcycle Services — ARJO X OB" }] }),
  component: ServicesPage,
});

const services = [
  { icon: Wrench, title: "General Tune-Up", desc: "Full inspection, fluid checks, chain & brake adjustment." },
  { icon: Gauge, title: "Engine Overhaul", desc: "Top-end and bottom-end rebuilds by certified mechanics." },
  { icon: Settings, title: "Custom Builds", desc: "From cafe racer to track-ready — built to your spec." },
  { icon: Sparkles, title: "Detailing & Polish", desc: "Showroom-grade cleaning and ceramic protection." },
  { icon: ShieldCheck, title: "Diagnostics", desc: "Computer-aided fault detection for modern motorcycles." },
  { icon: Cog, title: "Parts Installation", desc: "Professional fitting of all parts purchased in our shop." },
];

function ServicesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-display text-5xl tracking-wide">OUR SERVICES</h1>
        <p className="mt-2 text-muted-foreground">From routine maintenance to full custom builds.</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.title} className="border-border/60 bg-card transition hover:border-primary/50">
            <CardContent className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-fire text-primary-foreground">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-12 rounded-2xl bg-gradient-fire p-8 text-center text-primary-foreground shadow-glow">
        <h2 className="font-display text-3xl">READY TO BOOK?</h2>
        <p className="mt-2">Reserve your slot in just a minute.</p>
        <Button asChild size="lg" variant="secondary" className="mt-4">
          <Link to="/booking">Book a Service</Link>
        </Button>
      </div>
    </div>
  );
}
