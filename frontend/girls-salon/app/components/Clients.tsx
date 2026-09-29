import { useState } from "react";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  X,
} from "lucide-react";

const mockClients = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1 234 567 8900",
    totalSpent: 2450,
    visits: 12,
    lastVisit: "2026-04-08",
  },
  {
    id: 2,
    name: "Emma Williams",
    email: "emma.w@email.com",
    phone: "+1 234 567 8901",
    totalSpent: 1890,
    visits: 8,
    lastVisit: "2026-04-10",
  },
  {
    id: 3,
    name: "Olivia Brown",
    email: "olivia.b@email.com",
    phone: "+1 234 567 8902",
    totalSpent: 3200,
    visits: 15,
    lastVisit: "2026-04-09",
  },
  {
    id: 4,
    name: "Ava Davis",
    email: "ava.d@email.com",
    phone: "+1 234 567 8903",
    totalSpent: 1560,
    visits: 6,
    lastVisit: "2026-04-07",
  },
  {
    id: 5,
    name: "Isabella Miller",
    email: "isabella.m@email.com",
    phone: "+1 234 567 8904",
    totalSpent: 4120,
    visits: 20,
    lastVisit: "2026-04-11",
  },
];

const serviceHistory = [
  { date: "2026-04-11", service: "Hair Cut & Styling", amount: 120 },
  { date: "2026-03-28", service: "Hair Coloring", amount: 280 },
  { date: "2026-03-15", service: "Spa Treatment", amount: 350 },
  { date: "2026-03-02", service: "Manicure & Pedicure", amount: 80 },
];

export default function Clients() {
  const [showAddClient, setShowAddClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-[#8b6f47] mb-1">
            Clients Management
          </h2>
          <p className="text-sm text-[#9a9a9a]">
            Manage your salon clients and their visit history
          </p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3] mb-6">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
          />
        </div>
      </div>

      {/* Clients List and Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-2xl border border-[#f0ebe3] overflow-hidden">
          <div className="p-4 border-b border-[#f0ebe3]">
            <h3 className="font-semibold text-[#8b6f47]">Client List</h3>
            <p className="text-xs text-[#9a9a9a] mt-1">
              {filteredClients.length} clients
            </p>
          </div>
          <div className="divide-y divide-[#f0ebe3] max-h-[600px] overflow-y-auto">
            {filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => setSelectedClient(client)}
                className={`w-full p-4 text-left hover:bg-[#faf8f5] transition-colors ${
                  selectedClient?.id === client.id ? "bg-[#faf8f5]" : ""
                }`}
              >
                <div className="font-medium text-[#8b6f47] mb-1">
                  {client.name}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9a9a9a]">
                  <Mail size={12} />
                  {client.email}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#9a9a9a] mt-1">
                  <Phone size={12} />
                  {client.phone}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedClient ? (
            <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-2xl font-semibold text-[#8b6f47] mb-2">
                    {selectedClient.name}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-[#9a9a9a]">
                      <Mail size={16} />
                      {selectedClient.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#9a9a9a]">
                      <Phone size={16} />
                      {selectedClient.phone}
                    </div>
                  </div>
                </div>
                <button className="px-4 py-2 border border-[#f0ebe3] rounded-lg text-sm text-[#8b6f47] hover:bg-[#faf8f5] transition-colors w-full sm:w-auto">
                  Edit Profile
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-[#f5d5d8] to-[#f8e4d9] rounded-xl">
                  <div className="flex items-center gap-2 text-[#8b6f47] mb-2">
                    <DollarSign size={18} />
                    <span className="text-sm">Total Spent</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#8b6f47]">
                    ${selectedClient.totalSpent}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#e8d5f5] to-[#f5e8fa] rounded-xl">
                  <div className="flex items-center gap-2 text-[#8b6f47] mb-2">
                    <Calendar size={18} />
                    <span className="text-sm">Total Visits</span>
                  </div>
                  <div className="text-2xl font-semibold text-[#8b6f47]">
                    {selectedClient.visits}
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-[#d5f3f5] to-[#e8f9fa] rounded-xl">
                  <div className="flex items-center gap-2 text-[#8b6f47] mb-2">
                    <Calendar size={18} />
                    <span className="text-sm">Last Visit</span>
                  </div>
                  <div className="text-sm font-semibold text-[#8b6f47]">
                    {new Date(selectedClient.lastVisit).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Service History */}
              <div>
                <h4 className="font-semibold text-[#8b6f47] mb-4">
                  Service History
                </h4>
                <div className="space-y-3">
                  {serviceHistory.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[#faf8f5] rounded-xl"
                    >
                      <div>
                        <div className="font-medium text-[#8b6f47]">
                          {item.service}
                        </div>
                        <div className="text-sm text-[#9a9a9a]">
                          {new Date(item.date).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-lg font-semibold text-[#8b6f47]">
                        ${item.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-[#f0ebe3] flex flex-col items-center justify-center text-center h-full">
              <div className="w-16 h-16 rounded-full bg-[#faf8f5] flex items-center justify-center mb-4">
                <Search size={32} className="text-[#9a9a9a]" />
              </div>
              <h3 className="text-lg font-semibold text-[#8b6f47] mb-2">
                Select a Client
              </h3>
              <p className="text-sm text-[#9a9a9a]">
                Choose a client from the list to view their profile and history
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#8b6f47]">
                Add New Client
              </h3>
              <button
                onClick={() => setShowAddClient(false)}
                className="p-2 hover:bg-[#faf8f5] rounded-lg transition-colors"
              >
                <X size={20} className="text-[#9a9a9a]" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                  placeholder="Enter client name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddClient(false)}
                  className="flex-1 px-6 py-3 border border-[#f0ebe3] text-[#8b6f47] rounded-xl hover:bg-[#faf8f5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
