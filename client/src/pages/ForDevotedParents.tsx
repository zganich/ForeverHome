import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainNavigation from "@/components/MainNavigation";
import StickyCTA from "@/components/StickyCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SocialProof from "@/components/SocialProof";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import {
  Heart,
  Volume2,
  TrendingUp,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PawPrint,
} from "lucide-react";
import { Link } from "wouter";

export default function ForDevotedParents() {
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
              <Heart className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            For Devoted Pet Parents
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mt-2">
              Who Treat Pets Like Family
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            You're not just a pet owner—you're a pet parent. You invest in your pet's wellness, 
            celebrate their milestones, and want to understand every tail wag and purr. InterpWhat 
            helps you build that deeper connection you've been searching for.
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
              The Challenges You Face
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Communication Barrier</h3>
                  <p className="text-muted-foreground">
                    67% of pet owners wish they could understand what their pets are trying to tell them. 
                    You see your pet's behavior but can't decode what it means.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Behavioral Uncertainty</h3>
                  <p className="text-muted-foreground">
                    Is that behavior normal or concerning? You worry about missing early signs of 
                    health or behavioral issues that could be addressed proactively.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">No Historical Context</h3>
                  <p className="text-muted-foreground">
                    You can't track how your pet's behavior has changed over time. There's no way 
                    to see patterns or celebrate their growth from puppyhood to senior years.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Expensive Consultations</h3>
                  <p className="text-muted-foreground">
                    Pet behaviorists charge $100-300 per session. You want expert guidance but 
                    need a more accessible, on-demand solution.
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
            How InterpWhat Solves Your Challenges
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            The only platform that combines AI-powered behavior analysis with comprehensive pet care management
          </p>

          <div className="space-y-8">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Pet Voice™ Analysis</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Hear what your pet is really saying</strong> in one of 7 unique personality voices. 
                  Upload a photo or video and get instant, personalized AI analysis in 15-25 seconds. 
                  This isn't generic advice—it's tailored to your pet's specific behavior, breed, and context.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Instant Analysis
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    7 Personality Voices
                  </span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                    Personalized Insights
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Pet Timeline™</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Track your pet's behavioral evolution</strong> from their early years to the present. 
                  Understand patterns, detect changes early, and celebrate milestones. See how your pet 
                  has grown and changed over time—something no other platform offers.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Photo Quality Protection</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Never waste credits on poor photos.</strong> Our AI validates photo quality before 
                  using a credit, ensuring you always get accurate, high-quality analysis. No more guessing 
                  if your photo is good enough.
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
              Why InterpWhat is Better
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12">
              Unlike generic advice articles or expensive consultations, we provide instant, personalized insights
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
                      <span>AI-powered behavior analysis with Pet Voice™</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Historical timeline tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Instant, on-demand insights</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Starting at $9.99/month</span>
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
                      <span>Generic advice articles (not personalized)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>No historical tracking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Expensive consultations ($100-300/session)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Limited or no access between appointments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Separate tools for different needs</span>
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
                    <h3 className="text-xl font-bold mb-2">The InterpWhat Difference</h3>
                    <p className="text-muted-foreground mb-4">
                      We're the only platform that combines AI-powered behavior analysis with comprehensive 
                      pet care management. Our 4-agent AI system provides personalized insights that learn 
                      your pet's unique patterns over time. Plus, our Pet Voice™ feature—unique to InterpWhat—lets 
                      you actually hear what your pet would say if they could speak.
                    </p>
                    <p className="font-semibold text-primary">
                      All in one place. Starting at just $9.99/month. No expensive consultations required.
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
            Ready to Understand Your Pet on a Deeper Level?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of devoted pet parents who've transformed their relationship with their pets. 
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

