import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainNavigation from "@/components/MainNavigation";
import StickyCTA from "@/components/StickyCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SocialProof from "@/components/SocialProof";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import {
  Dog,
  Volume2,
  Heart,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PawPrint,
  Badge,
  Gift,
} from "lucide-react";
import { Link } from "wouter";

export default function ForRescueAdopters() {
  const { user } = useSupabaseAuth();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <MainNavigation />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center mb-6">
              <Dog className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            For Rescue Pet Adopters
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mt-2">
              Special Pricing & Support for Heroes
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            You gave a rescue pet a second chance at a loving home. Now get a lifetime discount on Premium, 
            help your shelter earn revenue, and understand your rescue pet's unique needs with AI-powered insights.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link href="/login">Verify Adoption & Start</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                  <Link href="/subscribe">View Rescue Plan</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              The Challenges of Rescue Pet Ownership
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Unknown Background</h3>
                  <p className="text-muted-foreground">
                    You don't know your rescue's breed mix, history, or past experiences. This makes it 
                    difficult to understand their behavior, energy needs, and potential health considerations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Behavioral Mysteries</h3>
                  <p className="text-muted-foreground">
                    Rescue pets often have unique behaviors shaped by past experiences. Understanding what's 
                    normal adjustment vs. concerning behavior is challenging without expert guidance.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Higher Care Needs</h3>
                  <p className="text-muted-foreground">
                    Rescue pets may need more attention, patience, and specialized care. You want to provide 
                    the best support but need tools designed for their unique challenges.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Want to Support Your Shelter</h3>
                  <p className="text-muted-foreground">
                    You want to give back to the shelter that helped you find your pet, but don't always 
                    know how. There should be a way to support them while getting the tools you need.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4">
            How InterpWhat Helps Rescue Pet Parents
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Special pricing, AI-powered insights, and shelter support—all in one
          </p>

          <div className="space-y-8">
            <Card className="border-2 border-accent/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-8 h-8 text-accent" />
                  <h3 className="text-2xl font-bold">Rescue Adopter Plan - $14.99/month</h3>
                  <Badge className="bg-accent text-accent-foreground">Lifetime Discount</Badge>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Get Premium features for less.</strong> As a rescue adopter, you get a lifetime $5/month 
                  discount on Premium ($14.99 instead of $19.99). All Premium features included, plus a special 
                  "Rescue Pet Parent" badge on your profile.
                </p>
                <div className="bg-accent/10 p-4 rounded-lg">
                  <p className="text-sm font-medium text-accent mb-2">What You Get:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>All Premium features (unlimited pets, 30 analyses/month)</li>
                    <li>Lifetime $5/month discount</li>
                    <li>"Rescue Pet Parent" badge</li>
                    <li>Priority support (rescue pets may have more challenges)</li>
                    <li>10% of your subscription goes to your shelter</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Dog className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">AI Breed Identification</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Discover your rescue's breed mix instantly.</strong> Upload a photo and our AI identifies 
                  the most likely breeds with confidence scores. Understanding their breed helps you provide 
                  appropriate exercise, nutrition, and care—essential for rescue pets with unknown backgrounds.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Pet Voice™ Analysis</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Understand your rescue's emotional state.</strong> Get AI-powered behavior analysis that 
                  helps you decode your rescue pet's behaviors, especially important for pets with unknown past 
                  experiences. Pet Voice™ helps you understand their needs and build trust.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Priority Support</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Get help when you need it.</strong> Rescue pets may have unique challenges, so we provide 
                  priority support (24-hour response) to help you navigate any issues. We're here to support 
                  your rescue pet journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Heart className="w-8 h-8 text-accent" />
                  <h3 className="text-2xl font-bold">Support Your Shelter</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>10% of your subscription goes to your shelter.</strong> When you verify your adoption 
                  through our shelter partner program, 10% of your monthly subscription ($1.50/month) goes directly 
                  to the shelter that helped you find your pet. Give back while getting the tools you need.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Better Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">
              Why InterpWhat is Better for Rescue Adopters
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12">
              The only platform with special pricing and shelter support for rescue pet parents
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold">InterpWhat</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Lifetime $5/month discount for rescue adopters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>AI breed identification for unknown backgrounds</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>10% revenue share supports your shelter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Priority support for rescue pet challenges</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>All Premium features included</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-muted">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm">×</span>
                    <h3 className="text-xl font-bold">Other Solutions</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>No special pricing for rescue adopters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>No breed identification tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>No way to support your shelter</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Generic support, not rescue-specific</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Full price for all users</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-accent">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">The Only Platform That Supports Rescue Adopters</h3>
                    <p className="text-muted-foreground mb-4">
                      InterpWhat is the only platform that recognizes and rewards rescue pet adopters. Our 
                      lifetime discount program, combined with AI breed identification and shelter revenue sharing, 
                      makes us uniquely positioned to support rescue pet parents. Plus, a portion of every subscription 
                      goes to no-kill shelters—helping more pets find their forever homes.
                    </p>
                    <p className="font-semibold text-accent">
                      Get Premium features for $14.99/month. Support your shelter. Understand your rescue pet better. 
                      All while helping other pets in need.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProof />

      {/* Social Impact */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-primary/10">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-3">
                <PawPrint className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold">Your Subscription Helps Animals in Need</h3>
              </div>
              <p className="text-lg text-muted-foreground">
                <strong>A portion of every subscription goes directly to no-kill animal shelters and rescue 
                organizations in your community.</strong> When you understand your pet better, you're also helping 
                pets who are still waiting for their forever homes find loving families.
              </p>
              <p className="text-muted-foreground">
                <strong>Plus, as a rescue adopter:</strong> 10% of your subscription ($1.50/month) goes directly 
                to the shelter that helped you find your pet. Give back to the organization that made your adoption 
                possible while getting the tools you need.
              </p>
              <p className="text-muted-foreground">
                InterpWhat was created by Chantell, a lifelong animal lover, in memory of her beloved dog Paisley. 
                Our mission is to help pet parents build deeper connections while supporting animal welfare—one 
                subscription at a time.
              </p>
              <div className="flex items-center gap-2 text-accent font-semibold">
                <Heart className="w-5 h-5" />
                <span>Every pet deserves to be understood. Every subscription helps save a life.</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary via-accent to-secondary py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Get Special Pricing & Support Your Shelter?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Verify your adoption to unlock lifetime $5/month discount and help your shelter earn revenue. 
            Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
                  <Link href="/login">
                    Verify Adoption & Start
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                  <Link href="/subscribe">
                    View Rescue Plan
                  </Link>
                </Button>
              </>
            )}
          </div>
          <p className="text-sm text-primary-foreground/80 mt-4">
            Adoption verification required • Free trial available • Cancel anytime
          </p>
        </div>
      </section>

      {/* Sticky CTA Bar */}
      <StickyCTA />

      {/* Exit Intent Popup */}
      <ExitIntentPopup />
    </div>
  );
}

