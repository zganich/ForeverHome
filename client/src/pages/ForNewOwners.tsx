import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainNavigation from "@/components/MainNavigation";
import StickyCTA from "@/components/StickyCTA";
import ExitIntentPopup from "@/components/ExitIntentPopup";
import SocialProof from "@/components/SocialProof";
import { useFirebaseAuth } from "@/contexts/AuthContext";
import {
  Baby,
  Volume2,
  Dog,
  Shield,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PawPrint,
  Heart,
  BookOpen,
} from "lucide-react";
import { Link } from "wouter";

export default function ForNewOwners() {
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
              <Baby className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            For New Pet Owners
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mt-2">
              Expert Guidance at Your Fingertips
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            First-time pet owner? You're not alone. That anxiety you feel—"Am I doing this right?"—is 
            completely normal. InterpWhat gives you the expert guidance you need, when you need it, 
            without the overwhelming advice overload.
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
              The Challenges Every New Owner Faces
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Is This Normal?</h3>
                  <p className="text-muted-foreground">
                    Every behavior seems like a potential problem. You're constantly second-guessing 
                    yourself and searching online for answers, but the advice is overwhelming and often contradictory.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Information Overload</h3>
                  <p className="text-muted-foreground">
                    There's too much generic advice online. You need personalized guidance that's specific 
                    to your pet's breed, age, and behavior—not generic articles that may not apply.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Unknown Breed</h3>
                  <p className="text-muted-foreground">
                    If you adopted a rescue, you might not know their breed mix. This makes it hard to 
                    understand their needs, energy levels, and potential health considerations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Need Reassurance</h3>
                  <p className="text-muted-foreground">
                    You want expert validation that you're doing things right. You need someone to tell 
                    you when behavior is normal and when it's time to consult a vet.
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
            How InterpWhat Helps New Owners
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Instant, personalized expert guidance without the anxiety
          </p>

          <div className="space-y-8">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Expert Guidance, Instantly</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Get personalized behavior analysis in seconds.</strong> Upload a photo or video and 
                  our AI-powered system analyzes your pet's behavior, body language, and context. You'll get 
                  clear explanations of what's normal and what might need attention—no more guessing.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-2">Example:</p>
                  <p className="text-sm text-muted-foreground">
                    "Your dog's tail position and ear posture suggest curiosity mixed with slight caution—completely 
                    normal for a new environment. This is expected behavior for a rescue adjusting to a new home."
                  </p>
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
                  appropriate exercise, nutrition, and care—essential for new owners.
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>Understand breed-specific traits and energy levels</li>
                  <li>Learn about potential health considerations</li>
                  <li>Get tailored care recommendations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Pet Voice™ - Hear What They're Saying</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Our viral feature helps you connect with your pet.</strong> Choose from 7 personality voices 
                  and actually hear what your pet would say if they could speak. It's not just fun—it helps you 
                  understand their emotional state and needs in a whole new way.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Safety-First Recommendations</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Our AI never diagnoses—it guides.</strong> When your pet's behavior suggests a vet visit 
                  might be needed, we'll flag it immediately. You'll get actionable steps and know when to seek 
                  professional help, giving you confidence in your decisions.
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
              Why InterpWhat is Better for New Owners
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12">
              Unlike overwhelming online articles or expensive consultations, we provide instant, personalized guidance
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
                      <span>Instant, personalized analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Breed identification for rescue pets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Clear "normal vs. concerning" guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Available 24/7, on-demand</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Starting at $9.99/month</span>
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
                      <span>Generic articles (not personalized)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Overwhelming, contradictory advice</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>No breed identification for rescues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Expensive consultations ($100-300/session)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Limited availability, scheduled appointments</span>
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
                    <h3 className="text-xl font-bold mb-2">The Perfect Tool for First-Time Owners</h3>
                    <p className="text-muted-foreground mb-4">
                      InterpWhat gives you the confidence you need as a new pet owner. Our AI analyzes your pet's 
                      specific behavior, breed, and context to give you personalized guidance—not generic advice. 
                      Plus, our Pet Voice™ feature makes understanding your pet's emotions fun and engaging.
                    </p>
                    <p className="font-semibold text-primary">
                      Get expert guidance instantly. No overwhelming articles. No expensive consultations. Just clear, 
                      personalized help when you need it.
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
            Ready to Feel Confident as a New Pet Owner?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Get the expert guidance you need without the anxiety. Start your free trial today—no credit card required.
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

