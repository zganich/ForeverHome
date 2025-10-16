import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { PawPrint, Sparkles, Heart, TrendingUp, Shield, Users } from "lucide-react";
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
              <Sparkles className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Understand Your Pet's
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Every Emotion
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload a photo or video of your pet, and our advanced AI instantly analyzes their behavior, 
            emotions, and body language—giving you insights that help you care for them better.
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
                  <a href="#how-it-works">See How It Works</a>
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            ✨ 3 free analyses every month • No credit card required
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
                  on a deeper level—before it's too late.
                </p>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <p className="font-semibold text-accent mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Every Analysis Helps
                  </p>
                  <p className="text-base">
                    A portion of every paid analysis goes directly to no-kill animal shelters, 
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

      {/* How It Works */}
      <section id="how-it-works" className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">How It Works</h3>
          <p className="text-xl text-muted-foreground">Three simple steps to understand your pet</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h4 className="text-xl font-bold">Upload a Photo or Video</h4>
              <p className="text-muted-foreground">
                Capture your pet showing a specific behavior. The clearer the better!
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-accent">2</span>
              </div>
              <h4 className="text-xl font-bold">AI Analyzes Behavior</h4>
              <p className="text-muted-foreground">
                Our advanced AI agents examine body language, expressions, and context in seconds.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
                <span className="text-3xl font-bold text-secondary">3</span>
              </div>
              <h4 className="text-xl font-bold">Get Actionable Insights</h4>
              <p className="text-muted-foreground">
                Receive clear explanations and specific recommendations to help your pet.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Why Pet Owners Love InterpWhat</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <Sparkles className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">AI-Powered Accuracy</h4>
                <p className="text-muted-foreground">
                  Advanced AI agents trained on thousands of pet behaviors provide accurate, 
                  science-backed insights.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <TrendingUp className="w-10 h-10 text-accent" />
                <h4 className="text-xl font-bold">Personalized Over Time</h4>
                <p className="text-muted-foreground">
                  The more you use InterpWhat, the better it understands YOUR specific pet's 
                  unique personality and patterns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Shield className="w-10 h-10 text-secondary" />
                <h4 className="text-xl font-bold">Safety First</h4>
                <p className="text-muted-foreground">
                  We never diagnose medical conditions and always recommend veterinary 
                  consultation when needed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Heart className="w-10 h-10 text-destructive" />
                <h4 className="text-xl font-bold">Supports Shelters</h4>
                <p className="text-muted-foreground">
                  Every paid analysis contributes to no-kill animal shelters, helping pets 
                  find their forever homes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <Users className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">Multi-Pet Support</h4>
                <p className="text-muted-foreground">
                  Track and analyze all your pets in one place, with separate profiles and 
                  history for each companion.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <PawPrint className="w-10 h-10 text-accent" />
                <h4 className="text-xl font-bold">Works for All Pets</h4>
                <p className="text-muted-foreground">
                  Dogs, cats, and other pets—our AI understands the unique behaviors of 
                  different species.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h3>
          <p className="text-xl text-muted-foreground">No subscriptions. No surprises. Just credits that never expire.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <h4 className="text-2xl font-bold">Free</h4>
              <div className="text-4xl font-bold">$0</div>
              <p className="text-muted-foreground">Perfect for trying it out</p>
              <ul className="space-y-2 text-sm">
                <li>✓ 3 analyses per month</li>
                <li>✓ All core features</li>
                <li>✓ Email support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary shadow-lg scale-105">
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-2xl font-bold">Value Pack</h4>
                <span className="text-xs font-bold bg-primary text-primary-foreground px-2 py-1 rounded">BEST VALUE</span>
              </div>
              <div className="text-4xl font-bold">$9.99</div>
              <p className="text-muted-foreground">25 analyses • Credits never expire</p>
              <ul className="space-y-2 text-sm">
                <li>✓ Just $0.40 per analysis</li>
                <li>✓ Unlock personalization</li>
                <li>✓ Support shelter animals</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="pt-6 space-y-4">
              <h4 className="text-2xl font-bold">Power Pack</h4>
              <div className="text-4xl font-bold">$19.99</div>
              <p className="text-muted-foreground">60 analyses • Best price per use</p>
              <ul className="space-y-2 text-sm">
                <li>✓ Just $0.33 per analysis</li>
                <li>✓ Full personalization</li>
                <li>✓ Priority support</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-muted-foreground mt-8">
          All credit packs include a donation to no-kill animal shelters 🐾
        </p>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary to-accent py-20">
        <div className="container mx-auto px-6 text-center text-primary-foreground">
          <h3 className="text-4xl font-bold mb-6">Ready to Understand Your Pet Better?</h3>
          <p className="text-xl mb-8 opacity-90">
            Join pet owners who are building deeper connections with their companions.
          </p>
          {isAuthenticated ? (
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <a href={getLoginUrl()}>Start Free Today</a>
            </Button>
          )}
          <p className="text-sm mt-4 opacity-75">No credit card required • 3 free analyses every month</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <PawPrint className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">{APP_TITLE}</span>
            </div>
            <p className="text-muted-foreground">
              Built with ❤️ for Chantell, her boys, and in memory of Paisley
            </p>
            <p className="text-sm text-muted-foreground">
              Every pet deserves to be understood. 🐾
            </p>
            <p className="text-xs text-muted-foreground">
              © 2025 InterpWhat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

