import { authFetch } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  shelterPartners: number;
}
export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data, isPending, error, refetch } = useQuery<AdminStats>({
    queryKey: ["admin-analytics", user?.id],
    enabled: isAuthenticated && user?.role === "admin",
    queryFn: async ({ signal }) => {
      const response = await authFetch("/api/admin/analytics", {
        signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
      });
      if (!response.ok)
        throw new Error(
          response.status === 403
            ? "Access denied."
            : "Admin analytics are temporarily unavailable."
        );
      return response.json();
    },
    retry: false,
  });
  if (error)
    return (
      <div role="alert">
        {error.message} <Button onClick={() => void refetch()}>Retry</Button>{" "}
        <Link href="/dashboard">Back to Dashboard</Link>
      </div>
    );
  if (isPending) return <p role="status">Loading admin analytics…</p>;
  return (
    <main className="container mx-auto px-6 py-8 space-y-6">
      <h1 className="text-4xl font-bold">Super Admin Dashboard</h1>
      <Button onClick={() => void refetch()}>Refresh</Button>{" "}
      <Link href="/dashboard">Back to Dashboard</Link>
      <div className="grid md:grid-cols-4 gap-4">
        {[
          ["Total Users", data.totalUsers],
          ["Active Subscribers", data.activeSubscriptions],
          ["Shelter Partners", data.shelterPartners],
          [
            "Estimated monthly subscription value",
            `$${data.totalRevenue.toFixed(2)}`,
          ],
        ].map(([title, value]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>{value}</CardContent>
          </Card>
        ))}
      </div>
      <p>
        Subscription value is estimated from active plans and listed prices; it
        is not collected revenue. Growth, churn, lifetime value, recent activity
        and shelter performance are not measured here.
      </p>
    </main>
  );
}
