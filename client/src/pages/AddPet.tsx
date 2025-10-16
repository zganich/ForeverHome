import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { PawPrint, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function AddPet() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"dog" | "cat" | "other">("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [personality, setPersonality] = useState<"goofy" | "wise" | "sassy" | "serious" | "excited" | "sleepy" | "dramatic">("goofy");

  const createPet = trpc.pets.create.useMutation({
    onSuccess: (pet) => {
      toast.success(`${pet.name} has been added!`);
      setLocation(`/pets/${pet.id}`);
    },
    onError: (error) => {
      toast.error(`Failed to add pet: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your pet's name");
      return;
    }
    createPet.mutate({
      name: name.trim(),
      species,
      breed: breed.trim() || undefined,
      age: age.trim() || undefined,
      personality,
      voiceStyle: "alloy",
    });
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <PawPrint className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {APP_TITLE}
              </h1>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold">Add Your Pet</h2>
            <p className="text-muted-foreground">Tell us about your furry friend</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pet Information</CardTitle>
              <CardDescription>We'll use this to provide more accurate behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Pet Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Buddy, Luna, Max"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="species">
                    Species <span className="text-destructive">*</span>
                  </Label>
                  <Select value={species} onValueChange={(value: "dog" | "cat" | "other") => setSpecies(value)}>
                    <SelectTrigger id="species">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dog">Dog</SelectItem>
                      <SelectItem value="cat">Cat</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="breed">Breed (optional)</Label>
                  <Input
                    id="breed"
                    placeholder="e.g., Golden Retriever, Siamese, Mixed"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps us provide breed-specific behavior insights
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age (optional)</Label>
                  <Input
                    id="age"
                    placeholder="e.g., 2 years, 6 months, 5 years old"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Age helps us understand age-appropriate behaviors
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personality">Personality Voice 🎤</Label>
                  <Select value={personality} onValueChange={(value: any) => setPersonality(value)}>
                    <SelectTrigger id="personality">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="goofy">🤪 Goofy - Playful & silly</SelectItem>
                      <SelectItem value="wise">🧙 Wise - Calm & philosophical</SelectItem>
                      <SelectItem value="sassy">💅 Sassy - Witty with attitude</SelectItem>
                      <SelectItem value="serious">🎩 Serious - Professional</SelectItem>
                      <SelectItem value="excited">🎉 Excited - High energy</SelectItem>
                      <SelectItem value="sleepy">😴 Sleepy - Calm & drowsy</SelectItem>
                      <SelectItem value="dramatic">🎭 Dramatic - Theatrical</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Choose how your pet's thoughts will be expressed in voice
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" disabled={createPet.isPending}>
                    {createPet.isPending ? "Adding..." : "Add Pet"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href="/dashboard">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

