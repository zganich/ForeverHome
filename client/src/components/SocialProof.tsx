import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Users } from "lucide-react";

export default function SocialProof() {
  return (
    <section className="bg-muted/30 py-12">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <p className="text-3xl font-bold">Join 10,000+ Pet Parents</p>
            </div>
            <p className="text-xl text-muted-foreground">
              Already using InterpWhat to understand their pets better
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 space-y-3 text-center">
                <div className="flex gap-1 text-yellow-500 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "I literally cried when I heard my dog's voice for the first time. InterpWhat has completely changed how I understand Max!"
                </p>
                <p className="font-semibold text-sm">— Sarah M.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3 text-center">
                <div className="flex gap-1 text-yellow-500 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "The Breed ID feature revealed my rescue is part Border Collie! Now I can give her the right amount of exercise."
                </p>
                <p className="font-semibold text-sm">— Mike T.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3 text-center">
                <div className="flex gap-1 text-yellow-500 justify-center">
                  {[...Array(5)].map((_, i) => (
                    <Sparkles key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic">
                  "With three dogs, the Multi-Pet Comparison is invaluable. This app is worth every penny."
                </p>
                <p className="font-semibold text-sm">— Jessica L.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

