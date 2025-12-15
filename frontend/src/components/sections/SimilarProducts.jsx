import ProductCard from "../ui/ProductCard";

export default function SimilarProducts({ products }) {
  const token = localStorage.getItem("token");

  return (
    <div className="mt-12">
      <h3 className="text-xl font-bold mb-4">Similar Products</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {products.map((item) => (
          <ProductCard
            key={item._id}
            id={item._id}
            image={item.images?.[0]?.url}
            title={item.name}
            price={item.price}
            mrp={item.mrp}
            rating={item.ratings}
            isLoggedIn={!!token}
          />
        ))}
      </div>
    </div>
  );
}
