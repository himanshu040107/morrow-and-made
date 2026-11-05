import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { createProduct, deleteProduct, getProduct, getProducts, updateProduct } from "../api/product.api.js";
import { logout as logoutRequest } from "../../auth/api/auth.api.js";
import useAuth from "../../auth/hooks/useAuth.js";


function Brand() {
  return (
    <Link to="/" aria-label="Morrow and Made home" className="inline-flex items-center gap-3 font-semibold tracking-tight text-[#193e37]">
      <span className="grid size-10 place-items-center rounded-2xl bg-[#193e37] shadow-sm shadow-[#193e37]/20">
        <svg viewBox="0 0 40 40" fill="none" className="size-7" aria-hidden="true">
          <path d="M7 28V13.5c0-1.7 2.1-2.4 3.1-1l8.4 11.2c.7.9 2.1.9 2.8 0l8.4-11.2c1-1.4 3.1-.7 3.1 1V28" stroke="#E5B77E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13 29.5h14" stroke="#F4F3ED" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="32.5" cy="8" r="2" fill="#D89A55" />
        </svg>
      </span>
      <span className="text-lg">Morrow <span className="font-normal text-[#b87535]">&amp; Made</span></span>
    </Link>
  );
}

function Arrow() {
  return <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function Home() {
  const { user, setUser, accessToken, setAccessToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ productName: "", productDescription: "", productPrice: "", stock: "", productImage: null });
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const myProducts = useMemo(() => products.filter((product) => product.seller?._id === user?.id || product.seller?._id === user?.userId || product.seller === user?.id || product.seller === user?.userId), [products, user]);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    setProductsError("");
    try { setProducts(await getProducts()); }
    catch { setProductsError("We couldn’t load the collection just now. Please try again in a moment."); }
    finally { setIsLoadingProducts(false); }
  };

  useEffect(() => { loadProducts(); }, []);

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({ productName: "", productDescription: "", productPrice: "", stock: "", productImage: null });
  };

  const startEditing = async (product) => {
    try {
      const freshProduct = await getProduct(product._id);
      setEditingProduct(freshProduct);
      setProductForm({ productName: freshProduct.productName, productDescription: freshProduct.productDescription, productPrice: freshProduct.productPrice, stock: freshProduct.stock, productImage: null });
      document.getElementById("seller-products")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) { setNotice(error.response?.data?.message || "Could not load this product for editing."); }
  };

  const openProduct = async (id) => {
    try { setSelectedProduct(await getProduct(id)); }
    catch (error) { setNotice(error.response?.data?.message || "Could not load product details."); }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setNotice("");
    setIsSaving(true);
    const formData = new FormData();
    Object.entries(productForm).forEach(([key, value]) => { if (value !== null && value !== "") formData.append(key, value); });
    try {
      if (editingProduct) await updateProduct(editingProduct._id, formData);
      else await createProduct(formData);
      setNotice(editingProduct ? "Product updated." : "Product added to your shop.");
      resetProductForm();
      await loadProducts();
    } catch (error) {
      const errors = error.response?.data?.errors;
      setNotice(error.response?.data?.message || errors?.map((item) => item.msg).join(" ") || "Could not save product. Check the image service and try again.");
    } finally { setIsSaving(false); }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Delete “${product.productName}”? This cannot be undone.`)) return;
    try {
      await deleteProduct(product._id);
      setNotice("Product deleted.");
      await loadProducts();
    } catch (error) { setNotice(error.response?.data?.message || "Could not delete product."); }
  };

  const handleLogout = async () => {
    try { await logoutRequest(accessToken); } catch { /* Clear the local session even if its cookie expired. */ }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <main className="min-h-screen bg-[#f4f3ed] text-[#193e37]">
      <div className="border-b border-[#e8e6de] bg-[#193e37] px-4 py-2 text-center text-xs font-medium tracking-wide text-white/85 sm:text-sm">
        Thoughtful finds, made by independent makers <span className="mx-1 text-[#e5b77e]">·</span> Free shipping on orders over $100
      </div>

      <header className="sticky top-0 z-20 border-b border-[#e8e6de] bg-[#f4f3ed]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center px-5 py-4 sm:px-8">
          <Brand />
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {user ? <>
              <span className="hidden text-sm font-medium text-[#53645c] sm:inline">Hi, {user.name}</span>
              <button type="button" onClick={handleLogout} className="rounded-xl border border-[#d8ded7] px-4 py-2.5 text-sm font-semibold text-[#53645c] transition hover:bg-white hover:text-[#193e37]">Sign out</button>
            </> : <>
              <Link to="/login" className="px-2 py-2.5 text-sm font-semibold text-[#53645c] transition hover:text-[#193e37]">Log in</Link>
              <Link to="/register" className="hidden rounded-xl border border-[#d8ded7] px-4 py-2.5 text-sm font-semibold text-[#53645c] transition hover:bg-white sm:inline-flex">Create account</Link>
              <Link to="/register?role=seller" className="rounded-xl bg-[#193e37] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#193e37]/10 transition hover:bg-[#24564c]">Sell with us</Link>
            </>}
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:pb-24 lg:pt-24">
        <div aria-hidden="true" className="absolute -left-40 top-0 -z-10 size-[28rem] rounded-full bg-[#e3c59f]/35 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-28 bottom-0 -z-10 size-[30rem] rounded-full bg-[#b8d1c0]/40 blur-3xl" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#d8d6ca] bg-white/60 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#8e6238]">
              <span className="size-1.5 rounded-full bg-[#d89a55]" /> A marketplace with meaning
            </span>
            <h1 className="mt-7 text-[2.7rem] font-semibold leading-[1.05] tracking-[-0.055em] text-[#193e37] sm:text-6xl lg:text-[4.35rem]">Good things,<br className="hidden sm:block" /> from good people.</h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#718079] sm:text-lg sm:leading-8">Find the pieces you’ll keep close, made with care by independent makers and small shops.</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a href="#discover" className="group inline-flex items-center gap-3 rounded-xl bg-[#193e37] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#193e37]/15 transition hover:-translate-y-0.5 hover:bg-[#24564c]">Explore the collection <span className="transition-transform group-hover:translate-x-1"><Arrow /></span></a>
              <a href="#makers" className="rounded-xl px-5 py-3.5 text-sm font-semibold text-[#277766] transition hover:bg-white/70">Meet the makers</a>
            </div>
            <div className="mt-10 flex items-center gap-3 text-sm text-[#718079]">
              <div className="flex -space-x-2" aria-hidden="true">
                <span className="grid size-8 place-items-center rounded-full border-2 border-[#f4f3ed] bg-[#d89a55] text-[10px] font-bold text-[#193e37]">J</span>
                <span className="grid size-8 place-items-center rounded-full border-2 border-[#f4f3ed] bg-[#b8d1c0] text-[10px] font-bold text-[#193e37]">M</span>
                <span className="grid size-8 place-items-center rounded-full border-2 border-[#f4f3ed] bg-[#e8c6b6] text-[10px] font-bold text-[#193e37]">A</span>
              </div>
              <span><strong className="font-semibold text-[#334b43]">300+ makers</strong> making everyday a little better</span>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[600px]">
            <div className="absolute -left-5 top-12 z-10 hidden rounded-2xl border border-white/70 bg-white/90 p-4 shadow-xl shadow-[#193e37]/10 backdrop-blur sm:block lg:-left-8">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#b87535]">Made with care</p>
              <p className="mt-1 text-sm font-semibold text-[#193e37]">A story in every piece</p>
            </div>
            <div className="overflow-hidden rounded-[2rem] bg-[#e5ddcf] shadow-[0_28px_70px_-30px_rgba(27,57,49,0.35)]">
              <img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1500&q=90" alt="Warm, thoughtfully arranged handmade home goods" className="h-[340px] w-full object-cover sm:h-[440px] lg:h-[510px]" />
            </div>
            <div className="absolute -bottom-5 right-4 rounded-2xl bg-[#193e37] px-5 py-4 text-white shadow-xl shadow-[#193e37]/20 sm:right-8">
              <p className="text-xs text-white/60">A little more personal</p>
              <p className="mt-1 text-sm font-semibold">Thoughtfully found. Made to be kept.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="discover" className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 sm:pb-24 sm:pt-16">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b87535]">A good place to start</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Find your kind of good.</h2>
          </div>
          <a href="#products" className="inline-flex items-center gap-2 text-sm font-semibold text-[#277766] transition hover:text-[#193e37]">Shop all finds <Arrow /></a>
        </div>
        <div id="products" className="mt-7 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {isLoadingProducts && <p className="col-span-full py-12 text-center text-sm text-[#718079]">Finding thoughtful things for you…</p>}
          {!isLoadingProducts && productsError && <p role="alert" className="col-span-full rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm text-red-800">{productsError}</p>}
          {!isLoadingProducts && !productsError && products.length === 0 && <p className="col-span-full py-12 text-center text-sm text-[#718079]">No products yet. Check back soon for new finds.</p>}
          {!isLoadingProducts && !productsError && products.map((product) => <article key={product._id} className="group min-w-0">
            <div className="relative overflow-hidden rounded-2xl bg-[#e7dfd1]">
              <img src={product.productImage} alt={product.productName} loading="lazy" className="aspect-[4/4.4] w-full object-cover transition duration-500 group-hover:scale-[1.04]" />
              <span className="absolute left-3 top-3 rounded-full bg-[#f4f3ed]/95 px-3 py-1.5 text-[11px] font-semibold text-[#53645c] shadow-sm">Independent maker</span>
            </div>
            <div className="flex items-start justify-between gap-3 pt-4">
              <div className="min-w-0"><h3 className="font-semibold leading-5 text-[#253b36]">{product.productName}</h3><p className="mt-1.5 text-sm text-[#87918b]">by {product.seller?.name || "Independent maker"}</p></div>
              <span className="shrink-0 text-sm font-semibold text-[#193e37]">${Number(product.productPrice).toFixed(2)}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#718079]">{product.productDescription}</p>
            <button type="button" onClick={() => openProduct(product._id)} className="mt-3 text-sm font-semibold text-[#277766] transition hover:text-[#193e37]">View details <span aria-hidden="true">→</span></button>
          </article>)}
        </div>
      </section>

      {user?.role === "seller" && <section id="seller-products" className="border-y border-[#e8e6de] bg-white/60 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div><p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#b87535]">Seller studio</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Your products</h2><p className="mt-2 text-sm text-[#718079]">Add new finds, update details, and keep your shop current.</p></div>
            <button type="button" onClick={handleLogout} className="self-start rounded-xl border border-[#d8ded7] px-4 py-2.5 text-sm font-semibold text-[#53645c] transition hover:bg-white sm:self-auto">Sign out</button>
          </div>
          {notice && <p role="status" className="mt-6 rounded-xl border border-[#d6e4da] bg-[#f0f7f1] px-4 py-3 text-sm text-[#315b47]">{notice}</p>}
          <div className="mt-8 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <form onSubmit={handleProductSubmit} className="space-y-4 rounded-2xl border border-[#e5e7df] bg-white p-5 shadow-sm sm:p-6">
              <h3 className="text-lg font-semibold text-[#193e37]">{editingProduct ? "Update product" : "Add a product"}</h3>
              <label className="block space-y-1.5 text-sm font-semibold text-[#253b36]">Product name<input required value={productForm.productName} onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })} className="w-full rounded-xl border border-[#e2e6df] bg-[#fbfcfa] px-4 py-3 font-normal outline-none focus:border-[#277766]" /></label>
              <label className="block space-y-1.5 text-sm font-semibold text-[#253b36]">Description<textarea required rows="3" value={productForm.productDescription} onChange={(e) => setProductForm({ ...productForm, productDescription: e.target.value })} className="w-full resize-y rounded-xl border border-[#e2e6df] bg-[#fbfcfa] px-4 py-3 font-normal outline-none focus:border-[#277766]" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5 text-sm font-semibold text-[#253b36]">Price<input required min="0" step="0.01" type="number" value={productForm.productPrice} onChange={(e) => setProductForm({ ...productForm, productPrice: e.target.value })} className="w-full rounded-xl border border-[#e2e6df] bg-[#fbfcfa] px-3 py-3 font-normal outline-none focus:border-[#277766]" /></label>
                <label className="block space-y-1.5 text-sm font-semibold text-[#253b36]">Stock<input required min="0" step="1" type="number" value={productForm.stock} onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })} className="w-full rounded-xl border border-[#e2e6df] bg-[#fbfcfa] px-3 py-3 font-normal outline-none focus:border-[#277766]" /></label>
              </div>
              <label className="block space-y-1.5 text-sm font-semibold text-[#253b36]">Product image {editingProduct && <span className="font-normal text-[#87918b]">(optional)</span>}<input required={!editingProduct} accept="image/*" type="file" onChange={(e) => setProductForm({ ...productForm, productImage: e.target.files?.[0] || null })} className="w-full rounded-xl border border-[#e2e6df] bg-[#fbfcfa] px-3 py-2.5 text-sm font-normal file:mr-3 file:rounded-lg file:border-0 file:bg-[#eaf1eb] file:px-3 file:py-2 file:font-semibold file:text-[#277766]" /></label>
              <div className="flex gap-3 pt-1"><button disabled={isSaving} className="rounded-xl bg-[#193e37] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24564c] disabled:opacity-60">{isSaving ? "Saving…" : editingProduct ? "Save changes" : "Add product"}</button>{editingProduct && <button type="button" onClick={resetProductForm} className="rounded-xl border border-[#d8ded7] px-4 py-3 text-sm font-semibold text-[#53645c]">Cancel</button>}</div>
            </form>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#193e37]">Your shop <span className="ml-1 text-sm font-medium text-[#87918b]">{myProducts.length} items</span></h3>
              {myProducts.length === 0 && <p className="rounded-2xl border border-dashed border-[#d8ded7] p-8 text-center text-sm text-[#718079]">Your products will appear here after you add them.</p>}
              {myProducts.map((product) => <article key={product._id} className="flex gap-4 rounded-2xl border border-[#e5e7df] bg-white p-3 shadow-sm sm:items-center sm:p-4">
                <img src={product.productImage} alt="" className="size-20 shrink-0 rounded-xl bg-[#e7dfd1] object-cover" />
                <div className="min-w-0 flex-1"><h4 className="truncate font-semibold text-[#253b36]">{product.productName}</h4><p className="mt-1 text-sm text-[#718079]">${Number(product.productPrice).toFixed(2)} <span className="mx-1">·</span> {product.stock} in stock</p><div className="mt-2 flex gap-4"><button type="button" onClick={() => startEditing(product)} className="text-sm font-semibold text-[#277766] hover:text-[#193e37]">Edit</button><button type="button" onClick={() => handleDeleteProduct(product)} className="text-sm font-semibold text-[#a34438] hover:text-[#7f2e25]">Delete</button></div></div>
              </article>)}
            </div>
          </div>
        </div>
      </section>}

      <section id="makers" className="bg-[#193e37] px-5 py-16 text-white sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#e5b77e]">The people behind the pieces</p>
            <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">Small shops. Big heart. Things worth knowing the story of.</h2>
          </div>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between lg:pl-8">
            <p className="max-w-sm text-sm leading-6 text-white/65">Every find starts with someone who cares about how it’s made. Get to know the hands and ideas behind your next favorite thing.</p>
            <a href="#story" className="group inline-flex shrink-0 items-center gap-3 rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">Our makers <span className="transition-transform group-hover:translate-x-1"><Arrow /></span></a>
          </div>
        </div>
      </section>

      <footer id="story" className="px-5 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Brand />
          <p className="text-xs text-[#87918b]">Thoughtfully found. Made to be kept.</p>
          <div className="flex gap-5 text-sm font-medium text-[#718079]">{user ? <button type="button" onClick={handleLogout} className="transition hover:text-[#193e37]">Sign out</button> : <><Link to="/login" className="transition hover:text-[#193e37]">Sign in</Link><Link to="/register" className="transition hover:text-[#193e37]">Create account</Link></>}</div>
        </div>
      </footer>

      {selectedProduct && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10231f]/60 p-4" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
        <section role="dialog" aria-modal="true" aria-labelledby="product-detail-title" className="grid w-full max-w-3xl overflow-hidden rounded-3xl bg-[#fdfdfa] shadow-2xl sm:grid-cols-2">
          <img src={selectedProduct.productImage} alt={selectedProduct.productName} className="h-64 w-full bg-[#e7dfd1] object-cover sm:h-full" />
          <div className="p-6 sm:p-8"><button type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product details" className="float-right grid size-9 place-items-center rounded-full bg-[#f0f1eb] text-lg text-[#53645c]">×</button><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#b87535]">From {selectedProduct.seller?.name || "Independent maker"}</p><h2 id="product-detail-title" className="mt-4 pr-8 text-2xl font-semibold leading-tight tracking-[-0.03em] text-[#193e37]">{selectedProduct.productName}</h2><p className="mt-4 text-sm leading-6 text-[#718079]">{selectedProduct.productDescription}</p><p className="mt-6 text-xl font-semibold text-[#193e37]">${Number(selectedProduct.productPrice).toFixed(2)}</p><p className="mt-2 text-sm text-[#718079]">{selectedProduct.stock > 0 ? `${selectedProduct.stock} available` : "Currently out of stock"}</p></div>
        </section>
      </div>}
    </main>
  );
}
