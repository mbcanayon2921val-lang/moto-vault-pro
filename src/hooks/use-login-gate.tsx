import { createContext, useContext, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuth } from "./use-auth";
import { Lock } from "lucide-react";

interface Ctx {
  /** Returns true if the user is authed; otherwise opens the login-required modal and returns false. */
  requireAuth: () => boolean;
  open: () => void;
}

const C = createContext<Ctx | undefined>(undefined);

export function LoginGateProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const requireAuth = () => {
    if (user) return true;
    setIsOpen(true);
    return false;
  };

  return (
    <C.Provider value={{ requireAuth, open: () => setIsOpen(true) }}>
      {children}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Lock className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-2xl">Login Required</DialogTitle>
            <DialogDescription className="text-center">
              You must login or create an account first to continue with this action.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button asChild className="w-full bg-gradient-fire text-primary-foreground" onClick={() => setIsOpen(false)}>
              <Link to="/auth" search={{ tab: "login" }}>Login</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
              <Link to="/auth" search={{ tab: "signup" }}>Create an account</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </C.Provider>
  );
}

export function useLoginGate() {
  const v = useContext(C);
  if (!v) throw new Error("useLoginGate must be used within LoginGateProvider");
  return v;
}
