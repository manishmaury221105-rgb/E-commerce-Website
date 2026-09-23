"use client";

import React from "react";
import Link from "next/link";
import { User as UserIcon, Mail, Phone, ShieldCheck, MapPin, Package, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-white p-8 rounded-3xl border border-slate-200">
        <UserIcon className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="font-heading font-bold text-xl text-slate-900">Please Sign In</h2>
        <p className="text-xs text-slate-500">You need to sign in to access your account profile.</p>
        <Link
          href="/auth/login"
          className="inline-block bg-emerald-600 text-white font-bold text-xs px-6 py-2.5 rounded-full hover:bg-emerald-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 font-extrabold text-2xl flex items-center justify-center">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900">
                {user.name}
              </h1>
              <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <Link
            href="/orders"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition-colors text-xs font-bold"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>My Orders & Tracking</span>
          </Link>
          <Link
            href="/account/addresses"
            className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-800 transition-colors text-xs font-bold"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Address Book</span>
          </Link>
        </div>

        {isAdmin && (
          <Link
            href="/admin"
            className="w-full flex items-center justify-center gap-2 p-3 bg-amber-500 hover:bg-amber-600 text-amber-950 font-extrabold text-xs rounded-2xl transition-colors shadow-xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Admin Management Panel</span>
          </Link>
        )}
      </div>

      {/* Account Info Details */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-slate-900 uppercase tracking-wider">
          Personal Details
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <span className="text-slate-500 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> Email
            </span>
            <span className="font-bold text-slate-900">{user.email}</span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
            <span className="text-slate-500 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> Phone
            </span>
            <span className="font-bold text-slate-900">{user.phone || "Not specified"}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of this Device</span>
          </button>
        </div>
      </div>
    </div>
  );
}
