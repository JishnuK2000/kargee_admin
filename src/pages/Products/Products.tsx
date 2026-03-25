import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../components/ui/table";
import Badge from "../../components/ui/badge/Badge";
import Button from "../../components/ui/button/Button";
import { useNavigate } from "react-router-dom";

interface Product {
  _id: string;
  name: string;
  collectionName: string;
  category: string;
  price: number;
  images: string[];
  stockStatus: "in-stock" | "out-of-stock";
}

export default function ProductScreen() {
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (_id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`${API}/admin/products/${_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== _id));
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Products
        </h2>
        <Button onClick={() => navigate("/products/add")} size="sm">
          Add Product
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <Table>
          <TableHeader className="border-y border-gray-100 dark:border-gray-800">
            <TableRow>
              <TableCell isHeader className="text-left">Product</TableCell>
              <TableCell isHeader className="text-left">Category</TableCell>
              <TableCell isHeader className="text-left">Collection</TableCell>
              <TableCell isHeader className="text-left">Price</TableCell>
              <TableCell isHeader className="text-left">Stock</TableCell>
              <TableCell isHeader className="text-left">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product._id}>
                  <TableCell className="py-3 flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md">
                      <img src={product.images[0]} alt={product.name} className="h-[50px] w-[50px] object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">{product.name}</p>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 text-gray-500 dark:text-gray-400">{product.category}</TableCell>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400">{product.collectionName}</TableCell>
                  <TableCell className="py-3 text-gray-500 dark:text-gray-400">${product.price}</TableCell>
                  <TableCell className="py-3">
                    <Badge size="sm" color={product.stockStatus === "in-stock" ? "success" : "error"}>
                      {product.stockStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 flex gap-2">
                    <Button  className="px-4 py-2"  size="xs" onClick={() => navigate(`/products/edit/${product._id}`)}>
                      Edit
                    </Button>
                    <Button  className="px-4 py-2"  size="xs" color="error" onClick={() => handleDelete(product._id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}