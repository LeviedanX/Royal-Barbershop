// Utility helpers for calculating booking prices in one place

export const getBarberBasePrice = (barber) =>
  Number((barber?.base_price ?? barber?.price ?? 0) || 0);

export const getServiceBasePrice = (service) =>
  Number((service?.base_price ?? service?.price ?? 0) || 0);

export const getSkillPremium = (barber, service) => {
  if (!barber || !service) return 0;

  const serviceBase = getServiceBasePrice(service);
  const skill = String(barber.skill_level || "").toLowerCase();

  if (skill === "senior") return 0.2 * serviceBase;
  if (skill === "master") return 0.4 * serviceBase;
  return 0;
};

export const calculateBookingPrice = (barber, service) => {
  if (!barber || !service) return 0;

  const serviceBase = getServiceBasePrice(service);
  const barberBase = getBarberBasePrice(barber);
  const skillPremium = getSkillPremium(barber, service);

  const total = serviceBase + barberBase + skillPremium;

  // keep it integer-friendly for display/payment
  return Math.round(total);
};
