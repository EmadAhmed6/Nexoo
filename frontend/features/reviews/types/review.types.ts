export interface ReviewUser {
  _id: string;
  fullName: string;
  username: string;
  profilePicture?: {
    url?: string;
    publicId?: string | null;
  };
  email?: string;
  role?: string;
}

export interface ReviewItem {
  _id: string;
  product: string;
  user: ReviewUser;
  ratings: number;
  reviewText: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewPayload {
  ratings: number;
  reviewText: string;
}

export interface UpdateReviewPayload {
  ratings?: number;
  reviewText?: string;
}

export interface ReviewResponseData {
  review?: ReviewItem;
  productRating: number;
  productRatingQuantity: number;
}
