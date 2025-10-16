import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { PawPrint, ArrowLeft, Upload, Sparkles, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { Link, useLocation, useParams } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [userContext, setUserContext] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: pet, isLoading: petLoading } = trpc.pets.list.useQuery(undefined, {
    enabled: isAuthenticated,
    select: (pets) => pets.find((p) => p.id === id),
  });

  const { data: analyses, isLoading: analysesLoading } = trpc.analysis.listForPet.useQuery(
    { petId: id! },
    {
      enabled: isAuthenticated && !!id,
    }
  );

  const createAnalysis = trpc.analysis.create.useMutation({
    onSuccess: (data) => {
      toast.success("Analysis complete!");
      setLocation(`/analysis/${data.analysis.id}`);
    },
    onError: (error) => {
      toast.error(`Analysis failed: ${error.message}`);
      setUploading(false);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, MOV)");
        return;
      }
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast.error("File size must be less than 50MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !pet) return;

    setUploading(true);
    toast.info("Uploading and analyzing...");

    try {
      // Upload file to server (we'll need to implement this endpoint)
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const { url } = await uploadResponse.json();

      // Determine media type
      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      // Create analysis
      createAnalysis.mutate({
        petId: pet.id,
        mediaUrl: url,
        mediaType,
        userContext: userContext.trim() || undefined,
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
      setUploading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (petLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Pet not found</h2>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
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
        <div className="max-w-4xl mx-auto space-y-8">
          <Button variant="ghost" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>

          {/* Pet Info */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{pet.name}</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {pet.breed || "Mixed breed"} {pet.species}
                    {pet.age && ` • ${pet.age}`}
                  </CardDescription>
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <PawPrint className="w-8 h-8 text-primary" />
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Upload Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle>Analyze Behavior</CardTitle>
              <CardDescription>Upload a photo or video to understand {pet.name}'s behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div className="space-y-4">
                <Label>Media Upload</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    file ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {file ? (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-primary mx-auto" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="font-medium">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">
                        Images (JPG, PNG, GIF, WebP) or Videos (MP4, MOV) up to 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Context Input */}
              <div className="space-y-2">
                <Label htmlFor="context">What's happening? (optional)</Label>
                <Textarea
                  id="context"
                  placeholder="e.g., 'My dog was barking at the mailman' or 'My cat was hiding under the bed'"
                  value={userContext}
                  onChange={(e) => setUserContext(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Adding context helps our AI provide more accurate insights
                </p>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full"
                size="lg"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze Behavior
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Analysis History */}
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold">Analysis History</h3>
            {analysesLoading ? (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading history...</p>
              </div>
            ) : analyses && analyses.length > 0 ? (
              <div className="grid gap-4">
                {analyses.map((analysis) => (
                  <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
                    <Card className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg">
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{analysis.primaryBehavior || "Analysis"}</h4>
                          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Clock className="w-4 h-4" />
                            {new Date(analysis.createdAt!).toLocaleDateString()} at{" "}
                            {new Date(analysis.createdAt!).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{analysis.confidenceScore}</div>
                          <p className="text-xs text-muted-foreground">confidence</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">No analyses yet. Upload a photo or video to get started!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

