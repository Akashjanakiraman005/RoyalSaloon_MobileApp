import {
  TrendingUp,
  Calendar,
  Sparkles,
  Users,
  Receipt,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Link } from "react-router";
import hairStylingImg from "../../imports/WhatsApp_Image_2026-04-08_at_2.25.39_PM.jpeg";
import facialTreatmentImg from "../../imports/WhatsApp_Image_2026-04-11_at_3.38.05_PM.jpeg";

const revenueData = [
  { id: 1, name: "Mon", revenue: 4200 },
  { id: 2, name: "Tue", revenue: 3800 },
  { id: 3, name: "Wed", revenue: 5200 },
  { id: 4, name: "Thu", revenue: 4600 },
  { id: 5, name: "Fri", revenue: 6800 },
  { id: 6, name: "Sat", revenue: 8400 },
  { id: 7, name: "Sun", revenue: 7200 },
];

const appointmentsData = [
  { id: 1, name: "Mon", appointments: 12 },
  { id: 2, name: "Tue", appointments: 10 },
  { id: 3, name: "Wed", appointments: 15 },
  { id: 4, name: "Thu", appointments: 13 },
  { id: 5, name: "Fri", appointments: 18 },
  { id: 6, name: "Sat", appointments: 22 },
  { id: 7, name: "Sun", appointments: 16 },
];

const topServices = [
  { name: "Hair Cut & Styling", count: 45, revenue: 13500 },
  { name: "Hair Coloring", count: 32, revenue: 19200 },
  { name: "Spa Treatment", count: 28, revenue: 16800 },
  { name: "Manicure & Pedicure", count: 38, revenue: 11400 },
];

export default function Dashboard() {
  return (
    <div className="p-4 md:p-8">
      {/* Hero Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden group">
          <img
            src={hairStylingImg}
            alt="Hair Styling Services"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Premium Hair Styling
            </h3>
            <p className="text-white/90 text-xs sm:text-sm mb-4">
              Expert cuts, coloring, and treatments tailored to your style
            </p>
            <Link
              to="/billing"
              className="flex items-center gap-2 text-white font-medium w-fit group-hover:gap-3 transition-all"
            >
              Book Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>

        <div className="relative h-48 sm:h-64 rounded-2xl overflow-hidden group">
          <img
            src={facialTreatmentImg}
            alt="Facial Treatments"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Luxury Spa & Facial
            </h3>
            <p className="text-white/90 text-xs sm:text-sm mb-4">
              Rejuvenate your skin with our premium treatments
            </p>
            <Link
              to="/billing"
              className="flex items-center gap-2 text-white font-medium w-fit group-hover:gap-3 transition-all"
            >
              Book Now
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-[#8b6f47] mb-1">
          Dashboard Overview
        </h2>
        <p className="text-sm text-[#9a9a9a]">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#f5d5d8] to-[#f8e4d9] rounded-xl">
              <TrendingUp size={24} className="text-[#d4a574]" />
            </div>
            <div className="flex items-center gap-1 text-[#5cb85c] text-sm">
              <ArrowUpRight size={16} />
              <span>12.5%</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#8b6f47] mb-1">
            $40,250
          </div>
          <div className="text-sm text-[#9a9a9a]">Total Revenue</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#e8d5f5] to-[#f5e8fa] rounded-xl">
              <Calendar size={24} className="text-[#b084cc]" />
            </div>
            <div className="flex items-center gap-1 text-[#5cb85c] text-sm">
              <ArrowUpRight size={16} />
              <span>8.2%</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#8b6f47] mb-1">106</div>
          <div className="text-sm text-[#9a9a9a]">Weekly Bookings</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#d5f3f5] to-[#e8f9fa] rounded-xl">
              <Sparkles size={24} className="text-[#6bb6bc]" />
            </div>
            <div className="flex items-center gap-1 text-[#5cb85c] text-sm">
              <ArrowUpRight size={16} />
              <span>15.3%</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#8b6f47] mb-1">
            Hair Coloring
          </div>
          <div className="text-sm text-[#9a9a9a]">Top Service</div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-[#ffeaa7] to-[#fff5d9] rounded-xl">
              <Users size={24} className="text-[#d4a574]" />
            </div>
            <div className="flex items-center gap-1 text-[#d9534f] text-sm">
              <ArrowDownRight size={16} />
              <span>3.1%</span>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold text-[#8b6f47] mb-1">342</div>
          <div className="text-sm text-[#9a9a9a]">Active Clients</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <h3 className="text-lg font-semibold text-[#8b6f47] mb-6">
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
              <XAxis
                dataKey="name"
                stroke="#9a9a9a"
                tick={{ fontSize: 12 }}
              />
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
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <h3 className="text-lg font-semibold text-[#8b6f47] mb-6">
            Appointments
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe3" />
              <XAxis
                dataKey="name"
                stroke="#9a9a9a"
                tick={{ fontSize: 12 }}
              />
              <YAxis stroke="#9a9a9a" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #f0ebe3",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="appointments" fill="#f5d5d8" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <h3 className="text-lg font-semibold text-[#8b6f47] mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/billing"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#f5d5d8] to-[#f8e4d9] rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-white rounded-lg">
                <Receipt size={20} className="text-[#d4a574]" />
              </div>
              <span className="font-medium text-[#8b6f47]">Add New Bill</span>
            </Link>

            <Link
              to="/clients"
              className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#e8d5f5] to-[#f5e8fa] rounded-xl hover:shadow-md transition-shadow"
            >
              <div className="p-2 bg-white rounded-lg">
                <UserPlus size={20} className="text-[#b084cc]" />
              </div>
              <span className="font-medium text-[#8b6f47]">Add Client</span>
            </Link>

          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#f0ebe3]">
          <h3 className="text-lg font-semibold text-[#8b6f47] mb-6">
            Top Services
          </h3>
          <div className="space-y-4">
            {topServices.map((service, index) => (
              <div
                key={service.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a574] to-[#8b6f47] flex items-center justify-center text-white text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-[#8b6f47]">
                      {service.name}
                    </div>
                    <div className="text-sm text-[#9a9a9a]">
                      {service.count} bookings
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-[#8b6f47]">
                    ${service.revenue.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
