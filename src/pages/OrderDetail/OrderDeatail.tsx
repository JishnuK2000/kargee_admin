import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/api";

export default function OrderDetail() {
  const { id } = useParams();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  // 🔥 Fetch single order
  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders/${id}`);
      setOrder(res.data);
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // ✅ Update status
  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      await api.put(`/admin/orders/${id}`, { status });
      fetchOrder();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-inter">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm p-6">
        {/* 🔥 Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold text-[#5E2A14]">
              Order #{order._id.slice(-5).toUpperCase()}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Payment: {order.paymentMethod}
            </p>
            <p className="text-gray-500 text-sm">Status: {order.status}</p>
          </div>

          {/* 🔥 Status Update */}
          <div className="flex gap-2 items-center">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded-lg"
            >
              <option value="PLACED">PLACED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>

            <button
              onClick={handleStatusUpdate}
              className="bg-[#5E2A14] text-white px-4 py-2 rounded-lg"
            >
              {updating ? "Updating..." : "Update"}
            </button>
          </div>
        </div>

        {/* 🔥 Customer Info */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#5E2A14] mb-2">
            Customer Details
          </h3>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <b>Name:</b> {order.address.name}
            </p>
            <p>
              <b>Phone:</b> {order.address.phone}
            </p>
            <p>
              <b>Address:</b> {order.address.address}, {order.address.city},{" "}
              {order.address.state} - {order.address.pincode}
            </p>
            <p>
              <b>City:</b> {order.address.city}
            </p>{" "}
              <p>
              <b>State:</b> {order.address.state}
            </p>{" "}
            <p>
              <b>Pincode:</b> {order.address.pincode}
            </p>
          </div>
        </div>

        {/* 🔥 Products */}
        <div>
          <h3 className="text-lg font-semibold text-[#5E2A14] mb-4">
            Products
          </h3>

          <div className="space-y-4">
            {order.products.map((p: any) => (
              <div
                key={p.productId}
                className="flex flex-col md:flex-row gap-4 border p-4 rounded-xl"
              >
                {/* Image */}
                {p.image && (
                  <img
                    src={p.image}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}

                {/* Info */}
                <div className="flex-1">
                  <h4 className="font-medium">{p.name}</h4>
                  <p className="text-sm text-gray-500">Qty: {p.quantity}</p>
                  <p className="text-sm text-gray-500">Price: ₹{p.price}</p>
                </div>

                {/* Total */}
                <div className="font-semibold text-[#5E2A14]">
                  ₹{p.quantity * p.price}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 Total */}
        <div className="mt-6 border-t pt-4 flex justify-between text-lg font-semibold">
          <span>Total Amount</span>
          <span className="text-[#5E2A14]">₹{order.totalAmount}</span>
        </div>
      </div>
    </div>
  );
}
