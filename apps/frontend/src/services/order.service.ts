import api from '@/lib/api';
import { Order, OrderStatus } from '@/types/order';

export interface CreateOrderData {
  shippingAddress: string;
  paymentMethod: string;
  paymentIntentId?: string;
}

class OrderService {
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  async createPaymentIntent(): Promise<{ clientSecret: string }> {
    const response = await api.post('/orders/create-payment-intent', {});
    return response.data;
  }

  async getUserOrders(): Promise<Order[]> {
    const response = await api.get('/orders');
    return response.data;
  }

  async getOrderById(id: string): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  }

  // Admin methods
  async getAllOrders(): Promise<Order[]> {
    const response = await api.get('/orders/admin');
    return response.data;
  }

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  }

  async deleteOrder(id: string): Promise<void> {
    await api.delete(`/orders/${id}`);
  }
}

export default new OrderService();