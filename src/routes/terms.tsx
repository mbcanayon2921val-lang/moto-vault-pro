import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — ARJO X OB" }] }),
  component: Terms,
});

function Terms() {
  return (
    <article className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-5xl tracking-wide">TERMS & CONDITIONS</h1>
      <p className="mt-2 text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      <div className="prose prose-invert mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground">
        <section><h2 className="text-foreground">1. Acceptance</h2><p>By creating an account or using ARJO X OB Motorcycle Parts & Services, you agree to these Terms and our Privacy Policy.</p></section>
        <section><h2 className="text-foreground">2. User Accounts</h2><p>You must provide accurate information when registering. You are responsible for maintaining the confidentiality of your password and for all activity under your account.</p></section>
        <section><h2 className="text-foreground">3. Online Ordering</h2><p>All orders are subject to product availability and price confirmation. We reserve the right to cancel or refund any order if a product is out of stock or incorrectly priced.</p></section>
        <section><h2 className="text-foreground">4. Service Bookings</h2><p>Booking a slot does not guarantee immediate service. We will contact you to confirm the date and time. Please arrive on time with your motorcycle. Late arrivals may be rescheduled.</p></section>
        <section><h2 className="text-foreground">5. Cancellation Policy</h2><p>Service bookings may be cancelled or rescheduled up to 24 hours before the appointment without penalty. Late cancellations may be subject to a fee. Online orders may be cancelled before they are shipped.</p></section>
        <section><h2 className="text-foreground">6. Warranty</h2><p>Parts carry the manufacturer's warranty. Service workmanship is warrantied for 30 days. Damage caused by accident, misuse, or unauthorized modification is not covered.</p></section>
        <section><h2 className="text-foreground">7. Liability</h2><p>ARJO X OB is not liable for damages arising from improper installation, use, or maintenance of products purchased outside our shop.</p></section>
        <section><h2 className="text-foreground">8. Changes</h2><p>We may update these Terms at any time. Continued use of the service constitutes acceptance of the revised Terms.</p></section>
      </div>
    </article>
  );
}
