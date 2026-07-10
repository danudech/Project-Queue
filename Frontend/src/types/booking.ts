export interface BookingDto {
  id: number;
  customerId: number;
  serviceId: number;
  branchId: number;
  bookingDate: string;
  bookingTime: string;
  status: string;
  createdAt: string;
}

export interface CreateBookingDto {
  customerId: number;
  serviceId: number;
  branchId: number;
  bookingDate: string;
  bookingTime: string;
}
