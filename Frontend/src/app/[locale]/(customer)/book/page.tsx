"use client";

import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock3, MapPin, Phone, Scissors, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type PublicService = {
  id: number;
  name: string;
  duration: string;
  price: string;
  category: string;
};

const services: PublicService[] = [
  { id: 1, name: "Haircut", duration: "30 min", price: "THB 300", category: "Hair" },
  { id: 2, name: "Wash & Blow", duration: "45 min", price: "THB 450", category: "Hair" },
  { id: 3, name: "Hair Color", duration: "90 min", price: "THB 1,200", category: "Color" },
  { id: 4, name: "Beard Trim", duration: "20 min", price: "THB 250", category: "Grooming" },
];

const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "13:00", "13:30", "14:00", "15:00", "16:30"];

export default function PublicCustomerBookingPage() {
  const [query, setQuery] = useState("");
  const [selectedService, setSelectedService] = useState<PublicService>(services[0]);
  const [selectedTime, setSelectedTime] = useState("10:30");
  const [submitted, setSubmitted] = useState(false);

  const filteredServices = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return services;
    return services.filter((service) =>
      [service.name, service.category].some((value) => value.toLowerCase().includes(keyword))
    );
  }, [query]);

  return (
    <main className="min-h-dvh bg-default-50">
      <section className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge color="primary">Public booking mockup</Badge>
            <h1 className="mt-4 text-3xl font-semibold text-default-900">EZQueue Demo Shop</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Customer-facing booking page mockup for selecting a service, choosing a time slot, and confirming queue details.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                Bangkok, Thailand
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                081-234-5678
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                Open 09:00 - 18:00
              </span>
            </div>
          </div>
          <Card className="w-full max-w-sm">
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">Selected booking</p>
              <p className="mt-2 text-xl font-semibold">{selectedService.name}</p>
              <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center justify-between">
                  <span>Duration</span>
                  <span className="font-medium text-default-900">{selectedService.duration}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Price</span>
                  <span className="font-medium text-default-900">{selectedService.price}</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Time</span>
                  <span className="font-medium text-default-900">{selectedTime}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Choose service</h2>
                <p className="text-sm text-muted-foreground">Mock service catalog from the shop API.</p>
              </div>
              <div className="relative sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search services..."
                  className="pl-9"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(service);
                    setSubmitted(false);
                  }}
                  className={[
                    "rounded-md border p-4 text-left transition-colors",
                    selectedService.id === service.id
                      ? "border-primary bg-primary/5"
                      : "border-default-200 bg-white hover:bg-default-50",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-default-900">{service.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{service.category}</p>
                    </div>
                    <Scissors className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{service.duration}</span>
                    <span className="font-semibold">{service.price}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div>
              <h2 className="text-lg font-semibold">Choose time</h2>
              <p className="text-sm text-muted-foreground">Available slots are local mock data.</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot}
                  type="button"
                  variant={selectedTime === slot ? "default" : "outline"}
                  onClick={() => {
                    setSelectedTime(slot);
                    setSubmitted(false);
                  }}
                >
                  {slot}
                </Button>
              ))}
            </div>

            <div className="mt-6 rounded-md border border-dashed p-4">
              <p className="flex items-center gap-2 text-sm font-medium">
                <CalendarDays className="h-4 w-4" />
                Today
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                This mock page can later read service, branch, holiday, and business-hour APIs to calculate real availability.
              </p>
            </div>

            <Button className="mt-6 w-full" onClick={() => setSubmitted(true)}>
              Confirm mock booking
            </Button>

            {submitted && (
              <div className="mt-4 flex items-start gap-3 rounded-md bg-success/10 p-4 text-success">
                <CheckCircle2 className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="font-medium">Mock booking confirmed</p>
                  <p className="text-sm">Your queue for {selectedService.name} at {selectedTime} is ready.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}