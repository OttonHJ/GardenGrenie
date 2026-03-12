// Determina si una planta necesita riego hoy o ya está vencida
export function isWateringDue(nextWatering: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const waterDate = new Date(nextWatering);
  waterDate.setHours(0, 0, 0, 0);
  return waterDate <= today;
}
