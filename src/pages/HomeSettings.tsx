import { useState, useEffect } from "react";
import api from "../api/api";
import PageMeta from "../components/common/PageMeta";
import Button from "../components/ui/button/Button";
import Input from "../components/form/input/InputField";

export default function HomeSettings() {

  const [carousels, setCarousels] = useState<any[]>([]);
  const [homeGrids, setHomeGrids] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [gridFile, setGridFile] = useState<File | null>(null);
  const [gridCategory, setGridCategory] = useState("");
  const [gridTitle, setGridTitle] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [carouselRes, gridRes, catRes] = await Promise.all([
        api.get("/home/carousel"),
        api.get("/home/4grid"),
        api.get("/categories"),
      ]);
      setCarousels(carouselRes.data);
      setHomeGrids(gridRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error("Error fetching home settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCarousel = async () => {
    if (!desktopFile || !mobileFile) return;
    const formData = new FormData();
    formData.append("desktopImage", desktopFile);
    formData.append("mobileImage", mobileFile);
    try {
      await api.post("/admin/home/carousel", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDesktopFile(null);
      setMobileFile(null);
      fetchData();
    } catch (err) {
      console.error("Error adding carousel:", err);
    }
  };

  const handleDeleteCarousel = async (id: string) => {
    if (!window.confirm("Delete this carousel image?")) return;
    try {
      await api.delete(`/admin/home/carousel/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting carousel:", err);
    }
  };

  const handleAddGrid = async () => {
    if (!gridFile || !gridCategory) {
      alert("Please provide both category and image");
      return;
    }
    const formData = new FormData();
    formData.append("image", gridFile);
    formData.append("category", gridCategory);
    formData.append("title", gridTitle);
    try {
      await api.post("/admin/home/4grid", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setGridFile(null);
      setGridCategory("");
      setGridTitle("");
      fetchData();
    } catch (err) {
      console.error("Error adding grid:", err);
    }
  };

  const handleDeleteGrid = async (id: string) => {
    if (!window.confirm("Delete this grid item?")) return;
    try {
      await api.delete(`/admin/home/4grid/${id}`);
      fetchData();
    } catch (err) {
      console.error("Error deleting grid:", err);
    }
  };

  return (
    <>
      <PageMeta
        title="Home Settings | Kargee Admin"
        description="Manage your home page carousel and categories"
      />
      <div className="p-6 max-w-6xl mx-auto space-y-10">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Home Page Management</h1>

        {/* Carousel Section */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Carousel Banner Images</h2>
          
          <div className="flex flex-col md:flex-row gap-6 mb-8 items-end bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Desktop version (Large)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setDesktopFile(e.target.files?.[0] || null)}
                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                      />
                      {desktopFile && (
                        <div className="w-12 h-8 border rounded overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                          <img src={URL.createObjectURL(desktopFile)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Mobile version (Portrait/Square)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setMobileFile(e.target.files?.[0] || null)}
                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                      />
                      {mobileFile && (
                        <div className="w-10 h-10 border rounded overflow-hidden bg-gray-100 flex-shrink-0 shadow-sm">
                          <img src={URL.createObjectURL(mobileFile)} alt="preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            <Button 
               onClick={handleAddCarousel} 
               disabled={!desktopFile || !mobileFile}
               className="h-10 px-6"
            >
              Add Carousel
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {carousels.map((item) => (
              <div key={item._id} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 h-32 p-1">
                   <div className="flex-[2] overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                      <img src={item.desktopImageUrl} alt="desktop" className="w-full h-full object-cover" title="Desktop Image" />
                   </div>
                   <div className="flex-1 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700">
                      <img src={item.mobileImageUrl} alt="mobile" className="w-full h-full object-cover" title="Mobile Image" />
                   </div>
                </div>
                <div className="px-3 py-2 flex justify-between items-center bg-white dark:bg-gray-900">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Carousel slide</span>
                   <button 
                    onClick={() => handleDeleteCarousel(item._id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            {loading && carousels.length === 0 && <p className="text-gray-500 italic">Loading...</p>}
            {!loading && carousels.length === 0 && <p className="text-gray-500 italic">No carousel images found.</p>}
          </div>
        </section>

        {/* 4-Grid Section */}
        <section className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Home Page Category Grid (Max 4)</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">Display Title</label>
              <Input 
                placeholder="e.g. Best Sellers" 
                value={gridTitle}
                onChange={(e) => setGridTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Category</label>
              <select 
                className="w-full h-11 px-4 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={gridCategory}
                onChange={(e) => setGridCategory(e.target.value)}
              >
                <option value="">Select a category...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload Grid Image</label>
              <div className="flex items-center gap-4 text-center justify-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setGridFile(e.target.files?.[0] || null)}
                  className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                />
                {gridFile && (
                  <div className="w-12 h-12 border rounded overflow-hidden bg-gray-100">
                    <img src={URL.createObjectURL(gridFile)} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
              <Button onClick={handleAddGrid} disabled={!gridFile || !gridCategory || !gridTitle || homeGrids.length >= 4}>
                Add to Grid
              </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {homeGrids.map((item) => (
              <div key={item._id} className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800">
                <div className="aspect-square">
                   <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover" />
                </div>
                <div className="p-3 text-center bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                  <span className="font-semibold text-gray-900 dark:text-white block">{item.title}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{item.category}</span>
                </div>
                <button 
                  onClick={() => handleDeleteGrid(item._id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition shadow-lg"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {!loading && homeGrids.length === 0 && <p className="text-gray-500 italic col-span-full">No grid items found.</p>}
          </div>
          {homeGrids.length >= 4 && <p className="mt-4 text-amber-600 text-sm font-medium">⚠️ Only 4 items can be displayed in the grid.</p>}
        </section>
      </div>
    </>
  );
}
