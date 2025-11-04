import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { APP_TITLE } from "@/const";
import { Check, ArrowLeft, Sparkles, Shield, Lock, CreditCard, Users } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const PLANS = [
  {
    id: "essential",
    name: "Essential",
    price: "$9.99",
    interval: "/month",
    description: "Perfect for pet owners with 1-2 pets",
    features: [
      "15 analyses per month",
      "Breed identification",
      "Reminders & notifications",
      "Email support",
      "Pet timeline",
      "Photo quality check",
    ],
    shelterDonation: "$1.00/month to shelters",
  },
  {
    id: "premium",
    name: "Premium",
    price: "$19.99",
    interval: "/month",
    description: "Best for multi-pet households",
    features: [
      "Unlimited analyses",
      "Priority support",
      "Advanced insights",
      "Multi-pet comparison",
      "Medical records storage",
      "All Essential features",
    ],
    badge: "POPULAR",
    highlight: true,
    shelterDonation: "$2.00/month to shelters",
  },
  {
    id: "realtime",
    name: "Real-Time Premium",
    price: "$39.99",
    interval: "/month",
    description: "Live behavior insights in real-time",
    features: [
      "5 hours real-time monitoring/month",
      "Live behavior insights (< 5 seconds)",
      "Unlimited standard analyses",
      "All Premium features",
      "Priority support",
      "Advanced analytics",
    ],
    badge: "NEW",
    highlight: false,
    shelterDonation: "$4.00/month to shelters",
  },
  {
    id: "ultimate",
    name: "Ultimate Real-Time",
    price: "$79.99",
    interval: "/month",
    description: "Maximum real-time monitoring",
    features: [
      "15 hours real-time monitoring/month",
      "Live behavior insights (< 5 seconds)",
      "Unlimited standard analyses",
      "Advanced analytics dashboard",
      "All Premium features",
      "Priority support",
    ],
    badge: "PREMIUM",
    highlight: false,
    shelterDonation: "$8.00/month to shelters",
  },
  {
    id: "shelter",
    name: "Shelter Partner",
    price: "$99",
    interval: "/3 months",
    description: "Perfect for new pet adopters",
    features: [
      "Everything in Premium",
      "3-month commitment",
      "$10 donation to shelter",
      "Tax-deductible portion",
      "Support animal welfare",
      "Founding member perks",
    ],
    shelterDonation: "$10 to shelters",
  },
];

export default function Subscribe() {
  const { user, isAuthenticated } = useAuth();

  const createSubscription = trpc.payment.createSubscriptionCheckout.useMutation({
    onSuccess: (data) => {
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create checkout session");
      }
    },
    onError: (error) => {
      toast.error(`Failed to start subscription: ${error.message}`);
    },
  });

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe");
      return;
    }

    createSubscription.mutate({
      planId: planId as "essential" | "premium" | "shelter",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-peach-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">Choose Your Plan</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Understand Your Pet Better
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Choose the plan that works best for you and your furry companions.
              Every subscription helps support Chantell's family and no-kill animal shelters.
            </p>
            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-green-600" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span>No Hidden Fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <span>Trusted by Pet Owners</span>
              </div>
            </div>
          </div>

          {/* Free Tier */}
          <Card className="mb-8 border-2 border-muted">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Try InterpWhat risk-free</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">$0</div>
                  <div className="text-sm text-muted-foreground">forever</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">3 analyses per month</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Basic features</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Community support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard" className="w-full">
                <Button variant="outline" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Feature Comparison Table */}
          <Card className="mb-8 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Compare Plans</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-4 font-semibold">Features</th>
                      <th className="text-center p-4 font-semibold">Free</th>
                      <th className="text-center p-4 font-semibold">Essential</th>
                      <th className="text-center p-4 font-semibold bg-purple-50">Premium</th>
                      <th className="text-center p-4 font-semibold">Shelter Partner</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Monthly Analyses</td>
                      <td className="text-center p-4">3</td>
                      <td className="text-center p-4">15</td>
                      <td className="text-center p-4 bg-purple-50"><strong>Unlimited</strong></td>
                      <td className="text-center p-4"><strong>Unlimited</strong></td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td className="p-4 font-medium">Breed Identification</td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Pet Timeline</td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td className="p-4 font-medium">Reminders & Notifications</td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Photo Quality Check</td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td className="p-4 font-medium">Multi-Pet Comparison</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Advanced Insights</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b bg-muted/20">
                      <td className="p-4 font-medium">Medical Records Storage</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4 bg-purple-50"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                      <td className="text-center p-4"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 font-medium">Support</td>
                      <td className="text-center p-4">Community</td>
                      <td className="text-center p-4">Email</td>
                      <td className="text-center p-4 bg-purple-50"><strong>Priority</strong></td>
                      <td className="text-center p-4"><strong>Priority</strong></td>
                    </tr>
                    <tr className="bg-muted/20">
                      <td className="p-4 font-medium">Shelter Donation</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4">—</td>
                      <td className="text-center p-4 bg-purple-50">—</td>
                      <td className="text-center p-4">$10 (tax-deductible)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Paid Plans */}
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.highlight
                    ? "border-2 border-purple-500 shadow-xl scale-105"
                    : "border-2 border-muted"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-purple-500 text-white px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={createSubscription.isPending}
                  >
                    {createSubscription.isPending ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Subscribe Now</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Money-Back Guarantee */}
          <Card className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardContent className="pt-6 text-center">
              <h3 className="text-xl font-bold mb-2 flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                30-Day Money-Back Guarantee
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Not satisfied? Get a full refund within 30 days, no questions asked. We're confident you'll love InterpWhat!
              </p>
            </CardContent>
          </Card>

          {/* Social Impact Message */}
          <div className="mt-8 text-center">
            <Card className="bg-gradient-to-r from-purple-50 to-peach-50 border-purple-200">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Your Subscription Makes a Difference</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Every subscription helps support Chantell's family and contributes to no-kill
                  animal shelters. Together, we're making the world better for pets and the people
                  who love them. 🐾💜
                </p>
              </CardContent>
            </Card>
          </div>

          {/* FAQ */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-center mb-6">Frequently Asked Questions</h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Yes! You can cancel your subscription at any time. You'll continue to have
                    access until the end of your billing period.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What if I need more analyses?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Essential plan users can upgrade to Premium for unlimited analyses, or purchase
                    one-time credit packs as needed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is the shelter donation tax-deductible?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Yes! The $10 shelter donation portion of the Shelter Partner plan is
                    tax-deductible. We'll provide documentation for your records.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I switch plans later?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Absolutely! You can upgrade or downgrade your plan at any time. Changes take
                    effect at the start of your next billing cycle.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

