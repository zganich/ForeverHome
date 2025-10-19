import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { PawPrint, Sparkles, Heart, TrendingUp, Shield, Users, Volume2, Mic, Bell, GitCompareArrows, Dog } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center mb-6 animate-pulse">
              <Volume2 className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            The All-In-One Pet Parenting App
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Understand, Care, Compare
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Instantly analyze your pet's behavior, identify their breed, get care reminders, and even compare behavior across multiple pets. InterpWhat is your complete toolkit for being the best pet parent you can be.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <a href={getLoginUrl()}>Get Started Free</a>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                  <a href="#features">See Features</a>
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            ✨ Free plan available • Upgrade for premium features
          </p>
        </div>
      </section>

      {/* Chantell's Story */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <Heart className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-4">Built with Love, For Every Pet</h3>
            </div>

            <Card className="border-2 border-accent/20">
              <CardContent className="pt-6 space-y-6 text-lg leading-relaxed">
                <p>
                  InterpWhat was born from a lifelong love of animals and a simple question: 
                  <em className="font-semibold text-primary"> "How can I help my pet feel understood?"</em>
                </p>

                <p>
                  Created by Chantell, an animal lover who has dedicated her life to caring for pets, 
                  this app represents decades of wondering what her companions were trying to tell her. 
                  After 17 beautiful years with Paisley, her beloved dog, Chantell's two sons experienced 
                  the heartbreak of saying goodbye to the only dog they'd ever known.
                </p>

                <p>
                  Paisley taught them that every tail wag, every bark, every quiet moment had meaning. 
                  InterpWhat honors that bond by helping pet owners everywhere understand their companions 
                  on a deeper level—<strong>and now, hear what they would say if they could speak</strong>.
                </p>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <p className="font-semibold text-accent mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Every Subscription Helps
                  </p>
                  <p className="text-base">
                    A portion of every subscription goes directly to no-kill animal shelters, 
                    helping pets who are still waiting for their forever homes. When you understand 
                    your pet better, you're also helping animals in need.
                  </p>
                </div>

                <p className="text-center italic text-muted-foreground pt-4">
                  "Every pet deserves to be understood." 🐾
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">A Smarter Way to Care for Your Pet</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">From behavior analysis to daily care, InterpWhat has you covered.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                <Volume2 className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">Hear Your Pet's Voice</h4>
                <p className="text-muted-foreground">
                  Our viral-hit feature! Choose from 7 unique personality voices to hear what your pet is really thinking—in their own words!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Dog className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">AI Breed Identification</h4>
                <p className="text-muted-foreground">
                  Curious about your rescue's roots? Upload a photo and our AI will identify the most likely breeds, complete with confidence scores.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Bell className="w-10 h-10 text-accent" />
                <h4 className="text-xl font-bold">Care Reminders & Notifications</h4>
                <p className="text-muted-foreground">
                  Never miss a vet appointment, medication dose, or grooming session again. Schedule reminders and get timely notifications.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <GitCompareArrows className="w-10 h-10 text-secondary" />
                <h4 className="text-xl font-bold">Multi-Pet Comparison</h4>
                <p className="text-muted-foreground">
                  Own more than one pet? Compare their behaviors, timelines, and personalities side-by-side to understand their unique dynamics.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <TrendingUp className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">Pet Timeline™</h4>
                <p className="text-muted-foreground">
                  Track behavioral evolution from their early years to the present. Understand patterns and detect changes early.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Shield className="w-10 h-10 text-destructive" />
                <h4 className="text-xl font-bold">Photo Quality Protection</h4>
                <p className="text-muted-foreground">
                  Our system validates your photo quality *before* using a credit, ensuring you always get a high-quality analysis.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Choose Your Plan</h3>
          <p className="text-xl text-muted-foreground">Become a better pet parent today. Cancel anytime.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardContent className="pt-6 space-y-4 text-center">
              <h4 className="text-2xl font-bold">Essential</h4>
              <div className="text-4xl font-bold">$9<span className="text-2xl text-muted-foreground">.99/mo</span></div>
              <p className="text-muted-foreground h-12">For the everyday pet owner.</p>
              <Button variant="outline" className="w-full">Choose Essential</Button>
              <ul className="space-y-3 text-sm text-left pt-4">
                <li className="flex items-center gap-2">✓ <span className="font-bold">10</span> AI Analyses per month</li>
                <li className="flex items-center gap-2">✓ Pet Voice™ Analysis</li>
                <li className="flex items-center gap-2">✓ Pet Timeline™</li>
                <li className="flex items-center gap-2">✓ Email Support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
              MOST POPULAR
            </div>
            <CardContent className="pt-10 space-y-4 text-center">
              <h4 className="text-2xl font-bold">Premium</h4>
              <div className="text-4xl font-bold">$19<span className="text-2xl text-muted-foreground">.99/mo</span></div>
              <p className="text-muted-foreground h-12">For the dedicated pet enthusiast.</p>
              <Button className="w-full">Choose Premium</Button>
              <ul className="space-y-3 text-sm text-left pt-4">
                <li className="flex items-center gap-2">✓ <span className="font-bold">30</span> AI Analyses per month</li>
                <li className="flex items-center gap-2">✓ All Essential features, plus:</li>
                <li className="flex items-center gap-2 font-bold text-primary">✓ AI Breed Identification</li>
                <li className="flex items-center gap-2 font-bold text-primary">✓ Care Reminders & Notifications</li>
                <li className="flex items-center gap-2 font-bold text-primary">✓ Multi-Pet Comparison</li>
                <li className="flex items-center gap-2">✓ Priority Support</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 space-y-4 text-center">
              <h4 className="text-2xl font-bold">Shelter Partner</h4>
              <div className="text-4xl font-bold">$99<span className="text-2xl text-muted-foreground">/3mo</span></div>
              <p className="text-muted-foreground h-12">For shelters and rescue organizations.</p>
              <Button variant="outline" className="w-full">Become a Partner</Button>
              <ul className="space-y-3 text-sm text-left pt-4">
                <li className="flex items-center gap-2">✓ <span className="font-bold">Unlimited</span> AI Analyses</li>
                <li className="flex items-center gap-2">✓ All Premium features</li>
                <li className="flex items-center gap-2">✓ Co-marketing opportunities</li>
                <li className="flex items-center gap-2">✓ Dedicated Partner Support</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          A portion of all subscriptions supports no-kill animal shelters 🐾
        </p>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary via-accent to-secondary py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Understand Your Pet Better?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of pet owners building deeper connections with their companions.
          </p>
          {isAuthenticated ? (
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <a href={getLoginUrl()}>Get Started Free</a>
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              <PawPrint className="w-6 h-6 text-primary" />
              <span className="font-bold text-lg">{APP_TITLE}</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-md">
              Built with ❤️ by Chantell, her boys, and in memory of Paisley.
            </p>
            <p className="text-xs text-muted-foreground">
              Every pet deserves to be understood. 🐾
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} InterpWhat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

