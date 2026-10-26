import { NotificationItem } from "../types/notification.types";

type Translator = (...args: any[]) => string;

const localizedStatusKeys: Record<string, string> = {
  Pending: "statusPending",
  Processing: "statusProcessing",
  Shipped: "statusShipped",
  Delivered: "statusDelivered",
  Cancelled: "statusCancelled",
};

export function translateNotification(
  item: NotificationItem,
  t: Translator,
): { title: string; message: string } {
  const orderIdFrom = (value: string) => value.match(/order #([\w-]+)/i)?.[1];

  if (item.title === "Order Placed Successfully") {
    return {
      title: t("orderPlaced"),
      message: t("orderPlacedMessage", { orderId: orderIdFrom(item.message) ?? "" }),
    };
  }

  if (item.title === "Payment Confirmed") {
    return {
      title: t("paymentConfirmedTitle"),
      message: t("paymentConfirmedMessage", { orderId: orderIdFrom(item.message) ?? "" }),
    };
  }

  const statusTitle = item.title.match(/^Order Status:\s*(.+)$/i)?.[1];
  if (statusTitle) {
    const status = statusTitle.trim();
    const statusKey = localizedStatusKeys[status];
    const orderId = orderIdFrom(item.message) ?? "";
    return {
      title: t("orderStatus", { status: statusKey ? t(statusKey) : status }),
      message: t("orderStatusMessage", {
        orderId,
        status: statusKey ? t(statusKey) : status,
      }),
    };
  }

  const sold = item.message.match(/^(.+) purchased (\d+)x "(.+)"$/);
  if (item.title === "Product Sold!" && sold) {
    return {
      title: t("productSold"),
      message: t("productSoldMessage", {
        buyerName: sold[1],
        quantity: sold[2],
        productName: sold[3],
      }),
    };
  }

  const review = item.message.match(/^(.+) gave a (\d+)★ review on "(.+)"$/);
  if (item.title === "New review on your product" && review) {
    return {
      title: t("newReview"),
      message: t("newReviewMessage", {
        reviewerName: review[1],
        rating: review[2],
        productName: review[3],
      }),
    };
  }

  const like = item.message.match(/^(.+) liked your product "(.+)"$/);
  if (item.title === "New like on your product" && like) {
    return {
      title: t("newLike"),
      message: t("newLikeMessage", { likerName: like[1], productName: like[2] }),
    };
  }

  return { title: item.title, message: item.message };
}
