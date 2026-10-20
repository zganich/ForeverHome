import { PrivateImage } from "@/components/PrivateImage";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Calendar } from "lucide-react";
import { Link } from "wouter";

interface Analysis {
  id: string;
  mediaUrl: string;
  primaryBehavior: string | null;
  confidenceScore: string | null;
  createdAt: Date | null;
  photoDate?: Date | null;
  petAgeAtPhoto?: string | null;
}

interface PetTimelineProps {
  analyses: Analysis[];
  petName: string;
}

export function PetTimeline({ analyses, petName }: PetTimelineProps) {
  if (!analyses || analyses.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📅 {petName}'s Timeline</CardTitle>
          <CardDescription>
            No analyses yet. Upload some photos to start building {petName}'s
            behavioral history!
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Sort analyses by photo date (or created date if no photo date)
  const sortedAnalyses = [...analyses].sort((a, b) => {
    const dateA = a.photoDate
      ? new Date(a.photoDate)
      : a.createdAt
        ? new Date(a.createdAt)
        : new Date();
    const dateB = b.photoDate
      ? new Date(b.photoDate)
      : b.createdAt
        ? new Date(b.createdAt)
        : new Date();
    return dateB.getTime() - dateA.getTime(); // Most recent first
  });

  // Group by age if available
  const groupedByAge: Record<string, Analysis[]> = {};
  sortedAnalyses.forEach(analysis => {
    const ageGroup = analysis.petAgeAtPhoto || "Recent";
    if (!groupedByAge[ageGroup]) {
      groupedByAge[ageGroup] = [];
    }
    groupedByAge[ageGroup].push(analysis);
  });

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              {petName}'s Behavioral Timeline
            </CardTitle>
            <CardDescription>
              {analyses.length}{" "}
              {analyses.length === 1 ? "analysis" : "analyses"} • Track how{" "}
              {petName} has changed over time
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Learning
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedByAge).map(([ageGroup, groupAnalyses]) => (
            <div key={ageGroup} className="space-y-3">
              {ageGroup !== "Recent" && (
                <h4 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  When {petName} was {ageGroup}
                </h4>
              )}

              <div className="space-y-3">
                {groupAnalyses.map((analysis, index) => {
                  const displayDate = analysis.photoDate
                    ? new Date(analysis.photoDate)
                    : analysis.createdAt
                      ? new Date(analysis.createdAt)
                      : new Date();
                  const isHistorical =
                    analysis.photoDate !== null &&
                    analysis.photoDate !== undefined;

                  return (
                    <Link key={analysis.id} href={`/analysis/${analysis.id}`}>
                      <div className="flex gap-4 p-4 rounded-lg border hover:border-primary/50 transition-colors cursor-pointer group">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-3 h-3 rounded-full ${isHistorical ? "bg-accent" : "bg-primary"} group-hover:scale-125 transition-transform`}
                          />
                          {index < groupAnalyses.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-2" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium group-hover:text-primary transition-colors">
                                {analysis.primaryBehavior ||
                                  "Behavior Analysis"}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(displayDate)}
                                {isHistorical && (
                                  <Badge variant="outline" className="text-xs">
                                    Historical
                                  </Badge>
                                )}
                              </p>
                            </div>
                            {analysis.confidenceScore && (
                              <Badge variant="secondary" className="text-xs">
                                {analysis.confidenceScore}
                              </Badge>
                            )}
                          </div>

                          {/* Thumbnail */}
                          {analysis.mediaUrl && (
                            <PrivateImage
                              locator={analysis.mediaUrl}
                              alt={
                                analysis.primaryBehavior ||
                                "Pet behavior analysis"
                              }
                              className="w-full h-32 object-cover rounded border"
                            />
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Insights */}
        {analyses.length >= 5 && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Pattern Recognition Active
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              With {analyses.length} analyses, our AI is learning {petName}'s
              unique behavioral patterns. Keep uploading to unlock deeper
              insights!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
