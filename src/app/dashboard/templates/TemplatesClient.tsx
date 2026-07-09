"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import {
  UploadSimple, Plus, CircleNotch, Image as ImageIcon,
  Warning, Trash, X, Funnel, Star, Clock, Sparkle, Layout,
  FileCode, CheckCircle, Info, Heart, MagnifyingGlass,
  CalendarBlank, Monitor, Compass, Sliders
} from "@phosphor-icons/react";
import { createTemplateAction, deleteTemplateAction } from "@/app/actions/templates";
import Image from "next/image";
import Link from "next/link";
import UpgradeModal from "@/components/UpgradeModal";
import { TemplateCard, PremiumCard, type TemplateItem, getMeta } from "./TemplateCard";
import { PreviewModal } from "./PreviewModal";
import { useTranslation } from "@/lib/hooks/useTranslation";

type Event = { id: string; name: string };

type Category = 
  | "all"
  | "workshop"
  | "seminar"
  | "competition"
  | "graduation"
  | "business"
  | "webinar"
  | "formal"
  | "premium"
  | "free"
  | "favorites";

const CATEGORY_LABELS: Record<Category, { id: string; en: string }> = {
  all: { id: "Semua Desain", en: "All Designs" },
  workshop: { id: "Workshop", en: "Workshop" },
  seminar: { id: "Seminar", en: "Seminar" },
  competition: { id: "Kompetisi", en: "Competition" },
  graduation: { id: "Wisuda", en: "Graduation" },
  business: { id: "Bisnis / Korporat", en: "Business / Corporate" },
  webinar: { id: "Webinar", en: "Webinar" },
  formal: { id: "Formal", en: "Formal" },
  premium: { id: "Premium", en: "Premium Only" },
  free: { id: "Gratis", en: "Free Only" },
  favorites: { id: "Favorit Saya", en: "My Favorites" },
};

type SortOption = "newest" | "popular" | "alphabetical" | "premium_first" | "free_first";

const SORT_OPTIONS: Record<SortOption, { id: string; en: string }> = {
  newest: { id: "Terbaru", en: "Newest" },
  popular: { id: "Populer", en: "Popular" },
  alphabetical: { id: "Nama (A - Z)", en: "Alphabetical (A - Z)" },
  premium_first: { id: "Premium Teratas", en: "Premium First" },
  free_first: { id: "Gratis Teratas", en: "Free First" },
};

export default function TemplatesClient({
  events,
  templates: initialTemplates,
  userPlan,
}: {
  events: Event[];
  templates: TemplateItem[];
  userPlan: string;
}) {
  const [templates, setTemplates] = useState<TemplateItem[]>(initialTemplates);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const { t, lang } = useTranslation();

  // SaaS enhancements states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);
  const [isLoadingSkeletons, setIsLoadingSkeletons] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    // Load favorites
    const favs = localStorage.getItem("favoriteTemplateIds");
    if (favs) {
      try {
        setFavorites(JSON.parse(favs));
      } catch (e) {
        console.error(e);
      }
    }

    // Load recently used
    const recents = localStorage.getItem("recentlyUsedTemplateIds");
    if (recents) {
      try {
        setRecentlyUsed(JSON.parse(recents));
      } catch (e) {
        console.error(e);
      }
    }

    // Load active template
    const activeId = localStorage.getItem("activeTemplateId");
    if (activeId) {
      setActiveTemplateId(activeId);
      // Auto select the active one on layout
      setSelectedId(activeId);
    }
  }, []);

  // Sync active template changes
  const updateActiveTemplate = (id: string) => {
    setActiveTemplateId(id);
    localStorage.setItem("activeTemplateId", id);

    // Track to recently used
    setRecentlyUsed(prev => {
      const filtered = prev.filter(x => x !== id);
      const updated = [id, ...filtered].slice(0, 5);
      localStorage.setItem("recentlyUsedTemplateIds", JSON.stringify(updated));
      return updated;
    });
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setFavorites(prev => {
      const isFav = prev.includes(id);
      const updated = isFav ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem("favoriteTemplateIds", JSON.stringify(updated));
      return updated;
    });
  };

  // Simulate loading skeletons when changing filter options for professional SaaS feel
  const handleCategoryChange = (cat: Category) => {
    setIsLoadingSkeletons(true);
    setActiveCategory(cat);
    setTimeout(() => {
      setIsLoadingSkeletons(false);
    }, 350);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
  };

  // Lock logic
  const customTemplatesCount = templates.filter(t => getMeta(t.fileUrl).badge === "custom").length;
  const limitTemplates = userPlan === "FREE" ? 0 : userPlan === "PRO" ? 5 : 999999;
  const isLocked = customTemplatesCount >= limitTemplates;

  // Filter templates
  const filtered = templates.filter(t => {
    const meta = getMeta(t.fileUrl);
    const nameMatch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = (lang === "id" ? meta.desc.id : meta.desc.en).toLowerCase().includes(searchQuery.toLowerCase());
    const usageMatch = (lang === "id" ? meta.usage.id : meta.usage.en).toLowerCase().includes(searchQuery.toLowerCase());
    const categoryNameMatch = (lang === "id" ? meta.category.id : meta.category.en).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSearch = nameMatch || descMatch || usageMatch || categoryNameMatch;
    if (!matchesSearch) return false;

    // Filter by Category Chip
    if (activeCategory === "all") return true;
    if (activeCategory === "favorites") return favorites.includes(t.id);
    if (activeCategory === "premium") return meta.badge === "premium";
    if (activeCategory === "free") return meta.badge === "free" || meta.badge === "custom";

    // Matching exact categories from meta key or custom category match
    const categoryKey = meta.category.en.toLowerCase();
    const subCategoryMatch = meta.usage.en.toLowerCase().includes(activeCategory) || categoryKey.includes(activeCategory);

    return subCategoryMatch;
  });

  // Sort templates
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortOption === "alphabetical") {
      return a.name.localeCompare(b.name);
    }
    if (sortOption === "premium_first") {
      const aMeta = getMeta(a.fileUrl);
      const bMeta = getMeta(b.fileUrl);
      if (aMeta.badge === "premium" && bMeta.badge !== "premium") return -1;
      if (aMeta.badge !== "premium" && bMeta.badge === "premium") return 1;
      return 0;
    }
    if (sortOption === "free_first") {
      const aMeta = getMeta(a.fileUrl);
      const bMeta = getMeta(b.fileUrl);
      const aFree = aMeta.badge === "free" || aMeta.badge === "custom";
      const bFree = bMeta.badge === "free" || bMeta.badge === "custom";
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
      return 0;
    }
    // Simulated popularity (presets first)
    const isPreset = (url: string) => url.includes("sertifikat") || url.includes("elegan") || url.includes("luxury") || url.includes("elegant") || url.includes("modern");
    if (isPreset(a.fileUrl) && !isPreset(b.fileUrl)) return -1;
    if (!isPreset(a.fileUrl) && isPreset(b.fileUrl)) return 1;
    return 0;
  });

  const selectedTemplate = templates.find(t => t.id === selectedId);

  // Auto Orientation
  const getOrientation = (w?: number, h?: number) => {
    if (!w || !h) return lang === "id" ? "Lanskap" : "Landscape";
    if (w > h) return lang === "id" ? "Lanskap" : "Landscape";
    if (w < h) return lang === "id" ? "Potret" : "Portrait";
    return lang === "id" ? "Kotak" : "Square";
  };

  const getOrientationLabel = (template: TemplateItem) => {
    const meta = getMeta(template.fileUrl);
    return getOrientation(template.width, template.height);
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { 
      setFormError(lang === "id" ? "File harus berupa gambar (PNG/JPG)" : "File must be an image (PNG/JPG)"); 
      return; 
    }
    setSelectedFile(file);
    setFormError("");
    const reader = new FileReader();
    reader.onload = ev => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!templateName || !selectedFile) { 
      setFormError(lang === "id" ? "Nama template dan file gambar wajib diisi" : "Template name and image file are required"); 
      return; 
    }
    setFormError("");
    const fd = new FormData();
    fd.append("name", templateName);
    fd.append("file", selectedFile);
    if (selectedEventId) fd.append("eventId", selectedEventId);
    startTransition(async () => {
      const res = await createTemplateAction(fd);
      if (res.error) setFormError(res.error);
      else if (res.success) window.location.reload();
    });
  }

  function handleDelete(id: string) {
    if (!confirm(lang === "id" ? "Apakah Anda yakin ingin menghapus template ini?" : "Are you sure you want to delete this template?")) return;
    startTransition(async () => {
      const res = await deleteTemplateAction(id);
      if (res.error) alert(res.error);
      else {
        setTemplates(prev => prev.filter(t => t.id !== id));
        if (selectedId === id) setSelectedId(null);
      }
    });
  }

  // Clear filters helper
  const handleClearFilters = () => {
    setSearchQuery("");
    setActiveCategory("all");
    setSortOption("newest");
  };

  // Get recently used items
  const recentlyUsedTemplates = templates.filter(t => recentlyUsed.includes(t.id));

  // Recommended for you generator based on active category
  const getRecommendedTemplates = () => {
    // Return 3 templates excluding current selected one
    return templates
      .filter(t => t.id !== selectedId)
      .slice(0, 3);
  };

  const recommendedTemplates = getRecommendedTemplates();

  return (
    <div className="space-y-6">
      {/* ── Professional Canva-Style Header ── */}
      <div className="card p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-ink-950 tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-brand-600" />
            {lang === "id" ? "Pustaka Template" : "Template Library"}
          </h1>
          <p className="text-sm text-ink-500 font-medium">
            {lang === "id" ? "Pilih desain sertifikat profesional untuk berbagai kebutuhan event Anda." : "Choose a professional certificate design for your event."}
          </p>
        </div>
        <button
          onClick={() => { if (isLocked) setUpgradeOpen(true); else setShowUploadModal(true); }}
          className="btn-primary self-start md:self-auto shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          {lang === "id" ? "Upload Template Baru" : "Upload New Template"}
        </button>
      </div>

      {/* ── Live Advanced Search & Sorting Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-bg-card border border-ink-150 p-4 rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:flex-1">
          <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder={lang === "id" ? "Cari nama template, kategori, deskripsi..." : "Search by template name, category, description..."}
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold bg-ink-50 border border-ink-150 rounded-xl focus:border-brand-500 focus:bg-bg-card focus:outline-none transition-all placeholder:text-ink-400 text-ink-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-600 rounded-full hover:bg-ink-100 transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
          <span className="text-xs font-bold text-ink-500 whitespace-nowrap">
            {lang === "id" ? "Urutkan:" : "Sort:"}
          </span>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as SortOption)}
            className="px-3 py-2 text-xs font-bold bg-bg-card border border-ink-150 rounded-xl focus:outline-none focus:border-brand-500 text-ink-700 cursor-pointer w-full sm:w-auto"
          >
            {(Object.entries(SORT_OPTIONS) as [SortOption, { id: string; en: string }][]).map(([opt, labelObj]) => (
              <option key={opt} value={opt}>
                {lang === "id" ? labelObj.id : labelObj.en}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Category Chips Filter ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-ink-100 scrollbar-none">
        <Funnel className="w-4 h-4 text-ink-400 shrink-0" />
        {(Object.entries(CATEGORY_LABELS) as [Category, { id: string; en: string }][]).map(([cat, labelObj]) => {
          const active = activeCategory === cat;
          const label = lang === "id" ? labelObj.id : labelObj.en;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                active
                  ? "bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-500/20"
                  : "bg-bg-card text-ink-550 border-ink-150 hover:bg-ink-50 hover:text-ink-900"
              }`}
            >
              {cat === "favorites" && <Heart className="w-3.5 h-3.5" weight="fill" />}
              {cat === "premium" && <Sparkle className="w-3.5 h-3.5" />}
              {cat === "free" && <CheckCircle className="w-3.5 h-3.5" />}
              <span>{label}</span>
              {cat === "all" && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${active ? "bg-white/20 text-white" : "bg-ink-100 text-ink-600"}`}>
                  {templates.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Recently Used Templates Row ── */}
      {recentlyUsedTemplates.length > 0 && (
        <div className="bg-ink-50/60 border border-ink-100 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-ink-900 font-extrabold text-sm">
            <Clock className="w-4 h-4 text-brand-600" />
            {lang === "id" ? "Baru Saja Digunakan" : "Recently Used"}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recentlyUsedTemplates.map(t => {
              const isAct = activeTemplateId === t.id;
              return (
                <div
                  key={`recent-${t.id}`}
                  onClick={() => setSelectedId(t.id)}
                  className={`bg-bg-card border rounded-xl p-3 flex flex-col gap-2 cursor-pointer transition-all hover:scale-[1.02] shadow-sm relative ${
                    isAct ? "border-brand-500 shadow-brand-500/10 shadow-md" : "border-ink-150 hover:border-ink-200"
                  }`}
                >
                  <div className="relative aspect-[16/11] bg-ink-50 rounded-lg overflow-hidden">
                    <Image
                      src={t.fileUrl}
                      alt={t.name}
                      fill
                      loading="lazy"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="text-[11px] font-bold text-ink-900 truncate">{t.name}</div>
                  {isAct && (
                    <span className="absolute top-1.5 right-1.5 bg-brand-500 text-white p-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" weight="fill" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Two Column Workspace (Gallery vs Info Panel) ── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Grid */}
        <div className="flex-1 w-full space-y-6">
          {/* Loading Skeletons */}
          {isLoadingSkeletons ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="card p-4 space-y-4 animate-pulse">
                  <div className="aspect-[1122/794] bg-ink-100 rounded-xl w-full" />
                  <div className="space-y-2">
                    <div className="h-4 bg-ink-100 rounded w-2/3" />
                    <div className="h-3 bg-ink-100 rounded w-full" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-7 bg-ink-100 rounded flex-1" />
                    <div className="h-7 bg-ink-100 rounded flex-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16 card shadow-sm max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4 border border-brand-100 shadow-inner">
                <ImageIcon className="w-8 h-8 text-brand-500" />
              </div>
              <h3 className="text-lg font-bold text-ink-900">
                {lang === "id" ? "Template Tidak Ditemukan" : "No Templates Found"}
              </h3>
              <p className="text-sm text-ink-500 mt-2 mb-6 max-w-xs mx-auto">
                {lang === "id"
                  ? "Coba ubah kata kunci pencarian atau bersihkan filter untuk menampilkan semua template kembali."
                  : "Try modifying your search keywords or clear current filters to show all certificate designs."}
              </p>
              <button
                onClick={handleClearFilters}
                className="btn-secondary mx-auto shadow-sm"
              >
                {lang === "id" ? "Bersihkan Filter" : "Clear Filters"}
              </button>
            </div>
          ) : (
            /* Main Cards Grid - Responsive layout */
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {sorted.map(t => (
                <div key={t.id} onClick={() => setSelectedId(t.id === selectedId ? null : t.id)}>
                  <TemplateCard
                    template={t}
                    isSelected={selectedId === t.id}
                    isActive={activeTemplateId === t.id}
                    isFavorite={favorites.includes(t.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onPreview={setPreviewTemplate}
                    onDelete={handleDelete}
                    isPending={isPending}
                    userPlan={userPlan}
                    onUpgradeRequired={() => setUpgradeOpen(true)}
                  />
                </div>
              ))}
              <PremiumCard />
            </div>
          )}

          {/* Recommended For You Section */}
          <div className="border-t border-ink-100 pt-6 space-y-4">
            <h3 className="text-base font-extrabold text-ink-950 flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-amber-500" />
              {lang === "id" ? "Direkomendasikan Untuk Anda" : "Recommended For You"}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedTemplates.map(t => {
                const meta = getMeta(t.fileUrl);
                return (
                  <div
                    key={`rec-${t.id}`}
                    onClick={() => setSelectedId(t.id)}
                    className="group card p-4 flex flex-col gap-3 cursor-pointer hover:border-brand-300 hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-[16/11] bg-ink-50 rounded-xl overflow-hidden group-hover:scale-[1.01] transition-transform">
                      <Image
                        src={t.fileUrl}
                        alt={t.name}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-ink-900 group-hover:text-brand-600 transition-colors truncate">{t.name}</div>
                      <div className="text-[10px] text-ink-400 mt-1 flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100 font-bold uppercase text-[8px]">
                          {lang === "id" ? "Rekomendasi" : "Recommended"}
                        </span>
                        <span>{lang === "id" ? meta.category.id : meta.category.en}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Info Panel Sidebar (Moves below on mobile/tablet) */}
        {selectedTemplate && (
          <div className="w-full lg:w-96 shrink-0 card p-5 space-y-5 shadow-lg lg:sticky lg:top-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between border-b border-ink-100 pb-3">
              <h2 className="font-extrabold text-ink-900 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-brand-600" />
                {lang === "id" ? "Detail Spesifikasi Desain" : "Design Specification Details"}
              </h2>
              <button
                onClick={() => setSelectedId(null)}
                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-600 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Micro Preview with hover state */}
            <div className="relative aspect-[1122/794] rounded-xl overflow-hidden bg-ink-50 border border-ink-100 shadow-inner group">
              <Image
                src={selectedTemplate.fileUrl}
                alt={selectedTemplate.name}
                fill
                className="object-contain p-3"
              />
              <button
                onClick={() => setPreviewTemplate(selectedTemplate)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs font-bold gap-2 transition-all cursor-pointer backdrop-blur-[2px]"
              >
                <Plus className="w-5 h-5 bg-white/20 p-1 rounded-full text-white" />
                {lang === "id" ? "Buka Pratinjau Penuh" : "Open Full Preview"}
              </button>
            </div>

            {/* Properties details */}
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                  {t("dashboard.templates.nameLabel")}
                </span>
                <span className="font-extrabold text-ink-900 text-base">{selectedTemplate.name}</span>
              </div>

              {/* Grid 2 column specs */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-ink-100">
                <div>
                  <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                    {lang === "id" ? "Ukuran Dimensi" : "Dimension Size"}
                  </span>
                  <span className="font-bold text-ink-800 text-xs">
                    {selectedTemplate.width ?? 1122} × {selectedTemplate.height ?? 794} px
                  </span>
                </div>
                <div>
                  <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                    {lang === "id" ? "Orientasi Kanvas" : "Canvas Orientation"}
                  </span>
                  <span className="font-bold text-ink-800 text-xs flex items-center gap-1.5">
                    <Layout className="w-4 h-4 text-brand-600" />
                    {getOrientationLabel(selectedTemplate)}
                  </span>
                </div>
              </div>

              {/* Formats and Version */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-ink-100">
                <div>
                  <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                    {lang === "id" ? "Tingkat Versi" : "Layout Version"}
                  </span>
                  <span className="font-bold text-ink-800 text-xs">
                    {getMeta(selectedTemplate.fileUrl).category.en === "Custom" ? "v1.0" : "v1.1"}
                  </span>
                </div>
                <div>
                  <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                    {lang === "id" ? "Format File" : "File Extension"}
                  </span>
                  <span className="font-bold text-ink-800 text-xs flex items-center gap-1">
                    <FileCode className="w-4 h-4 text-emerald-600" />
                    SVG Vector
                  </span>
                </div>
              </div>

              {/* Recommended Events */}
              <div className="pt-3 border-t border-ink-100">
                <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                  {lang === "id" ? "Direkomendasikan Untuk" : "Recommended For"}
                </span>
                <span className="font-semibold text-ink-800 text-xs">
                  {lang === "id" ? getMeta(selectedTemplate.fileUrl).usage.id : getMeta(selectedTemplate.fileUrl).usage.en}
                </span>
              </div>

              {/* Date Information */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-ink-100">
                <div>
                  <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                    {lang === "id" ? "Dibuat Pada" : "Created At"}
                  </span>
                  <span className="font-semibold text-ink-700 text-[11px] flex items-center gap-1">
                    <CalendarBlank className="w-3.5 h-3.5 text-ink-400" />
                    {new Date(selectedTemplate.createdAt).toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block mb-1">
                    {lang === "id" ? "Kompatibilitas" : "Browser Compatibility"}
                  </span>
                  <span className="font-semibold text-ink-700 text-[11px] flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5 text-brand-600" />
                    HTML5, Chrome, Safari
                  </span>
                </div>
              </div>

              {/* Export Formats Badge */}
              <div className="pt-3 border-t border-ink-100 space-y-2">
                <span className="text-ink-400 font-bold uppercase tracking-wider text-[9px] block">
                  {lang === "id" ? "Format Ekspor yang Didukung" : "Supported Export Formats"}
                </span>
                <div className="flex gap-1.5 flex-wrap">
                  {["PDF Vector", "High-Res PNG", "ZIP Archive", "Original SVG"].map(f => (
                    <span
                      key={f}
                      className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-[9px] uppercase tracking-wide flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" weight="fill" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons in Info Panel */}
            <div className="pt-3 border-t border-ink-100 space-y-2.5">
              <button
                onClick={() => {
                  const meta = getMeta(selectedTemplate.fileUrl);
                  if (userPlan === "FREE" && meta.badge === "premium") {
                    setUpgradeOpen(true);
                    return;
                  }
                  updateActiveTemplate(selectedTemplate.id);
                  // Redirect to certificate generator
                  window.location.href = "/dashboard/generator";
                }}
                className="btn-primary w-full justify-center !py-3 text-xs font-extrabold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle className="w-4 h-4" />
                {lang === "id" ? "Gunakan Sebagai Template Aktif" : "Use As Active Template"}
              </button>
              
              <button
                onClick={() => {
                  const meta = getMeta(selectedTemplate.fileUrl);
                  if (userPlan === "FREE" && meta.badge === "premium") {
                    setUpgradeOpen(true);
                    return;
                  }
                  updateActiveTemplate(selectedTemplate.id);
                  window.location.href = `/dashboard/templates/${selectedTemplate.id}`;
                }}
                className="btn-secondary w-full justify-center !py-3 text-xs font-extrabold border border-ink-200 hover:bg-ink-50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sliders className="w-4 h-4 text-ink-600" />
                {lang === "id" ? "Buka Kanvas Editor" : "Open Layout Editor"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Preview Modal ── */}
      <PreviewModal
        template={previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />

      {/* ── Upload Modal ── */}
      {showUploadModal && (
        <div
          onClick={() => setShowUploadModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-bg-card border border-ink-150 rounded-2xl shadow-soft overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
              <h2 className="text-lg font-bold text-ink-900">{lang === "id" ? "Upload Template Baru" : "Upload New Template"}</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setTemplateName("");
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  setFormError("");
                }}
                className="p-1.5 rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                  <Warning weight="fill" className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {t("dashboard.templates.nameLabel")} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder={lang === "id" ? "Contoh: Sertifikat Webinar UI/UX" : "Example: UI/UX Webinar Certificate"}
                  className="input-field animate-none"
                />
              </div>

              {/* Event Link Field */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {lang === "id" ? "Hubungkan dengan Event" : "Connect with Event"}
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="input-field cursor-pointer"
                >
                  <option value="">{lang === "id" ? "— Opsional (Dapat dihubungkan nanti) —" : "— Optional (Can link later) —"}</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* File Upload Field */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  {lang === "id" ? "File Gambar Template" : "Template Image File"} <span className="text-rose-500">*</span>
                </label>

                {previewUrl ? (
                  <div className="relative aspect-[16/11] w-full rounded-xl overflow-hidden border border-ink-200 bg-ink-50">
                    <Image
                      src={previewUrl}
                      alt="Preview template"
                      fill
                      className="object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-ink-200 rounded-xl p-6 text-center hover:border-brand-400 hover:bg-brand-50/20 transition-all cursor-pointer"
                  >
                    <UploadSimple className="w-8 h-8 text-ink-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-ink-700">
                      {lang === "id" ? "Klik untuk memilih file gambar" : "Click to select image file"}
                    </p>
                    <p className="text-xs text-ink-400 mt-1">
                      {lang === "id" ? "PNG atau JPG (Disarankan resolusi lanskap A4)" : "PNG or JPG (A4 Landscape resolution recommended)"}
                    </p>
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary cursor-pointer"
                  disabled={isPending}
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  className="btn-primary cursor-pointer"
                  disabled={isPending || !templateName || !selectedFile}
                >
                  {isPending ? (
                    <>
                      <CircleNotch className="w-4 h-4 animate-spin" />
                      {lang === "id" ? "Mengunggah..." : "Uploading..."}
                    </>
                  ) : (
                    lang === "id" ? "Simpan Template" : "Save Template"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UpgradeModal
        isOpen={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        currentPlan={userPlan}
      />
    </div>
  );
}
