import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, DollarSign, TrendingUp, Download, RefreshCw } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  activeSubscriptions: number;
  rescueAdopters: number;
  shelterPartners: number;
  monthlyGrowth: number;
  churnRate: number;
  avgLifetimeValue: number;
  premiumRevenue: number;
  essentialRevenue: number;
  rescueRevenue: number;
  shelterOrgRevenue: number;
  totalAdopterSignups: number;
  shelterRevenueShare: number;
  avgSignupRate: number;
  topShelter: string;
  recentActivity: Array<{ type: string; user: string; value: string; timestamp: string }>;
}

const defaultStats: AdminStats = {
  totalUsers: 0,
  totalRevenue: 0,
  activeSubscriptions: 0,
  rescueAdopters: 0,
  shelterPartners: 0,
  monthlyGrowth: 0,
  churnRate: 0,
  avgLifetimeValue: 0,
  premiumRevenue: 0,
  essentialRevenue: 0,
  rescueRevenue: 0,
  shelterOrgRevenue: 0,
  totalAdopterSignups: 0,
  shelterRevenueShare: 0,
  avgSignupRate: 0,
  topShelter: "N/A",
  recentActivity: []
};

export default function AdminDashboard() {
  const { data: analytics, isLoading, refetch } = useQuery<AdminStats>({
    queryKey: ["/api/admin/analytics"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const stats: AdminStats = analytics || defaultStats;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Super Admin Dashboard</h1>
        <div className="flex gap-4">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.rescueAdopters} rescue adopters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Shelter Partners</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shelterPartners}</div>
            <p className="text-xs text-muted-foreground">
              Active partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg LTV</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgLifetimeValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Churn rate: {stats.churnRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Premium ($19.99/mo)</span>
                <span className="text-sm font-bold">${(stats.premiumRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Essential ($9.99/mo)</span>
                <span className="text-sm font-bold">${(stats.essentialRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Rescue Adopter ($14.99/mo)</span>
                <span className="text-sm font-bold">${(stats.rescueRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Shelter Org ($33/mo)</span>
                <span className="text-sm font-bold">${(stats.shelterOrgRevenue || 0).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shelter Partner Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Adopter Sign-Ups</span>
                <span className="text-sm font-bold">{stats.totalAdopterSignups || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Revenue Share Paid</span>
                <span className="text-sm font-bold">${(stats.shelterRevenueShare || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg Sign-Up Rate</span>
                <span className="text-sm font-bold">{(stats.avgSignupRate || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Top Performing Shelter</span>
                <span className="text-sm font-bold">{stats.topShelter || "N/A"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(stats.recentActivity || []).map((activity: any, index: number) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="text-sm font-medium">{activity.type}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{activity.value}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
