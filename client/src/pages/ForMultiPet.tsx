import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainNavigation from "@/components/MainNavigation";
import StickyCTA from "@/components/StickyCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SocialProof from "@/components/SocialProof";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import {
  Users,
  GitCompareArrows,
  Volume2,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PawPrint,
  Heart,
  Bell,
} from "lucide-react";
import { Link } from "wouter";

export default function ForMultiPet() {
  const { user } = useFirebaseAuth();
  const isAuthenticated = !!user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <MainNavigation />

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-block">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            For Multi-Pet Households
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mt-2">
              Understand Each Pet's Unique Personality
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Managing multiple pets means managing multiple personalities, needs, and dynamics. InterpWhat helps 
            you understand each pet's unique behavior, compare their patterns side-by-side, and manage their care 
            efficiently—all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            {isAuthenticated ? (
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link href="/login">Start Free Trial</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                  <Link href="/subscribe">View Plans</Link>
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
              The Challenges of Multi-Pet Management
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Complex Dynamics</h3>
                  <p className="text-muted-foreground">
                    Each pet has unique needs, behaviors, and personalities. Understanding why they interact 
                    the way they do and managing individual care requirements is overwhelming without the right tools.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">No Comparison Tool</h3>
                  <p className="text-muted-foreground">
                    You can't easily compare behaviors, health patterns, or timelines across your pets. This makes 
                    it hard to spot individual issues or understand their unique dynamics.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Care Management Chaos</h3>
                  <p className="text-muted-foreground">
                    Managing medications, vet appointments, and care schedules for multiple pets is a juggling act. 
                    You need a system that keeps everything organized and prevents missed appointments.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Individual Needs Get Lost</h3>
                  <p className="text-muted-foreground">
                    It's easy to miss individual pet needs when managing multiple animals. Each pet deserves personalized 
                    attention, but tracking everything separately is time-consuming and inefficient.
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
            How InterpWhat Solves Multi-Pet Challenges
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            The only platform designed specifically for multi-pet households
          </p>

          <div className="space-y-8">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <GitCompareArrows className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Multi-Pet Comparison</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Compare all your pets side-by-side.</strong> View their behaviors, timelines, and analyses 
                  together to understand their unique dynamics. See how they interact, spot individual patterns, 
                  and understand why conflicts might occur—all in one view.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-2">Perfect for:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                    <li>Understanding why pets get along or have conflicts</li>
                    <li>Spotting individual behavioral changes</li>
                    <li>Comparing health patterns across pets</li>
                    <li>Celebrating each pet's unique personality</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Unlimited Pet Profiles</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Premium plan includes unlimited pets.</strong> Add as many pets as you have—no limits. 
                  Each pet gets their own profile with individual timelines, analyses, and care reminders. 
                  Manage everything from one dashboard.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Unified Care Reminders</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Never miss a medication or appointment again.</strong> Set custom reminders for each pet's 
                  medications, vet visits, grooming, and feeding schedules. Get notifications for all pets in one place, 
                  making multi-pet care management effortless.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Individual Pet Timelines</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Track each pet's unique journey.</strong> Every pet has their own Pet Timeline™ showing 
                  behavioral evolution, milestones, and patterns. Compare timelines to understand how each pet has 
                  grown and changed over time.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Individual Pet Voice™ Analysis</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Understand each pet's unique personality.</strong> Get AI-powered behavior analysis for each 
                  pet with Pet Voice™. Choose different personality voices for each pet to match their unique character, 
                  helping you understand their individual needs and emotional states.
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
              Why InterpWhat is Better for Multi-Pet Households
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12">
              Unlike single-pet apps or separate tools, we're designed specifically for multi-pet management
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
                      <span>Multi-pet comparison side-by-side</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Unlimited pet profiles (Premium)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Unified care reminders for all pets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Individual timelines and analyses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>All-in-one platform</span>
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
                      <span>Designed for single pets only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Limited pet profiles (3-5 max)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>No comparison tools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Separate apps for different needs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Can't track multiple pets efficiently</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Sparkles className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">The Only Multi-Pet Platform</h3>
                    <p className="text-muted-foreground mb-4">
                      InterpWhat is the only platform designed specifically for multi-pet households. Our 
                      Multi-Pet Comparison feature is unique in the market, and our unlimited pet profiles (Premium) 
                      mean you never have to choose which pets to track. Everything—from behavior analysis to care 
                      reminders—is built with multi-pet families in mind.
                    </p>
                    <p className="font-semibold text-primary">
                      Manage all your pets efficiently. Understand their unique dynamics. Never miss a care task. 
                      All in one place, starting at $19.99/month.
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
                organizations in your community.</strong> When you understand your pets better, you're also helping 
                pets who are still waiting for their forever homes find loving families.
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
            Ready to Manage All Your Pets Efficiently?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join multi-pet families who've simplified their pet care management. Start your free trial today—no credit card required.
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
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
                  <Link href="/subscribe">
                    View Plans & Pricing
                  </Link>
                </Button>
              </>
            )}
          </div>
          <p className="text-sm text-primary-foreground/80 mt-4">
            Free plan available • Cancel anytime • No credit card required for trial
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

