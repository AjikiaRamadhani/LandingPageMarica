const TRACKING_URLS: Record<string, string> = {
  jne: "https://www.jne.co.id/en/tracking/trace",
  jnt: "https://tracking.jet.co.id/",
  "j&t": "https://tracking.jet.co.id/",
  sicepat: "https://www.sicepat.com/checkAwb",
  anteraja: "https://anteraja.id/tracking",
  lion: "https://lionparcel.com/track/stt",
  pos: "https://www.posindonesia.co.id/id/tracking",
};

function normalizeCourier(courier: string) {
  return courier.trim().toLowerCase().replace(/\s+/g, "");
}

export function getTrackingUrl(courier: string | null | undefined, trackingNumber: string | null | undefined) {
  if (!courier || !trackingNumber) return null;
  const baseUrl = TRACKING_URLS[normalizeCourier(courier)];
  return baseUrl ? `${baseUrl}?awb=${encodeURIComponent(trackingNumber)}` : null;
}
