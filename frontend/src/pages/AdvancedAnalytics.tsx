import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Clock,
  Target,
  Briefcase,
  Calendar,
  Building2,
  MapPin,
  Loader2,
} from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import { advancedAnalyticsApi } from "../api/advancedAnalytics";
import type { AdvancedAnalyticsData } from "../types";
import { toast } from "sonner";
import { useTheme } from "../context/ThemeContext";

const COLORS = ["#0f6f8f", "#2f7d62", "#c17b09", "#c74255", "#4f6577", "#5e6f7b", "#2d8fa3"];

export default function AdvancedAnalytics() {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();

  const chartColors = {
    grid: isDark ? "hsl(218, 18%, 18%)" : "hsl(210, 18%, 84%)",
    tooltip: {
      bg: isDark ? "hsl(222, 47%, 7%)" : "hsl(0, 0%, 100%)",
      border: isDark ? "hsl(218, 18%, 18%)" : "hsl(210, 18%, 84%)",
    },
    text: isDark ? "hsl(218, 11%, 55%)" : "hsl(220, 9%, 46%)",
  };

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const analyticsData = await advancedAnalyticsApi.getAdvancedAnalytics();
      setData(analyticsData);
    } catch (error) {
      console.error("Failed to fetch advanced analytics:", error);
      toast.error("Failed to load advanced analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <>
        <PageHeader title="Advanced Analytics" description="Deep dive into your job search data" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Advanced Analytics"
        description="Deep dive into your job search performance and trends"
      />

      {/* Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6"
      >
        <div className="ui-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground">Conversion Rate</h3>
            <Target className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-semibold tracking-tight">{data.conversionRate}%</p>
          <p className="text-[10px] text-muted-foreground mt-1">Applied to Interview</p>
        </div>

        <div className="ui-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground">Avg Time to Offer</h3>
            <Clock className="w-4 h-4 text-status-warning" />
          </div>
          <p className="text-2xl font-semibold tracking-tight">{data.averageTimeToOffer}d</p>
          <p className="text-[10px] text-muted-foreground mt-1">From application date</p>
        </div>

        <div className="ui-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground">Interviews / Month</h3>
            <Calendar className="w-4 h-4 text-status-info" />
          </div>
          <p className="text-2xl font-semibold tracking-tight">
            {(data.interviewsByMonth.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0) / Math.max(1, data.interviewsByMonth.length)).toFixed(1)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Average run rate</p>
        </div>

        <div className="ui-panel p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground">Success Score</h3>
            <TrendingUp className="w-4 h-4 text-status-success" />
          </div>
          <p className="text-2xl font-semibold tracking-tight">
            {Math.min(100, Math.round((data.conversionRate * 2) + (data.stats.offers * 10)))}
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">Based on overall metrics</p>
        </div>
      </motion.div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Interviews by Month */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="ui-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Interviews by Month</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.interviewsByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chartColors.text }} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltip.bg,
                  border: `1px solid ${chartColors.tooltip.border}`,
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#0f6f8f" radius={[4, 4, 0, 0]} name="Interviews" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Companies */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="ui-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Applications by Company</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topCompanies} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.text }} />
              <YAxis dataKey="company" type="category" width={80} tick={{ fontSize: 11, fill: chartColors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltip.bg,
                  border: `1px solid ${chartColors.tooltip.border}`,
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#2d8fa3" radius={[0, 4, 4, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Locations */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="ui-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Applications by Location</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.applicationsByLocation}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="location" tick={{ fontSize: 11, fill: chartColors.text }} />
              <YAxis tick={{ fontSize: 11, fill: chartColors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltip.bg,
                  border: `1px solid ${chartColors.tooltip.border}`,
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" name="Applications" radius={[4, 4, 0, 0]}>
                {data.applicationsByLocation.map((_, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Positions */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="ui-panel p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Most Applied Positions</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.topPositions} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis type="number" tick={{ fontSize: 11, fill: chartColors.text }} />
              <YAxis dataKey="position" type="category" width={100} tick={{ fontSize: 11, fill: chartColors.text }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartColors.tooltip.bg,
                  border: `1px solid ${chartColors.tooltip.border}`,
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="count" fill="#2f7d62" radius={[0, 4, 4, 0]} name="Applications" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </>
  );
}
