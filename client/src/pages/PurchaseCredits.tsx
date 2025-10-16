import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { PawPrint, ArrowLeft, Sparkles, Check, Heart } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function PurchaseCredits() {
  const { isAuthenticated } = useAuth();

  const { data: creditPacks, isLoading: packsLoading } = trpc.payment.getCreditPacks.useQuery();
  const { data: balance } = trpc.credits.getBalance.useQuery(undefined, { enabled: isAuthenticated });

  const createCheckout = trpc.payment.createCheckout.useMutation({
    onSuccess: (data) => {
      // Redirect to Stripe checkout
      window.location.href = data.url;
    },
    onError: (error) => {
      toast.error(`Failed to start checkout: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  const handlePurchase = (packId: "starter" | "value" | "power") => {
    createCheckout.mutate({ packId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Current Balance */}
          {balance && (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Your Current Balance</p>
                    <p className="text-4xl font-bold text-primary">
                      {balance.isBetaTester ? "∞" : balance.credits}
                      <span className="text-lg text-muted-foreground ml-2">
                        {balance.isBetaTester ? "Unlimited" : "credits"}
                      </span>
                    </p>
                    {balance.isBetaTester && (
                      <Badge className="mt-2 bg-gradient-to-r from-primary to-accent">
                        🏆 Founding Member
                      </Badge>
                    )}
                  </div>
                  <Sparkles className="w-16 h-16 text-primary" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Heading */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Get More Credits</h2>
            <p className="text-xl text-muted-foreground">
              Credits never expire. Use them whenever you need insights about your pet.
            </p>
          </div>

          {/* Credit Packs */}
          {packsLoading ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {creditPacks?.map((pack) => (
                <Card
                  key={pack.id}
                  className={`border-2 ${
                    "badge" in pack ? "border-primary shadow-lg scale-105" : "border-border"
                  } hover:shadow-xl transition-all`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-2xl">{pack.name}</CardTitle>
                      {"badge" in pack && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          {pack.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="text-5xl font-bold">{pack.priceDisplay}</div>
                    <CardDescription className="text-base">
                      {pack.credits} analyses • {pack.perAnalysis} each
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Credits never expire</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Use anytime, no rush</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Unlock personalization</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Heart className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                        <span>Supports shelter animals</span>
                      </li>
                    </ul>
                    <Button
                      className="w-full"
                      size="lg"
                      variant={"badge" in pack ? "default" : "outline"}
                      onClick={() => handlePurchase(pack.id as "starter" | "value" | "power")}
                      disabled={createCheckout.isPending || balance?.isBetaTester}
                    >
                      {balance?.isBetaTester ? "You Have Unlimited" : "Purchase"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Benefits */}
          <Card className="bg-gradient-to-br from-accent/10 to-secondary/10 border-2 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-accent" />
                Every Purchase Helps Shelter Animals
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                $0.10 from every analysis goes directly to no-kill animal shelters. When you understand your pet
                better, you're also helping pets who are still waiting for their forever homes. Together, we're making
                a difference. 🐾
              </p>
            </CardContent>
          </Card>

          {/* FAQ */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-center">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do credits expire?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  No! Credits never expire. Buy them now, use them whenever you need insights about your pet.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I share credits?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Credits are tied to your account and can be used for any of your pets. They cannot be transferred to
                  other users.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I'm not satisfied?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  We want you to be happy! If an analysis doesn't meet your expectations, contact us and we'll make it
                  right.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is payment secure?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Yes! All payments are processed securely through Stripe, a trusted payment platform used by millions
                  of businesses.
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

