import { authFetch } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { PawPrint, ArrowLeft, Upload } from "lucide-react";
import { useState, useRef } from "react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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

  const validateAndSetPhoto = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setErrors({ ...errors, photo: "Please upload an image (JPG, PNG, GIF, or WebP)" });
      toast.error("Invalid file type. Please upload an image file.");
      return false;
    }
    
    // Validate file size (max 4 MB)
    if (file.size > 4 * 1024 * 1024) {
      setErrors({ ...errors, photo: "File size must be less than 4 MB" });
      toast.error("File too large. Please compress your image or choose a smaller file.");
      return false;
    }
    
    setPhotoFile(file);
    setErrors({ ...errors, photo: "" });
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetPhoto(file);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      const droppedFile = droppedFiles[0];
      if (validateAndSetPhoto(droppedFile)) {
        toast.success("Photo selected!");
      }
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
      const response = await authFetch("/api/upload", {
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
      setErrors({});
      
      // Parse and display user-friendly error messages
      let errorMessage = "Failed to add pet";
      
      if (error.message.includes("name") || error.message.includes("required")) {
        setErrors({ name: "Pet name is required" });
        errorMessage = "Please enter a name for your pet";
      } else if (error.message.includes("species") || error.message.includes("invalid")) {
        setErrors({ species: "Please select a valid species" });
        errorMessage = "Please select a valid species";
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else if (error.message.includes("unauthorized") || error.message.includes("auth")) {
        errorMessage = "Please sign in to add a pet";
      } else {
        errorMessage = `Failed to add pet: ${error.message}`;
      }
      
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form fields
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Please enter your pet's name";
    } else if (name.trim().length < 2) {
      newErrors.name = "Pet name must be at least 2 characters";
    } else if (name.trim().length > 50) {
      newErrors.name = "Pet name must be less than 50 characters";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix the errors below");
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

          <div className="text-center space-y-3">
            <h2 className="text-4xl font-bold">Add Your Pet</h2>
            <p className="text-base text-muted-foreground">Tell us about your furry friend</p>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              <strong>Step by step:</strong> Enter your pet's name, choose if they're a dog or cat, and optionally add a photo. Everything else is optional!
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Pet Information</CardTitle>
              <CardDescription>We'll use this to provide more accurate behavior analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-semibold">
                    Pet Name <span className="text-destructive">*</span>
                    <span className="text-xs text-muted-foreground font-normal ml-2">(Required)</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Buddy, Luna, Max"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    required
                    className={`text-base min-h-[48px] ${errors.name ? "border-destructive" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-base text-destructive font-medium">{errors.name}</p>
                  )}
                  <p className="text-sm text-muted-foreground">Just type your pet's name here</p>
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
                    {!photoPreview ? (
                      <div
                        ref={dropZoneRef}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-primary bg-primary/10 scale-105"
                            : errors.photo
                            ? "border-destructive bg-destructive/5"
                            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handlePhotoChange(e);
                            if (errors.photo) setErrors({ ...errors, photo: "" });
                          }}
                          capture="environment"
                          className="hidden"
                        />
                        <Upload className={`w-10 h-10 mx-auto mb-3 transition-transform ${isDragging ? "text-primary scale-110" : "text-muted-foreground"}`} />
                        <p className="font-medium text-sm mb-1">
                          {isDragging ? "Drop photo here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, GIF, WebP • Max 4 MB
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative inline-block">
                          <img
                            src={photoPreview}
                            alt="Pet preview"
                            className="w-32 h-32 object-cover rounded-lg border-2 border-primary/20"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                            onClick={() => {
                              setPhotoPreview(null);
                              setPhotoFile(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                          >
                            ×
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change Photo
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            handlePhotoChange(e);
                            if (errors.photo) setErrors({ ...errors, photo: "" });
                          }}
                          capture="environment"
                          className="hidden"
                        />
                      </div>
                    )}
                    {errors.photo && (
                      <p className="text-sm text-destructive">{errors.photo}</p>
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
                  <Button type="submit" size="lg" className="flex-1 text-base min-h-[48px]" disabled={createPet.isPending}>
                    {createPet.isPending ? "Adding..." : "Add Pet"}
                  </Button>
                  <Button type="button" variant="outline" size="lg" className="text-base min-h-[48px]" asChild>
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

