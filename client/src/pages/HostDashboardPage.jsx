import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusCircle,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  LogIn,
  ShieldCheck,
  CreditCard,
  Search,
  RefreshCw,
  X,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Store,
  ArrowRight,
  AlertCircle,
  Calendar as CalendarIcon,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function HostDashboardPage({ onNavigate, onOpenListOutfit, onOpenAuth }) {
  const { user, updateProfile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'APPROVED', 'PENDING_REVIEW', 'REJECTED'

  // Edit Modal State
  const [editingListing, setEditingListing] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Lehengas',
    gender: 'Women',
    size: 'M',
    colour: '',
    condition: 'Like New',
    description: '',
    brand: '',
    expectedEarning: '',
    isAvailable: true,
    images: []
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // Date Blackout & Slot Availability Modal State
  const [blackoutModalItem, setBlackoutModalItem] = useState(null);
  const [blackoutStartDate, setBlackoutStartDate] = useState('');
  const [blackoutEndDate, setBlackoutEndDate] = useState('');
  const [blackoutNote, setBlackoutNote] = useState('');
  const [blackoutSaving, setBlackoutSaving] = useState(false);

  // Payout Modal State
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutUpi, setPayoutUpi] = useState(user?.hostDetails?.payoutUpi || '');
  const [bankAccount, setBankAccount] = useState(user?.hostDetails?.payoutBankDetails?.accountNumber || '');
  const [bankIfsc, setBankIfsc] = useState(user?.hostDetails?.payoutBankDetails?.ifsc || '');
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);

  const canAccessHost = Boolean(user);

  const fetchHostData = useCallback(async () => {
    if (!canAccessHost) return;
    setLoading(true);
    try {
      const data = await api.products.getHostListings();
      setListings(data.listings || []);
    } catch (err) {
      console.error('Failed to fetch host listings:', err);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [canAccessHost]);

  useEffect(() => {
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }
    if (!canAccessHost) {
      setLoading(false);
      return;
    }
    fetchHostData();
  }, [user, canAccessHost, fetchHostData]);

  // Calculations
  const approvedListings = listings.filter((l) => l.status === 'APPROVED');
  const pendingListings = listings.filter((l) => l.status === 'PENDING_REVIEW');
  const rejectedListings = listings.filter((l) => l.status === 'REJECTED');

  const approvedCount = approvedListings.length;
  const pendingCount = pendingListings.length;
  const totalPotentialEarnings = listings.reduce((sum, l) => sum + (Number(l.ownerExpectedEarning || l.expectedEarning) || 0), 0);
  const liveEarningsProjected = approvedListings.reduce((sum, l) => sum + (Number(l.ownerExpectedEarning || l.expectedEarning) || 0), 0);

  // Filtered listings
  const filteredListings = listings.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.productId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenEdit = (item) => {
    setEditingListing(item);
    setEditFormData({
      name: item.name || '',
      category: item.category || 'Lehengas',
      gender: item.gender || 'Women',
      size: item.size || 'M',
      colour: item.colour || '',
      condition: item.condition || 'Like New',
      description: item.description || '',
      brand: item.brand || '',
      expectedEarning: String(item.ownerExpectedEarning || item.expectedEarning || 800),
      isAvailable: item.isAvailable !== false,
      images: item.images || []
    });
    setEditError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingListing) return;
    setEditSaving(true);
    setEditError('');

    try {
      await api.products.updateHostListing(editingListing._id, {
        ...editFormData,
        expectedEarning: Number(editFormData.expectedEarning)
      });
      setEditingListing(null);
      await fetchHostData();
    } catch (err) {
      setEditError(err.message || 'Failed to update outfit');
    } finally {
      setEditSaving(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      const nextStatus = item.isAvailable === false ? true : false;
      await api.products.updateHostListing(item._id, { isAvailable: nextStatus });
      await fetchHostData();
    } catch (err) {
      alert('Failed to update availability: ' + err.message);
    }
  };

  const handleDeleteListing = async (item) => {
    if (!window.confirm(`Are you sure you want to remove "${item.name}" from your boutique inventory?`)) {
      return;
    }

    try {
      await api.products.deleteHostListing(item._id);
      await fetchHostData();
    } catch (err) {
      alert(err.message || 'Failed to delete listing');
    }
  };

  const handleAddBlackout = async (e) => {
    e.preventDefault();
    if (!blackoutModalItem || !blackoutStartDate || !blackoutEndDate) return;
    setBlackoutSaving(true);
    try {
      const existing = blackoutModalItem.hostAvailabilityBlocks || [];
      const updated = [
        ...existing,
        {
          startDate: new Date(blackoutStartDate),
          endDate: new Date(blackoutEndDate),
          note: blackoutNote.trim() || 'Store offline reserve'
        }
      ];
      await api.products.updateHostListing(blackoutModalItem._id, { hostAvailabilityBlocks: updated });
      setBlackoutModalItem({ ...blackoutModalItem, hostAvailabilityBlocks: updated });
      setBlackoutStartDate('');
      setBlackoutEndDate('');
      setBlackoutNote('');
      await fetchHostData();
    } catch (err) {
      alert('Failed to save date block: ' + err.message);
    } finally {
      setBlackoutSaving(false);
    }
  };

  const handleRemoveBlackout = async (index) => {
    if (!blackoutModalItem) return;
    setBlackoutSaving(true);
    try {
      const existing = blackoutModalItem.hostAvailabilityBlocks || [];
      const updated = existing.filter((_, i) => i !== index);
      await api.products.updateHostListing(blackoutModalItem._id, { hostAvailabilityBlocks: updated });
      setBlackoutModalItem({ ...blackoutModalItem, hostAvailabilityBlocks: updated });
      await fetchHostData();
    } catch (err) {
      alert('Failed to remove date block: ' + err.message);
    } finally {
      setBlackoutSaving(false);
    }
  };

  const handleSavePayout = async (e) => {
    e.preventDefault();
    setPayoutSaving(true);
    try {
      if (updateProfile) {
        await updateProfile({
          hostDetails: {
            ...(user?.hostDetails || {}),
            payoutUpi,
            payoutBankDetails: {
              ...(user?.hostDetails?.payoutBankDetails || {}),
              accountNumber: bankAccount,
              ifsc: bankIfsc
            }
          }
        });
      }
      setPayoutSuccess(true);
      setTimeout(() => {
        setPayoutSuccess(false);
        setPayoutModalOpen(false);
      }, 1500);
    } catch (err) {
      alert('Failed to update payout details: ' + (err.message || 'Unknown error'));
    } finally {
      setPayoutSaving(false);
    }
  };

  const statusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Live on Catalog</span>
        </span>
      );
    }
    if (status === 'PENDING_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>Under Admin Review</span>
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-800 border border-red-200 shadow-xs">
          <XCircle className="w-3.5 h-3.5 text-red-600" />
          <span>Needs Changes</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700">
        Inactive
      </span>
    );
  };

  // Sign in required state
  if (!user) {
    return (
      <div className="min-h-screen bg-sand/20 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex items-center justify-center">
        <div className="w-full max-w-md text-center py-16 px-6 sm:px-8 rounded-3xl border border-black/10 bg-white shadow-framer-md">
          <div className="w-14 h-14 rounded-2xl bg-cream flex items-center justify-center mx-auto mb-4 border border-black/5">
            <Store className="w-7 h-7 text-noir/70" />
          </div>
          <h1 className="font-display text-2xl font-black text-noir tracking-tight">Shopkeeper Portal</h1>
          <p className="text-xs text-ash mt-2 mb-6 leading-relaxed">
            Sign in to manage your boutique occasion listings, monitor curation reviews, and track your rental earnings.
          </p>
          <button
            type="button"
            onClick={() => onOpenAuth({ role: 'shopkeeper', mode: 'login' })}
            className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Shopkeeper Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand/20 pb-20 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Top Header Card */}
        <header className="bg-white rounded-3xl p-5 sm:p-8 border border-black/10 shadow-framer-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-900 border border-emerald-200">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  {user.hostDetails?.businessName || 'Boutique Partner Portal'}
                </span>
                <span className="text-[11px] text-ash font-medium">
                  {user.name} ({user.email})
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-noir tracking-tight">
                Boutique Inventory & Rental Yield
              </h1>
              <p className="text-xs sm:text-sm text-ash mt-1 max-w-xl">
                Full access to upload, update, and manage your boutique collection, monitor curation reviews, and receive payouts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={fetchHostData}
                disabled={loading}
                className="p-2.5 rounded-xl border border-black/10 bg-cream/40 hover:bg-cream text-noir/80 hover:text-noir transition-colors"
                title="Refresh listings"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={() => setPayoutModalOpen(true)}
                className="px-4 py-3 border border-black/15 hover:bg-cream text-noir text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Payout Settings</span>
              </button>
              <button
                type="button"
                onClick={onOpenListOutfit}
                className="px-5 py-3 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List an Outfit</span>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-black/5">
            <div className="p-4 rounded-2xl bg-cream/30 border border-black/5">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                Total Inventory
              </span>
              <span className="font-display text-2xl font-black text-noir mt-1 block">
                {listings.length} Outfits
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream/30 border border-black/5">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                Live on FLOSET
              </span>
              <span className="font-display text-2xl font-black text-emerald-700 mt-1 block">
                {approvedCount} Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream/30 border border-black/5">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                Pending Curation
              </span>
              <span className="font-display text-2xl font-black text-amber-700 mt-1 block">
                {pendingCount} Under Review
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-cream/30 border border-black/5">
              <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
                Projected Rental Yield
              </span>
              <span className="font-display text-2xl font-black text-noir mt-1 block">
                ₹{liveEarningsProjected.toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        {/* Inventory Management Table / Grid */}
        <div className="bg-white rounded-3xl border border-black/10 shadow-framer-sm overflow-hidden">
          {/* Controls bar */}
          <div className="p-4 sm:p-6 border-b border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-cream/20">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-ash absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by outfit name, category, SKU..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir shadow-xs"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All', count: listings.length },
                { id: 'APPROVED', label: 'Live', count: approvedCount },
                { id: 'PENDING_REVIEW', label: 'Pending', count: pendingCount },
                { id: 'REJECTED', label: 'Needs Changes', count: rejectedListings.length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    activeFilter === tab.id
                      ? 'bg-noir text-white shadow-sm'
                      : 'bg-white border border-black/10 text-ash hover:text-noir'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Table of listings */}
          {loading ? (
            <div className="p-12 text-center text-ash text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-noir" />
              <span>Loading boutique inventory...</span>
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="py-16 text-center space-y-3 p-6">
              <p className="font-display text-base font-bold text-noir">No listings found</p>
              <p className="text-xs text-ash max-w-sm mx-auto">
                {listings.length === 0
                  ? 'Start by listing your first boutique outfit to make it available for rental booking.'
                  : 'No outfits match your active search or filter.'}
              </p>
              {listings.length === 0 && (
                <button
                  onClick={onOpenListOutfit}
                  className="mt-2 px-6 py-2.5 bg-noir text-white text-xs font-bold rounded-xl hover:bg-obsidian transition-colors"
                >
                  List Your First Outfit
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-black/10 bg-sand/30 text-[10px] font-extrabold uppercase tracking-wider text-ash">
                    <th className="py-3 px-4 sm:px-6">Outfit & SKU</th>
                    <th className="py-3 px-4">Category / Size</th>
                    <th className="py-3 px-4">Expected Payout</th>
                    <th className="py-3 px-4">Curation Status</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-medium text-noir/90">
                  {filteredListings.map((item) => (
                    <tr key={item._id} className="hover:bg-cream/30 transition-colors">
                      {/* Outfit Info */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.images?.[0]}
                            alt={item.name}
                            className="w-12 h-16 object-cover rounded-lg bg-sand border border-black/5 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-mono text-ash font-bold block">
                              {item.productId}
                            </span>
                            <span className="font-display text-sm font-bold text-noir line-clamp-1">
                              {item.name}
                            </span>
                            <span className="text-[11px] text-ash block">
                              {item.brand || 'Boutique'} • {item.colour}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Size */}
                      <td className="py-4 px-4">
                        <span className="font-semibold block">{item.category}</span>
                        <span className="text-[11px] text-ash font-bold">Size {item.size}</span>
                      </td>

                      {/* Expected Earning */}
                      <td className="py-4 px-4">
                        <span className="font-display text-sm font-extrabold text-noir block">
                          ₹{(item.ownerExpectedEarning || item.expectedEarning || 0).toLocaleString()}
                        </span>
                        <span className="text-[10px] text-ash">per 3-day rental</span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        {statusBadge(item.status)}
                        {item.adminReviewNotes && (
                          <p className="text-[10px] text-ash italic mt-1 max-w-xs line-clamp-1">
                            Note: {item.adminReviewNotes}
                          </p>
                        )}
                      </td>

                      {/* Availability Toggle */}
                      <td className="py-4 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleAvailability(item)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            item.isAvailable !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                          }`}
                        >
                          {item.isAvailable !== false ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-neutral-500" />
                              <span>Paused</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setBlackoutModalItem(item)}
                            className="p-2 rounded-xl border border-black/10 hover:bg-emerald-50 text-noir/80 hover:text-emerald-800 transition-colors"
                            title="Manage Date Availability & Blackout Windows"
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(item)}
                            className="p-2 rounded-xl border border-black/10 hover:bg-cream text-noir/80 hover:text-noir transition-colors"
                            title="Edit Outfit Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteListing(item)}
                            className="p-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100 text-red-700 transition-colors"
                            title="Delete Listing"
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
        </div>
      </div>

      {/* EDIT OUTFIT MODAL */}
      {editingListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir/70 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-black/10 flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-extrabold text-noir">
                  Edit Outfit: {editingListing.name}
                </h3>
                <p className="text-xs text-ash">
                  Update outfit specs, pricing, and description ({editingListing.productId})
                </p>
              </div>
              <button
                onClick={() => setEditingListing(null)}
                className="p-1 rounded-full text-noir/50 hover:text-noir"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-4 flex-grow text-xs">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                  Outfit Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none focus:border-noir font-bold"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                  >
                    {['Lehengas', 'Sarees', 'Gowns', 'Dresses', 'Indo-Western', 'Sherwanis', 'Kurta Sets', 'Suits', 'Blazers'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                    Size
                  </label>
                  <select
                    value={editFormData.size}
                    onChange={(e) => setEditFormData({ ...editFormData, size: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                  >
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                    Condition
                  </label>
                  <select
                    value={editFormData.condition}
                    onChange={(e) => setEditFormData({ ...editFormData, condition: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                  >
                    <option value="Brand New with Tags">Brand New with Tags</option>
                    <option value="Like New">Like New</option>
                    <option value="Gently Used">Gently Used</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                    Colour
                  </label>
                  <input
                    type="text"
                    value={editFormData.colour}
                    onChange={(e) => setEditFormData({ ...editFormData, colour: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                    Expected Payout (₹)
                  </label>
                  <input
                    type="number"
                    value={editFormData.expectedEarning}
                    onChange={(e) => setEditFormData({ ...editFormData, expectedEarning: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
              </div>

              <div className="p-4 bg-sand/30 border-t border-black/10 flex justify-end gap-2 -mx-6 -mb-6 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingListing(null)}
                  className="px-5 py-2.5 border border-black/15 text-noir font-semibold rounded-xl hover:bg-cream"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-6 py-2.5 bg-noir hover:bg-obsidian text-white font-bold rounded-xl shadow-sm"
                >
                  {editSaving ? 'Saving Changes...' : 'Save & Update Outfit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DATE AVAILABILITY & BLACKOUT SLOTS MODAL */}
      {blackoutModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir/70 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/10 p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-start justify-between border-b border-black/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-14 rounded-xl overflow-hidden bg-sand flex-shrink-0 border border-black/10">
                  <img
                    src={blackoutModalItem.images?.[0] || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=300'}
                    alt={blackoutModalItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-emerald-700" />
                    <h3 className="font-display text-lg font-bold text-noir">Outfit Date Availability</h3>
                  </div>
                  <p className="text-xs text-ash font-medium line-clamp-1">{blackoutModalItem.name} ({blackoutModalItem.productId || 'FL-STYLE'})</p>
                </div>
              </div>
              <button
                onClick={() => setBlackoutModalItem(null)}
                className="p-1 rounded-full text-ash hover:text-noir hover:bg-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart dynamic availability info */}
            <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
              <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 leading-relaxed">
                <p className="font-bold mb-0.5">Dynamic Rental Availability Active</p>
                <p className="text-emerald-800">
                  When customers book this outfit for a specific date window (e.g. Oct 1–4), only those dates are reserved. Your listing remains visible and open for all other rental dates automatically.
                </p>
              </div>
            </div>

            {/* Active Blackout Windows */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ash mb-3 flex items-center justify-between">
                <span>Custom Offline / Maintenance Dates</span>
                <span className="text-[11px] font-normal text-ash">
                  {(blackoutModalItem.hostAvailabilityBlocks || []).length} blocked range(s)
                </span>
              </h4>

              {(!blackoutModalItem.hostAvailabilityBlocks || blackoutModalItem.hostAvailabilityBlocks.length === 0) ? (
                <div className="p-4 rounded-2xl bg-sand/30 border border-dashed border-black/15 text-center text-xs text-ash">
                  No custom blackout dates added. Outfit is fully bookable whenever no customer rental conflicts exist.
                </div>
              ) : (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                  {blackoutModalItem.hostAvailabilityBlocks.map((block, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-cream/40 rounded-xl border border-black/10 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-noir flex items-center gap-1.5">
                          <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>
                            {new Date(block.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {'  ➜  '}
                            {new Date(block.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-ash mt-0.5">
                          {block.note || 'Offline / In-Store Fitting'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveBlackout(idx)}
                        disabled={blackoutSaving}
                        className="p-1.5 text-ash hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove blackout window"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form to Add New Blackout Window */}
            <form onSubmit={handleAddBlackout} className="p-4 bg-sand/30 border border-black/10 rounded-2xl space-y-3">
              <h5 className="text-xs font-bold text-noir uppercase tracking-wider">
                + Block A New Date Window
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-ash mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={blackoutStartDate}
                    onChange={(e) => setBlackoutStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-noir focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ash mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    min={blackoutStartDate || new Date().toISOString().split('T')[0]}
                    value={blackoutEndDate}
                    onChange={(e) => setBlackoutEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-noir focus:outline-none"
                  />
                </div>
              </div>
              <div className="text-xs">
                <label className="block text-[11px] font-bold text-ash mb-1">Reason / Note (Optional)</label>
                <input
                  type="text"
                  placeholder="E.g. In-store VIP trial, Dry cleaning, Boutique photoshoot"
                  value={blackoutNote}
                  onChange={(e) => setBlackoutNote(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-black/10 rounded-xl text-noir focus:outline-none"
                />
              </div>
              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={blackoutSaving || !blackoutStartDate || !blackoutEndDate}
                  className="px-5 py-2 bg-noir hover:bg-obsidian disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
                >
                  {blackoutSaving ? 'Saving...' : 'Add Date Block'}
                </button>
              </div>
            </form>

            <div className="flex justify-end pt-2 border-t border-black/10">
              <button
                type="button"
                onClick={() => setBlackoutModalItem(null)}
                className="px-6 py-2 bg-noir hover:bg-obsidian text-white text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYOUT SETTINGS MODAL */}
      {payoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <h3 className="font-display text-lg font-bold text-noir flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Shopkeeper Payout Account</span>
              </h3>
              <button onClick={() => setPayoutModalOpen(false)} className="text-ash hover:text-noir">
                <X className="w-5 h-5" />
              </button>
            </div>

            {payoutSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Payout details saved successfully!</span>
              </div>
            )}

            <form onSubmit={handleSavePayout} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                  UPI ID (Preferred for Fast Settlements)
                </label>
                <input
                  type="text"
                  placeholder="E.g. boutique@okhdfcbank"
                  value={payoutUpi}
                  onChange={(e) => setPayoutUpi(e.target.value)}
                  className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                  Bank Account Number
                </label>
                <input
                  type="text"
                  placeholder="Account Number"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-ash uppercase tracking-wider mb-1">
                  Bank IFSC Code
                </label>
                <input
                  type="text"
                  placeholder="IFSC Code (e.g. HDFC0001234)"
                  value={bankIfsc}
                  onChange={(e) => setBankIfsc(e.target.value)}
                  className="w-full px-3 py-2 bg-cream/40 border border-black/10 rounded-xl text-noir focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutModalOpen(false)}
                  className="px-4 py-2 border border-black/10 text-noir rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSaving}
                  className="px-6 py-2 bg-noir hover:bg-obsidian text-white font-bold rounded-xl shadow-sm"
                >
                  {payoutSaving ? 'Saving...' : 'Save Payout Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
