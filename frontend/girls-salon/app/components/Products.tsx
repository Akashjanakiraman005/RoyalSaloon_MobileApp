import { useState } from "react";
import { Search, Plus, AlertCircle, X } from "lucide-react";

const mockProducts = [
  {
    id: 1,
    name: "Moisturizing Shampoo",
    category: "Hair Care",
    price: 24.99,
    stock: 45,
    lowStock: false,
    image: "https://images.unsplash.com/photo-1775126454577-4846f3e55cc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 2,
    name: "Keratin Treatment Serum",
    category: "Hair Care",
    price: 89.99,
    stock: 8,
    lowStock: true,
    image: "https://images.unsplash.com/photo-1766142167641-507c80e35eb9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 3,
    name: "Nail Polish - Rose Gold",
    category: "Nail Care",
    price: 12.99,
    stock: 32,
    lowStock: false,
    image: "https://images.unsplash.com/photo-1763987300719-fd27c51a3227?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 4,
    name: "Facial Cleanser",
    category: "Skin Care",
    price: 34.99,
    stock: 5,
    lowStock: true,
    image: "https://images.unsplash.com/photo-1556228578-f9707385e031?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 5,
    name: "Hair Color - Platinum Blonde",
    category: "Hair Color",
    price: 45.99,
    stock: 18,
    lowStock: false,
    image: "https://images.unsplash.com/photo-1758788390320-16e1f280cf49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 6,
    name: "Anti-Aging Cream",
    category: "Skin Care",
    price: 79.99,
    stock: 3,
    lowStock: true,
    image: "https://images.unsplash.com/photo-1764694071508-e4b1efcd39bc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 7,
    name: "Cuticle Oil",
    category: "Nail Care",
    price: 8.99,
    stock: 50,
    lowStock: false,
    image: "https://images.unsplash.com/photo-1766229492219-30330de033b4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
  {
    id: 8,
    name: "Hair Styling Gel",
    category: "Hair Care",
    price: 19.99,
    stock: 28,
    lowStock: false,
    image: "https://images.unsplash.com/photo-1775126250972-9321ca2d110b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
  },
];

export default function Products() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(mockProducts.map((p) => p.category))),
  ];

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "All" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockProducts = mockProducts.filter((p) => p.lowStock);

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-[#8b6f47] mb-1">
            Products Management
          </h2>
          <p className="text-sm text-[#9a9a9a]">
            Manage salon products and inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddProduct(true)}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow w-full sm:w-auto"
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-[#fff3cd] to-[#fff8e1] border border-[#ffd966] rounded-2xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-[#b8860b] mt-0.5" />
            <div>
              <h3 className="font-semibold text-[#8b6f47] mb-1">
                Low Stock Alert
              </h3>
              <p className="text-sm text-[#9a9a9a]">
                {lowStockProducts.length} product(s) running low on stock
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {lowStockProducts.map((product) => (
                  <span
                    key={product.id}
                    className="px-3 py-1 bg-white rounded-lg text-xs text-[#8b6f47] border border-[#f0ebe3]"
                  >
                    {product.name} ({product.stock} left)
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl p-6 border border-[#f0ebe3] mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9a9a9a]"
              size={20}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl p-6 border border-[#f0ebe3] hover:shadow-lg transition-all group"
          >
            <div className="w-full h-48 bg-gradient-to-br from-[#faf8f5] to-[#f5f5f5] rounded-xl overflow-hidden mb-4">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>

            <div className="mb-2">
              <span className="text-xs px-2 py-1 bg-[#faf8f5] text-[#9a9a9a] rounded-md">
                {product.category}
              </span>
            </div>

            <h3 className="font-semibold text-[#8b6f47] mb-2">
              {product.name}
            </h3>

            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl font-bold text-[#8b6f47]">
                ${product.price}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded-lg ${
                  product.lowStock
                    ? "bg-[#fff3cd] text-[#b8860b]"
                    : "bg-[#d4edda] text-[#155724]"
                }`}
              >
                {product.stock} in stock
              </span>
            </div>

            <button className="w-full py-2 border border-[#f0ebe3] rounded-lg text-sm text-[#8b6f47] hover:bg-[#faf8f5] transition-colors">
              Edit Product
            </button>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-[#8b6f47]">
                Add New Product
              </h3>
              <button
                onClick={() => setShowAddProduct(false)}
                className="p-2 hover:bg-[#faf8f5] rounded-lg transition-colors"
              >
                <X size={20} className="text-[#9a9a9a]" />
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                  Category
                </label>
                <select className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30">
                  <option>Hair Care</option>
                  <option>Skin Care</option>
                  <option>Nail Care</option>
                  <option>Hair Color</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#8b6f47] mb-2">
                    Stock
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-[#faf8f5] border border-[#f0ebe3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4a574]/30"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="flex-1 px-6 py-3 border border-[#f0ebe3] text-[#8b6f47] rounded-xl hover:bg-[#faf8f5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-[#d4a574] to-[#8b6f47] text-white rounded-xl hover:shadow-lg transition-shadow"
                >
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
