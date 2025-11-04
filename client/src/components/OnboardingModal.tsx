import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, PawPrint, Plus, Upload, Volume2 } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

interface OnboardingStep {
  id: string;
  label: string;
  icon: React.ReactNode;
  completed: boolean;
  href: string;
}

export default function OnboardingModal() {
  const [open, setOpen] = useState(false);
  const { data: pets } = trpc.pets.list.useQuery();
  
  // Check if user has any analyses by checking first pet
  const firstPetId = pets && pets.length > 0 ? pets[0].id : null;
  const { data: firstPetAnalyses } = trpc.analysis.listForPet.useQuery(
    { petId: firstPetId! },
    { enabled: !!firstPetId }
  );
  
  const hasAnalyses = !!firstPetAnalyses && firstPetAnalyses.length > 0;

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem("onboarding_completed") === "true";
    const hasPets = pets && pets.length > 0;

    // Show onboarding if:
    // 1. Not completed before
    // 2. No pets yet OR no analyses yet
    if (!onboardingCompleted && (!hasPets || !hasAnalyses)) {
      setOpen(true);
    }
  }, [pets, hasAnalyses]);

  const steps: OnboardingStep[] = [
    {
      id: "add-pet",
      label: "Add Your First Pet",
      icon: <Plus className="w-5 h-5" />,
      completed: !!pets && pets.length > 0,
      href: "/pets/new",
    },
    {
      id: "upload-photo",
      label: "Upload a Photo",
      icon: <Upload className="w-5 h-5" />,
      completed: false, // Will be updated based on analysis
      href: pets && pets.length > 0 ? `/pets/${pets[0].id}` : "/pets/new",
    },
    {
      id: "view-analysis",
      label: "View Your First Analysis",
      icon: <Volume2 className="w-5 h-5" />,
      completed: hasAnalyses,
      href: hasAnalyses && firstPetAnalyses && firstPetAnalyses.length > 0 
        ? `/analysis/${firstPetAnalyses[0].id}` 
        : "#",
    },
  ];

  const completedSteps = steps.filter((s) => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  const handleComplete = () => {
    localStorage.setItem("onboarding_completed", "true");
    setOpen(false);
  };

  const nextStep = steps.find((s) => !s.completed);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <PawPrint className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-2xl">Welcome to InterpWhat! 🎉</DialogTitle>
              <DialogDescription>Let's get you started in 3 simple steps</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">
                {completedSteps} of {totalSteps} completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <Link
                key={step.id}
                href={step.href}
                onClick={() => {
                  if (step.completed) return;
                  // Close modal when clicking on incomplete step
                  if (!step.completed && step.id !== "view-analysis") {
                    setOpen(false);
                  }
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  step.completed
                    ? "bg-green-50 border-green-200"
                    : step.id === nextStep?.id
                    ? "bg-primary/10 border-primary/30 cursor-pointer hover:bg-primary/20"
                    : "bg-muted border-muted cursor-pointer hover:bg-muted/80"
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    step.completed ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </div>
                <div className="flex-1">{step.icon}</div>
                <div className="flex-1">
                  <p className="font-medium">{step.label}</p>
                </div>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {nextStep && (
              <Button asChild className="flex-1" onClick={() => setOpen(false)}>
                <Link href={nextStep.href}>
                  {nextStep.label}
                  {nextStep.id === "add-pet" && <Plus className="ml-2 w-4 h-4" />}
                  {nextStep.id === "upload-photo" && <Upload className="ml-2 w-4 h-4" />}
                </Link>
              </Button>
            )}
            {completedSteps === totalSteps && (
              <Button onClick={handleComplete} className="flex-1">
                Complete Onboarding
              </Button>
            )}
            <Button variant="outline" onClick={handleComplete}>
              Skip
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            You can always access this guide from the dashboard
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

