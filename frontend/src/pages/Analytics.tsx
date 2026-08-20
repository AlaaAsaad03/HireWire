import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, CheckCircle, AlertCircle } from "lucide-react";
import { analyticsApi, type AnalyticsData } from "../api/analytics";
import { toast } from "sonner";
import PageHeader from "../components/ui/PageHeader";

const COLORS = ["#0f6f8f", "#2f7d62", "#c17b09", "#c74255", "#4f6577"];

export default function Analytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      const data = await analyticsApi.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Track your job search progress and success metrics"
      />

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Applications */}
          <div className="ui-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Total Applications
              </h3>
              <Users className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">{analytics.stats.total}</p>
          </div>

          {/* Response Rate */}
          <div className="ui-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Response Rate
              </h3>
              <TrendingUp className="w-5 h-5 text-status-success" />
            </div>
            <p className="text-3xl font-bold">{analytics.responseRate}%</p>
          </div>

          {/* Interviews */}
          <div className="ui-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Interviews
              </h3>
              <CheckCircle className="w-5 h-5 text-status-info" />
            </div>
            <p className="text-3xl font-bold">{analytics.stats.interviewed}</p>
          </div>

          {/* Offers */}
          <div className="ui-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">
                Offers
              </h3>
              <AlertCircle className="w-5 h-5 text-status-warning" />
            </div>
            <p className="text-3xl font-bold">{analytics.stats.offers}</p>
          </div>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Success Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="ui-panel p-6"
          >
            <h2 className="text-lg font-bold mb-6">Success Funnel</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.successFunnel}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="stage" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#0f6f8f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="ui-panel p-6"
          >
            <h2 className="text-lg font-bold mb-6">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics.statusDistribution).map(
                    ([name, value]) => ({ name, value }),
                  )}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#0f6f8f"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Application Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="ui-panel p-6 lg:col-span-2"
          >
            <h2 className="text-lg font-bold mb-6">
              Application Timeline (Last 30 Days)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.applicationTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e1e1e",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#0f6f8f"
                  strokeWidth={2}
                  dot={{ fill: "#0f6f8f" }}
                  name="Applications"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="ui-panel-muted p-6"
        >
          <h2 className="text-lg font-bold mb-4">💡 Insights</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              ✓ You've applied to <strong>{analytics.stats.total}</strong>{" "}
              positions
            </li>
            <li>
              ✓ Your response rate is <strong>{analytics.responseRate}%</strong>
            </li>
            {analytics.stats.interviewed > 0 && (
              <li>
                ✓ You have <strong>{analytics.stats.interviewed}</strong>{" "}
                interviews
              </li>
            )}
            {analytics.stats.offers > 0 && (
              <li>
                ✓ You've received <strong>{analytics.stats.offers}</strong>{" "}
                offer{analytics.stats.offers > 1 ? "s" : ""}!
              </li>
            )}
            {analytics.averageTimeToInterview > 0 && (
              <li>
                ✓ Average time to interview:{" "}
                <strong>{analytics.averageTimeToInterview} days</strong>
              </li>
            )}
          </ul>
        </motion.div>
    </>
  );
}
