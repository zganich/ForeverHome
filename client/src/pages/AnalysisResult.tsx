import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { PawPrint, ArrowLeft, ThumbsUp, ThumbsDown, AlertTriangle, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { APP_TITLE } from "@/const";
import { toast } from "sonner";

export default function AnalysisResult() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const { data: analysis, isLoading } = trpc.analysis.get.useQuery(
    { analysisId: id! },
    { enabled: isAuthenticated && !!id }
  );

  const submitFeedback = trpc.analysis.submitFeedback.useMutation({
    onSuccess: () => {
      setFeedbackSubmitted(true);
      toast.success("Thank you for your feedback!");
    },
    onError: (error) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Analysis not found</h2>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Parse JSON data
  const visionData = analysis.visionData ? JSON.parse(analysis.visionData) : null;
  const contextData = analysis.contextData ? JSON.parse(analysis.contextData) : null;
  const synthesisData = analysis.synthesisData ? JSON.parse(analysis.synthesisData) : null;
  const recommendations = analysis.recommendations ? JSON.parse(analysis.recommendations) : null;

  const handleFeedback = (feedback: "helpful" | "not_helpful") => {
    submitFeedback.mutate({ analysisId: id!, feedback });
  };

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
            <Link href={`/pets/${analysis.petId}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pet
            </Link>
          </Button>

          {/* Primary Result */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-primary to-accent">
                      {analysis.primaryBehavior}
                    </Badge>
                    <div className="text-3xl font-bold text-primary">{analysis.confidenceScore}</div>
                  </div>
                  <CardDescription className="text-base">
                    Analysis completed on {new Date(analysis.createdAt!).toLocaleDateString()} at{" "}
                    {new Date(analysis.createdAt!).toLocaleTimeString()}
                  </CardDescription>
                </div>
                <Sparkles className="w-12 h-12 text-primary" />
              </div>
            </CardHeader>
            {synthesisData && (
              <CardContent>
                <p className="text-lg leading-relaxed">{synthesisData.reasoning}</p>
                {synthesisData.alternativeInterpretations && synthesisData.alternativeInterpretations.length > 0 && (
                  <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Alternative Interpretations
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {synthesisData.alternativeInterpretations.map((alt: string, idx: number) => (
                        <li key={idx}>• {alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            )}
          </Card>

          {/* Recommendations */}
          {recommendations && (
            <Card className="border-2 border-accent/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-6 h-6 text-accent" />
                  What You Can Do
                </CardTitle>
                <CardDescription>Actionable steps to support your pet</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {recommendations.actions.map((action: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-accent/5 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="flex-1">{action}</p>
                    </div>
                  ))}
                </div>

                {recommendations.safetyWarnings && recommendations.safetyWarnings.length > 0 && (
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Safety Warnings
                    </h4>
                    <ul className="space-y-1 text-sm">
                      {recommendations.safetyWarnings.map((warning: string, idx: number) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {recommendations.vetConsultation && (
                  <div className="p-4 bg-secondary/20 border border-secondary/30 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-secondary" />
                      Veterinary Consultation Recommended
                    </h4>
                    <p className="text-sm">
                      Based on this behavior, we recommend consulting with a veterinarian for professional evaluation
                      and guidance.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Vision Analysis */}
            {visionData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">👁️ Visual Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold mb-1">Body Posture</h5>
                    <p className="text-muted-foreground">{visionData.posture}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Facial Expression</h5>
                    <p className="text-muted-foreground">{visionData.facialExpression}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Environment</h5>
                    <p className="text-muted-foreground">{visionData.environmentalContext}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Vision Confidence: {visionData.confidence}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Context Analysis */}
            {contextData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">🧬 Behavioral Context</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h5 className="font-semibold mb-1">Breed Traits</h5>
                    <p className="text-muted-foreground">{contextData.breedTraits}</p>
                  </div>
                  <div>
                    <h5 className="font-semibold mb-1">Age Considerations</h5>
                    <p className="text-muted-foreground">{contextData.ageConsiderations}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* User Context */}
          {analysis.userContext && (
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg">📝 Your Note</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic text-muted-foreground">"{analysis.userContext}"</p>
              </CardContent>
            </Card>
          )}

          {/* Feedback */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Was this analysis helpful?</CardTitle>
              <CardDescription>Your feedback helps us improve our AI</CardDescription>
            </CardHeader>
            <CardContent>
              {feedbackSubmitted || analysis.userFeedback ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-2" />
                  <p className="font-medium">Thank you for your feedback!</p>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleFeedback("helpful")}
                    disabled={submitFeedback.isPending}
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Helpful
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => handleFeedback("not_helpful")}
                    disabled={submitFeedback.isPending}
                  >
                    <ThumbsDown className="w-5 h-5 mr-2" />
                    Not Helpful
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="bg-muted/20 border-dashed">
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              <p>
                <strong>Disclaimer:</strong> InterpWhat provides informational insights based on AI analysis. This is
                not a substitute for professional veterinary advice, diagnosis, or treatment. Always consult with a
                qualified veterinarian for medical concerns.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

