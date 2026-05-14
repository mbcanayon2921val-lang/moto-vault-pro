import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Wrench, ShoppingBag, Shield, Zap } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARJO X OB — Motorcycle Parts & Services" },
      { name: "description", content: "Premium motorcycle parts, accessories, and professional service bookings." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto grid gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Zap className="h-3.5 w-3.5" /> Built for the ride
            </span>
            <h1 className="font-display text-5xl leading-[0.95] tracking-wide text-foreground md:text-7xl">
              UNLEASH<br />YOUR <span className="text-primary">RIDE</span>
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              ARJO X OB is your one-stop garage for premium motorcycle parts and certified professional service. Order online, book your slot, ride harder.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-fire text-primary-foreground shadow-glow">
                <Link to="/products"><ShoppingBag className="mr-2 h-5 w-5" />Shop Parts</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/booking"><Wrench className="mr-2 h-5 w-5" />Book Service</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200"
              alt="Sport motorcycle"
              className="rounded-2xl object-cover shadow-glow"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: ShoppingBag, title: "Genuine Parts", desc: "OEM and premium aftermarket parts vetted by our master mechanics." },
            { icon: Wrench, title: "Pro Service", desc: "Full-service garage — tune-ups, overhauls, custom builds, diagnostics." },
            { icon: Shield, title: "Warranty Backed", desc: "Every part and service comes with a no-nonsense warranty." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-fire text-primary-foreground">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-2xl">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="overflow-hidden rounded-2xl bg-gradient-fire p-10 text-center text-primary-foreground shadow-glow md:p-16">
          <h2 className="font-display text-4xl md:text-5xl">READY TO RIDE?</h2>
          <p className="mx-auto mt-3 max-w-xl">Create your account to start ordering parts and booking services with ARJO X OB.</p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link to="/auth" search={{ tab: "signup" }}>Create Account</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
