import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bike, ShoppingCart, User as UserIcon, LogOut, LayoutDashboard, Wrench } from "lucide-react";

export function Header() {
  const { user, profile, roles, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-fire text-primary-foreground">
            <Bike className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <div className="font-display text-xl tracking-wide">ARJO X OB</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Motorcycle Parts & Services</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link to="/" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Home</Link>
          <Link to="/products" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Products</Link>
          <Link to="/services" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Services</Link>
          <Link to="/booking" className="text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }}>Book</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild size="icon" variant="ghost"><Link to="/cart"><ShoppingCart className="h-5 w-5" /></Link></Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">{profile?.username ?? user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">{profile?.full_name || profile?.username}</span>
                    <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
                    <span className="mt-1 text-[10px] uppercase tracking-wider text-primary">{roles.join(", ") || "user"}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/booking"><Wrench className="mr-2 h-4 w-4" />Book a Service</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" />Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild className="bg-gradient-fire text-primary-foreground"><Link to="/auth" search={{ tab: "login" }}>Login</Link></Button>
          )}
        </div>
      </div>
    </header>
  );
}
