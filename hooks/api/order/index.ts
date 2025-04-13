import {
  ICancelAndReturnRequest,
  ICancelOrder,
  ICancelRequestOrder,
  ICreateGroupOrder,
  ICreateOrder,
  ICreatePreOrder,
  IOrder,
  IOrderFilter,
  IOrderFilterFilter,
  IOrderItem,
  IRejectReturnRequestOrder,
  IRequest,
  IRequestFilter,
  IRequestFilterFilter,
} from "@/types/order";
import {
  TServerResponse,
  TServerResponseWithPagination,
} from "@/types/request";
import { IStatusTracking } from "@/types/status-tracking";
import { toMutationFetcher, toQueryFetcher } from "@/utils/query";
import { privateRequest } from "@/utils/request";

export const createOderApi = toMutationFetcher<
  ICreateOrder,
  TServerResponse<IOrder>
>("createOderApi", async (data) => {
  return privateRequest("/orders/create-normal", {
    method: "POST",
    data,
  });
});

export const createPreOderApi = toMutationFetcher<
  ICreatePreOrder,
  TServerResponse<IOrder>
>("createPreOderApi", async (data) => {
  return privateRequest("/orders/create-pre-order", {
    method: "POST",
    data,
  });
});

export const createGroupOderApi = toMutationFetcher<
  ICreateGroupOrder,
  TServerResponse<IOrder>
>("createGroupOderApi", async (data) => {
  return privateRequest("/group-buyings/buy/" + data.groupBuyingId, {
    method: "POST",
    data,
  });
});
export const getMyOrdersApi = toMutationFetcher<
  IOrderFilter,
  TServerResponse<IOrderItem[]>
>("getMyOrdersApi", async (data) => {
  return privateRequest("/orders/get-my-orders/", {
    method: "POST",
    data,
  });
});
export const getMyRequestsApi = toMutationFetcher<
  IRequestFilter,
  TServerResponse<IRequest[]>
>("getMyRequestsApi", async (data) => {
  return privateRequest("/orders/get-my-requests/", {
    method: "POST",
    data,
  });
});
export const getMyCancelRequestApi = toMutationFetcher<
  IOrderFilter,
  TServerResponse<ICancelRequestOrder[]>
>("getMyCancelRequestApi", async (data) => {
  return privateRequest("/orders/get-my-cancel-requests", {
    method: "POST",
    data,
  });
});
export const getCancelAndReturnRequestApi = toQueryFetcher<
  string,
  TServerResponse<ICancelAndReturnRequest>
>("getCancelAndReturnRequestApi", async (orderId) => {
  return privateRequest(`/orders/get-requests-of-order/${orderId}`, {
    method: "GET",
  });
});
export const getRejectReturnRequestApi = toQueryFetcher<
  string,
  TServerResponse<IRejectReturnRequestOrder>
>("getRejectReturnRequestApi", async (orderId) => {
  return privateRequest(`/orders/get-requests-of-order/${orderId}`, {
    method: "GET",
  });
});

export const getOrderByIdApi = toQueryFetcher<
  string,
  TServerResponse<IOrderItem>
>("getOrderByIdApi", async (orderId) => {
  return privateRequest(`/orders/get-by-id/${orderId}`);
});
export const getParentOrderByIdApi = toQueryFetcher<
  string,
  TServerResponse<IOrder>
>("getParentOrderByIdApi", async (orderId) => {
  return privateRequest(`/orders/get-parent-by-id/${orderId}`);
});

export const filterRequestApi = toQueryFetcher<
  IRequestFilterFilter,
  TServerResponseWithPagination<IRequest[]>
>("filterRequestApi", async (filterData) => {
  const { page, limit, sortBy, order, ...rest } = filterData || {};

  const body: IRequestFilterFilter = {};

  if (rest.statuses?.length) {
    body.statuses = rest.statuses;
  }
  if (rest.types?.length) {
    body.types = rest.types;
  }

  return privateRequest("/orders/filter-parent", {
    method: "POST",
    data: body,
    params: {
      page,
      limit,
      sortBy,
      order,
    },
  });
});

export const filterOrdersApi = toQueryFetcher<
  IOrderFilterFilter,
  TServerResponseWithPagination<IOrder[]>
>("filterOrdersApi", async (filterData) => {
  const { page, limit, sortBy, order, ...rest } = filterData || {};

  const body: IOrderFilterFilter = {};
  if (rest.search) {
    body.search = rest.search;
  }
  if (rest.statuses?.length) {
    body.statuses = rest.statuses;
  }
  if (rest.types?.length) {
    body.types = rest.types;
  }
  if (rest.paymentMethods?.length) {
    body.paymentMethods = rest.paymentMethods;
  }
  if (rest.productIds?.length) {
    body.productIds = rest.productIds;
  }

  return privateRequest("/orders/filter", {
    method: "POST",
    data: body,
    params: {
      page,
      limit,
      sortBy,
      order,
    },
  });
});

export const cancelParentOrderApi = toMutationFetcher<
  ICancelOrder,
  TServerResponse<IOrder>
>("cancelParentOrderApi", async ({ orderId, reason }) => {
  return privateRequest(`/orders/cancel-parent-order/${orderId}`, {
    method: "POST",
    data: { reason },
  });
});

export const filterOrdersParentApi = toQueryFetcher<
  IOrderFilterFilter,
  TServerResponseWithPagination<IOrder[]>
>("filterOrdersParentApi", async (filterData) => {
  const { page, limit, sortBy, order, ...rest } = filterData || {};

  const body: IOrderFilterFilter = {};
  if (rest.search) {
    body.search = rest.search;
  }
  if (rest.statuses?.length) {
    body.statuses = rest.statuses;
  }
  if (rest.types?.length) {
    body.types = rest.types;
  }
  if (rest.paymentMethods?.length) {
    body.paymentMethods = rest.paymentMethods;
  }
  if (rest.productIds?.length) {
    body.productIds = rest.productIds;
  }

  return privateRequest("/orders/filter-parent", {
    method: "POST",
    data: body,
    params: {
      page,
      limit,
      sortBy,
      order,
    },
  });
});
export const getStatusTrackingByIdApi = toQueryFetcher<
  string,
  TServerResponse<IStatusTracking[]>
>("getStatusTrackingByIdApi", async (orderId) => {
  return privateRequest(`/orders/get-status-tracking/${orderId}`);
});

export const getAllOrderListApi = toQueryFetcher<
  void,
  TServerResponse<IOrder[]>
>("getAllOrderListApi", async () => {
  return privateRequest("/orders", {
    method: "GET",
  });
});

export const updateOrderApi = toMutationFetcher<
  IOrder,
  TServerResponse<IOrder>
>("updateOrderApi", async (data) => {
  return privateRequest(`/orders/${data.id}`, {
    method: "PUT",
    data,
  });
});

export const cancelOrderApi = toMutationFetcher<
  ICancelOrder,
  TServerResponse<IOrder>
>("cancelOrderApi", async ({ orderId, reason }) => {
  return privateRequest(`/orders/customer-cancel-order/${orderId}`, {
    method: "POST",
    data: { reason },
  });
});

export const updateOrderStatusApi = toMutationFetcher<
  { id: string; status: string; mediaFiles?: string[] },
  TServerResponse<IOrder>
>("updateOrderStatusApi", async ({ id, status, mediaFiles }) => {
  return privateRequest(`/orders/update-status/${id}`, {
    method: "PUT",
    data: { status: status, mediaFiles: mediaFiles },
  });
});

export const requestReturnOrderApi = toMutationFetcher<
  { orderId: string; reason: string; mediaFiles?: string[] },
  TServerResponse<IOrder>
>("requestReturnOrderApi", async ({ orderId, reason, mediaFiles }) => {
  return privateRequest(`/orders/request-refund/${orderId}`, {
    method: "POST",
    data: { reason: reason, mediaFiles: mediaFiles },
  });
});
