import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Check, X, AlertCircle } from "lucide-react";
import { useState } from "react";

export function PhotoTips() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span>📸 Tips for Better Results</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {isExpanded ? "Click to collapse" : "Click to expand"}
          </span>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Shot Distance Guide */}
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Best Shot Distances
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Medium Shots (Best)</strong> - Shows full body + face. Pet takes up 60-80% of frame.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Close-ups</strong> - Face and head only. Great for emotions.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Long Shots</strong> - Pet in environment. Good for context but harder to see details.
                </div>
              </div>
            </div>
          </div>

          {/* What to Capture */}
          <div>
            <h4 className="font-semibold mb-3">Activities to Capture</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Resting/Sleeping</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Playing</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Eating/Drinking</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Interacting</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Alert/Watching</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <span>Training</span>
              </div>
            </div>
          </div>

          {/* What to Avoid */}
          <div>
            <h4 className="font-semibold mb-3 text-destructive">What to Avoid</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>Too far away - Can't see facial expressions</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>Blurry or out of focus</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>Poor lighting (too dark)</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <span>Pet partially hidden or obstructed</span>
              </div>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-primary/5 p-4 rounded-lg">
            <h4 className="font-semibold mb-3">💡 Pro Tips</h4>
            <ul className="space-y-2 text-sm">
              <li>✓ Natural light is best - outdoor or near windows</li>
              <li>✓ Shoot at your pet's eye level, not from above</li>
              <li>✓ Uncluttered background helps AI focus</li>
              <li>✓ Capture real behavior, don't stage it</li>
              <li>✓ Videos are even better - movement tells a story!</li>
            </ul>
          </div>

          {/* How Many Photos */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">How Many Photos Do I Need?</h4>
            <div className="space-y-3 text-sm">
              <div>
                <strong className="text-green-600">Good Results:</strong> 3-5 photos
                <p className="text-muted-foreground ml-4">One face shot, one full body, one showing behavior</p>
              </div>
              <div>
                <strong className="text-blue-600">Better Results:</strong> 10-15 photos
                <p className="text-muted-foreground ml-4">Multiple angles, times, emotional states</p>
              </div>
              <div>
                <strong className="text-purple-600">Best Results:</strong> 20+ photos over time
                <p className="text-muted-foreground ml-4">AI learns your pet's unique patterns and personality</p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

