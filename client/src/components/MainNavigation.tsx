import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { APP_TITLE } from "@/const";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { PawPrint, Heart, Users, Baby, Dog, Building2 } from "lucide-react";
import { Link } from "wouter";

export default function MainNavigation() {
  const { user } = useSupabaseAuth();
  const isAuthenticated = !!user;

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <PawPrint className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {APP_TITLE}
          </h1>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>For Pet Parents</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid w-[500px] gap-3 p-4 md:grid-cols-2">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-devoted-parents"
                        className="flex flex-col gap-2 rounded-lg p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-primary" />
                          <span className="font-semibold">Devoted Pet Parents</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          For pet parents who treat their pets like family
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-new-owners"
                        className="flex flex-col gap-2 rounded-lg p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Baby className="w-5 h-5 text-primary" />
                          <span className="font-semibold">New Pet Owners</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          First-time owners seeking expert guidance
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-multi-pet"
                        className="flex flex-col gap-2 rounded-lg p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="font-semibold">Multi-Pet Households</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Managing multiple pets efficiently
                        </p>
                      </Link>
                    </NavigationMenuLink>
                    <NavigationMenuLink asChild>
                      <Link
                        href="/for-rescue-adopters"
                        className="flex flex-col gap-2 rounded-lg p-4 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Dog className="w-5 h-5 text-primary" />
                          <span className="font-semibold">Rescue Pet Adopters</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Special pricing for rescue pet parents
                        </p>
                      </Link>
                    </NavigationMenuLink>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild>
                  <Link
                    href="/for-shelters"
                    className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    For Shelters
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/#features">
            <Button variant="ghost">Features</Button>
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

