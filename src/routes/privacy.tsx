import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — ARJO X OB" }] }),
  component: Privacy,
});

function Privacy() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-5xl tracking-wide">PRIVACY POLICY</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose prose-invert mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section><h2 className="text-foreground">1. Information We Collect</h2><p>When you create an account or place an order/booking, we collect your name, username, email, phone, motorcycle model, and order/booking history.</p></section>
        <section><h2 className="text-foreground">2. How We Use Your Data</h2><p>We use your information to: process orders and bookings, contact you about your service, improve our shop, and comply with legal obligations.</p></section>
        <section><h2 className="text-foreground">3. Data Storage & Security</h2><p>Your data is stored securely on our backend. Passwords are hashed and never stored in plain text. All connections are encrypted via HTTPS.</p></section>
        <section><h2 className="text-foreground">4. Sharing</h2><p>We do not sell your personal information. We only share data with service providers strictly necessary to fulfill your orders (e.g. courier partners).</p></section>
        <section><h2 className="text-foreground">5. Your Rights</h2><p>You may request access, correction, or deletion of your personal data at any time by contacting us.</p></section>
        <section><h2 className="text-foreground">6. Cookies & Sessions</h2><p>We use secure session storage to keep you logged in. We do not use third-party advertising trackers.</p></section>
        <section><h2 className="text-foreground">7. Contact</h2><p>For privacy questions, contact ARJO X OB Motorcycle Parts & Services.</p></section>
      </div>
    </article>
  );
}
