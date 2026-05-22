"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { 
  Plus, Trash2, Edit3, Settings, ShieldAlert, BarChart3, Database, 
  Sparkles, CheckCircle, ArrowLeft, X, FileText
} from "lucide-react";
import { PRODUCTS, CATEGORIES, Product } from "@/data/products";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Initial FAQ base for chatbot management
const INITIAL_QA = [
  { id: "1", keyword: "cửa nhôm", q: "Tư vấn khóa cho cửa nhôm Xingfa?", a: "Khuyên khách hàng chọn Kassler KL-660 Slim Plus kháng nước IP66." },
  { id: "2", keyword: "đại sảnh", q: "Khóa đại sảnh sang trọng nhất?", a: "Khuyên khách hàng chọn Kassler KL-990 Gold dát vàng 24K, tích hợp FaceID 3D." },
  { id: "3", keyword: "két sắt", q: "Tìm két sắt bảo mật chống trộm tốt?", a: "Đề xuất két sắt KS-100 Safe, thép dày 10 ly chống cháy 1200 độ C." },
  { id: "4", keyword: "bảo hành", q: "Chính sách bảo hành ra sao?", a: "Dát vàng bảo hành 36 tháng, các mẫu khác bảo hành 24 tháng chính hãng." }
];

function generateId(): string {
  return Math.random().toString();
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={
      <div className="bg-[#050505] min-h-screen flex items-center justify-center text-zinc-500 font-bold uppercase tracking-widest text-xs gap-3">
        <div className="w-6 h-6 border-2 border-lime border-t-transparent rounded-full animate-spin" />
        Đang tải bảng quản trị...
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}

function AdminDashboardContent() {
  const [productsList, setProductsList] = useState<Product[]>(PRODUCTS);
  const [qaList, setQaList] = useState(INITIAL_QA);

  const tabs = [
    { key: "products", label: "Quản lý sản phẩm", icon: <Database className="w-4 h-4" /> },
    { key: "leads", label: "Khách hàng đăng ký tư vấn", icon: <FileText className="w-4 h-4" /> },
    { key: "chatbot", label: "Đào tạo chatbot AI", icon: <Sparkles className="w-4 h-4" /> }
  ] as const;
  
  // Forms & Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"products" | "leads" | "chatbot">("products");
  const [successMessage, setSuccessMessage] = useState("");
  
  // Product wizard state
  const [newProduct, setNewProduct] = useState({
    name: "", code: "", category: "Lock", priceRange: "",
    shortDescription: "", description: "", warranty: 24,
    colors: "Đen sần, Champagne Gold", technologies: "Vân tay FPC Thụy Điển, App Wifi"
  });

  // Mock leads
  const [leadsList, setLeadsList] = useState([
    { id: "lead-1", name: "Nguyễn Văn Hùng", phone: "0912.345.678", email: "hungnv@gmail.com", product: "TA-9800", message: "Cần khảo sát lắp đặt cửa gỗ đại sảnh biệt thự đơn lập.", date: "2026-05-20" },
    { id: "lead-2", name: "Trần Thị Mai", phone: "0987.654.321", email: "maitt@gmail.com", product: "Bosch Bếp", message: "Lắp đặt bếp từ đa điểm và hút mùi âm tủ bếp.", date: "2026-05-19" },
    { id: "lead-3", name: "Lê Minh Tuấn", phone: "0909.111.222", email: "tuanlm@yahoo.com", product: "A.O. Smith M2", message: "Tư vấn máy lọc nước tinh khiết đặt gầm tủ bếp.", date: "2026-05-18" }
  ]);

  // Chatbot Q&A form states
  const [newQa, setNewQa] = useState({ keyword: "", q: "", a: "" });

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProduct.name && newProduct.code) {
      const addedProduct: Product = {
        id: `tahouse-${newProduct.code.toLowerCase().replace(/\s+/g, "-")}`,
        name: newProduct.name,
        code: newProduct.code,
        category: newProduct.category,
        categoryName: CATEGORIES.find(c => c.slug === newProduct.category)?.name || "Khóa thông minh",
        imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80",
        price: Number(newProduct.priceRange.replace(/\D/g, "")) || 0,
        priceRange: newProduct.priceRange || "Liên hệ hotline",
        shortDescription: newProduct.shortDescription,
        description: newProduct.description,
        features: ["Bảo mật mã số ảo", "Mở khóa siêu tốc", "Chất lượng cao cấp"],
        specs: {
          "Chất liệu": "Hợp kim kẽm hàng không CNC nguyên khối",
          "Cách thức mở": "Vân tay sinh trắc học, Mã số ảo",
          "Chế độ bảo hành": `${newProduct.warranty} Tháng`
        },
        specifications: {
          dimensions: "Dài 380mm x Rộng 75mm",
          material: "Hợp kim kẽm siêu cường",
          battery: "Pin sạc dung lượng cao",
          openingMethods: ["Vân tay", "Mã số", "Thẻ từ", "App Wifi"],
          lockingMechanism: "Thân khóa tự động Inox 304"
        },
        images: ["https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"],
        colors: newProduct.colors.split(",").map(c => c.trim()),
        technologies: newProduct.technologies.split(",").map(t => t.trim()),
        warranty: Number(newProduct.warranty),
        warrantyText: `${newProduct.warranty} Tháng`,
        installationManual: ["Kiểm tra cửa", "Khoan đục", "Bắt vít cố định", "Cấu hình pin và vân tay"],
        faq: [{ question: "Khóa này dùng pin gì?", answer: "Sử dụng 4 viên pin AA Alkaline hoặc Pin Lithium chính hãng." }]
      };

      setProductsList([addedProduct, ...productsList]);
      setIsAddProductOpen(false);
      setNewProduct({
        name: "", code: "", category: "Lock", priceRange: "",
        shortDescription: "", description: "", warranty: 24,
        colors: "Đen sần, Champagne Gold", technologies: "Vân tay FPC Thụy Điển, App Wifi"
      });
      triggerSuccess("Thêm sản phẩm thành công!");
    }
  };

  const handleAddQaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQa.keyword && newQa.q) {
      const addedQa = {
        id: generateId(),
        keyword: newQa.keyword,
        q: newQa.q,
        a: newQa.a
      };
      setQaList([addedQa, ...qaList]);
      setNewQa({ keyword: "", q: "", a: "" });
      triggerSuccess("Thêm câu hỏi đào tạo Chatbot thành công!");
    }
  };

  const handleDeleteProduct = (id: string) => {
    setProductsList(productsList.filter(p => p.id !== id));
    triggerSuccess("Xóa sản phẩm thành công!");
  };

  const handleDeleteQa = (id: string) => {
    setQaList(qaList.filter(qa => qa.id !== id));
    triggerSuccess("Xóa dữ liệu Chatbot thành công!");
  };

  const handleLeadResolve = (id: string) => {
    setLeadsList(leadsList.filter(l => l.id !== id));
    triggerSuccess("Đã xử lý thông tin khách hàng thành công!");
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(""), 4000);
  };

  return (
    <>
      <Header />

      <main className="flex-1 pt-24 pb-20 bg-[#050505] min-h-[90vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-6 mb-8">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="p-2 border border-zinc-800 hover:border-lime text-zinc-400 hover:text-lime rounded-lg transition-colors"
                title="Quay về trang chủ"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Settings className="w-5 h-5 text-lime animate-spin-slow" /> 
                  Bảng Quản Trị Hệ Thống TA HOUSE
                </h1>
                <span className="text-xxs text-zinc-500 font-semibold tracking-wider uppercase">Kiến trúc sẵn sàng mở rộng cơ sở dữ liệu (Admin-Ready Dashboard)</span>
              </div>
            </div>

            <button
              onClick={() => setIsAddProductOpen(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs font-black uppercase tracking-wider rounded-lg shadow-md hover:brightness-105 transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm sản phẩm mới
            </button>
          </div>

          {/* Success Alerts */}
          {successMessage && (
            <div className="bg-emerald-950/80 border border-emerald-500/35 p-4 rounded-xl flex items-center gap-3 text-emerald-400 text-xs font-semibold mb-6 animate-fadeIn">
              <CheckCircle className="w-5 h-5 animate-bounce" />
              {successMessage}
            </div>
          )}

          {/* 1. ANALYTICS STATS METRIC TILES */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Tổng sản phẩm", value: productsList.length, icon: <Database className="w-5 h-5 text-gold" />, desc: "Hoạt động trong hệ thống" },
              { label: "Số lượng liên hệ", value: leadsList.length, icon: <FileText className="w-5 h-5 text-gold" />, desc: "Đang chờ xử lý tư vấn" },
              { label: "Đào tạo chatbot", value: qaList.length, icon: <Sparkles className="w-5 h-5 text-gold animate-pulse" />, desc: "Bộ từ khóa truy vấn" },
              { label: "Truy cập hệ thống", value: "2.450+", icon: <BarChart3 className="w-5 h-5 text-gold" />, desc: "Lượt xem trang tháng này" }
            ].map((stat, idx) => (
              <div key={idx} className="glass-panel p-5 rounded-xl border border-gold/10 flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                  {stat.icon}
                </div>
                <div className="pt-2">
                  <strong className="text-xl sm:text-2xl font-black text-white font-mono">{stat.value}</strong>
                  <span className="text-[10px] text-zinc-500 block leading-normal mt-0.5">{stat.desc}</span>
                </div>
              </div>
            ))}
          </section>

          {/* 2. ADMIN TABS DISPLAY SELECTOR */}
          <section className="glass-panel rounded-2xl border border-zinc-900 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Tab links */}
            <div className="flex border-b border-zinc-900 bg-zinc-950 px-4">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-5 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all focus:outline-none ${
                    activeTab === tab.key 
                      ? "border-gold text-gold bg-gold/5" 
                      : "border-transparent text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB PANEL 1: PRODUCTS LIST */}
            {activeTab === "products" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-zinc-900 text-zinc-400 font-bold uppercase border-b border-zinc-800">
                      <th className="px-6 py-4">Mã Khóa</th>
                      <th className="px-6 py-4">Tên Sản Phẩm</th>
                      <th className="px-6 py-4">Phân Loại Danh Mục</th>
                      <th className="px-6 py-4">Tầm Giá Tham Khảo</th>
                      <th className="px-6 py-4">Bảo Hành</th>
                      <th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900 text-zinc-300">
                    {productsList.map((prod) => (
                      <tr key={prod.id} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-gold">{prod.code}</td>
                        <td className="px-6 py-4 font-medium text-white max-w-[200px] truncate">{prod.name}</td>
                        <td className="px-6 py-4 text-zinc-400">{prod.categoryName}</td>
                        <td className="px-6 py-4 font-mono font-semibold">{prod.priceRange}</td>
                        <td className="px-6 py-4 text-emerald-400">{prod.warranty} tháng</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              href={`/products/${prod.id}`}
                              className="p-1.5 border border-zinc-800 hover:border-gold rounded text-zinc-400 hover:text-gold"
                              title="Xem trang chi tiết"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProduct(prod.id)}
                              className="p-1.5 border border-zinc-800 hover:border-red-500 rounded text-zinc-400 hover:text-red-500"
                              title="Xóa sản phẩm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB PANEL 2: LEADS AND REGISTRATIONS */}
            {activeTab === "leads" && (
              <div className="p-6">
                <div className="flex items-center gap-2 text-zinc-500 text-xs mb-6">
                  <ShieldAlert className="w-4 h-4 text-gold shrink-0" />
                  <span>Dưới đây là danh sách thông tin khách hàng điền form tư vấn. Xử lý liên hệ để xóa khỏi hàng chờ khẩn cấp.</span>
                </div>

                <div className="flex flex-col gap-4">
                  {leadsList.length > 0 ? (
                    leadsList.map((lead) => (
                      <div 
                        key={lead.id} 
                        className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex flex-col sm:flex-row justify-between gap-6"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h4 className="text-sm font-bold text-white">{lead.name}</h4>
                            <span className="px-2 py-0.5 bg-gold/10 border border-gold/30 text-gold text-[10px] font-bold rounded">{lead.product}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">{lead.date}</span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-zinc-400 font-light">
                            <p>📞 Điện thoại: <strong className="text-white font-semibold font-mono">{lead.phone}</strong></p>
                            <p>✉️ Email: <span className="text-zinc-300">{lead.email || "Không cung cấp"}</span></p>
                          </div>

                          <p className="text-xs text-zinc-400 bg-zinc-900/60 p-3 rounded-lg border border-zinc-900 leading-normal font-light">
                            💬 <strong>Ghi chú/Yêu cầu:</strong> {lead.message}
                          </p>
                        </div>

                        <div className="flex items-center justify-end shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => handleLeadResolve(lead.id)}
                            className="px-4 py-2 border border-emerald-600/30 hover:border-emerald-500 bg-emerald-600/5 hover:bg-emerald-600/10 text-emerald-400 text-xs font-bold uppercase rounded-lg transition-all"
                          >
                            Đã liên hệ xử lý
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-zinc-500 text-sm">
                      Không có cuộc gọi tư vấn nào đang chờ xử lý.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB PANEL 3: CHATBOT TRAINING BASE */}
            {activeTab === "chatbot" && (
              <div className="p-6 flex flex-col lg:flex-row gap-8">
                
                {/* Form to add new training data */}
                <div className="lg:w-1/3 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-gold uppercase tracking-wider border-b border-zinc-900 pb-3 mb-2">Đào tạo từ khóa AI</h3>
                  
                  <form onSubmit={handleAddQaSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Từ khóa kích hoạt *</label>
                      <input
                        type="text"
                        required
                        value={newQa.keyword}
                        onChange={(e) => setNewQa({ ...newQa, keyword: e.target.value })}
                        placeholder="Ví dụ: 'cửa sắt', 'KL-990'"
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Câu hỏi phổ biến</label>
                      <input
                        type="text"
                        required
                        value={newQa.q}
                        onChange={(e) => setNewQa({ ...newQa, q: e.target.value })}
                        placeholder="Ví dụ: 'Lắp khóa Kassler có khó không?'"
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Câu trả lời AI mẫu *</label>
                      <textarea
                        rows={4}
                        required
                        value={newQa.a}
                        onChange={(e) => setNewQa({ ...newQa, a: e.target.value })}
                        placeholder="Ví dụ: 'Quy trình lắp đặt chuyên nghiệp chỉ mất 2-3 tiếng và hoàn toàn miễn phí trọn gói...'"
                        className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-gold-dark to-gold text-[#050505] text-xs font-black uppercase tracking-wider rounded-lg shadow-md hover:brightness-105 transition-all cursor-pointer"
                    >
                      Huấn luyện chatbot AI
                    </button>
                  </form>
                </div>

                {/* Training QA Table log */}
                <div className="lg:w-2/3 flex flex-col gap-4">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-3 mb-2">Bộ cơ sở tri thức hiện hành</h3>
                  
                  <div className="overflow-x-auto border border-zinc-900 rounded-xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-zinc-900 text-zinc-500 font-bold uppercase border-b border-zinc-850">
                          <th className="px-4 py-3">Keyword</th>
                          <th className="px-4 py-3">Câu Hỏi Mẫu</th>
                          <th className="px-4 py-3">Câu Trả Lời Huấn Luyện</th>
                          <th className="px-4 py-3 text-center">Xóa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900 text-zinc-400">
                        {qaList.map((qa) => (
                          <tr key={qa.id} className="hover:bg-zinc-900/10">
                            <td className="px-4 py-3 font-bold text-gold font-mono">{qa.keyword}</td>
                            <td className="px-4 py-3 text-white font-medium max-w-[150px] truncate">{qa.q}</td>
                            <td className="px-4 py-3 max-w-[200px] truncate">{qa.a}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleDeleteQa(qa.id)}
                                className="p-1 rounded text-zinc-500 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </section>

        </div>
      </main>

      {/* Add Product Modal Wizard popup */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/85 z-55 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="glass-panel max-w-lg w-full rounded-2xl border border-gold/30 p-6 flex flex-col gap-5 bg-[#0A0A0C] animate-fadeIn max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-gold" /> Thêm sản phẩm mới Kassler
              </h3>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="flex flex-col gap-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ví dụ: Khóa đại sảnh KL-920"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Mã sản phẩm *</label>
                  <input
                    type="text"
                    required
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({ ...newProduct, code: e.target.value })}
                    placeholder="Ví dụ: KL-920 Gold"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Danh mục *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-zinc-300 focus:outline-none"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Tầm giá tham khảo</label>
                  <input
                    type="text"
                    value={newProduct.priceRange}
                    onChange={(e) => setNewProduct({ ...newProduct, priceRange: e.target.value })}
                    placeholder="Ví dụ: 12.000.000 VNĐ"
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Mô tả ngắn *</label>
                <input
                  type="text"
                  required
                  value={newProduct.shortDescription}
                  onChange={(e) => setNewProduct({ ...newProduct, shortDescription: e.target.value })}
                  placeholder="Một câu tóm tắt nổi bật dòng sản phẩm..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Mô tả chi tiết sản phẩm</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Ghi chi tiết ưu điểm nổi trội, phân khúc sử dụng của sản phẩm..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Bảo hành (Tháng)</label>
                  <input
                    type="number"
                    value={newProduct.warranty}
                    onChange={(e) => setNewProduct({ ...newProduct, warranty: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Màu sắc (phân tách dấu phẩy)</label>
                  <input
                    type="text"
                    value={newProduct.colors}
                    onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Công nghệ chính (phân tách dấu phẩy)</label>
                <input
                  type="text"
                  value={newProduct.technologies}
                  onChange={(e) => setNewProduct({ ...newProduct, technologies: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 focus:border-gold rounded-lg text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="flex-1 py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded-lg uppercase tracking-wider font-bold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-gold-dark to-gold text-[#050505] rounded-lg uppercase tracking-wider font-bold shadow-lg"
                >
                  Xác nhận thêm
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
