import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, Phone, Store, Shield, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  role: propRole,
  onLoginSuccess
}) {
  const { login, register, authConfig = {} } = useAuth();
  
  // Determine effective mode and role (prioritizing authConfig from openAuth({ ... }))
  const targetRole = authConfig.role || propRole || 'customer';
  const targetMode = authConfig.mode || initialMode || 'login';

  const [isLogin, setIsLogin] = useState(targetMode === 'login');
  const [selectedRole, setSelectedRole] = useState(targetRole);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLogin(targetMode === 'login');
      setSelectedRole(targetRole);
      setError('');
    }
  }, [isOpen, targetMode, targetRole]);

  if (!isOpen) return null;

  const isShopkeeper = selectedRole === 'shopkeeper';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userData;
      if (isLogin) {
        userData = await login({ email, password, role: selectedRole });
      } else {
        userData = await register({
          name,
          email,
          password,
          phone,
          role: selectedRole,
          businessName: isShopkeeper ? businessName : undefined
        });
      }
      onClose();
      if (onLoginSuccess) onLoginSuccess(userData);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-noir/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-black/10 overflow-hidden relative">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-black/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-extrabold tracking-tight text-noir">
                FLOSET
              </span>
              {isShopkeeper && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  <Store className="w-3 h-3" /> Shopkeeper
                </span>
              )}
            </div>
            <p className="text-xs text-ash mt-0.5">
              {isLogin
                ? isShopkeeper
                  ? 'Sign in to your Boutique / Shopkeeper Portal'
                  : 'Welcome back to occasion wear rentals'
                : isShopkeeper
                ? 'Register your boutique to list & monetize inventory'
                : 'Create your FLOSET account'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-noir/50 hover:text-noir hover:bg-cream transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Toggle Selector (When registering) */}
        {!isLogin && (
          <div className="px-6 pt-4">
            <div className="grid grid-cols-2 p-1 bg-sand/60 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedRole('customer')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  !isShopkeeper
                    ? 'bg-white text-noir shadow-sm font-bold'
                    : 'text-ash hover:text-noir'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Customer
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('shopkeeper')}
                className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  isShopkeeper
                    ? 'bg-noir text-white shadow-sm font-bold'
                    : 'text-ash hover:text-noir'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> Shopkeeper / Boutique
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                    {isShopkeeper ? 'Owner / Manager Name' : 'Full Name'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={isShopkeeper ? 'E.g. Rajesh Singhania' : 'E.g. Ananya Sharma'}
                      className="w-full pl-9 pr-3 py-2.5 bg-cream/50 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                    />
                  </div>
                </div>

                {isShopkeeper && (
                  <div>
                    <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                      Boutique / Store Business Name
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="E.g. Singhania Bridal Studio"
                        className="w-full pl-9 pr-3 py-2.5 bg-cream/50 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                    Phone Number {isShopkeeper && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
                    <input
                      type="tel"
                      required={isShopkeeper}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2.5 bg-cream/50 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isShopkeeper ? 'contact@singhaniastudio.com' : 'yourname@gmail.com'}
                  className="w-full pl-9 pr-3 py-2.5 bg-cream/50 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-noir/70 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-noir/40 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-cream/50 border border-black/10 rounded-xl text-xs text-noir focus:outline-none focus:border-noir"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-noir/40 hover:text-noir transition-colors focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-noir hover:bg-obsidian text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {loading
                ? 'Please wait...'
                : isLogin
                ? 'Sign In to FLOSET'
                : isShopkeeper
                ? 'Register Boutique Partner'
                : 'Create FLOSET Account'}
            </button>
          </form>

          {/* Toggle Login / Register */}
          <div className="text-center text-xs text-ash pt-1">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="font-bold text-noir underline underline-offset-4"
            >
              {isLogin ? 'Register now' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
