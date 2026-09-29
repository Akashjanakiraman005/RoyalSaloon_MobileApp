import { useState } from "react";
import {
  Download,
  TrendingUp,
  Users,
  Package,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const revenueData = [
  { id: 1, month: "Jan", revenue: 42000, expenses: 18000 },
  { id: 2, month: "Feb", revenue: 38000, expenses: 17000 },
  { id: 3, month: "Mar", revenue: 51000, expenses: 19000 },
  { id: 4, month: "Apr", revenue: 48000, expenses: 18500 },
  { id: 5, month: "May", revenue: 56000, expenses: 20000 },
  { id: 6, month: "Jun", revenue: 62000, expenses: 21000 },
];

const serviceData = [
  { id: 1, name: "Hair Services", value: 45, color: "#f5d5d8" },
  { id: 2, name: "Spa Treatments", value: 25, color: "#e8d5f5" },
  { id: 3, name: "Nail Care", value: 18, color: "#d5f3f5" },
  { id: 4, name: "Skin Care", value: 12, color: "#ffeaa7" },
];

const customerInsights = [
  { metric: "New Clients", value: 45, change: "+12.5%", trend: "up" },
  { metric: "Repeat Visits", value: 78, change: "+8.2%", trend: "up" },
  { metric: "Avg Spend", value: "$245", change: "+15.3%", trend: "up" },
  { metric: "Satisfaction", value: "4.8/5", change: "+0.3", trend: "up" },
];

const topProducts = [
  { name: "Keratin Treatment Serum", sold: 45, revenue: 4049.55 },
  { name: "Hair Color - Platinum", sold: 38, revenue: 1747.62 },
  { name: "Anti-Aging Cream", sold: 32, revenue: 2559.68 },
  { name: "Moisturizing Shampoo", sold: 28, revenue: 699.72 },
];

export default function Reports() {
  const [reportPeriod, setReportPeriod] = useState("monthly");

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-[#8b6f47] mb-1">
            Reports & Analytics
          </h2>
          <p className="text-sm text-[#9a9a9a]">
            Track performance and business insights
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={reportPeriod}
            onChange={(e) => setReportPeriod(e.target.value)}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-[#f0ebe3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow">
            <Download size={20} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {customerInsights.map((insight) => (
          <div
            key={insight.metric}
            className="bg-white rounded-2xl p-6 border border-[#f0ebe3]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-sm text-[#9a9a9a]">{insight.metric}</div>
              <div
                className={`flex items-center gap-1 text-sm ${
                  insight.trend === "up" ? "text-[#5cb85c]" : "text-[#d9534f]"
                }`}
              >
                <TrendingUp size={16} />
                <span>{insight.change}</span>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-semibold text-[#8b6f47]">
              {insight.value}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3] mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#8b6f47]">
            Revenue vs Expenses
          </h3>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#d4a574]"></div>
              <span className="text-[#9a9a9a]">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#b084cc]"></div>
              <span className="text-[#9a9a9a]">Expenses</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
            <XAxis dataKey="month" stroke="#9a9a9a" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9a9a9a" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #f0ebe3",
                borderRadius: "8px",
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#d4a574"
              strokeWidth={3}
              dot={{ fill: "#d4a574", r: 4 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#b084cc"
              strokeWidth={3}
              dot={{ fill: "#b084cc", r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Service Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <h3 className="text-lg font-semibold text-[#8b6f47] mb-6">
            Service Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={false}
              >
                {serviceData.map((entry) => (
                  <Cell key={`cell-${entry.id}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f0ebe3",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {serviceData.map((service) => (
              <div key={service.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: service.color }}
                ></div>
                <div className="text-sm text-[#8b6f47]">
                  {service.name}
                  <span className="text-[#9a9a9a] ml-1">({service.value}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <h3 className="text-lg font-semibold text-[#8b6f47] mb-6">
            Top Selling Products
          </h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={product.name}
                className="flex items-center justify-between p-4 bg-[#faf8f5] rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d4a574] to-[#8b6f47] flex items-center justify-center text-white font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-[#8b6f47]">
                      {product.name}
                    </div>
                    <div className="text-sm text-[#9a9a9a]">
                      {product.sold} units sold
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#8b6f47]">
                    ${product.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#f5d5d8] to-[#f8e4d9] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-xl">
              <DollarSign size={24} className="text-[#d4a574]" />
            </div>
            <div>
              <div className="text-sm text-[#8b6f47]">Total Revenue</div>
              <div className="text-xl font-bold text-[#8b6f47]">$297,000</div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-[#8b6f47]">
            Year to date • +18.5% from last year
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#e8d5f5] to-[#f5e8fa] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-xl">
              <Users size={24} className="text-[#b084cc]" />
            </div>
            <div>
              <div className="text-sm text-[#8b6f47]">Total Clients</div>
              <div className="text-xl font-bold text-[#8b6f47]">1,248</div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-[#8b6f47]">
            Active clients • +12.3% growth
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#d5f3f5] to-[#e8f9fa] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white rounded-xl">
              <Calendar size={24} className="text-[#6bb6bc]" />
            </div>
            <div>
              <div className="text-sm text-[#8b6f47]">Appointments</div>
              <div className="text-xl font-bold text-[#8b6f47]">3,842</div>
            </div>
          </div>
          <div className="text-xs sm:text-sm text-[#8b6f47]">
            This year • 95% completion rate
          </div>
        </div>
      </div>
    </div>
  );
}
