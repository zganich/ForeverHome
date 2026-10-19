import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ComparePets from "./pages/ComparePets";
import Subscribe from "./pages/Subscribe";
import Dashboard from "./pages/Dashboard";
import AddPet from "./pages/AddPet";
import PetDetail from "./pages/PetDetail";
import AnalysisResult from "./pages/AnalysisResult";
import PurchaseCredits from "./pages/PurchaseCredits";
import AdminDashboard from "./pages/AdminDashboard";
import AuthCallback from "./pages/AuthCallback";
import ResetPassword from "./pages/ResetPassword";
import ForDevotedParents from "./pages/ForDevotedParents";
import ForNewOwners from "./pages/ForNewOwners";
import ForMultiPet from "./pages/ForMultiPet";
import ForRescueAdopters from "./pages/ForRescueAdopters";
import ForShelters from "./pages/ForShelters";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/auth/callback"} component={AuthCallback} />
      <Route path={"/auth/reset-password"} component={ResetPassword} />
      <Route path={"/compare"} component={ComparePets} />
      <Route path={"/subscribe"} component={Subscribe} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/pets/new"} component={AddPet} />
      <Route path={"/pets/:id"} component={PetDetail} />
      <Route path={"/analysis/:id"} component={AnalysisResult} />
      <Route path={"/purchase"} component={PurchaseCredits} />
      <Route path={"/admin/dashboard"} component={AdminDashboard} />
      <Route path={"/for-devoted-parents"} component={ForDevotedParents} />
      <Route path={"/for-new-owners"} component={ForNewOwners} />
      <Route path={"/for-multi-pet"} component={ForMultiPet} />
      <Route path={"/for-rescue-adopters"} component={ForRescueAdopters} />
      <Route path={"/for-shelters"} component={ForShelters} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
          <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

