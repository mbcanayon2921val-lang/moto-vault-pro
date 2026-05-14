import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Search = { tab?: "login" | "signup" };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    tab: s.tab === "signup" ? "signup" : "login",
  }),
  head: () => ({ meta: [{ title: "Login or Sign Up — ARJO X OB" }] }),
  component: AuthPage,
});

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(100),
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  password: z.string().min(8, "Min 8 characters").regex(/[A-Z]/, "Must include an uppercase letter").regex(/[a-z]/, "Must include a lowercase letter").regex(/\d/, "Must include a number"),
  confirm: z.string(),
  agree: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms and Privacy Policy" }) }),
}).refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

const loginSchema = z.object({
  email: z.string().trim().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

function AuthPage() {
  const { tab } = Route.useSearch();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-12rem)] max-w-md items-center px-4 py-10">
      <Card className="w-full border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-center font-display text-3xl tracking-wide">Welcome to ARJO X OB</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab ?? "login"}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login"><LoginForm /></TabsContent>
            <TabsContent value="signup"><SignupForm /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errs, setErrs] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { out[i.path[0] as string] = i.message; });
      setErrs(out); return;
    }
    setErrs({}); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <Input id="login-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errs.email && <p className="text-xs text-destructive">{errs.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="login-pw">Password</Label>
        <Input id="login-pw" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {errs.password && <p className="text-xs text-destructive">{errs.password}</p>}
      </div>
      <Button type="submit" disabled={loading} className="w-full bg-gradient-fire text-primary-foreground">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Login
      </Button>
    </form>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "", email: "", phone: "", password: "", confirm: "", agree: false });
  const [errs, setErrs] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      const out: Record<string, string> = {};
      parsed.error.issues.forEach((i) => { out[i.path[0] as string] = i.message; });
      setErrs(out); return;
    }
    setErrs({}); setLoading(true);

    // Check duplicate username before signup
    const { data: existing } = await supabase.from("profiles").select("id").eq("username", parsed.data.username).maybeSingle();
    if (existing) {
      setLoading(false);
      setErrs({ username: "Username is already taken" });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: parsed.data.full_name,
          username: parsed.data.username,
          phone: parsed.data.phone,
        },
      },
    });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("registered")) {
        setErrs({ email: "This email is already registered" });
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success("Account created! Welcome to ARJO X OB.");
    navigate({ to: "/dashboard" });
  };

  const F = (key: keyof typeof form, label: string, type = "text") => (
    <div className="space-y-2">
      <Label htmlFor={`s-${key}`}>{label}</Label>
      <Input id={`s-${key}`} type={type} value={form[key] as string} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />
      {errs[key] && <p className="text-xs text-destructive">{errs[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {F("full_name", "Full Name")}
      {F("username", "Username")}
      {F("email", "Email", "email")}
      {F("phone", "Phone Number", "tel")}
      {F("password", "Password", "password")}
      {F("confirm", "Confirm Password", "password")}
      <div className="flex items-start gap-2 pt-2">
        <Checkbox id="agree" checked={form.agree} onCheckedChange={(c) => setForm({ ...form, agree: c === true })} />
        <label htmlFor="agree" className="text-sm leading-relaxed text-muted-foreground">
          I agree to the <Link to="/terms" className="text-primary hover:underline">Terms and Conditions</Link> and{" "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
        </label>
      </div>
      {errs.agree && <p className="text-xs text-destructive">{errs.agree}</p>}
      <Button type="submit" disabled={loading} className="w-full bg-gradient-fire text-primary-foreground">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Account
      </Button>
    </form>
  );
}
