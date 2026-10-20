import { PrivateImage } from "@/components/PrivateImage";
import { AnalysisStream } from "@/lib/analysisStream";
import { authFetch } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Toggle } from "@/components/ui/toggle";
import { trpc } from "@/lib/trpc";
import {
  PawPrint,
  ArrowLeft,
  Upload,
  Sparkles,
  Clock,
  X,
  Zap,
} from "lucide-react";
import { PetTimeline } from "@/components/PetTimeline";
import Reminders from "@/components/Reminders";
import { useState, useRef, useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

// Stage-based status messages for real-time progress
const STAGE_STATUS_MESSAGES: Record<string, string> = {
  start: "Initializing analysis...",
  vision: "Analyzing pet's expression and body language...",
  context: "Understanding breed and context...",
  synthesis: "Generating behavioral insights...",
  recommendations: "Preparing recommendations...",
  voice: "Creating personality-based interpretation...",
  complete: "Analysis complete!",
  error: "Analysis failed",
};

export default function PetDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [uploadedLocator, setUploadedLocator] = useState<string>();
  const [file, setFile] = useState<File | null>(null);
  const [userContext, setUserContext] = useState("");
  const [uploading, setUploading] = useState(false);
  const [photoDate, setPhotoDate] = useState<string>("");
  const [petAgeAtPhoto, setPetAgeAtPhoto] = useState<string>("");
  const [quickMode, setQuickMode] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [currentStage, setCurrentStage] = useState<string>("");
  const eventSourceRef = useRef<AnalysisStream | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { data: pet, isLoading: petLoading } = trpc.pets.list.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      select: pets => pets.find(p => p.id === id),
    }
  );

  const { data: analyses, isLoading: analysesLoading } =
    trpc.analysis.listForPet.useQuery(
      { petId: id! },
      {
        enabled: isAuthenticated && !!id,
      }
    );

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  const validatePhoto = trpc.analysis.validatePhoto.useMutation();

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error("Please upload an image (JPG, PNG, GIF, WebP) ");
      return false;
    }
    // Validate file size (max 4 MB)
    if (selectedFile.size > 4 * 1024 * 1024) {
      toast.error(
        "File size must be less than 4 MB. Please compress your file or choose a smaller one."
      );
      return false;
    }
    setUploadedLocator(undefined);
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
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
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

  // Function to get status message based on stage
  const getStatusMessage = (stage: string, data?: any): string => {
    if (stage === "vision" && data?.status === "analyzing") {
      return "Analyzing pet's expression and body language...";
    }
    if (stage === "context" && data?.status === "analyzing") {
      return "Understanding breed characteristics and context...";
    }
    if (stage === "synthesis" && data?.status === "analyzing") {
      return "Generating behavioral insights...";
    }
    if (stage === "recommendations" && data?.status === "analyzing") {
      return "Preparing recommendations...";
    }
    if (stage === "voice" && data?.status === "analyzing") {
      return "Creating personality-based interpretation...";
    }
    return STAGE_STATUS_MESSAGES[stage] || "Processing...";
  };

  const handleUpload = async () => {
    if (!file || !pet) return;

    setUploading(true);
    setAnalysisProgress(0);
    setAnalysisStatus("Uploading file...");
    setCurrentStage("start");

    try {
      // Upload file to server
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await authFetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(
          "Upload failed. Please check your internet connection and try again."
        );
      }

      const { url } = await uploadResponse.json();
      setUploadedLocator(url);

      // Determine media type
      const mediaType = file.type.startsWith("video/") ? "video" : "image";

      // Validate photo quality for images (skip for videos)
      if (mediaType === "image") {
        setAnalysisStatus("Checking photo quality...");
        setAnalysisProgress(10);

        const qualityCheck = await validatePhoto.mutateAsync({ imageUrl: url });

        if (!qualityCheck.canProceed) {
          setUploading(false);
          setAnalysisProgress(0);
          setAnalysisStatus("");
          setCurrentStage("");

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
            description:
              "Analysis will proceed, but better lighting or focus may improve results.",
          });
        }
      }

      // Start SSE streaming for analysis progress
      setAnalysisStatus("Connecting to analysis server...");
      setAnalysisProgress(15);

      const eventSource = new AnalysisStream({
        petId: pet.id,
        mediaUrl: url,
        mediaType,
        userContext: userContext.trim() || undefined,
        photoDate: photoDate || undefined,
        petAgeAtPhoto: petAgeAtPhoto || undefined,
        quickMode,
      });
      eventSourceRef.current = eventSource;

      eventSource.onmessage = event => {
        try {
          const eventData = JSON.parse(event.data);
          const { stage, data, progress } = eventData;

          setCurrentStage(stage);
          setAnalysisProgress(progress || 0);
          setAnalysisStatus(getStatusMessage(stage, data));

          if (stage === "complete" && eventData.analysisId) {
            // Analysis complete - navigate to results page
            eventSource.close();
            eventSourceRef.current = null;

            setAnalysisProgress(100);
            setAnalysisStatus("Analysis complete!");
            setUploading(false);

            toast.success("Analysis complete!");

            // Navigate to results page
            setTimeout(() => {
              if (eventData.analysisId) {
                setLocation(`/analysis/${eventData.analysisId}`);
              }
            }, 500);
          } else if (stage === "error") {
            // Error occurred
            eventSource.close();
            eventSourceRef.current = null;

            setUploading(false);
            setAnalysisProgress(0);
            setAnalysisStatus("");
            setCurrentStage("");

            const errorMessage =
              eventData.error || "Analysis failed. Please try again.";

            // User-friendly error messages
            let friendlyMessage = errorMessage;
            if (
              errorMessage.includes("credits") ||
              errorMessage.includes("balance")
            ) {
              friendlyMessage =
                "Insufficient credits. Please purchase more credits to continue.";
            } else if (
              errorMessage.includes("Pet not found") ||
              errorMessage.includes("Access denied")
            ) {
              friendlyMessage =
                "Unable to analyze this pet. Please try again or contact support.";
            }

            toast.error(friendlyMessage);
          }
        } catch (error) {
          console.error("Error parsing SSE event:", error);
        }
      };

      eventSource.onerror = error => {
        console.error("SSE connection error:", error);
        eventSource.close();
        eventSourceRef.current = null;

        setUploading(false);
        setAnalysisProgress(0);
        setAnalysisStatus("");
        setCurrentStage("");

        toast.error(
          "Connection error. Please check your internet and try again."
        );
      };
    } catch (error) {
      console.error("Upload error:", error);

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      setUploading(false);
      setAnalysisProgress(0);
      setAnalysisStatus("");
      setCurrentStage("");

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to upload file. Please check your internet connection and try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancelAnalysis = () => {
    // Close SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    // Note: Analysis continues in background, but we stop showing progress
    setUploading(false);
    setAnalysisProgress(0);
    setAnalysisStatus("");
    setCurrentStage("");

    toast.info(
      "Stopped watching progress. Check the timeline later; the request may still finish."
    );
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

          {uploadedLocator && (
            <PrivateImage
              locator={uploadedLocator}
              alt="Uploaded pet photo"
              className="max-h-80 rounded-lg"
            />
          )}
          {/* Upload Section */}
          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Analyze Behavior</CardTitle>
              <CardDescription className="text-base">
                Upload a photo to understand {pet.name}'s behavior
              </CardDescription>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>How it works:</strong> Upload a photo of {pet.name}. Our
                AI will tell you what they're thinking or feeling in about{" "}
                {quickMode ? "8" : "20"} seconds.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Mode Toggle */}
              <div className="flex items-center justify-between p-4 bg-accent/10 rounded-lg border border-accent/20">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-accent" />
                  <div>
                    <Label
                      htmlFor="quickMode"
                      className="text-sm font-semibold cursor-pointer"
                    >
                      Quick Mode
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Faster analysis (5-8s) with basic insights, skip detailed
                      recommendations
                    </p>
                  </div>
                </div>
                <Toggle
                  id="quickMode"
                  pressed={quickMode}
                  onPressedChange={setQuickMode}
                  aria-label="Toggle Quick Mode"
                >
                  {quickMode ? "On" : "Off"}
                </Toggle>
              </div>

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
                    accept="image/jpeg,image/png,image/webp,image/gif"
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
                          {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                          {file.type.split("/")[0].toUpperCase()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={e => {
                          e.stopPropagation();
                          setFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        Change File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Upload
                        className={`w-12 h-12 mx-auto transition-transform ${isDragging ? "text-primary scale-110" : "text-muted-foreground"}`}
                      />
                      <div>
                        <p className="font-medium text-base">
                          {isDragging
                            ? "Drop file here"
                            : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Images (JPG, PNG, GIF, WebP) or Videos (MP4, MOV)
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Maximum file size: 4 MB
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
                  onChange={e => setUserContext(e.target.value)}
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
                  <Label className="text-sm font-semibold">
                    Is this an older photo?
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Help our AI learn {pet.name}'s behavior over time by dating
                  older photos
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="photoDate" className="text-sm">
                      When was this taken?
                    </Label>
                    <Input
                      id="photoDate"
                      type="date"
                      value={photoDate}
                      onChange={e => setPhotoDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="petAge" className="text-sm">
                      How old was {pet.name}?
                    </Label>
                    <Input
                      id="petAge"
                      placeholder="e.g., '6 months' or '2 years'"
                      value={petAgeAtPhoto}
                      onChange={e => setPetAgeAtPhoto(e.target.value)}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground italic">
                  💡 The more historical photos you upload, the better our AI
                  understands {pet.name}'s unique patterns!
                </p>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full text-base min-h-[56px] text-lg"
                size="lg"
                onClick={handleUpload}
                disabled={!file || uploading}
              >
                {uploading ? (
                  <>
                    <Sparkles className="w-6 h-6 mr-2 animate-spin" />
                    {analysisStatus || "Analyzing... Please wait"}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 mr-2" />
                    Click to Analyze {pet.name}'s Behavior{" "}
                    {quickMode && "(Quick Mode)"}
                  </>
                )}
              </Button>

              {/* Analysis Progress Bar */}
              {uploading && (
                <div className="mt-6 space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">
                      Analysis in Progress
                    </h3>
                    <span className="text-xs text-muted-foreground">
                      {analysisProgress}%
                    </span>
                  </div>
                  <Progress value={analysisProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-primary" />
                    {analysisStatus || "Processing..."}
                  </p>
                  {currentStage && (
                    <div className="text-xs text-muted-foreground">
                      <span className="font-medium">Stage:</span> {currentStage}
                    </div>
                  )}
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
                    💡 You can navigate away. We'll notify you when the analysis
                    is complete.
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
