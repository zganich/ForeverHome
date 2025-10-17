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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [identifyingBreed, setIdentifyingBreed] = useState(false);

  const identifyBreedMutation = trpc.pets.identifyBreed.useMutation({
    onSuccess: (result) => {
      setBreed(result.primaryBreed);
      toast.success(`Breed identified: ${result.primaryBreed} (${result.confidence} confidence)`);
      if (result.confidence === "low") {
        toast.info("Low confidence. You may want to try a clearer photo or enter breed manually.");
      }
    },
    onError: (error) => {
      toast.error(`Failed to identify breed: ${error.message}`);
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdentifyBreed = async () => {
    if (!photoPreview) {
      toast.error("Please upload a photo first");
      return;
    }
    setIdentifyingBreed(true);
    try {
      // Upload photo to get URL
      const formData = new FormData();
      if (photoFile) {
        formData.append("file", photoFile);
      }
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.url) {
        identifyBreedMutation.mutate({ imageUrl: data.url, species });
      }
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setIdentifyingBreed(false);
    }
  };

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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pet Photo (optional)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    {photoPreview && (
                      <div className="mt-2">
                        <img
                          src={photoPreview}
                          alt="Pet preview"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="breed">Breed (optional)</Label>
                    <div className="flex gap-2">
                      <Input
                        id="breed"
                        placeholder="e.g., Golden Retriever, Siamese, Mixed"
                        value={breed}
                        onChange={(e) => setBreed(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleIdentifyBreed}
                        disabled={!photoPreview || identifyingBreed || identifyBreedMutation.isPending}
                      >
                        {identifyingBreed || identifyBreedMutation.isPending ? "Identifying..." : "AI Identify"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a photo and click "AI Identify" to auto-detect breed, or enter manually
                    </p>
                  </div>
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

