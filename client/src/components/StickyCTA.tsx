import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

interface StickyCTAProps {
  primaryText?: string;
  secondaryText?: string;
  primaryHref?: string;
  secondaryHref?: string;
}

export default function StickyCTA({
  primaryText = "Start Free Trial",
  secondaryText = "View Plans & Pricing",
  primaryHref = "/login",
  secondaryHref = "/subscribe",
}: StickyCTAProps) {
  const { user } = useSupabaseAuth();
  const isAuthenticated = !!user;

  if (isAuthenticated) {
    return null; // Don't show for authenticated users
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50 p-4 animate-in slide-in-from-bottom">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="font-semibold text-sm sm:text-base">Ready to understand your pet better?</p>
          <p className="text-xs text-muted-foreground hidden sm:block">
            Free plan available • No credit card required
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button size="lg" asChild className="w-full sm:w-auto">
            <Link href={primaryHref}>
              {primaryText}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
            <Link href={secondaryHref}>{secondaryText}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

