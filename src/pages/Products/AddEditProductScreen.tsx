import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Input from "../../components/form/input/InputField";
import { Select } from "../../components/ui/select/Select";
import Button from "../../components/ui/button/Button";

// ✅ Sizes
const sizeOptions = [
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
];

export default function AddEditProductScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("token");

  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);
  const [collections, setCollections] = useState<any[]>([]);

  const [newCategory, setNewCategory] = useState("");
  const [newCollection, setNewCollection] = useState("");

  const [form, setForm] = useState({
    name: "",
    category: "",
    collectionName: "",
    price: "",
    discountPrice: "",
    description: "",
    fabric: "",
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as File[],
    imageUrls: [] as string[],
    stockStatus: "in-stock",
    status: "Pending",
    isFeatured: false,
    isNewArrival: false,
  });

  // ✅ Fetch categories & collections
  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch(`${API}/categories`);
        const catData = await catRes.json();
        console.log("CATEGORIES:", catData);
        setCategories(catData);

        const colRes = await fetch(`${API}/collections`);
        const colData = await colRes.json();
        console.log("COLLECTIONS:", colData);
        setCollections(colData);
      } catch (err) {
        console.error("Error fetching:", err);
      }
    };

    fetchData();
  }, []);

  // ✅ Fetch product (Edit mode)
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${API}/admin/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setForm({
          name: data.name,
          category: data.category,
          collectionName: data.collectionName,
          price: data.price,
          discountPrice: data.discountPrice || "",
          description: data.description || "",
          fabric: data.fabric || "",
          sizes: data.sizes || [],
          colors: data.colors || [],
          images: [],
          imageUrls: data.images || [],
          stockStatus: data.stockStatus,
          status: data.status || "Pending",
          isFeatured: data.isFeatured || false,
          isNewArrival: data.isNewArrival || false,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  // ✅ Image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...Array.from(e.target.files)],
    }));
  };

  // ✅ Add Category
  const handleAddCategory = async () => {
    if (!newCategory) return;

    await fetch(`${API}/categories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCategory }),
    });

    const addedName = newCategory;
    setNewCategory("");

    const res = await fetch(`${API}/categories`);
    const data = await res.json();
    setCategories(data);

    // auto select
    setForm((prev) => ({ ...prev, category: addedName }));
  };

  // ✅ Add Collection
  const handleAddCollection = async () => {
    if (!newCollection) return;

    await fetch(`${API}/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newCollection }),
    });

    const addedName = newCollection;
    setNewCollection("");

    const res = await fetch(`${API}/collections`);
    const data = await res.json();
    setCollections(data);

    // auto select
    setForm((prev) => ({ ...prev, collectionName: addedName }));
  };

  // ✅ Save Product
  const handleSave = async () => {
    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "images") {
          value.forEach((file: File) => formData.append("images", file));
        } else if (key === "imageUrls") {
          value.forEach((url: string) =>
            formData.append("existingImages[]", url),
          );
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key + "[]", v));
        } else {
          formData.append(key, value as any);
        }
      });

      const method = id ? "PUT" : "POST";
      const url = id ? `${API}/admin/products/${id}` : `${API}/admin/products`;

      await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      navigate("/products");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">
        {id ? "Edit Product" : "Add Product"}
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-5">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Product Name
            </label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              options={categories.map((c) => ({
                label: c.name,
                value: c.name,
              }))}
              value={form.category}
              onChange={(val: string) => setForm({ ...form, category: val })}
            />

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add Category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>
          </div>

          {/* Collection */}
          <div>
            <label className="block text-sm font-medium mb-1">Collection</label>
            <Select
              options={collections.map((c) => ({
                label: c.name,
                value: c.name,
              }))}
              value={form.collectionName}
              onChange={(val: string) =>
                setForm({ ...form, collectionName: val })
              }
            />

            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add Collection"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
              />
              <Button onClick={handleAddCollection}>Add</Button>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>

          {/* Discount Price */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Discount Price
            </label>
            <Input
              type="number"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({ ...form, discountPrice: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          {/* Fabric */}
          <div>
            <label className="block text-sm font-medium mb-1">Fabric</label>
            <Input
              value={form.fabric}
              onChange={(e) => setForm({ ...form, fabric: e.target.value })}
            />
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium mb-1">Sizes</label>
            <Select
              options={sizeOptions}
              value={form.sizes}
              multiple
              onChange={(vals: string[]) => setForm({ ...form, sizes: vals })}
            />
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Colors (comma separated)
            </label>
            <Input
              value={form.colors.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  colors: e.target.value.split(",").map((c) => c.trim()),
                })
              }
            />
          </div>

          {/* Images */}
          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>

            {/* Upload Box */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <p className="text-gray-500">Click to upload images</p>
                <p className="text-xs text-gray-400">(Multiple allowed)</p>
              </label>
            </div>

            {/* Preview Section */}
            <div className="flex flex-wrap gap-3 mt-4">
              {/* Existing Images (Edit mode) */}
              {form.imageUrls.map((url) => (
                <div key={url} className="relative w-24 h-24">
                  <img
                    src={url}
                    alt="product"
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <button
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        imageUrls: prev.imageUrls.filter((img) => img !== url),
                      }))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}

              {/* New Uploaded Images */}
              {form.images.map((file) => (
                <div key={file.name} className="relative w-24 h-24">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-full h-full object-cover rounded-md border"
                  />
                  <button
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        images: prev.images.filter((img) => img !== file),
                      }))
                    }
                    className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex gap-4">
            <label>
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm({ ...form, isFeatured: e.target.checked })
                }
              />
              Featured
            </label>

            <label>
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) =>
                  setForm({ ...form, isNewArrival: e.target.checked })
                }
              />
              New Arrival
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <Button onClick={() => navigate("/products")}>Cancel</Button>
            <Button onClick={handleSave}>
              {id ? "Update" : "Add Product"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
