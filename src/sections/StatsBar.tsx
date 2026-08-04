export default function StatsBar() {
  const stats = [
    { value: "₦38.5M", label: "Starting Price" },
    { value: "31", label: "Countries Served" },
    { value: "500+", label: "Homes Handed Over" },
    { value: "4.9/5", label: "Customer Rating" },
  ];

  return (
    <div className="bg-[#1e3a5f] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-[#c8956c]">{stat.value}</div>
              <div className="text-sm text-gray-300 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
