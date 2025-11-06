import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { APP_TITLE, APP_LOGO } from "@/const";
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext";
import { PawPrint, Heart, Users, Baby, Dog, Building2, Menu } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function MainNavigation() {
  const { user } = useSupabaseAuth();
  const isAuthenticated = !!user;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const personaLinks = [
    {
      href: "/for-devoted-parents",
      icon: Heart,
      title: "Devoted Pet Parents",
      description: "For pet parents who treat their pets like family",
    },
    {
      href: "/for-new-owners",
      icon: Baby,
      title: "New Pet Owners",
      description: "First-time owners seeking expert guidance",
    },
    {
      href: "/for-multi-pet",
      icon: Users,
      title: "Multi-Pet Households",
      description: "Managing multiple pets efficiently",
    },
    {
      href: "/for-rescue-adopters",
      icon: Dog,
      title: "Rescue Pet Adopters",
      description: "Special pricing for rescue pet parents",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop: Use CSS Grid for perfect visual balance */}
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] h-16 items-center gap-4">
          {/* Left: Logo */}
          <div className="flex items-center justify-start">
            <Link 
              href="/" 
              className="flex items-center gap-2 sm:gap-3 group transition-opacity hover:opacity-80"
            >
              {APP_LOGO && !APP_LOGO.includes('placehold') && APP_LOGO !== "https://placehold.co/128x128/E1E7EF/1F2937?text=App" ? (
                <img 
                  src={APP_LOGO} 
                  alt={APP_TITLE}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-sm transition-transform group-hover:scale-105">
                  <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
                </div>
              )}
              <span className="hidden sm:block text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                {APP_TITLE}
              </span>
            </Link>
          </div>

          {/* Center: Navigation - Perfectly centered */}
          <nav className="flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-2">
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="h-9 px-4 text-sm font-medium data-[state=open]:bg-accent data-[state=open]:text-accent-foreground hover:bg-accent/50 transition-colors">
                    For Pet Parents
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[520px] gap-1 p-2 md:grid-cols-2">
                      {personaLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                          <NavigationMenuLink key={item.href} asChild>
                            <Link
                              href={item.href}
                              className="group flex flex-col gap-2 rounded-lg p-4 transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/20 shrink-0">
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold leading-none">
                                  {item.title}
                                </span>
                              </div>
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground pl-12">
                                {item.description}
                              </p>
                            </Link>
                          </NavigationMenuLink>
                        );
                      })}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/for-shelters"
                      className="group inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>For Shelters</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      href="/#features"
                      className="inline-flex h-9 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                    >
                      Features
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Right: Actions - Perfectly aligned */}
          <div className="flex items-center justify-end gap-3">
            {isAuthenticated ? (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Mobile/Tablet: Use flexbox with hamburger */}
        <div className="flex lg:hidden h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 group transition-opacity hover:opacity-80"
          >
            {APP_LOGO && !APP_LOGO.includes('placehold') && APP_LOGO !== "https://placehold.co/128x128/E1E7EF/1F2937?text=App" ? (
              <img 
                src={APP_LOGO} 
                alt={APP_TITLE}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full object-cover shadow-sm transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-sm transition-transform group-hover:scale-105">
                <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
              </div>
            )}
            <span className="hidden sm:block text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              {APP_TITLE}
            </span>
          </Link>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Toggle menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <PawPrint className="h-5 w-5 text-primary" />
                    {APP_TITLE}
                  </SheetTitle>
                  <SheetDescription>
                    Navigate to different sections
                  </SheetDescription>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-4">
                  <div className="space-y-1">
                    <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      For Pet Parents
                    </h3>
                    {personaLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4">
                    <Link
                      href="/for-shelters"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <span className="font-semibold">For Shelters</span>
                    </Link>
                  </div>

                  <div className="border-t pt-4">
                    <Link
                      href="/#features"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="font-semibold">Features</span>
                    </Link>
                  </div>

                  <div className="border-t pt-4">
                    {isAuthenticated ? (
                      <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                    ) : (
                      <Button asChild className="w-full" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/login">Sign In</Link>
                      </Button>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
