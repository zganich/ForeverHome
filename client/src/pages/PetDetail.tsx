import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { PawPrint, ArrowLeft, Upload, Sparkles, Clock, X } from "lucide-react";
import { PetTimeline } from "@/components/PetTimeline";
import Reminders from "@/components/Reminders";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

// Analysis status messages that progress over time
const ANALYSIS_STATUS_MESSAGES = [
  { time: 0, message: "Uploading your photo...", progress: 10 },
  { time: 2, message: "Checking photo quality...", progress: 20 },
  { time: 5, message: "Analyzing pet's expression...", progress: 35 },
  { time: 8, message: "Understanding body language...", progress: 50 },
  { time: 12, message: "Processing behavioral patterns...", progress: 65 },
  { time: 16, message: "Generating insights...", progress: 80 },
  { time: 20, message: "Almost done...", progress: 95 },
];

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [userContext, setUserContext] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoDate, setPhotoDate] = useState<string>("");
  const [petAgeAtPhoto, setPetAgeAtPhoto] = useState<string>("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [analysisStartTime, setAnalysisStartTime] = useState<number | null>(null);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

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

  // Cleanup progress interval on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Update progress and status messages during analysis
  useEffect(() => {
    if (!uploading || !analysisStartTime) return;

    const startProgressTracking = () => {
      const startTime = Date.now();
      
      progressIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000; // seconds
        
        // Find the appropriate status message based on elapsed time
        let currentStatus = ANALYSIS_STATUS_MESSAGES[0];
        for (let i = ANALYSIS_STATUS_MESSAGES.length - 1; i >= 0; i--) {
          if (elapsed >= ANALYSIS_STATUS_MESSAGES[i].time) {
            currentStatus = ANALYSIS_STATUS_MESSAGES[i];
            break;
          }
        }

        setAnalysisStatus(currentStatus.message);
        setAnalysisProgress(currentStatus.progress);

        // Estimate remaining time (analysis takes 15-25 seconds, average 20 seconds)
        const avgAnalysisTime = 20;
        const remaining = Math.max(0, avgAnalysisTime - elapsed);
        setEstimatedTimeRemaining(Math.ceil(remaining));

        // Cap progress at 95% until actually complete
        if (currentStatus.progress >= 95) {
          setAnalysisProgress(95);
        }
      }, 500); // Update every 500ms for smooth progress
    };

    startProgressTracking();

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [uploading, analysisStartTime]);

  const createAnalysis = trpc.analysis.create.useMutation({
    onSuccess: (data) => {
      // Clear progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setAnalysisProgress(100);
      setAnalysisStatus("Analysis complete!");
      setUploading(false);
      setAnalysisStartTime(null);
      setEstimatedTimeRemaining(null);
      
      toast.success("Analysis complete!");
      
      // Small delay to show 100% completion, then navigate
      setTimeout(() => {
        setLocation(`/analysis/${data.analysis.id}`);
      }, 500);
    },
    onError: (error) => {
      // Clear progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setUploading(false);
      setAnalysisStartTime(null);
      setEstimatedTimeRemaining(null);
      setAnalysisProgress(0);
      setAnalysisStatus("");
      
      // User-friendly error messages
      let errorMessage = "Analysis failed";
      if (error.message.includes("Pet not found") || error.message.includes("access denied")) {
        errorMessage = "Unable to analyze this pet. Please try again or contact support.";
      } else if (error.message.includes("credits") || error.message.includes("balance")) {
        errorMessage = "Insufficient credits. Please purchase more credits to continue.";
      } else if (error.message.includes("network") || error.message.includes("timeout")) {
        errorMessage = "Network error. Please check your connection and try again.";
      } else {
        errorMessage = `Analysis failed: ${error.message}`;
      }
      
      toast.error(errorMessage);
    },
  });

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "video/mp4", "video/quicktime"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Please upload an image (JPG, PNG, GIF, WebP) or video (MP4, MOV)");
      return false;
    }
    // Validate file size (max 50MB)
    if (selectedFile.size > 50 * 1024 * 1024) {
      toast.error("File size must be less than 50MB. Please compress your file or choose a smaller one.");
      return false;
    }
    setFile(selectedFile);
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
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
    // Only set dragging to false if we're leaving the drop zone itself
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
      if (validateAndSetFile(droppedFile)) {
        toast.success("File selected!");
      }
    }
  };

  const validatePhoto = trpc.analysis.validatePhoto.useMutation();

  const handleUpload = async () => {
    if (!file || !pet) return;

    setUploading(true);
    setAnalysisStartTime(Date.now());
    setAnalysisProgress(0);
    setAnalysisStatus(ANALYSIS_STATUS_MESSAGES[0].message);
    setEstimatedTimeRemaining(20); // Initial estimate

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed. Please check your internet connection and try again.");
      }

      const { url } = await uploadResponse.json();

      // Determine media type
      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      // Validate photo quality for images (skip for videos)
      if (mediaType === "image") {
        setAnalysisStatus("Checking photo quality...");
        setAnalysisProgress(15);
        
        const qualityCheck = await validatePhoto.mutateAsync({ imageUrl: url });

        if (!qualityCheck.canProceed) {
          // Clear progress tracking
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          setUploading(false);
          setAnalysisStartTime(null);
          setEstimatedTimeRemaining(null);
          setAnalysisProgress(0);
          setAnalysisStatus("");
          
          toast.error("Photo quality issue detected", {
            description: qualityCheck.issues.join(", "),
          });
          
          // Show suggestions
          if (qualityCheck.tips && qualityCheck.tips.length > 0) {
            setTimeout(() => {
              toast.info("Tips to improve your photo:", {
                description: qualityCheck.tips.join(" • "),
                duration: 8000,
              });
            }, 1000);
          }
          return;
        }

        if (qualityCheck.score < 70) {
          toast.warning("Photo quality could be better", {
            description: "Analysis will proceed, but better lighting or focus may improve results.",
          });
        }
      }

      // Create analysis (this will take 15-25 seconds)
      setAnalysisStatus("Starting analysis...");
      createAnalysis.mutate({
        petId: pet.id,
        mediaUrl: url,
        mediaType,
        userContext: userContext.trim() || undefined,
        photoDate: photoDate ? new Date(photoDate) : undefined,
        petAgeAtPhoto: petAgeAtPhoto.trim() || undefined,
      });
    } catch (error) {
      console.error("Upload error:", error);
      
      // Clear progress tracking
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setUploading(false);
      setAnalysisStartTime(null);
      setEstimatedTimeRemaining(null);
      setAnalysisProgress(0);
      setAnalysisStatus("");
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to upload file. Please check your internet connection and try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancelAnalysis = () => {
    // Note: We can't actually cancel the backend operation, but we can stop showing progress
    // The analysis will complete in the background, and we'll show a notification when done
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setUploading(false);
    setAnalysisStartTime(null);
    setEstimatedTimeRemaining(null);
    setAnalysisProgress(0);
    setAnalysisStatus("");
    
    toast.info("Analysis continues in the background. You'll be notified when it's complete.");
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
                  ref={dropZoneRef}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-primary bg-primary/10 scale-105"
                      : file
                      ? "border-primary bg-primary/5"
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
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                    capture="environment"
                    className="hidden"
                  />
                  {file ? (
                    <div className="space-y-3">
                      <Upload className="w-12 h-12 text-primary mx-auto" />
                      <div>
                        <p className="font-medium text-base">{file.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split('/')[0].toUpperCase()}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload className={`w-12 h-12 mx-auto transition-transform ${isDragging ? "text-primary scale-110" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium text-base">
                          {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Images (JPG, PNG, GIF, WebP) or Videos (MP4, MOV)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum file size: 50MB
                        </p>
                      </div>
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

              {/* Historical Photo Options */}
              <div className="bg-accent/10 p-4 rounded-lg border border-accent/20 space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  <Label className="text-sm font-semibold">Is this an older photo?</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Help our AI learn {pet.name}'s behavior over time by dating older photos
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="photoDate" className="text-sm">When was this taken?</Label>
                    <Input
                      id="photoDate"
                      type="date"
                      value={photoDate}
                      onChange={(e) => setPhotoDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="petAge" className="text-sm">How old was {pet.name}?</Label>
                    <Input
                      id="petAge"
                      placeholder="e.g., '6 months' or '2 years'"
                      value={petAgeAtPhoto}
                      onChange={(e) => setPetAgeAtPhoto(e.target.value)}
                    />
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground italic">
                  💡 The more historical photos you upload, the better our AI understands {pet.name}'s unique patterns!
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

              {/* Analysis Progress Bar */}
              {uploading && analysisStartTime && (
                <div className="mt-6 space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Analysis in Progress</h3>
                    {estimatedTimeRemaining !== null && (
                      <span className="text-xs text-muted-foreground">
                        ~{estimatedTimeRemaining}s remaining
                      </span>
                    )}
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-primary" />
                    {analysisStatus}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelAnalysis}
                    className="w-full"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel (continues in background)
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    💡 You can navigate away. We'll notify you when the analysis is complete.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pet Timeline */}
          {analysesLoading ? (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading timeline...</p>
            </div>
          ) : (
            <>
              <Reminders petId={id!} />
              <PetTimeline analyses={analyses || []} petName={pet.name} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

