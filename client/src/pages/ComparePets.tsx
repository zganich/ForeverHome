import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { APP_TITLE } from "@/const";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function ComparePets() {
  const { isAuthenticated } = useAuth();
  const [pet1Id, setPet1Id] = useState<string>("");
  const [pet2Id, setPet2Id] = useState<string>("");

  const { data: pets } = trpc.pets.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: pet1Analyses } = trpc.analysis.listForPet.useQuery(
    { petId: pet1Id },
    { enabled: !!pet1Id }
  );

  const { data: pet2Analyses } = trpc.analysis.listForPet.useQuery(
    { petId: pet2Id },
    { enabled: !!pet2Id }
  );

  const pet1 = pets?.find((p) => p.id === pet1Id);
  const pet2 = pets?.find((p) => p.id === pet2Id);

  const calculateAverageBehavior = (analyses: any[] | undefined) => {
    if (!analyses || analyses.length === 0) return null;

    const behaviors: Record<string, number> = {};
    analyses.forEach((analysis) => {
      if (analysis.primaryBehavior) {
        behaviors[analysis.primaryBehavior] = (behaviors[analysis.primaryBehavior] || 0) + 1;
      }
    });

    const total = analyses.length;
    return Object.entries(behaviors)
      .map(([behavior, count]) => ({
        behavior,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  };

  const pet1Behaviors = calculateAverageBehavior(pet1Analyses);
  const pet2Behaviors = calculateAverageBehavior(pet2Analyses);

  const getComparisonIcon = (diff: number) => {
    if (diff > 10) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (diff < -10) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-peach-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
              <p className="text-sm text-muted-foreground">Compare Your Pets</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Pets to Compare</CardTitle>
              <CardDescription>
                Compare behavior patterns, personality traits, and analysis history between your pets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Pet</label>
                  <Select value={pet1Id} onValueChange={setPet1Id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets?.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id} disabled={pet.id === pet2Id}>
                          {pet.name} ({pet.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Second Pet</label>
                  <Select value={pet2Id} onValueChange={setPet2Id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets?.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id} disabled={pet.id === pet1Id}>
                          {pet.name} ({pet.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {pet1 && pet2 && (
            <>
              {/* Basic Info Comparison */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{pet1.name}</CardTitle>
                    <CardDescription>
                      {pet1.breed || pet1.species} • {pet1.age || "Age unknown"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pet1.photoUrl && (
                      <img
                        src={pet1.photoUrl}
                        alt={pet1.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Personality:</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {pet1.personality || "Not set"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Total Analyses:</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {pet1Analyses?.length || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{pet2.name}</CardTitle>
                    <CardDescription>
                      {pet2.breed || pet2.species} • {pet2.age || "Age unknown"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pet2.photoUrl && (
                      <img
                        src={pet2.photoUrl}
                        alt={pet2.name}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">Personality:</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {pet2.personality || "Not set"}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Total Analyses:</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {pet2Analyses?.length || 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Behavior Comparison */}
              <Card>
                <CardHeader>
                  <CardTitle>Behavior Patterns</CardTitle>
                  <CardDescription>
                    Most common behaviors observed in analyses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pet1Behaviors && pet2Behaviors ? (
                    <div className="space-y-4">
                      {pet1Behaviors.slice(0, 5).map((behavior1, index) => {
                        const behavior2 = pet2Behaviors.find((b) => b.behavior === behavior1.behavior);
                        const diff = behavior1.percentage - (behavior2?.percentage || 0);

                        return (
                          <div key={behavior1.behavior} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium capitalize">
                                {behavior1.behavior}
                              </span>
                              {getComparisonIcon(diff)}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">{pet1.name}</span>
                                  <span className="font-medium">{behavior1.percentage}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500"
                                    style={{ width: `${behavior1.percentage}%` }}
                                  />
                                </div>
                              </div>
                              <div>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">{pet2.name}</span>
                                  <span className="font-medium">
                                    {behavior2?.percentage || 0}%
                                  </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-peach-500"
                                    style={{ width: `${behavior2?.percentage || 0}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Not enough data to compare. Upload more analyses for both pets.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Key Insights */}
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pet1Behaviors && pet2Behaviors && pet1Behaviors.length > 0 && pet2Behaviors.length > 0 ? (
                      <>
                        <div className="p-4 bg-purple-50 rounded-lg">
                          <p className="text-sm">
                            <strong>{pet1.name}</strong> most commonly shows{" "}
                            <strong className="text-purple-600">
                              {pet1Behaviors[0].behavior}
                            </strong>{" "}
                            behavior ({pet1Behaviors[0].percentage}% of analyses)
                          </p>
                        </div>
                        <div className="p-4 bg-peach-50 rounded-lg">
                          <p className="text-sm">
                            <strong>{pet2.name}</strong> most commonly shows{" "}
                            <strong className="text-peach-600">
                              {pet2Behaviors[0].behavior}
                            </strong>{" "}
                            behavior ({pet2Behaviors[0].percentage}% of analyses)
                          </p>
                        </div>
                        {pet1Behaviors[0].behavior !== pet2Behaviors[0].behavior && (
                          <div className="p-4 bg-mint-50 rounded-lg">
                            <p className="text-sm">
                              💡 <strong>Tip:</strong> {pet1.name} and {pet2.name} have different
                              dominant behaviors. This is normal! Each pet has their own unique
                              personality.
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        Upload analyses for both pets to see insights
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {(!pet1 || !pet2) && (
            <Card>
              <CardContent className="py-12">
                <p className="text-center text-muted-foreground">
                  Select two pets above to start comparing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

