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
  Image as ImageIcon,
  ExternalLink,
  MessageCircle,
  Check,
  FileText,
  ClipboardCheck,
  Zap
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

  // Dedicated Full-Page Workflow State
  const [selectedBookingWorkflow, setSelectedBookingWorkflow] = useState(null);
  const [workflowCustomNote, setWorkflowCustomNote] = useState('');
  const [workflowActionLoading, setWorkflowActionLoading] = useState(false);
  const [penaltyAmount, setPenaltyAmount] = useState('');
  const [penaltyReason, setPenaltyReason] = useState('');
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const WORKFLOW_STAGES = [
    {
      id: 'BOOKING_CONFIRMED',
      label: 'Order Confirmed',
      phase: 'Inbound Sourcing',
      desc: 'Customer payment verified and rental booking created.',
      icon: CheckCircle2,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'SECURED_OUTFIT',
      label: 'Outfit Secured',
      phase: 'Inbound Sourcing',
      desc: 'Outfit reserved from vault or boutique studio partner notified.',
      icon: Package,
      badgeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200'
    },
    {
      id: 'PICKUP_FROM_HOST',
      label: 'Boutique Collection',
      phase: 'Inbound Sourcing',
      desc: 'Concierge rider collected piece from partner boutique.',
      icon: Truck,
      badgeColor: 'bg-violet-50 text-violet-800 border-violet-200'
    },
    {
      id: 'PHYSICAL_INSPECTION',
      label: 'Inbound Inspection',
      phase: 'Inbound Sourcing',
      desc: 'Physical check for fabric integrity, beadwork, embroidery and seams.',
      icon: ClipboardCheck,
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    {
      id: 'CLEANING_SANITIZATION',
      label: 'Dry Clean & UV Sanitization',
      phase: 'Hygiene & Prep',
      desc: '5-step eco solvent dry cleaning and UV-C hospital-grade disinfection.',
      icon: Sparkles,
      badgeColor: 'bg-teal-50 text-teal-800 border-teal-200'
    },
    {
      id: 'STEAM_IRON',
      label: 'Steam Pressing',
      phase: 'Hygiene & Prep',
      desc: 'Vertical steam pressing for flawless silhouette and drape.',
      icon: ShieldCheck,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'QUALITY_CHECKED',
      label: 'Senior Stylist QC Passed',
      phase: 'Hygiene & Prep',
      desc: 'Final senior stylist sign-off and tamper-evident security tag attached.',
      icon: Check,
      badgeColor: 'bg-green-50 text-green-800 border-green-200'
    },
    {
      id: 'PACKAGED',
      label: 'Garment Bag Sealed',
      phase: 'Hygiene & Prep',
      desc: 'Vacuum sealed in breathable luxury FLOSET garment bag with matching hanger.',
      icon: Package,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'OUT_FOR_DELIVERY',
      label: 'Out For Delivery',
      phase: 'Outbound Logistics',
      desc: 'Dedicated FLOSET courier in transit to customer doorstep.',
      icon: Truck,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
    },
    {
      id: 'DELIVERED',
      label: 'Delivered to Customer',
      phase: 'Outbound Logistics',
      desc: 'Doorstep handoff completed and OTP/signature verified.',
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'IN_USE',
      label: 'Active Rental / In Use',
      phase: 'Customer Occasion',
      desc: 'Customer enjoying the outfit for their special occasion.',
      icon: Clock,
      badgeColor: 'bg-blue-50 text-blue-800 border-blue-200'
    },
    {
      id: 'RETURN_PICKUP_SCHEDULED',
      label: 'Return Pickup In Transit',
      phase: 'Reverse Logistics',
      desc: 'Courier collecting garment bag from customer address.',
      icon: Truck,
      badgeColor: 'bg-orange-50 text-orange-800 border-orange-200'
    },
    {
      id: 'RETURN_INSPECTED',
      label: 'Return QC Inspection',
      phase: 'Reverse Logistics',
      desc: 'Post-event inspection for stains, tears, zipper checks or damages.',
      icon: ClipboardCheck,
      badgeColor: 'bg-purple-50 text-purple-800 border-purple-200'
    },
    {
      id: 'DEPOSIT_REFUNDED',
      label: 'Security Deposit Settled',
      phase: 'Settlement',
      desc: 'Security deposit released back to customer payment method / UPI.',
      icon: DollarSign,
      badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200'
    },
    {
      id: 'COMPLETED',
      label: 'Order Completed',
      phase: 'Settlement',
      desc: 'Outfit sanitized, restored to vault / boutique and order archived.',
      icon: Shield,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    }
  ];

  const workflowOrder = WORKFLOW_STAGES.map(s => s.id);

  const getNextStatus = (currentStatus) => {
    const currentIndex = workflowOrder.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex >= workflowOrder.length - 1) return null;
    return workflowOrder[currentIndex + 1];
  };

  const handleAdvanceOrderStatus = async (bookingId, currentStatus, customNote, depositStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    if (!nextStatus) {
      alert('Order is already in final completed status.');
      return;
    }
    await handleUpdateWorkflowStatus(bookingId, nextStatus, customNote, depositStatus);
  };

  const handleUpdateWorkflowStatus = async (bookingId, targetStatus, customNote, depositStatus) => {
    setWorkflowActionLoading(true);
    try {
      const res = await api.admin.updateBookingStatus(bookingId, {
        orderStatus: targetStatus,
        note: customNote || `Admin updated status to ${targetStatus}`,
        depositStatus: depositStatus || (targetStatus === 'DEPOSIT_REFUNDED' || targetStatus === 'COMPLETED' ? 'FULLY_REFUNDED' : undefined)
      });
      await fetchAdminData();
      if (res.booking) {
        setSelectedBookingWorkflow(res.booking);
      } else {
        const fresh = allBookings.find(b => b._id === bookingId);
        if (fresh) {
          setSelectedBookingWorkflow({ ...fresh, orderStatus: targetStatus });
        }
      }
      setWorkflowCustomNote('');
    } catch (err) {
      alert(err.message || 'Status update failed');
    } finally {
      setWorkflowActionLoading(false);
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

  // DEDICATED FULL-PAGE RENTAL WORKFLOW & LIFECYCLE OPERATIONS HUB
  if (selectedBookingWorkflow) {
    const booking = selectedBookingWorkflow;
    const currentIdx = workflowOrder.indexOf(booking.orderStatus);
    const nextStatus = getNextStatus(booking.orderStatus);
    const currentStageObj = WORKFLOW_STAGES.find(s => s.id === booking.orderStatus) || WORKFLOW_STAGES[0];
    const nextStageObj = nextStatus ? WORKFLOW_STAGES.find(s => s.id === nextStatus) : null;
    const progressPercent = Math.round(((currentIdx + 1) / WORKFLOW_STAGES.length) * 100);

    const customerPhone = booking.customerId?.phone || booking.deliveryAddress?.phone || '';
    const customerName = booking.customerId?.name || booking.deliveryAddress?.name || 'Customer';
    const outfitName = booking.productId?.name || 'Rental Outfit';
    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`}?text=${encodeURIComponent(`Hello ${customerName}, this is FLOSET Concierge regarding your rental order #${booking.bookingId} (${outfitName}).`)}`;

    const fullAddress = [
      booking.deliveryAddress?.street,
      booking.deliveryAddress?.city,
      booking.deliveryAddress?.state,
      booking.deliveryAddress?.pincode
    ].filter(Boolean).join(', ');

    return (
      <div className="min-h-screen bg-sand/30 text-noir font-sans pb-16">
        {/* Top Header Command Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-black/10 px-4 sm:px-8 py-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedBookingWorkflow(null)}
                className="px-3.5 py-2 rounded-xl border border-black/10 hover:bg-neutral-100 text-noir transition-colors flex items-center gap-1.5 text-xs font-bold shadow-2xs cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Orders</span>
              </button>
              <div className="h-5 w-px bg-black/10 hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-noir tracking-tight">
                    Order #{booking.bookingId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider ${currentStageObj.badgeColor || 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}>
                    {booking.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="text-[11px] text-ash mt-0.5">
                  Placed on {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • Customer: <strong className="text-noir">{customerName}</strong>
                </p>
              </div>
            </div>

            {/* Fast Action Buttons in Header */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Customer</span>
              </a>
              {customerPhone && (
                <a
                  href={`tel:${customerPhone}`}
                  className="px-3.5 py-2 bg-white hover:bg-cream border border-black/10 text-noir rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Call</span>
                </a>
              )}
              {nextStatus && (
                <button
                  type="button"
                  disabled={workflowActionLoading}
                  onClick={() => handleAdvanceOrderStatus(booking._id, booking.orderStatus, workflowCustomNote)}
                  className="px-4 py-2 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Advance: {nextStageObj?.label || nextStatus.replace(/_/g, ' ')}</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          {/* Top Quick Status Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-framer-sm">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">Lifecycle Progress</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-2xl font-black text-noir">{progressPercent}%</span>
                <span className="text-[11px] text-ash font-medium">Stage {currentIdx + 1}/15</span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold block mt-1 truncate">{currentStageObj.phase}</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-framer-sm">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">Rental Window</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-lg font-black text-noir">{booking.rentalDuration.replace('_', ' ')}</span>
              </div>
              <span className="text-[10px] text-ash block mt-1">
                {new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-framer-sm">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">Security Deposit</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-2xl font-black text-noir">₹{booking.securityDeposit?.toLocaleString()}</span>
              </div>
              <span className={`text-[10px] font-bold block mt-1 ${booking.depositStatus === 'FULLY_REFUNDED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                Status: {booking.depositStatus}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-black/10 shadow-framer-sm">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">Total Amount Paid</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display text-2xl font-black text-noir">₹{booking.totalAmount?.toLocaleString()}</span>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                Payment: {booking.paymentStatus || 'PAID'}
              </span>
            </div>
          </div>

          {/* Interactive 15-Stage Lifecycle Stepper Deck */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-black/10 shadow-framer-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-noir">
                  15-Stage Master Rental Pipeline
                </h3>
                <p className="text-xs text-ash">
                  Interactive stage progression from reservation through 5-step UV sanitization, dispatch, return QC, and deposit settlement.
                </p>
              </div>
              <span className="px-3 py-1 bg-sand/60 text-noir rounded-full text-xs font-bold">
                Current: <strong className="text-noir">{currentStageObj.label}</strong>
              </span>
            </div>

            {/* Stepper Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {WORKFLOW_STAGES.map((stage, idx) => {
                const isPassed = idx < currentIdx;
                const isCurrent = idx === currentIdx;
                const isUpcoming = idx > currentIdx;
                const StageIcon = stage.icon;

                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      if (isCurrent) return;
                      if (window.confirm(`Override workflow stage directly to "${stage.label}"?`)) {
                        handleUpdateWorkflowStatus(booking._id, stage.id, `Admin jumped stage to ${stage.label}`);
                      }
                    }}
                    title={`Click to set stage to ${stage.label}`}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[125px] relative group cursor-pointer ${
                      isCurrent
                        ? 'bg-noir text-white border-noir shadow-lg ring-2 ring-emerald-400/40 scale-[1.02]'
                        : isPassed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70'
                        : 'bg-white hover:bg-cream/60 border-black/10 text-noir/70 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                          isCurrent
                            ? 'bg-white/20 text-white'
                            : isPassed
                            ? 'bg-emerald-200/80 text-emerald-900'
                            : 'bg-sand text-ash'
                        }`}>
                          #{idx + 1}
                        </span>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          isCurrent
                            ? 'bg-emerald-400 text-noir'
                            : isPassed
                            ? 'bg-emerald-600 text-white'
                            : 'bg-neutral-100 text-ash'
                        }`}>
                          {isPassed ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <StageIcon className="w-3.5 h-3.5" />
                          )}
                        </div>
                      </div>
                      <span className={`text-xs font-bold block leading-snug ${isCurrent ? 'text-white' : 'text-noir'}`}>
                        {stage.label}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-black/5 mt-2">
                      <span className={`text-[9px] font-semibold block uppercase tracking-wider truncate ${isCurrent ? 'text-neutral-300' : 'text-ash'}`}>
                        {stage.phase}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operations Center 2-Column Grid (Left: Actions & Logs, Right: Garment & Customer) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Operational Deck (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card 1: Stage Advancement Engine */}
              <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-framer-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <h4 className="font-display text-base font-bold text-noir">
                      Stage Action & Progression
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-ash uppercase">
                    Stage {currentIdx + 1} of 15
                  </span>
                </div>

                {/* Current vs Next */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-cream/50 border border-black/10 space-y-1">
                    <span className="text-[10px] font-bold text-ash uppercase">Current Active Stage</span>
                    <strong className="text-xs text-noir font-extrabold block">{currentStageObj.label}</strong>
                    <p className="text-[11px] text-ash leading-relaxed">{currentStageObj.desc}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Next Upcoming Stage</span>
                    <strong className="text-xs text-emerald-950 font-extrabold block">
                      {nextStageObj ? nextStageObj.label : 'Final Stage (Order Completed)'}
                    </strong>
                    <p className="text-[11px] text-emerald-900/80 leading-relaxed">
                      {nextStageObj ? nextStageObj.desc : 'All lifecycle and security deposit steps concluded.'}
                    </p>
                  </div>
                </div>

                {/* Note Input */}
                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1.5">
                    Internal Note / Dispatch Observation (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="E.g. Outfit sanitized, garment bag sealed with seal #4820, handed to courier..."
                    value={workflowCustomNote}
                    onChange={(e) => setWorkflowCustomNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream/30 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir leading-relaxed"
                  />
                </div>

                {/* Advance & Override Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  {nextStatus ? (
                    <button
                      type="button"
                      disabled={workflowActionLoading}
                      onClick={() => handleAdvanceOrderStatus(booking._id, booking.orderStatus, workflowCustomNote)}
                      className="w-full sm:flex-1 py-3.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>{workflowActionLoading ? 'Updating...' : `Confirm & Advance to ${nextStageObj?.label || nextStatus}`}</span>
                    </button>
                  ) : (
                    <div className="w-full py-3 bg-emerald-100 text-emerald-900 text-center font-bold text-xs rounded-xl">
                      ✓ Lifecycle Fully Completed
                    </div>
                  )}

                  {/* Direct Status Jump Selector */}
                  <div className="w-full sm:w-auto">
                    <select
                      value={booking.orderStatus}
                      onChange={(e) => {
                        if (e.target.value !== booking.orderStatus) {
                          handleUpdateWorkflowStatus(booking._id, e.target.value, workflowCustomNote || `Admin updated stage to ${e.target.value}`);
                        }
                      }}
                      className="w-full sm:w-auto px-3 py-3 bg-white border border-black/15 rounded-xl text-xs font-semibold text-noir focus:outline-none focus:border-noir cursor-pointer"
                    >
                      {WORKFLOW_STAGES.map((st) => (
                        <option key={st.id} value={st.id}>
                          Jump to: #{workflowOrder.indexOf(st.id) + 1} {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Card 2: Security Deposit Settlement */}
              <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-framer-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <h4 className="font-display text-base font-bold text-noir">
                      Return QC & Security Deposit Settlement
                    </h4>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    booking.depositStatus === 'FULLY_REFUNDED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {booking.depositStatus}
                  </span>
                </div>

                <div className="p-4 bg-sand/30 rounded-2xl border border-black/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-ash uppercase block">Escrow Deposit Amount</span>
                    <span className="font-display text-2xl font-black text-noir">₹{booking.securityDeposit?.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-ash uppercase block">Customer Payment Source</span>
                    <span className="text-xs font-semibold text-noir">UPI / Razorpay Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={workflowActionLoading || booking.depositStatus === 'FULLY_REFUNDED'}
                    onClick={() => {
                      if (window.confirm(`Release full security deposit refund of ₹${booking.securityDeposit} to customer?`)) {
                        handleUpdateWorkflowStatus(booking._id, booking.orderStatus, 'Full security deposit refund released to customer', 'FULLY_REFUNDED');
                      }
                    }}
                    className="py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{booking.depositStatus === 'FULLY_REFUNDED' ? 'Deposit Fully Refunded' : `Release 100% Refund (₹${booking.securityDeposit})`}</span>
                  </button>

                  <button
                    type="button"
                    disabled={workflowActionLoading || booking.depositStatus === 'FULLY_REFUNDED'}
                    onClick={() => setShowPenaltyModal(true)}
                    className="py-3 px-4 bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <span>Deduct Damage Penalty</span>
                  </button>
                </div>
              </div>

              {/* Card 3: Doorstep Logistics & Delivery Address */}
              <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-framer-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-noir" />
                    <h4 className="font-display text-base font-bold text-noir">
                      Doorstep Logistics & Concierge Address
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-ash uppercase">Mumbai Fulfillment</span>
                </div>

                <div className="p-4 bg-cream/40 rounded-2xl border border-black/5 space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-noir/70 shrink-0 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-noir block">{customerName}</span>
                      <p className="text-xs text-ash mt-0.5 leading-relaxed">{fullAddress || 'Address on file'}</p>
                      <span className="text-[11px] font-mono font-bold text-noir block mt-1">Phone: {customerPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white hover:bg-cream border border-black/15 text-noir rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in Google Maps</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`${customerName}\n${customerPhone}\n${fullAddress}`);
                      alert('Delivery details copied to clipboard!');
                    }}
                    className="px-4 py-2 bg-white hover:bg-cream border border-black/15 text-noir rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Copy Address</span>
                  </button>
                </div>
              </div>

              {/* Card 4: Chronological Audit Trail & Status History */}
              <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-framer-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-ash" />
                    <h4 className="font-display text-base font-bold text-noir">
                      Activity Audit Trail & History
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-ash">
                    {booking.statusHistory?.length || 0} events logged
                  </span>
                </div>

                {booking.statusHistory?.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/5">
                    {booking.statusHistory.slice().reverse().map((entry, i) => (
                      <div key={i} className="flex items-start gap-3 relative pl-6">
                        <div className="w-2.5 h-2.5 rounded-full bg-noir absolute left-1.5 top-1.5 ring-4 ring-white" />
                        <div className="min-w-0 flex-1 p-3 bg-cream/30 rounded-xl border border-black/5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-[11px] font-black text-noir">{entry.status?.replace(/_/g, ' ')}</span>
                            <span className="text-[10px] text-ash whitespace-nowrap">
                              {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          {entry.note && (
                            <p className="text-[11px] text-ash mt-1 leading-snug">{entry.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-ash italic py-2">No previous status history entries recorded.</p>
                )}
              </div>
            </div>

            {/* Right Column: Garment Details & Concierge Profile (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Card 5: Garment & Outfit Card */}
              <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-framer-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <h4 className="font-display text-base font-bold text-noir">
                    Outfit & SKU Details
                  </h4>
                  <span className="font-mono text-[10px] font-bold text-ash uppercase">
                    ID: {booking.productId?.productId}
                  </span>
                </div>

                <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-sand relative border border-black/5">
                  <img
                    src={booking.productId?.images?.[0]}
                    alt={booking.productId?.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-noir shadow-sm">
                    {booking.productId?.category}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <h3 className="font-display text-lg font-bold text-noir leading-tight">
                    {booking.productId?.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-ash">
                    <span>Size: <strong className="text-noir font-bold">{booking.productId?.size || 'Standard'}</strong></span>
                    <span>•</span>
                    <span>Condition: <strong className="text-emerald-800 font-bold">{booking.productId?.condition || 'Pristine'}</strong></span>
                  </div>
                </div>

                <div className="p-3.5 bg-cream/40 rounded-2xl border border-black/5 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-ash block font-bold uppercase">Rental Start</span>
                    <strong className="text-noir font-bold">{new Date(booking.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-ash block font-bold uppercase">Rental End</span>
                    <strong className="text-noir font-bold">{new Date(booking.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                  </div>
                </div>
              </div>

              {/* Card 6: Customer Concierge Card */}
              <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-framer-sm space-y-4">
                <div className="flex items-center justify-between border-b border-black/5 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-noir" />
                    <h4 className="font-display text-base font-bold text-noir">
                      Customer Profile
                    </h4>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Verified Customer
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-sand/30 rounded-xl">
                    <span className="text-ash font-medium">Name:</span>
                    <strong className="text-noir font-bold">{customerName}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-sand/30 rounded-xl">
                    <span className="text-ash font-medium">Email:</span>
                    <span className="text-noir font-medium">{booking.customerId?.email || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-sand/30 rounded-xl">
                    <span className="text-ash font-medium">Phone:</span>
                    <span className="font-mono font-bold text-noir">{customerPhone || '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  {customerPhone && (
                    <a
                      href={`tel:${customerPhone}`}
                      className="py-2.5 px-3 bg-noir hover:bg-obsidian text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Now</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Card 7: Financial Breakdown */}
              <div className="bg-white p-6 rounded-3xl border border-black/10 shadow-framer-sm space-y-3 text-xs">
                <h4 className="font-display text-base font-bold text-noir border-b border-black/5 pb-3">
                  Billing & Settlement
                </h4>
                <div className="flex justify-between py-1 border-b border-black/5 text-ash">
                  <span>Rental Fee ({booking.rentalDuration.replace('_', ' ')}):</span>
                  <span className="font-bold text-noir">₹{booking.rentalPrice?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 text-ash">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-noir">₹{booking.securityDeposit?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-black/5 text-ash">
                  <span>Doorstep Delivery & Pickup:</span>
                  <span className="font-bold text-emerald-800">FREE (Included)</span>
                </div>
                <div className="flex justify-between pt-2 font-display text-sm font-black text-noir">
                  <span>Grand Total Paid:</span>
                  <span>₹{booking.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Penalty Deduction Modal */}
        {showPenaltyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir/70 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-black/10 pb-3">
                <h3 className="font-display text-lg font-bold text-noir">
                  Deduct Damage Penalty
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPenaltyModal(false)}
                  className="p-1 rounded-full hover:bg-cream"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-ash">
                Enter the amount to be deducted from the customer's ₹{booking.securityDeposit} security deposit for fabric stain removal, zipper repair, or replacement.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                    Deduction Amount (₹)
                  </label>
                  <input
                    type="number"
                    max={booking.securityDeposit}
                    value={penaltyAmount}
                    onChange={(e) => setPenaltyAmount(e.target.value)}
                    placeholder="E.g. 500"
                    className="w-full px-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                    Reason / Damage Inspection Note
                  </label>
                  <input
                    type="text"
                    value={penaltyReason}
                    onChange={(e) => setPenaltyReason(e.target.value)}
                    placeholder="E.g. Makeup stain on neckline requiring deep dry clean restoration"
                    className="w-full px-3.5 py-2.5 bg-cream/40 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPenaltyModal(false)}
                  className="flex-1 py-2.5 border border-black/15 text-noir rounded-xl text-xs font-semibold hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fine = Number(penaltyAmount);
                    if (!fine || fine <= 0) {
                      alert('Please enter a valid penalty amount.');
                      return;
                    }
                    const refundBal = (booking.securityDeposit || 0) - fine;
                    handleUpdateWorkflowStatus(
                      booking._id,
                      booking.orderStatus,
                      `Deducted penalty ₹${fine} (${penaltyReason || 'Damage repair'}). Balance ₹${refundBal} refunded.`,
                      'PARTIALLY_REFUNDED'
                    );
                    setShowPenaltyModal(false);
                    setPenaltyAmount('');
                    setPenaltyReason('');
                  }}
                  className="flex-1 py-2.5 bg-noir hover:bg-obsidian text-white rounded-xl text-xs font-bold uppercase tracking-wider"
                >
                  Apply & Settle
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
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
                          onClick={() => setSelectedBookingWorkflow(b)}
                          className="bg-white p-4 rounded-3xl border border-black/10 shadow-framer-sm space-y-3 hover:border-black/30 transition-all cursor-pointer"
                        >
                          {/* Card Header: ID + Status */}
                          <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                            <div>
                              <span className="font-mono text-xs font-black text-noir">{b.bookingId}</span>
                              <span className="text-[10px] text-ash block">
                                {new Date(b.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                              {b.orderStatus.replace(/_/g, ' ')}
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
                                {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
                              <span className="font-bold text-emerald-700">
                                {b.customerId?.phone || b.deliveryAddress?.phone}
                              </span>
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

                          {/* Action Button: Manage Full Workflow */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedBookingWorkflow(b);
                            }}
                            className="w-full py-3 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <span>Open Workflow Hub</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
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
                            <th className="p-4 text-right">Workflow Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {filteredBookings.map((b) => (
                            <tr
                              key={b._id}
                              onClick={() => setSelectedBookingWorkflow(b)}
                              className="hover:bg-cream/40 transition-colors cursor-pointer group"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={b.productId?.images?.[0]}
                                    alt={b.productId?.name}
                                    className="w-12 h-14 object-cover rounded-xl bg-sand shrink-0 border border-black/5"
                                  />
                                  <div>
                                    <span className="font-mono text-xs font-bold text-noir block group-hover:text-emerald-800 transition-colors">{b.bookingId}</span>
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
                                  {new Date(b.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – {new Date(b.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-noir">₹{b.totalAmount}</span>
                                <div className="text-[10px] text-emerald-700 font-medium">Dep: ₹{b.securityDeposit} ({b.depositStatus})</div>
                              </td>
                              <td className="p-4">
                                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 uppercase">
                                  {b.orderStatus.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedBookingWorkflow(b);
                                    }}
                                    className="px-3 py-1.5 bg-noir hover:bg-obsidian text-white text-[11px] font-bold rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                                  >
                                    <span>Manage Workflow</span>
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                </div>
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
