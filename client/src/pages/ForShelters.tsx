import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MainNavigation from "@/components/MainNavigation";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import {
  Building2,
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  PawPrint,
  Heart,
  Gift,
  Shield,
  FileText,
} from "lucide-react";
import { Link } from "wouter";

export default function ForShelters() {
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
              <Building2 className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            For Animal Shelters & Rescues
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mt-2">
              Reduce Returns & Earn Revenue
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Help your adopters understand their new pets better, reduce return rates, and earn revenue 
            through our partnership program. Zero cost to your organization—we handle everything.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <a href="mailto:partnerships@interpwhat.com">Become a Partner</a>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
              <Link href="/#features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pain Points Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">
              The Challenges Shelters Face
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">High Return Rates</h3>
                  <p className="text-muted-foreground">
                    Up to 20% of adopted pets are returned due to behavioral mismatches. This costs shelters 
                    millions in operational overhead and, more importantly, traumatizes animals.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Limited Resources</h3>
                  <p className="text-muted-foreground">
                    Shelters operate on tight budgets. You need tools that help adopters succeed, but can't 
                    afford expensive programs or complex integrations.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Adopter Support Gap</h3>
                  <p className="text-muted-foreground">
                    Adopters need guidance after adoption, but shelters have limited capacity to provide 
                    ongoing support. There's a gap between adoption and long-term success.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-destructive/20">
                <CardContent className="pt-6 space-y-3">
                  <h3 className="text-xl font-bold text-destructive">Need Revenue Streams</h3>
                  <p className="text-muted-foreground">
                    Funding is always a challenge. You need new revenue streams that don't require 
                    additional resources or staff time.
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
            How InterpWhat Helps Shelters
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Zero-cost partnership program that reduces returns and generates revenue
          </p>

          <div className="space-y-8">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">10% Revenue Share</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Earn $1.50/month per adopter.</strong> When your adopters sign up for the Rescue Adopter 
                  Plan ($14.99/month), you receive 10% of their subscription ($1.50/month) as long as they remain 
                  a subscriber. This creates a recurring revenue stream with zero cost to your organization.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm font-medium text-primary mb-2">Example:</p>
                  <p className="text-sm text-muted-foreground">
                    If 50 adopters sign up, your shelter earns $75/month ($900/year) in recurring revenue—with 
                    no additional work or resources required.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Reduce Return Rates</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Help adopters succeed with their new pets.</strong> InterpWhat's AI-powered behavior 
                  analysis and breed identification help adopters understand their rescue pets better, leading 
                  to more successful adoptions and fewer returns.
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>AI breed identification for unknown backgrounds</li>
                  <li>Behavioral insights to help adopters understand their pets</li>
                  <li>24/7 on-demand support (reduces shelter workload)</li>
                  <li>Care reminders to ensure pets get proper care</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Adopter Benefits</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>Your adopters get special pricing and support.</strong> When adopters verify their adoption 
                  through your shelter partnership, they get:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-6 list-disc">
                  <li>Lifetime $5/month discount (Premium features for $14.99/month)</li>
                  <li>"Rescue Pet Parent" badge</li>
                  <li>Priority support (24-hour response)</li>
                  <li>All Premium features (unlimited pets, 30 analyses/month)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Zero Cost to Your Organization</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>We handle everything.</strong> No setup fees, no monthly costs, no integration work. 
                  We provide marketing materials, handle adoption verification, and manage the entire partnership. 
                  You just share the program with your adopters.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <h3 className="text-2xl font-bold">Marketing Materials Provided</h3>
                </div>
                <p className="text-lg text-muted-foreground">
                  <strong>We provide everything you need to promote the program.</strong> Email templates, social 
                  media graphics, flyers, and adoption packet inserts. Make it easy for your adopters to learn 
                  about and sign up for InterpWhat.
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
              Why InterpWhat is Better for Shelters
            </h2>
            <p className="text-xl text-muted-foreground text-center mb-12">
              The only partnership program designed specifically for animal shelters
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold">InterpWhat Partnership</h3>
                  </div>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>10% revenue share ($1.50/month per adopter)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Zero cost to your organization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Reduces return rates through better adopter support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Marketing materials provided</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>Simple adoption verification process</span>
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
                      <span>No revenue sharing programs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Require setup fees or monthly costs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Don't address return rate problem</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>Complex integrations required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0">×</span>
                      <span>No marketing support</span>
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
                    <h3 className="text-xl font-bold mb-2">The Only Shelter Partnership Program</h3>
                    <p className="text-muted-foreground mb-4">
                      InterpWhat is the only platform with a dedicated partnership program for animal shelters. 
                      We're mission-aligned—a portion of every subscription (including from non-partner adopters) 
                      goes to no-kill shelters. When you partner with us, you not only earn revenue but also help 
                      reduce return rates and support your adopters' success.
                    </p>
                    <p className="font-semibold text-primary">
                      Zero cost. Recurring revenue. Better adopter outcomes. Win-win-win.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Impact */}
      <section className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-accent/50 bg-gradient-to-br from-accent/10 to-primary/10">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-3">
                <PawPrint className="w-8 h-8 text-accent" />
                <h3 className="text-2xl font-bold">Mission-Aligned Partnership</h3>
              </div>
              <p className="text-lg text-muted-foreground">
                <strong>InterpWhat was created to help animals.</strong> A portion of every subscription goes 
                directly to no-kill animal shelters and rescue organizations. When you partner with us, you're 
                joining a mission to help pets find and stay in loving homes.
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
            Ready to Partner with InterpWhat?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join animal shelters earning recurring revenue while helping adopters succeed. Zero cost, 
            zero commitment—just email us to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <a href="mailto:partnerships@interpwhat.com">
                Email Us to Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6" asChild>
              <Link href="/#features">
                Learn More About InterpWhat
              </Link>
            </Button>
          </div>
          <p className="text-sm text-primary-foreground/80 mt-4">
            partnerships@interpwhat.com • No setup fees • No monthly costs
          </p>
        </div>
      </section>
    </div>
  );
}

