import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLoginGate } from "@/hooks/use-login-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/products")({
  head: () => ({ meta: [{ title: "Shop Motorcycle Parts — ARJO X OB" }] }),
  component: ProductsPage,
});

interface Product {
  id: string; name: string; description: string | null; price: number;
  category: string; stock: number; image_url: string | null;
}

function ProductsPage() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Product[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-display text-5xl tracking-wide">SHOP PARTS</h1>
        <p className="mt-2 text-muted-foreground">Premium motorcycle parts and accessories.</p>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products?.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { user } = useAuth();
  const { requireAuth } = useLoginGate();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);

  const addToCart = async () => {
    if (!requireAuth()) return;
    setAdding(true);
    const { data: existing } = await supabase.from("cart_items").select("id, quantity").eq("user_id", user!.id).eq("product_id", p.id).maybeSingle();
    if (existing) {
      await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
    } else {
      await supabase.from("cart_items").insert({ user_id: user!.id, product_id: p.id, quantity: 1 });
    }
    setAdding(false);
    qc.invalidateQueries({ queryKey: ["cart"] });
    toast.success(`${p.name} added to cart`);
  };

  return (
    <Card className="overflow-hidden border-border/60 bg-card transition hover:border-primary/50 hover:shadow-glow">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {p.image_url && <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />}
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2 text-xs">{p.category}</Badge>
        <h3 className="text-xl">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        <div className="font-display text-2xl text-primary">₱{Number(p.price).toLocaleString()}</div>
        <Button size="sm" onClick={addToCart} disabled={adding || p.stock <= 0} className="bg-gradient-fire text-primary-foreground">
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShoppingCart className="mr-2 h-4 w-4" />Add</>}
        </Button>
      </CardFooter>
    </Card>
  );
}
