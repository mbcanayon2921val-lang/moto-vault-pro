import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-card/40">
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="font-display text-2xl tracking-wide">ARJO X OB</div>
          <p className="mt-2 text-sm text-muted-foreground">Premium motorcycle parts and pro service for riders who don't compromise.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-primary">Services</Link></li>
            <li><Link to="/products" className="hover:text-primary">Shop Parts</Link></li>
            <li><Link to="/booking" className="hover:text-primary">Book Service</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
            <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ARJO X OB Motorcycle Parts & Services. All rights reserved.
      </div>
    </footer>
  );
}
