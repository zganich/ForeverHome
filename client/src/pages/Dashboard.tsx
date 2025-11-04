import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { PawPrint, Plus, Sparkles, Upload, ShoppingCart, Gift, Coins, GitCompare } from "lucide-react";
import { PhotoTips } from "@/components/PhotoTips";
import { Link } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";
import { useState } from "react";

export default function Dashboard() {
  const { user, loading, signOut } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [, setLocation] = useLocation();
  const [betaCode, setBetaCode] = useState("");
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);

  const { data: pets, isLoading: petsLoading } = trpc.pets.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: balance } = trpc.credits.getBalance.useQuery(undefined, { enabled: isAuthenticated });
  const utils = trpc.useUtils();

  const redeemCode = trpc.credits.redeemBetaCode.useMutation({
    onSuccess: () => {
      toast.success("🎉 Beta code redeemed! You now have unlimited credits!");
      setIsRedeemOpen(false);
      setBetaCode("");
      utils.credits.getBalance.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to redeem code: ${error.message}`);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            {balance && (
              <Card className="border-primary/20">
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Credits</p>
                      <p className="text-lg font-bold text-primary">{balance.isBetaTester ? "∞" : balance.credits}</p>
                    </div>
                    {balance.isBetaTester && (
                      <Badge className="bg-gradient-to-r from-primary to-accent ml-2 text-xs">🏆 Founding</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            <span className="text-sm text-muted-foreground hidden md:block">Hi, {user?.name || "there"}!</span>
            <Button variant="outline" onClick={() => signOut()}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Welcome to Your Pet Dashboard</h2>
            <p className="text-xl text-base text-muted-foreground">
              Add your pets and start understanding their behavior better.
            </p>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              <strong>What you can do:</strong> Upload photos of your pet to see what they're thinking, set reminders for vet visits and medications, and track your pet's behavior over time.
            </p>
          </div>

          {/* Photo Tips */}
          <PhotoTips />

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6">
            {pets && pets.length >= 2 && (
              <Link href="/compare">
                <Card className="border-2 border-mint-500/20 hover:border-mint-500/40 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GitCompare className="w-5 h-5" />
                      Compare Pets
                    </CardTitle>
                    <CardDescription>See how your pets differ</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )}
            <Link href="/pets/new">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add a New Pet
                  </CardTitle>
                  <CardDescription>Create a profile for your furry friend</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/purchase">
              <Card className="border-2 border-accent/20 hover:border-accent/40 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Get More Credits
                  </CardTitle>
                  <CardDescription>Purchase analysis credits</CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
              <DialogTrigger asChild>
                <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                      Redeem Beta Code
                    </CardTitle>
                    <CardDescription>Have a beta invite code?</CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Redeem Beta Code</DialogTitle>
                  <DialogDescription>
                    Enter your beta invite code to unlock unlimited free analyses and Founding Member status.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="betaCode">Beta Code</Label>
                    <Input
                      id="betaCode"
                      placeholder="BETA-XXXXX-XXXX"
                      value={betaCode}
                      onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => redeemCode.mutate({ code: betaCode })}
                    disabled={!betaCode || redeemCode.isPending}
                  >
                    {redeemCode.isPending ? "Redeeming..." : "Redeem Code"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Pets Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Your Pets</h3>
                                  <Button asChild size="lg" className="text-base min-h-[48px]">
                <Link href="/pets/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Pet
                </Link>
              </Button>
            </div>

            {petsLoading ? (
              <div className="text-center py-12">
                <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading your pets...</p>
              </div>
            ) : pets && pets.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                  <Link key={pet.id} href={`/pets/${pet.id}`}>
                    <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{pet.name}</CardTitle>
                            <CardDescription>
                              {pet.breed || "Mixed breed"} {pet.species}
                              {pet.age && ` • ${pet.age}`}
                            </CardDescription>
                          </div>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                            <PawPrint className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button variant="outline" className="w-full">
                          <Upload className="w-4 h-4 mr-2" />
                          Analyze Behavior
                        </Button>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
                    <PawPrint className="w-12 h-12 text-primary" />
                  </div>
                  <div className="space-y-3 max-w-md">
                    <h4 className="text-2xl font-bold">Welcome to InterpWhat! 🐾</h4>
                    <p className="text-muted-foreground text-lg">
                      Ready to understand your pet better? Add your first furry friend to get started with AI-powered behavior analysis.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button asChild size="lg" className="text-base px-8">
                      <Link href="/pets/new">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Your First Pet
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-base px-8">
                      <a href="#how-it-works">
                        Learn How It Works
                      </a>
                    </Button>
                  </div>
                  <div className="pt-4 space-y-2 text-sm text-muted-foreground max-w-md">
                    <p className="font-semibold">What you can do:</p>
                    <ul className="space-y-1 text-left list-disc list-inside">
                      <li>Analyze your pet's behavior from photos</li>
                      <li>Identify breeds with AI</li>
                      <li>Track behavior patterns over time</li>
                      <li>Get personalized care recommendations</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Tips */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
              <CardDescription>Get the most accurate analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                ✨ <strong>Good lighting:</strong> Make sure your pet is well-lit and clearly visible
              </p>
              <p>
                📹 <strong>Short videos:</strong> 5-30 seconds works best for behavior analysis
              </p>
              <p>
                🎯 <strong>Focus on behavior:</strong> Capture the specific behavior you want to understand
              </p>
              <p>
                📝 <strong>Add context:</strong> Tell us what was happening when you captured the media
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

