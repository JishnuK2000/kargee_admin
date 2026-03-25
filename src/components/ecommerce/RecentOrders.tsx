import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface Product {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  products: Product[];
  totalAmount: number;
  status: "PLACED" | "PROCESSING" | "SHIPPED" | "DELIVERED";
}

export default function RecentOrders() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState<Order[]>([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      // 👉 only latest 5 orders
      setOrders(data.slice(0, 5));
    } catch (err) {
      console.error("Error fetching recent orders:", err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "PROCESSING":
        return "warning";
      case "SHIPPED":
        return "info";
      default:
        return "primary";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Recent Orders
        </h3>
      </div>

      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-y border-gray-100">
            <TableRow>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                Products
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                Price
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                Quantity
              </TableCell>
              <TableCell isHeader className="py-3 text-start text-theme-xs">
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No recent orders
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) =>
                order.products.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-gray-100">
                          {product.image ? (
                            <img
                              src={product.image}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-400">
                              IMG
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-gray-800 text-theme-sm">
                            {product.name}
                          </p>
                          <span className="text-gray-500 text-theme-xs">
                            Order #{order._id.slice(-5)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 text-gray-500">
                      ₹{product.price}
                    </TableCell>

                    <TableCell className="py-3 text-gray-500">
                      {product.quantity}
                    </TableCell>

                    <TableCell className="py-3">
                      <Badge size="sm" color={statusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}