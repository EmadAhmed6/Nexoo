"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Star,
  X,
  Loader2,
  Phone,
  Building,
  Navigation,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import {
  useUserAddresses,
  useAddUserAddress,
  useUpdateUserAddress,
  useDeleteUserAddress,
} from "../hooks/useUser";
import { AddressPayload } from "../api/user.api";
import { UserAddress } from "@/features/auth/types/auth.types";
import { DeleteConfirmModal } from "@/features/products/components/DeleteConfirmModal";

const EMPTY_FORM: AddressPayload = {
  street: "",
  city: "",
  state: "",
  postalCode: "",
  phone: "",
  isDefault: false,
};

interface AddressFormProps {
  initial?: Partial<AddressPayload>;
  onSubmit: (data: AddressPayload) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
  isEdit?: boolean;
}

function AddressForm({
  initial = {},
  onSubmit,
  onCancel,
  isPending,
  isEdit,
}: AddressFormProps) {
  const [form, setForm] = useState<AddressPayload>({ ...EMPTY_FORM, ...initial });

  const set = (field: keyof AddressPayload, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.street.trim() || form.street.length < 3) {
      toast.error("Street must be at least 3 characters");
      return;
    }
    if (!form.city.trim() || form.city.length < 3) {
      toast.error("City must be at least 3 characters");
      return;
    }
    if (!form.state.trim() || form.state.length < 3) {
      toast.error("State must be at least 3 characters");
      return;
    }
    if (!form.phone.trim() || !/^01\d{9}$/.test(form.phone.trim())) {
      toast.error("Phone must start with 01 and be exactly 11 digits");
      return;
    }
    await onSubmit(form);
  };

  const inputCls =
    "w-full pl-10 pr-4 py-2.5 rounded-xl border border-borderPrimary bg-bgPrimary text-textPrimary placeholder:text-textSecondary focus:outline-none focus:border-primary transition-colors text-sm";

  return (
    <motion.form
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      onSubmit={handleSubmit}
      className="space-y-4 pt-4 border-t border-borderPrimary mt-4"
    >
      <h4 className="text-xs font-bold text-textPrimary uppercase tracking-wider flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-primary" />
        {isEdit ? "Edit Address" : "New Address"}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Street */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
            Street
          </label>
          <div className="relative">
            <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              required
              value={form.street}
              onChange={(e) => set("street", e.target.value)}
              placeholder="e.g. 15 Tahrir Street"
              className={inputCls}
            />
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
            City
          </label>
          <div className="relative">
            <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="e.g. Cairo"
              className={inputCls}
            />
          </div>
        </div>

        {/* State */}
        <div>
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
            State / Governorate
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              required
              value={form.state}
              onChange={(e) => set("state", e.target.value)}
              placeholder="e.g. Cairo"
              className={inputCls}
            />
          </div>
        </div>

        {/* Postal Code */}
        <div>
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
            Postal Code <span className="text-textSecondary font-normal normal-case">(optional)</span>
          </label>
          <div className="relative">
            <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
            <input
              type="text"
              value={form.postalCode ?? ""}
              onChange={(e) => set("postalCode", e.target.value)}
              placeholder="e.g. 11371"
              className={inputCls}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-1.5">
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary pointer-events-none" />
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="01XXXXXXXXX"
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Set as default */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none group w-fit">
        <div
          onClick={() => set("isDefault", !form.isDefault)}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
            form.isDefault
              ? "bg-primary border-primary"
              : "border-borderPrimary group-hover:border-primary/50"
          }`}
        >
          {form.isDefault && <CheckCircle2 className="w-3.5 h-3.5 text-bgPrimary" strokeWidth={3} />}
        </div>
        <span className="text-xs font-semibold text-textSecondary group-hover:text-textPrimary transition-colors">
          Set as default address
        </span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primaryHover text-bgPrimary text-sm font-bold transition-all disabled:opacity-60 cursor-pointer shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <span>{isEdit ? "Save Changes" : "Add Address"}</span>
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-borderPrimary text-textSecondary hover:text-textPrimary hover:border-primary/40 text-sm font-semibold transition-all disabled:opacity-60 cursor-pointer"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </motion.form>
  );
}

// ─── Address Card ────────────────────────────────────────────────────────────

interface AddressCardProps {
  address: UserAddress;
  onEdit: () => void;
  onDelete: () => void;
}

function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className={`relative p-4 rounded-2xl border transition-all ${
        address.isDefault
          ? "border-primary/50 bg-primary/5 shadow-lg shadow-primary/5"
          : "border-borderPrimary bg-bgPrimary hover:border-primary/30"
      }`}
    >
      {address.isDefault && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-wider">
          <Star className="w-2.5 h-2.5 fill-current" />
          Default
        </div>
      )}

      <div className="space-y-1.5 pr-20">
        <p className="text-sm font-bold text-textPrimary leading-snug">
          {address.street}
        </p>
        <p className="text-xs text-textSecondary">
          {address.city}, {address.state}
          {address.postalCode ? ` — ${address.postalCode}` : ""}
        </p>
        <p className="text-xs text-textSecondary flex items-center gap-1.5 mt-1">
          <Phone className="w-3 h-3" />
          {address.phone}
        </p>
      </div>

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-borderPrimary bg-bgSecondary hover:border-primary/40 text-textSecondary hover:text-primary text-xs font-semibold transition-all cursor-pointer"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          onClick={onDelete}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-textError/20 bg-textError/5 hover:bg-textError/10 text-textError text-xs font-semibold transition-all cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────

interface UserAddressesSectionProps {
  userId: string;
}

export function UserAddressesSection({ userId }: UserAddressesSectionProps) {
  const { data: addresses = [], isLoading } = useUserAddresses(userId);
  const addMutation = useAddUserAddress(userId);
  const updateMutation = useUpdateUserAddress(userId);
  const deleteMutation = useDeleteUserAddress(userId);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<UserAddress | null>(null);

  const handleAdd = async (data: AddressPayload) => {
    try {
      await addMutation.mutateAsync(data);
      toast.success("Address added successfully!");
      setShowAddForm(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to add address");
    }
  };

  const handleUpdate = async (addressId: string, data: AddressPayload) => {
    try {
      await updateMutation.mutateAsync({ addressId, payload: data });
      toast.success("Address updated successfully!");
      setEditingId(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update address");
    }
  };

  const handleDelete = async () => {
    if (!deletingAddress?._id) return;
    try {
      await deleteMutation.mutateAsync(deletingAddress._id);
      toast.success("Address deleted");
      setDeletingAddress(null);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete address");
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-borderPrimary bg-bgSecondary p-6 sm:p-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-lg font-bold text-textPrimary tracking-tight flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Saved Addresses
            </h3>
            <p className="text-xs text-textSecondary mt-0.5">
              Manage your shipping addresses for faster checkout.
            </p>
          </div>

          {!showAddForm && (
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primaryHover text-bgPrimary text-xs font-bold transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          )}
        </div>

        {/* Add Form */}
        <AnimatePresence>
          {showAddForm && (
            <AddressForm
              onSubmit={handleAdd}
              onCancel={() => setShowAddForm(false)}
              isPending={addMutation.isPending}
            />
          )}
        </AnimatePresence>

        {/* Address List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : addresses.length === 0 && !showAddForm ? (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <MapPin className="w-7 h-7 text-primary" />
            </div>
            <p className="text-sm font-semibold text-textPrimary">No addresses yet</p>
            <p className="text-xs text-textSecondary">Add your first shipping address to speed up checkout.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {addresses.map((addr) =>
                editingId === addr._id ? (
                  <motion.div
                    key={addr._id}
                    layout
                    className="sm:col-span-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <AddressForm
                      isEdit
                      initial={{
                        street: addr.street,
                        city: addr.city,
                        state: addr.state,
                        postalCode: addr.postalCode,
                        phone: addr.phone,
                        isDefault: addr.isDefault,
                      }}
                      onSubmit={(data) => handleUpdate(addr._id!, data)}
                      onCancel={() => setEditingId(null)}
                      isPending={updateMutation.isPending}
                    />
                  </motion.div>
                ) : (
                  <AddressCard
                    key={addr._id}
                    address={addr}
                    onEdit={() => { setEditingId(addr._id!); setShowAddForm(false); }}
                    onDelete={() => setDeletingAddress(addr)}
                  />
                )
              )}
            </div>
          </AnimatePresence>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingAddress)}
        onClose={() => setDeletingAddress(null)}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
        title="Delete Address"
        description={`Are you sure you want to delete the address at "${deletingAddress?.street}"? This cannot be undone.`}
        noticeText="Your saved address will be permanently removed."
      />
    </>
  );
}
