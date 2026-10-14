"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "../api/wishlist.api";
import { Wishlist } from "../types/wishlist.types";
import { useAppStore } from "@/store/use-app-store";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const WISHLIST_QUERY_KEY = ["wishlist"] as const;

export function useWishlist() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  return useQuery({
    queryKey: WISHLIST_QUERY_KEY,
    queryFn: async () => {
      const res = await wishlistApi.getWishlist();
      return res.data ?? null;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 3, // 3 min
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes("404")) return false;
      return failureCount < 2;
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.addToWishlist(productId),
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, response.data);
      } else {
        queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      }
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => wishlistApi.removeFromWishlist(productId),
    onSuccess: (response) => {
      if (response?.data) {
        queryClient.setQueryData(WISHLIST_QUERY_KEY, response.data);
      } else {
        queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
      }
    },
  });
}

export function useClearWishlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => wishlistApi.clearWishlist(),
    onSuccess: () => {
      queryClient.setQueryData(WISHLIST_QUERY_KEY, {
        _id: "",
        user: "",
        products: [],
      });
      queryClient.invalidateQueries({ queryKey: WISHLIST_QUERY_KEY });
    },
  });
}

export function useToggleWishlist() {
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const router = useRouter();

  const isPending = addToWishlist.isPending || removeFromWishlist.isPending;

  const toggleWishlist = (productId: string, productTitle?: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save items to your wishlist");
      router.push("/auth/login");
      return;
    }

    const isInWishlist = Boolean(
      wishlist?.products?.some((p) => {
        const id = typeof p === "string" ? p : p?._id;
        return id === productId;
      }),
    );

    if (isInWishlist) {
      removeFromWishlist.mutate(productId, {
        onSuccess: () => {
          toast.info(
            productTitle
              ? `Removed "${productTitle}" from wishlist`
              : "Removed from wishlist",
          );
        },
        onError: (err) => {
          toast.error((err as Error)?.message || "Failed to remove from wishlist");
        },
      });
    } else {
      addToWishlist.mutate(productId, {
        onSuccess: () => {
          toast.success(
            productTitle
              ? `Added "${productTitle}" to wishlist ✨`
              : "Added to wishlist ✨",
          );
        },
        onError: (err) => {
          toast.error((err as Error)?.message || "Failed to add to wishlist");
        },
      });
    }
  };

  return {
    toggleWishlist,
    isPending,
  };
}

export function useIsInWishlist(productId?: string): boolean {
  const { data: wishlist } = useWishlist();
  if (!productId || !wishlist?.products) return false;
  return wishlist.products.some((p) => {
    const id = typeof p === "string" ? p : p?._id;
    return id === productId;
  });
}
