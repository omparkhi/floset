import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  CheckCircle2,
  RefreshCw,
  ChevronRight,
  LayoutList,
  Package,
  Truck,
  LogIn,
  Clock,
  XCircle,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Search,
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Store,
  User,
  Mail,
  CreditCard,
  Tag,
  Eye,
  Layers,
  ShieldCheck,
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardShell, { DashboardStat, DashboardPanel } from '../components/layout/DashboardShell';

export default function AdminDashboardPage({ onNavigate, onOpenAuth }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('approvals'); // 'approvals', 'orders', 'inventory'

  const [pendingListings, setPendingListings] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search queries for tabs
  const [ordersSearch, setOrdersSearch] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');

  // Approval workspace state
  const [selectedPending, setSelectedPending] = useState(null);
  const [pricingInput, setPricingInput] = useState({
    name: '',
    category: 'Lehengas',
    subcategory: '',
    gender: 'Women',
    size: 'M',
    availableSizes: ['M'],
    colour: '',
    condition: 'Like New',
    brand: 'Boutique Collection',
    description: '',
    badge: 'Curated',
    isFeatured: false,
    isBestSeller: false,
    duration3h: '',
    duration1d: '',
    duration3d: '',
    duration5d: '',
    duration7d: '',
    securityDeposit: '',
    adminNotes: ''
  });

  const [activeReviewImg, setActiveReviewImg] = useState(0);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    if (!user || user.role !== 'admin') return;
    setLoading(true);
    try {
      const [pendingRes, productsRes, bookingsRes, statsRes] = await Promise.all([
        api.admin.getPendingListings(),
        api.admin.getAllProducts(),
        api.admin.getAllBookings(),
        api.admin.getStats()
      ]);

      setPendingListings(pendingRes.listings || []);
      setAllProducts(productsRes.products || []);
      setAllBookings(bookingsRes.bookings || []);
      setStats(statsRes.stats || null);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setPendingListings([]);
      setAllProducts([]);
      setAllBookings([]);
      setStats(null);
      return;
    }
    if (user.role !== 'admin') {
      setLoading(false);
      return;
    }
    fetchAdminData();
  }, [user, fetchAdminData]);

  const handleOpenApproveModal = (listing) => {
    setSelectedPending(listing);
    setActiveReviewImg(0);
    const expected = listing.ownerExpectedEarning || 800;
    const initialSizes = listing.availableSizes?.length
      ? listing.availableSizes
      : (listing.size ? [listing.size] : ['M']);

    setPricingInput({
      name: listing.name || '',
      category: listing.category || 'Lehengas',
      subcategory: listing.subcategory || '',
      gender: listing.gender || 'Women',
      size: initialSizes[0] || 'M',
      availableSizes: initialSizes,
      colour: listing.colour || '',
      condition: listing.condition || 'Like New',
      brand: listing.brand || 'Boutique Collection',
      description: listing.description || '',
      badge: listing.badge || 'Curated',
      isFeatured: listing.isFeatured || false,
      isBestSeller: listing.isBestSeller || false,
      duration3h: Math.round(expected * 0.9),
      duration1d: Math.round(expected * 1.3),
      duration3d: Math.round(expected * 1.8),
      duration5d: Math.round(expected * 2.4),
      duration7d: Math.round(expected * 3.0),
      securityDeposit: Math.round(expected * 2.0),
      adminNotes: 'Approved after verification of stitching and pristine fabric quality.'
    });
  };

  const applyMarkupPreset = (multiplier) => {
    const expected = selectedPending?.ownerExpectedEarning || 800;
    setPricingInput(prev => ({
      ...prev,
      duration3h: Math.round(expected * 0.5 * multiplier),
      duration1d: Math.round(expected * 0.75 * multiplier),
      duration3d: Math.round(expected * 1.0 * multiplier),
      duration5d: Math.round(expected * 1.35 * multiplier),
      duration7d: Math.round(expected * 1.7 * multiplier),
      securityDeposit: Math.round(expected * 1.2)
    }));
  };

  const handleConfirmApproval = async () => {
    if (!selectedPending) return;
    setReviewActionLoading(true);
    try {
      await api.admin.approveListing(selectedPending._id, {
        name: pricingInput.name,
        category: pricingInput.category,
        subcategory: pricingInput.subcategory,
        gender: pricingInput.gender,
        size: pricingInput.size,
        availableSizes: pricingInput.availableSizes?.length ? pricingInput.availableSizes : [pricingInput.size || 'M'],
        colour: pricingInput.colour,
        condition: pricingInput.condition,
        brand: pricingInput.brand,
        description: pricingInput.description,
        badge: pricingInput.badge,
        isFeatured: Boolean(pricingInput.isFeatured),
        isBestSeller: Boolean(pricingInput.isBestSeller),
        pricing: {
          duration3h: Number(pricingInput.duration3h),
          duration1d: Number(pricingInput.duration1d),
          duration3d: Number(pricingInput.duration3d),
          duration5d: Number(pricingInput.duration5d),
          duration7d: Number(pricingInput.duration7d)
        },
        securityDeposit: Number(pricingInput.securityDeposit),
        adminNotes: pricingInput.adminNotes
      });
      setSelectedPending(null);
      await fetchAdminData();
    } catch (err) {
      alert(err.message || 'Approval failed');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleRejectListing = async (listingId) => {
    const notes = prompt('Enter rejection reason for host:', 'Fabric condition does not meet FLOSET luxury standards.');
    if (!notes) return;

    try {
      await api.admin.rejectListing(listingId, { adminNotes: notes });
      await fetchAdminData();
    } catch (err) {
      alert(err.message || 'Rejection failed');
    }
  };

  const workflowOrder = [
    'BOOKING_CONFIRMED',
    'SECURED_OUTFIT',
    'PICKUP_FROM_HOST',
    'PHYSICAL_INSPECTION',
    'CLEANING_SANITIZATION',
    'STEAM_IRON',
    'QUALITY_CHECKED',
    'PACKAGED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'IN_USE',
    'RETURN_PICKUP_SCHEDULED',
    'RETURN_INSPECTED',
    'DEPOSIT_REFUNDED',
    'COMPLETED'
  ];

  const getNextStatus = (currentStatus) => {
    const currentIndex = workflowOrder.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= workflowOrder.length - 1) return null;
    return workflowOrder[currentIndex + 1];
  };

  const handleAdvanceOrderStatus = async (bookingId, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) {
      alert('Order is already in final completed status.');
      return;
    }

    try {
      await api.admin.updateBookingStatus(bookingId, {
        orderStatus: nextStatus,
        note: `Admin advanced status to ${nextStatus}`,
        depositStatus: nextStatus === 'DEPOSIT_REFUNDED' || nextStatus === 'COMPLETED' ? 'FULLY_REFUNDED' : undefined
      });
      await fetchAdminData();
    } catch (err) {
      alert(err.message || 'Status update failed');
    }
  };

  const tabNav = [
    { id: 'approvals', label: 'Listing Approvals', icon: LayoutList, count: pendingListings.length },
    { id: 'orders', label: 'Rental Workflow', icon: Truck, count: allBookings.length },
    { id: 'inventory', label: 'Platform Inventory', icon: Package, count: allProducts.length }
  ];

  // Filtering for orders
  const filteredBookings = allBookings.filter((b) => {
    if (!ordersSearch.trim()) return true;
    const q = ordersSearch.toLowerCase();
    return (
      b.bookingId?.toLowerCase().includes(q) ||
      b.productId?.name?.toLowerCase().includes(q) ||
      b.customerId?.name?.toLowerCase().includes(q) ||
      b.deliveryAddress?.name?.toLowerCase().includes(q) ||
      b.orderStatus?.toLowerCase().includes(q)
    );
  });

  // Filtering for inventory
  const filteredProducts = allProducts.filter((p) => {
    if (!inventorySearch.trim()) return true;
    const q = inventorySearch.toLowerCase();
    return (
      p.productId?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.sourceType?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  });

  if (!user) {
    return (
      <DashboardShell
        badge="Admin"
        badgeIcon={Shield}
        title="Operations Center"
        subtitle="Sign in with an administrator account to manage curation, bookings, and inventory."
      >
        <div className="max-w-md mx-auto text-center py-16 px-6 rounded-3xl border border-black/10 bg-white shadow-framer-sm">
          <Shield className="w-12 h-12 text-noir/30 mx-auto mb-4" />
          <h2 className="font-display text-xl font-bold text-noir">Administrator Sign In</h2>
          <p className="text-xs text-ash mt-1 mb-6">You must be logged in as an administrator to access the operations portal.</p>
          <button
            type="button"
            onClick={onOpenAuth}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-noir text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-obsidian transition-colors shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Admin Portal</span>
          </button>
        </div>
      </DashboardShell>
    );
  }

  if (user.role !== 'admin') {
    return (
      <DashboardShell
        badge="Admin"
        badgeIcon={Shield}
        title="Access Restricted"
        subtitle="This area is strictly reserved for FLOSET platform administrators."
      >
        <div className="max-w-md mx-auto text-center py-12 px-6 rounded-3xl border border-amber-200/80 bg-amber-50/50 shadow-framer-sm">
          <Shield className="w-10 h-10 text-amber-700 mx-auto mb-3" />
          <p className="text-sm text-noir font-bold">Signed in as {user.email}</p>
          <p className="text-xs text-ash mt-1 mb-6">Your account role ({user.role}) does not have admin permissions.</p>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="px-6 py-2.5 bg-noir text-white text-xs font-bold rounded-xl hover:bg-obsidian transition-colors"
          >
            Return to Storefront
          </button>
        </div>
      </DashboardShell>
    );
  }

  // If reviewing a pending listing, render dedicated solid full-page Curation Workspace (no modal/floating backdrop)
  if (selectedPending) {
    return (
      <div className="min-h-screen bg-white text-noir font-sans">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-black/10 px-4 sm:px-8 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedPending(null)}
                className="px-3.5 py-2 rounded-xl border border-black/10 hover:bg-neutral-100 text-noir transition-colors flex items-center gap-1.5 text-xs font-bold shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Curation Queue</span>
              </button>
              <div className="h-5 w-px bg-black/10 hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-noir px-2 py-0.5 rounded-md bg-sand border border-black/5">
                    {selectedPending.productId}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                    <Clock className="w-3 h-3 text-amber-600" />
                    Pending Quality & Pricing Curation
                  </span>
                </div>
                <h2 className="font-display text-base sm:text-lg font-black text-noir tracking-tight truncate max-w-md mt-0.5">
                  {selectedPending.name}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => handleRejectListing(selectedPending._id)}
                className="px-4 py-2.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Listing</span>
              </button>
              <button
                type="button"
                disabled={reviewActionLoading}
                onClick={handleConfirmApproval}
                className="px-6 py-2.5 bg-emeraldRent hover:bg-emerald-400 text-noir text-xs font-display font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                {reviewActionLoading ? (
                  <span>Publishing Live...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Approve & Publish Live</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Workspace (2 Columns) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Shopkeeper Dossier & Garment Specifications (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* 1. Shopkeeper & Boutique Partner Profile Card */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-noir text-emeraldRent flex items-center justify-center shadow-xs">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-extrabold text-noir">
                        Boutique Partner Profile
                      </h4>
                      <p className="text-[10px] text-ash uppercase font-bold tracking-wider">
                        Inventory Owner Dossier
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {selectedPending.sourceType || 'STORE'}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start justify-between">
                    <span className="text-ash font-medium">Boutique / Store:</span>
                    <span className="font-bold text-noir text-right">
                      {selectedPending.ownerId?.hostDetails?.businessName || selectedPending.brand || 'Boutique Partner'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-ash font-medium">Owner Name:</span>
                    <span className="font-bold text-noir text-right">
                      {selectedPending.ownerId?.name || 'Partner Account'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-ash font-medium">Email:</span>
                    <span className="font-medium text-noir text-right truncate max-w-[200px]">
                      {selectedPending.ownerId?.email || '—'}
                    </span>
                  </div>

                  <div className="flex items-start justify-between">
                    <span className="text-ash font-medium">Phone:</span>
                    <span className="font-bold text-noir text-right">
                      {selectedPending.ownerId?.phone || selectedPending.ownerPickupAddress?.contactPhone || '—'}
                    </span>
                  </div>

                  {/* Payout Details */}
                  <div className="pt-2 border-t border-black/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                      Payout Account Preferences
                    </span>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span className="font-mono text-xs font-bold text-noir truncate">
                        UPI: {selectedPending.ownerId?.hostDetails?.payoutUpi || 'Auto-settled via FLOSET UPI'}
                      </span>
                    </div>
                  </div>

                  {/* Pickup Location */}
                  <div className="pt-2 border-t border-black/5 space-y-1.5">
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                      Concierge Doorstep Pickup Location
                    </span>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5 flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-roseTag shrink-0 mt-0.5" />
                      <div className="text-xs text-noir">
                        <p className="font-semibold">
                          {selectedPending.ownerPickupAddress?.street || 'Storefront Pickup Window'}
                        </p>
                        <p className="text-[11px] text-ash">
                          {selectedPending.ownerPickupAddress?.city || 'Mumbai'}, {selectedPending.ownerPickupAddress?.state || 'Maharashtra'} - {selectedPending.ownerPickupAddress?.pincode || '400050'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Photo Gallery Preview */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <h4 className="font-display text-sm font-extrabold text-noir">
                    High-Resolution Garment Photos ({selectedPending.images?.length || 0})
                  </h4>
                  <span className="text-[10px] text-ash italic">Click thumbnail to preview</span>
                </div>

                {/* Main Selected Photo */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-100 border border-black/10 shadow-xs">
                  <img
                    src={selectedPending.images?.[activeReviewImg] || selectedPending.images?.[0]}
                    alt={selectedPending.name}
                    className="w-full h-full object-cover"
                  />
                  {activeReviewImg === 0 && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-md">
                      ★ Primary Cover Photo
                    </span>
                  )}
                </div>

                {/* Thumbnail Strip */}
                <div className="grid grid-cols-4 gap-2">
                  {selectedPending.images?.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveReviewImg(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                        activeReviewImg === idx
                          ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105'
                          : 'border-black/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Garment Technical Specifications & Sizing */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-sm space-y-4">
                <h4 className="font-display text-sm font-extrabold text-noir border-b border-black/5 pb-3">
                  Garment Specs & Tailoring Measurements
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                      Condition
                    </span>
                    <span className="font-bold text-noir mt-0.5 block">
                      {selectedPending.condition || 'Like New'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                      Gender / Category
                    </span>
                    <span className="font-bold text-noir mt-0.5 block">
                      {selectedPending.gender} · {selectedPending.category}
                    </span>
                  </div>
                </div>

                {/* Detailed Measurements */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-ash uppercase tracking-wider block mb-2">
                    Tailoring Sizing & Fit Measurements
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5">
                      <span className="text-[10px] text-ash block">Bust / Chest</span>
                      <span className="font-bold text-noir">
                        {selectedPending.measurements?.bustChest || '36 in'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5">
                      <span className="text-[10px] text-ash block">Waist</span>
                      <span className="font-bold text-noir">
                        {selectedPending.measurements?.waist || '30 in'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5">
                      <span className="text-[10px] text-ash block">Hips</span>
                      <span className="font-bold text-noir">
                        {selectedPending.measurements?.hips || '40 in'}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5">
                      <span className="text-[10px] text-ash block">Length</span>
                      <span className="font-bold text-noir">
                        {selectedPending.measurements?.length || '43 in'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Occasions */}
                {selectedPending.occasions?.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wider block mb-1.5">
                      Tagged Occasions
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPending.occasions.map((occ, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-neutral-100 border border-black/5 text-noir text-[11px] font-semibold">
                          {occ}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                  {/* Declared Available Sizes */}
                  <div className="pt-2 border-t border-black/5">
                    <span className="text-[10px] font-bold text-ash uppercase tracking-wider block mb-1.5">
                      Declared In-Stock Sizes (by Boutique)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(selectedPending.availableSizes?.length ? selectedPending.availableSizes : [selectedPending.size || 'M']).map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Curation, Attributes Editor & Live Pricing Engine (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* 4. Partner Financial Terms Summary */}
                <div className="bg-noir text-white rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-emeraldRent bg-white/10 px-2.5 py-0.5 rounded-full mb-2">
                      <DollarSign className="w-3.5 h-3.5" />
                      Shopkeeper Quoted Revenue
                    </span>
                    <h3 className="font-display text-2xl font-extrabold">
                      ₹{selectedPending.ownerExpectedEarning?.toLocaleString() || '0'}{' '}
                      <span className="text-xs text-white/70 font-normal">/ 3-day rental</span>
                    </h3>
                    <p className="text-xs text-white/60 mt-0.5">
                      Extra day charge: ₹{selectedPending.additionalDayCharge || 200}/day · Preferred duration: 3 Days
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-white/10 border border-white/10 text-right shrink-0">
                    <span className="text-[10px] text-white/60 uppercase block">Projected Deposit</span>
                    <span className="font-display text-lg font-bold text-roseTag">
                      ₹{(selectedPending.ownerExpectedEarning * 1.5).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 5. Editable Catalog Attributes */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/10 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b border-black/5 pb-3">
                    <h4 className="font-display text-base font-extrabold text-noir">
                      Storefront Catalog Attributes
                    </h4>
                    <span className="text-[11px] text-ash font-medium">Editable by Fashion Curator</span>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1.5">
                        Garment Title / Catalog Headline *
                      </label>
                      <input
                        type="text"
                        value={pricingInput.name}
                        onChange={(e) => setPricingInput({ ...pricingInput, name: e.target.value })}
                        className="w-full px-4 py-2.5 bg-neutral-50 border border-black/15 rounded-xl font-bold text-sm text-noir focus:outline-none focus:border-noir shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                          Category *
                        </label>
                        <select
                          value={pricingInput.category}
                          onChange={(e) => setPricingInput({ ...pricingInput, category: e.target.value })}
                          className="w-full px-3 py-2.5 bg-neutral-50 border border-black/15 rounded-xl font-semibold text-noir focus:outline-none"
                        >
                          {['Lehengas', 'Sarees', 'Gowns', 'Dresses', 'Indo-Western', 'Sherwanis', 'Kurta Sets', 'Suits', 'Blazers'].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                          Catalog Badge Tag
                        </label>
                        <input
                          type="text"
                          value={pricingInput.badge}
                          onChange={(e) => setPricingInput({ ...pricingInput, badge: e.target.value })}
                          placeholder="E.g. Curated, New Arrival"
                          className="w-full px-3 py-2.5 bg-neutral-50 border border-black/15 rounded-xl font-semibold text-noir focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Available Sizes Multi-Selector for Storefront */}
                    <div className="p-3.5 rounded-2xl bg-neutral-50 border border-black/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-noir uppercase tracking-wider">
                          Active Storefront Sizes (Customers can select these) *
                        </label>
                        <span className="text-[10px] text-emerald-800 font-bold">
                          {(pricingInput.availableSizes || []).join(', ') || 'None'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => {
                          const isSelected = (pricingInput.availableSizes || []).includes(sz);
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => {
                                const current = pricingInput.availableSizes || [];
                                let next;
                                if (current.includes(sz)) {
                                  if (current.length === 1) return;
                                  next = current.filter((s) => s !== sz);
                                } else {
                                  next = [...current, sz];
                                }
                                setPricingInput({
                                  ...pricingInput,
                                  availableSizes: next,
                                  size: next[0] || 'M'
                                });
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                                isSelected
                                  ? 'bg-noir text-white shadow-xs ring-2 ring-emerald-500/40'
                                  : 'bg-white text-ash border border-black/10 hover:text-noir'
                              }`}
                            >
                              <span>{sz}</span>
                              {isSelected && <span className="text-[10px] text-emeraldRent">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                        Colour / Hue *
                      </label>
                      <input
                        type="text"
                        value={pricingInput.colour}
                        onChange={(e) => setPricingInput({ ...pricingInput, colour: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 rounded-xl font-medium text-noir focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                        Brand / Designer Tag
                      </label>
                      <input
                        type="text"
                        value={pricingInput.brand}
                        onChange={(e) => setPricingInput({ ...pricingInput, brand: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 rounded-xl font-medium text-noir focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                      Editorial Product Description
                    </label>
                    <textarea
                      rows={3}
                      value={pricingInput.description}
                      onChange={(e) => setPricingInput({ ...pricingInput, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 rounded-xl text-noir focus:outline-none focus:border-noir leading-relaxed"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Consumer Rental Pricing Engine & Revenue Breakdown */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/10 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
                  <div>
                    <h4 className="font-display text-base font-extrabold text-noir">
                      Consumer Rental Pricing Engine
                    </h4>
                    <p className="text-xs text-ash">
                      Set customer rental pricing tiers and refundable security deposit.
                    </p>
                  </div>

                  {/* Auto-Markup Presets */}
                  <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => applyMarkupPreset(1.5)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-white transition-colors"
                    >
                      +50% Standard
                    </button>
                    <button
                      type="button"
                      onClick={() => applyMarkupPreset(1.8)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-noir shadow-xs"
                    >
                      +80% Premium
                    </button>
                    <button
                      type="button"
                      onClick={() => applyMarkupPreset(2.0)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-white transition-colors"
                    >
                      +100% (2x)
                    </button>
                  </div>
                </div>

                {/* Pricing Tiers Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-neutral-50 border border-black/10">
                    <span className="text-[10px] font-bold text-ash uppercase block">3 Hours Express</span>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 font-bold text-noir/40">₹</span>
                      <input
                        type="number"
                        value={pricingInput.duration3h}
                        onChange={(e) => setPricingInput({ ...pricingInput, duration3h: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 rounded-xl font-extrabold text-noir focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-50 border border-black/10">
                    <span className="text-[10px] font-bold text-ash uppercase block">1 Day Rental</span>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 font-bold text-noir/40">₹</span>
                      <input
                        type="number"
                        value={pricingInput.duration1d}
                        onChange={(e) => setPricingInput({ ...pricingInput, duration1d: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 rounded-xl font-extrabold text-noir focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-300">
                    <span className="text-[10px] font-extrabold text-emerald-900 uppercase block">
                      ★ 3 Days (Hero Tier)
                    </span>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 font-bold text-emerald-900/60">₹</span>
                      <input
                        type="number"
                        value={pricingInput.duration3d}
                        onChange={(e) => setPricingInput({ ...pricingInput, duration3d: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-emerald-400 rounded-xl font-extrabold text-emerald-950 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-50 border border-black/10">
                    <span className="text-[10px] font-bold text-ash uppercase block">5 Days Extended</span>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 font-bold text-noir/40">₹</span>
                      <input
                        type="number"
                        value={pricingInput.duration5d}
                        onChange={(e) => setPricingInput({ ...pricingInput, duration5d: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 rounded-xl font-extrabold text-noir focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-neutral-50 border border-black/10">
                    <span className="text-[10px] font-bold text-ash uppercase block">7 Days Week-long</span>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 font-bold text-noir/40">₹</span>
                      <input
                        type="number"
                        value={pricingInput.duration7d}
                        onChange={(e) => setPricingInput({ ...pricingInput, duration7d: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-black/10 rounded-xl font-extrabold text-noir focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-roseTag/10 border border-roseTag/30">
                    <span className="text-[10px] font-extrabold text-roseTag uppercase block">
                      Refundable Deposit
                    </span>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-2.5 font-bold text-roseTag/60">₹</span>
                      <input
                        type="number"
                        value={pricingInput.securityDeposit}
                        onChange={(e) => setPricingInput({ ...pricingInput, securityDeposit: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 bg-white border border-roseTag/40 rounded-xl font-extrabold text-noir focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown Card */}
                <div className="p-4 rounded-2xl bg-neutral-50 border border-black/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-noir">3-Day Rental Yield Split</span>
                    <p className="text-[11px] text-ash">
                      Customer pays ₹{pricingInput.duration3d || 0} → Shopkeeper gets ₹{selectedPending.ownerExpectedEarning || 0}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 font-display text-sm font-black text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-black/5 shadow-xs">
                    <span>FLOSET Platform Margin:</span>
                    <span>
                      +₹{Math.max(0, (Number(pricingInput.duration3d) || 0) - (Number(selectedPending.ownerExpectedEarning) || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* 7. Admin QC & Curation Review Notes */}
              <div className="bg-white rounded-3xl p-5 sm:p-7 border border-black/10 shadow-sm space-y-3 text-xs">
                <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider">
                  Admin QC Quality Control & Curation Audit Notes
                </label>
                <textarea
                  rows={2}
                  value={pricingInput.adminNotes}
                  onChange={(e) => setPricingInput({ ...pricingInput, adminNotes: e.target.value })}
                  placeholder="Provide curation remarks, garment physical quality notes, or dry-cleaning guidelines..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-black/15 rounded-xl text-noir focus:outline-none focus:border-noir leading-relaxed"
                />
              </div>

              {/* Bottom Action Strip */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPending(null)}
                  className="w-full sm:w-auto px-6 py-3 border border-black/15 text-ash hover:text-noir text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel / Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleRejectListing(selectedPending._id)}
                  className="w-full sm:w-auto px-6 py-3 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold rounded-xl transition-colors"
                >
                  Reject with Feedback
                </button>
                <button
                  type="button"
                  disabled={reviewActionLoading}
                  onClick={handleConfirmApproval}
                  className="w-full sm:w-auto px-8 py-3.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {reviewActionLoading ? (
                    <span>Publishing Live to Catalog...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-emeraldRent" />
                      <span>Approve & Publish Live to Storefront</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <DashboardShell
      badge="Admin Operations"
      badgeIcon={Shield}
      title="Platform Operations & Curation"
      subtitle="Verify host listings, set customer pricing tiers, and advance rental orders through the full quality lifecycle."
      actions={
        <button
          type="button"
          onClick={fetchAdminData}
          disabled={loading}
          className="px-4 py-2.5 border border-black/10 bg-white rounded-xl text-xs font-bold text-noir hover:bg-cream flex items-center gap-2 disabled:opacity-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      }
    >
      {/* Stats Summary - Responsive Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <DashboardStat
            label="Live Outfits"
            value={stats.approvedProducts}
            hint={`${stats.pendingListings} awaiting review`}
            icon={Package}
            accent="success"
          />
          <DashboardStat
            label="Total Rentals"
            value={stats.totalBookings}
            hint={`${stats.activeBookings} active in transit/use`}
            icon={Truck}
          />
          <DashboardStat
            label="Rental Volume"
            value={`₹${stats.totalRevenue?.toLocaleString()}`}
            hint="Total booking value"
            icon={CheckCircle2}
            accent="success"
          />
          <DashboardStat
            label="Security Deposits"
            value={`₹${stats.totalDepositsHeld?.toLocaleString()}`}
            hint="Held until return QC"
            icon={Shield}
          />
        </div>
      )}

      {/* Main Tab Layout */}
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
        {/* Mobile & Desktop Tab Navigator */}
        <nav className="lg:w-60 shrink-0 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {tabNav.map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center justify-between gap-2.5 px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all whitespace-nowrap shrink-0 lg:shrink ${
                activeTab === id
                  ? 'bg-noir text-white shadow-md'
                  : 'bg-white border border-black/[0.08] text-noir/70 hover:text-noir hover:bg-cream/40'
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </span>
              {count > 0 && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    activeTab === id ? 'bg-white/20 text-white' : 'bg-cream text-noir/80'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          {/* TAB 1: PENDING APPROVALS */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-bold text-noir">Curation Queue</h2>
                  <p className="text-xs text-ash">Verify submitted garments, check authenticity & set consumer pricing.</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cream text-noir/80 border border-black/5">
                  {pendingListings.length} pending
                </span>
              </div>

              {pendingListings.length === 0 ? (
                <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-black/10 shadow-framer-sm">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-base font-bold text-noir">Curation Queue is Clear</h3>
                  <p className="text-xs text-ash mt-1 max-w-sm mx-auto">
                    All submitted host garments have been reviewed and priced. New listings will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {pendingListings.map((listing) => (
                    <div
                      key={listing._id}
                      className="bg-white p-4 sm:p-6 rounded-3xl border border-black/10 shadow-framer-sm flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Mobile & Desktop Header */}
                        <div className="flex items-start gap-3 sm:gap-4">
                          <img
                            src={listing.images?.[0]}
                            alt={listing.name}
                            className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-2xl bg-sand shrink-0 border border-black/5"
                          />
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-black text-ash">
                                {listing.productId}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                                PENDING REVIEW
                              </span>
                            </div>
                            <h3 className="font-display text-sm sm:text-base font-bold text-noir leading-tight truncate">
                              {listing.name}
                            </h3>
                            <p className="text-xs text-ash">
                              {listing.category} · Size {listing.size} · {listing.colour}
                            </p>
                            <p className="text-[11px] text-noir/70 line-clamp-2 pt-0.5">
                              {listing.description}
                            </p>
                          </div>
                        </div>

                        {/* Confidential Internal Host Specs */}
                        <div className="p-3 bg-cream/50 rounded-2xl border border-black/5 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-ash">Host Source:</span>
                            <span className="font-bold text-noir">{listing.sourceType} ({listing.ownerId?.name || 'Customer Host'})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ash">Owner Quote:</span>
                            <span className="font-bold text-emerald-800">₹{listing.ownerExpectedEarning} / 3 days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-ash">Pickup Location:</span>
                            <span className="text-noir font-medium">{listing.ownerPickupAddress?.city || 'Mumbai'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Mobile Full Width */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-black/5">
                        <button
                          type="button"
                          onClick={() => handleOpenApproveModal(listing)}
                          className="flex-1 py-3 bg-noir text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-obsidian transition-colors shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Set Prices & Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectListing(listing._id)}
                          className="py-3 px-4 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RENTAL WORKFLOW LIFECYCLE */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-noir">Rental Orders Lifecycle</h2>
                  <p className="text-xs text-ash">Track bookings through quality check, dry cleaning, delivery, and return.</p>
                </div>
                {/* Search */}
                <div className="relative sm:w-64">
                  <Search className="w-3.5 h-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search orders, clients..."
                    value={ordersSearch}
                    onChange={(e) => setOrdersSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-black/30"
                  />
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-black/10">
                  <p className="font-display text-sm font-bold text-noir">No rental bookings found</p>
                  <p className="text-xs text-ash mt-1">Bookings will appear here when customers checkout.</p>
                </div>
              ) : (
                <>
                  {/* MOBILE VIEW: Luxury Card Stream (sm:hidden) */}
                  <div className="block sm:hidden space-y-3">
                    {filteredBookings.map((b) => {
                      const next = getNextStatus(b.orderStatus);
                      return (
                        <div
                          key={b._id}
                          className="bg-white p-4 rounded-3xl border border-black/10 shadow-framer-sm space-y-3"
                        >
                          {/* Card Header: ID + Status */}
                          <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                            <div>
                              <span className="font-mono text-xs font-black text-noir">{b.bookingId}</span>
                              <span className="text-[10px] text-ash block">
                                {new Date(b.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              {b.orderStatus}
                            </span>
                          </div>

                          {/* Outfit & Dates */}
                          <div className="flex items-center gap-3">
                            <img
                              src={b.productId?.images?.[0]}
                              alt={b.productId?.name}
                              className="w-14 h-16 object-cover rounded-xl bg-sand shrink-0 border border-black/5"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="font-display text-xs font-bold text-noir truncate">
                                {b.productId?.name}
                              </h4>
                              <p className="text-[11px] text-ash">
                                Duration: <strong className="text-noir">{b.rentalDuration.replace('_', ' ')}</strong>
                              </p>
                              <p className="text-[10px] text-ash">
                                {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Customer & Address Snippet */}
                          <div className="p-2.5 bg-cream/40 rounded-xl text-[11px] space-y-1">
                            <div className="flex justify-between">
                              <span className="text-ash">Customer:</span>
                              <span className="font-bold text-noir">{b.customerId?.name || b.deliveryAddress?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-ash">Phone:</span>
                              <a
                                href={`tel:${b.customerId?.phone || b.deliveryAddress?.phone}`}
                                className="font-bold text-emerald-700 underline flex items-center gap-1"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                {b.customerId?.phone || b.deliveryAddress?.phone}
                              </a>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-ash">Delivery:</span>
                              <span className="text-noir truncate max-w-[180px]">{b.deliveryAddress?.city} ({b.deliveryAddress?.pincode})</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-black/5 font-bold">
                              <span>Total Paid:</span>
                              <span>₹{b.totalAmount} (Dep: ₹{b.securityDeposit})</span>
                            </div>
                          </div>

                          {/* Action Button: Advance Workflow */}
                          {next ? (
                            <button
                              type="button"
                              onClick={() => handleAdvanceOrderStatus(b._id, b.orderStatus)}
                              className="w-full py-3 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                            >
                              <span>Next: {next.replace(/_/g, ' ')}</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="text-center py-2 text-xs font-bold text-emerald-800 bg-emerald-50 rounded-xl">
                              ✓ Order Completed
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* DESKTOP VIEW: Data Table (hidden sm:block) */}
                  <div className="hidden sm:block bg-white rounded-3xl border border-black/10 shadow-framer-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-sand/40 text-ash text-[10px] font-bold uppercase tracking-wider border-b border-black/5">
                          <tr>
                            <th className="p-4">Booking & Outfit</th>
                            <th className="p-4">Customer & Phone</th>
                            <th className="p-4">Dates & Duration</th>
                            <th className="p-4">Paid & Deposit</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {filteredBookings.map((b) => (
                            <tr key={b._id} className="hover:bg-cream/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={b.productId?.images?.[0]}
                                    alt={b.productId?.name}
                                    className="w-12 h-14 object-cover rounded-xl bg-sand shrink-0 border border-black/5"
                                  />
                                  <div>
                                    <span className="font-mono text-xs font-bold text-noir block">{b.bookingId}</span>
                                    <span className="text-ash font-medium block truncate max-w-[140px]">{b.productId?.name}</span>
                                    <span className="text-[10px] text-emerald-800 font-bold">{b.productId?.category}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-noir block">{b.customerId?.name || b.deliveryAddress?.name}</span>
                                <span className="text-ash text-[10px] block">{b.customerId?.phone || b.deliveryAddress?.phone}</span>
                                <span className="text-ash text-[10px] block truncate max-w-[140px]">{b.deliveryAddress?.street}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-noir">{b.rentalDuration.replace('_', ' ')}</span>
                                <div className="text-[10px] text-ash">
                                  {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-noir">₹{b.totalAmount}</span>
                                <div className="text-[10px] text-emerald-700 font-medium">Dep: ₹{b.securityDeposit} ({b.depositStatus})</div>
                              </td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900">
                                  {b.orderStatus}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {getNextStatus(b.orderStatus) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceOrderStatus(b._id, b.orderStatus)}
                                    className="px-3 py-1.5 bg-noir text-white text-[11px] font-bold rounded-lg hover:bg-obsidian transition-colors inline-flex items-center gap-1"
                                  >
                                    <span>Advance</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-800">Done</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: INVENTORY & CATALOGUE */}
          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg font-bold text-noir">Active Platform Catalogue</h2>
                  <p className="text-xs text-ash">Full inventory overview with internal host tags & customer prices.</p>
                </div>
                <div className="relative sm:w-64">
                  <Search className="w-3.5 h-3.5 text-ash absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search catalogue..."
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-black/30"
                  />
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-3xl border border-black/10">
                  <p className="font-bold text-noir text-sm">No products found</p>
                </div>
              ) : (
                <>
                  {/* MOBILE VIEW: Inventory Cards (sm:hidden) */}
                  <div className="block sm:hidden space-y-3">
                    {filteredProducts.map((p) => (
                      <div
                        key={p._id}
                        className="bg-white p-4 rounded-3xl border border-black/10 shadow-framer-sm space-y-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="w-16 h-20 object-cover rounded-xl bg-sand shrink-0 border border-black/5"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="font-mono text-[10px] font-black text-ash uppercase">{p.productId}</span>
                            <h4 className="font-display text-sm font-bold text-noir leading-snug truncate">
                              {p.name}
                            </h4>
                            <p className="text-xs text-ash mt-0.5">
                              {p.category} · Size {p.size}
                            </p>
                            <span className="inline-block mt-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-cream text-noir uppercase">
                              {p.sourceType || 'INDIVIDUAL'}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-black/5 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-[10px] text-ash block">Host Quote:</span>
                            <span className="font-bold text-noir">₹{p.ownerExpectedEarning || '—'}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-ash block">Customer 3-Day:</span>
                            <span className="font-bold text-emerald-800">₹{p.pricing?.duration3d?.toLocaleString() || '—'}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DESKTOP VIEW: Data Table (hidden sm:block) */}
                  <div className="hidden sm:block bg-white rounded-3xl border border-black/10 shadow-framer-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-sand/40 text-ash text-[10px] font-bold uppercase tracking-wider border-b border-black/5">
                          <tr>
                            <th className="p-4">Product ID & Name</th>
                            <th className="p-4">Category & Size</th>
                            <th className="p-4">Source Tag</th>
                            <th className="p-4">Owner Expected</th>
                            <th className="p-4">FLOSET 3-Day Price</th>
                            <th className="p-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {filteredProducts.map((p) => (
                            <tr key={p._id} className="hover:bg-cream/30 transition-colors">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.images?.[0]}
                                    alt={p.name}
                                    className="w-12 h-14 object-cover rounded-xl bg-sand shrink-0 border border-black/5"
                                  />
                                  <div>
                                    <span className="font-mono text-xs font-bold text-noir block">{p.productId}</span>
                                    <span className="text-noir font-bold block truncate max-w-[180px]">{p.name}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-noir">{p.category}</span>
                                <div className="text-[10px] text-ash">Size: {p.size} · {p.colour}</div>
                              </td>
                              <td className="p-4">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-cream text-noir/80 uppercase">
                                  {p.sourceType || 'INDIVIDUAL'}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-noir">
                                ₹{p.ownerExpectedEarning || '—'}
                              </td>
                              <td className="p-4 font-bold text-emerald-800">
                                ₹{p.pricing?.duration3d?.toLocaleString() || '—'}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                    p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {p.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
