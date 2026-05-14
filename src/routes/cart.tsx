import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useLoginGate } from "@/hooks/use-login-gate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Cart — ARJO X OB" }] }),
  component: CartPage,
});

interface CartRow {
  id: string; quantity: number; product_id: string;
  products: { id: string; name: string; price: number; image_url: string | null } | null;
}

function CartPage() {
  const { user } = useAuth();
  const { requireAuth } = useLoginGate();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const { data: items, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["cart", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cart_items")
        .select("id, quantity, product_id, products(id,name,price,image_url)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data as unknown as CartRow[];
    },
  });

  if (!user) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="font-display text-4xl">YOUR CART</h1>
        <p className="mt-2 text-muted-foreground">Login to view your cart and checkout.</p>
        <Button className="mt-6 bg-gradient-fire text-primary-foreground" onClick={() => requireAuth()}>Login</Button>
      </div>
    );
  }

  const total = items?.reduce((s, i) => s + (i.products ? Number(i.products.price) * i.quantity : 0), 0) ?? 0;

  const remove = async (id: string) => {
    await supabase.from("cart_items").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  const updateQty = async (id: string, q: number) => {
    if (q <= 0) return remove(id);
    await supabase.from("cart_items").update({ quantity: q }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["cart"] });
  };

  const checkout = async () => {
    if (!items || items.length === 0) return;
    setCheckingOut(true);
    const { data: order, error } = await supabase.from("orders").insert({ user_id: user.id, total, status: "pending" }).select().single();
    if (error || !order) { setCheckingOut(false); toast.error(error?.message ?? "Checkout failed"); return; }
    const orderItems = items.filter((i) => i.products).map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      product_name: i.products!.name,
      unit_price: i.products!.price,
      quantity: i.quantity,
    }));
    await supabase.from("order_items").insert(orderItems);
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setCheckingOut(false);
    qc.invalidateQueries({ queryKey: ["cart"] });
    toast.success("Order placed! View it in your dashboard.");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-display text-5xl tracking-wide">YOUR CART</h1>
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : !items?.length ? (
        <Card className="mt-8 bg-card"><CardContent className="p-8 text-center text-muted-foreground">
          Your cart is empty. <Link to="/products" className="text-primary hover:underline">Shop parts</Link>
        </CardContent></Card>
      ) : (
        <>
          <div className="mt-8 space-y-3">
            {items.map((i) => (
              <Card key={i.id} className="bg-card">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-muted">
                    {i.products?.image_url && <img src={i.products.image_url} alt={i.products.name} className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{i.products?.name}</div>
                    <div className="text-sm text-muted-foreground">₱{Number(i.products?.price ?? 0).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateQty(i.id, i.quantity - 1)}>-</Button>
                    <span className="w-8 text-center">{i.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQty(i.id, i.quantity + 1)}>+</Button>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => remove(i.id)}><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mt-6 bg-card">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="font-display text-3xl text-primary">₱{total.toLocaleString()}</div>
              </div>
              <Button size="lg" disabled={checkingOut} onClick={checkout} className="bg-gradient-fire text-primary-foreground shadow-glow">
                {checkingOut && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Checkout
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
