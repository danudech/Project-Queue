import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { http } from "@/lib/http/client";
import { BookingDto, CreateBookingDto } from "@/types/booking";

export const useBooking = (customerId?: number) => {
  const queryClient = useQueryClient();

  const getBookings = useQuery({
    queryKey: ["bookings", customerId],
    queryFn: () => http.get<BookingDto[]>("/booking", { params: { customerId } }),
    enabled: !!customerId,
  });

  const createBooking = useMutation({
    mutationFn: (data: CreateBookingDto) => http.post<BookingDto>("/booking", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings", customerId] });
    },
  });

  return {
    getBookings,
    createBooking,
  };
};
