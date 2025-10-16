import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { PawPrint, Plus, Sparkles, Upload } from "lucide-react";
import { Link } from "wouter";
import { APP_TITLE, getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { data: pets, isLoading: petsLoading } = trpc.pets.list.useQuery(undefined, {
    enabled: isAuthenticated,
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
    window.location.href = getLoginUrl();
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
            <span className="text-sm text-muted-foreground">Hi, {user?.name || "there"}!</span>
            <Button variant="outline" onClick={() => logout()}>
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
            <p className="text-xl text-muted-foreground">
              Add your pets and start understanding their behavior better.
            </p>
          </div>

          {/* Pets Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-semibold">Your Pets</h3>
              <Button asChild>
                <Link href="/pets/new">
                  <Plus className="w-4 h-4 mr-2" />
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
              <Card className="border-2 border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <PawPrint className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold mb-2">No pets yet</h4>
                    <p className="text-muted-foreground mb-6">
                      Add your first pet to start analyzing their behavior.
                    </p>
                    <Button asChild>
                      <Link href="/pets/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Pet
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
            <CardHeader>
              <CardTitle>Quick Tips</CardTitle>
              <CardDescription>Get the most accurate analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✨ <strong>Good lighting:</strong> Make sure your pet is well-lit and clearly visible</p>
              <p>📹 <strong>Short videos:</strong> 5-30 seconds works best for behavior analysis</p>
              <p>🎯 <strong>Focus on behavior:</strong> Capture the specific behavior you want to understand</p>
              <p>📝 <strong>Add context:</strong> Tell us what was happening when you captured the media</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

