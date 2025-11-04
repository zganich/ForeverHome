import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, X } from "lucide-react";
import { Link } from "wouter";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";

export default function ExitIntentPopup() {
  const { user } = useSupabaseAuth();
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Don't show for authenticated users
  if (user) {
    return null;
  }

  useEffect(() => {
    // Check if we've already shown this to the user
    const hasShownBefore = localStorage.getItem("exitIntentShown") === "true";
    if (hasShownBefore) {
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Trigger when mouse leaves the top of the viewport
      if (e.clientY <= 0 && !hasShown) {
        setShow(true);
        setHasShown(true);
        localStorage.setItem("exitIntentShown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasShown]);

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Wait! Don't Miss Out 🐾</DialogTitle>
          <DialogDescription className="text-base pt-2">
            Get started with InterpWhat and understand your pet like never before.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="font-semibold text-primary mb-2">Special Offer for You:</p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Free plan with 2 analyses/month</li>
              <li>✓ No credit card required</li>
              <li>✓ Cancel anytime</li>
              <li>✓ 10,000+ pet parents already using InterpWhat</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" asChild className="flex-1">
              <Link href="/login" onClick={() => setShow(false)}>
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setShow(false)}
              className="flex-1"
            >
              No Thanks
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            A portion of every subscription supports no-kill animal shelters 🐾
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

