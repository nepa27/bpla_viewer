export function prepareFlightDurations(duration) {
  // flight_duration: "1:00"
  if (!duration || duration === 'Не найдено') {
    return 0;
  }

  try {
    const [durationHours, durationMinutes] = duration.split(':').map(Number);

    if (isNaN(durationHours) || isNaN(durationMinutes)) {
      return 0;
    }

    const durationTotalMinutes = durationHours * 60 + durationMinutes;

    return Math.max(0, durationTotalMinutes);
  } catch (err) {
    console.warn('Error calculating flight duration ', err);
    return 0;
  }
}
