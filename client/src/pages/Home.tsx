import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { PawPrint, Sparkles, Heart, TrendingUp, Shield, Users, Volume2, Mic, Bell, GitCompareArrows, Dog, Check } from "lucide-react";
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
            The All-In-One Pet Parenting Platform
            <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mt-2">
              Understand, Care, Compare
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Instantly analyze your pet's behavior with AI, identify their breed from a photo, set care reminders, and compare multiple pets side-by-side. InterpWhat is your complete toolkit for being the best pet parent you can be.
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
                  <a href="#features">Explore Features</a>
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            ✨ Free plan available • No credit card required • Upgrade anytime for premium features
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
                  on a deeper level—and now, <strong>hear what they would say if they could speak</strong>.
                </p>

                <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
                  <p className="font-semibold text-accent mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5" />
                    Every Subscription Helps
                  </p>
                  <p className="text-base">
                    A portion of every subscription goes directly to no-kill animal shelters and rescue organizations, 
                    helping pets who are still waiting for their forever homes. When you understand 
                    your pet better, you're also helping animals in need find loving families.
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
            <h3 className="text-4xl font-bold mb-4">Everything You Need in One Platform</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI-powered behavior analysis to daily care management, InterpWhat has you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                <Volume2 className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">Pet Voice™ Analysis</h4>
                <p className="text-muted-foreground">
                  Our viral-hit feature! Choose from 7 unique personality voices to hear what your pet is really thinking—in their own words. Upload a photo or video and get instant insights in 15-25 seconds.
                </p>
                <p className="text-sm text-primary font-semibold">✓ Available in all plans</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                <Dog className="w-10 h-10 text-accent" />
                <h4 className="text-xl font-bold">AI Breed Identification</h4>
                <p className="text-muted-foreground">
                  Curious about your rescue's heritage? Upload a photo and our AI instantly identifies breed mixes, typical traits, and health considerations specific to your pet's genetic background.
                </p>
                <p className="text-sm text-accent font-semibold">✓ Premium feature</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                <Bell className="w-10 h-10 text-secondary" />
                <h4 className="text-xl font-bold">Care Reminders</h4>
                <p className="text-muted-foreground">
                  Never miss a vet appointment, medication dose, or grooming session. Set custom reminders for each pet and receive notifications exactly when you need them.
                </p>
                <p className="text-sm text-secondary font-semibold">✓ Premium feature</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                <GitCompareArrows className="w-10 h-10 text-primary" />
                <h4 className="text-xl font-bold">Multi-Pet Comparison</h4>
                <p className="text-muted-foreground">
                  Managing multiple pets? Compare behaviors, health patterns, and personality traits side-by-side to understand how your pets interact and what makes each one unique.
                </p>
                <p className="text-sm text-primary font-semibold">✓ Premium feature</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                <TrendingUp className="w-10 h-10 text-accent" />
                <h4 className="text-xl font-bold">Pet Timeline™</h4>
                <p className="text-muted-foreground">
                  Track your pet's journey from day one. View all analyses, milestones, and behavioral changes in a beautiful timeline that tells your pet's complete story.
                </p>
                <p className="text-sm text-accent font-semibold">✓ Available in all plans</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 space-y-3">
                <Shield className="w-10 h-10 text-secondary" />
                <h4 className="text-xl font-bold">Advanced Insights</h4>
                <p className="text-muted-foreground">
                  Get detailed behavioral analysis, health indicators, and personalized recommendations based on your pet's unique patterns and history.
                </p>
                <p className="text-sm text-secondary font-semibold">✓ Premium feature</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Choose Your Plan</h3>
          <p className="text-xl text-muted-foreground">Become a better pet parent today. Cancel anytime, no questions asked.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Essential Plan */}
          <Card className="border-2">
            <CardContent className="pt-6 space-y-6">
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-bold">Essential</h4>
                <div className="text-5xl font-bold">
                  $14<span className="text-3xl text-muted-foreground">.99</span>
                </div>
                <p className="text-sm text-muted-foreground">per month</p>
                <p className="text-muted-foreground h-12">Perfect for the everyday pet owner.</p>
              </div>

              <Button variant="outline" className="w-full" asChild>
                <a href={getLoginUrl()}>Choose Essential</a>
              </Button>

              <div className="space-y-4 pt-4">
                <div className="space-y-3">
                  <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">What's Included</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>3 pet profiles</strong> - Perfect for most households</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>15 AI analyses per month</strong> - ~1 every 2 days</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Pet Voice™ Analysis</strong> - 7 personality voices</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Pet Timeline™</strong> - Track history & milestones</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Basic Behavior Insights</strong> - Understand patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Email Support</strong> - 48-hour response time</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground">
                    <strong>Why this price?</strong> Less than a bag of premium dog food, but helps you understand your pet every single day.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-primary relative shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              MOST POPULAR
            </div>
            <CardContent className="pt-10 space-y-6">
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-bold">Premium</h4>
                <div className="text-5xl font-bold">
                  $29<span className="text-3xl text-muted-foreground">.99</span>
                </div>
                <p className="text-sm text-muted-foreground">per month</p>
                <p className="text-muted-foreground h-12">For dedicated pet enthusiasts.</p>
              </div>

              <Button className="w-full" asChild>
                <a href={getLoginUrl()}>Choose Premium</a>
              </Button>

              <div className="space-y-4 pt-4">
                <div className="space-y-3">
                  <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Everything in Essential, plus:</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Unlimited pet profiles</strong> - For multi-pet households</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Unlimited AI analyses</strong> - Analyze as often as you need</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong className="text-primary">AI Breed Identification</strong> - Unlimited breed scans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong className="text-primary">Care Reminders & Notifications</strong> - Never miss important tasks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong className="text-primary">Multi-Pet Comparison</strong> - Compare behaviors side-by-side</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Advanced Behavioral Insights</strong> - Deeper analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Priority Support</strong> - 24-hour response time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span><strong>Export Reports (PDF)</strong> - Share with your vet</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-4 bg-primary/5 -mx-6 px-6 py-4 rounded-b-lg">
                  <p className="text-xs text-muted-foreground">
                    <strong>Why this price?</strong> Fi collar costs $19/mo for just GPS. InterpWhat tells you HOW your pet feels, WHY they act that way, and WHAT to do—all for just $10 more.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rescue Adopter Plan */}
          <Card className="border-2 border-accent/50 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
              RESCUE HERO
            </div>
            <CardContent className="pt-10 space-y-6">
              <div className="text-center space-y-2">
                <h4 className="text-2xl font-bold">Rescue Adopter</h4>
                <div className="text-5xl font-bold">
                  $24<span className="text-3xl text-muted-foreground">.99</span>
                </div>
                <p className="text-sm text-muted-foreground">per month</p>
                <p className="text-muted-foreground h-12">Lifetime discount for rescue pet parents.</p>
              </div>

              <Button variant="outline" className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground" asChild>
                <a href={getLoginUrl()}>Verify Adoption</a>
              </Button>

              <div className="space-y-4 pt-4">
                <div className="space-y-3">
                  <p className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">All Premium Features, plus:</p>
                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong className="text-accent">Lifetime $5/mo discount</strong> - Forever</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong>"Rescue Pet Parent" badge</strong> - Show your pride</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong>Support your shelter</strong> - 10% revenue share</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong>Priority support</strong> - 24-hour response</span>
                    </li>
                  </ul>
                </div>

                <div className="border-t pt-4">
                  <p className="text-xs text-muted-foreground mb-3">
                    <strong>Adoption verification required:</strong> Upload adoption paperwork or shelter confirmation. One discount per person (covers unlimited pets).
                  </p>
                  <p className="text-xs text-accent font-semibold">
                    You saved a life. We honor that with a lifetime discount.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            A portion of all subscriptions supports no-kill animal shelters and rescue organizations 🐾
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Cancel anytime, no questions asked</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>No credit card required to start</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>Trusted by thousands of pet parents</span>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Testimonials */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Loved by Pet Parents Everywhere</h3>
            <p className="text-xl text-muted-foreground">Join thousands of pet owners who've transformed their relationship with their pets.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "I literally cried when I heard my dog's voice for the first time. InterpWhat has completely changed how I understand Max. The reminders feature is a lifesaver!"
                </p>
                <p className="font-semibold">— Sarah M., Beta Tester</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "The Breed ID feature revealed my rescue is part Border Collie! It explains so much about her energy levels. Now I can give her the right amount of exercise."
                </p>
                <p className="font-semibold">— Mike T., Premium User</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-1 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-muted-foreground italic">
                  "With three dogs, the Multi-Pet Comparison is invaluable. I can finally see why they interact the way they do. This app is worth every penny."
                </p>
                <p className="font-semibold">— Jessica L., Premium User</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-primary via-accent to-secondary py-20">
        <div className="container mx-auto px-6 text-center">
          <h3 className="text-4xl font-bold text-primary-foreground mb-6">
            Ready to Understand Your Pet Better?
          </h3>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of pet parents building deeper connections with their companions. Start free today.
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
          <p className="text-sm text-primary-foreground/80 mt-4">
            No credit card required • Cancel anytime
          </p>
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
              Built with ❤️ by Chantell and the guy with the mumbling drawl...and in memory of Paisley.
            </p>
            <p className="text-xs text-muted-foreground">
              Every pet deserves to be understood. 🐾
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground mt-2">
              <a href="mailto:hello@interpwhat.com" className="hover:text-primary transition-colors">Contact</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} InterpWhat. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

