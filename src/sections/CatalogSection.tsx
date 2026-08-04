import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, Bed, Bath, Maximize, ShoppingCart, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import ProductModal from "@/components/ProductModal";

export default function CatalogSection() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { addItem } = useCart();

  const { data: products, isLoading } = trpc.products.list.useQuery(
    activeCategory === "all" ? undefined : { category: activeCategory as any }
  );

  const categories = [
    { key: "all", label: "All Properties" },
    { key: "2br", label: "2 Bedroom" },
    { key: "3br", label: "3 Bedroom" },
    { key: "4br", label: "4+ Bedroom" },
  ];

  const handleAddToCart = (product: any) => {
    const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
    addItem({
      productId: product.id,
      productName: product.name,
      slug: product.slug,
      price: Number(product.price),
      size: product.size,
      bedrooms: product.bedrooms,
      bathrooms: product.bathrooms,
      image: Array.isArray(images) ? images[0] : "/images/home-exterior-1.jpg",
    });
    toast.success(`${product.name} added to cart!`);
  };

  if (isLoading) {
    return (
      <section id="catalog" className="py-20 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#1e3a5f] border-t-transparent rounded-full mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="catalog" className="py-20 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif font-bold text-[#1e3a5f] mb-4">Browse Our Properties</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Completed luxury homes across Abuja's finest districts — from elegant terrace duplexes to presidential mansions. Prices from ₦38,500,000 to ₦250,000,000, with mortgage plans available.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-3 rounded-full font-medium transition ${
                  activeCategory === cat.key
                    ? "bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white shadow-lg"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products?.map((product) => {
              const images = typeof product.images === "string" ? JSON.parse(product.images) : product.images;
              const features = typeof product.features === "string" ? JSON.parse(product.features) : product.features;
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={Array.isArray(images) ? images[0] : "/images/home-exterior-1.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        onClick={() => setSelectedProduct(product)}
                        className="bg-white text-[#1e3a5f] hover:bg-[#c8956c] hover:text-white rounded-full px-6"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white px-3 py-1 rounded-full text-sm font-bold">
                      ₦{Number(product.price).toLocaleString()}
                    </div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-[#1e3a5f]">
                      {product.size}
                    </div>
                    {product.mortgageEnabled === "yes" && (
                      <div className="absolute bottom-4 left-4 bg-[#c8956c] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow">
                        <Landmark className="w-3.5 h-3.5" /> Mortgage Available
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-[#1e3a5f]">{product.name}</h3>
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                        {product.bedrooms} BR / {product.bathrooms} BA
                      </Badge>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{product.size} floor area · Completed luxury property</p>
                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Bed className="w-4 h-4" /> {product.bedrooms}</span>
                      <span className="flex items-center gap-1"><Bath className="w-4 h-4" /> {product.bathrooms}</span>
                      <span className="flex items-center gap-1"><Maximize className="w-4 h-4" /> {product.size}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {Array.isArray(features) && features.slice(0, 2).map((f: string) => (
                        <span key={f} className="text-xs bg-[#faf8f5] text-[#1e3a5f] px-3 py-1 rounded-full">
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] hover:shadow-lg transition"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedProduct(product)}
                        className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {product.mortgageEnabled === "yes" && (
                        <Button
                          variant="outline"
                          title="Buy with Mortgage"
                          onClick={() => navigate(`/mortgage/apply/${product.id}`)}
                          className="border-[#c8956c] text-[#b07d52] hover:bg-[#c8956c] hover:text-white"
                        >
                          <Landmark className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
        />
      )}
    </>
  );
}
