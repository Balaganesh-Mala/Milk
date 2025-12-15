export default function ReviewSection({ reviews }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow mt-10">
      <h3 className="text-xl font-bold text-blue-900 mb-4">Customer Reviews</h3>

      {reviews.length === 0 && (
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      )}

      <div className="space-y-4">
        {reviews.map((r, idx) => (
          <div key={idx} className="border-b pb-2">
            <p className="font-semibold">{r.name}</p>
            <p className="text-yellow-500 text-sm">⭐ {r.rating}/5</p>
            <p className="text-gray-600">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
