export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-MX', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString('es-MX', {
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function calculateWorkedHours(checkIn: Date, checkOut: Date): number {
  const diffMs = checkOut.getTime() - checkIn.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
}

export function checkTardiness(
  checkInTime: Date,
  scheduledTime: string,
  toleranceMinutes: number,
): { late: boolean; lateMinutes: number } {
  const [hours, minutes] = scheduledTime.split(':').map(Number);
  const scheduled = new Date(checkInTime);
  scheduled.setHours(hours, minutes, 0, 0);

  const deadlineMs = scheduled.getTime() + toleranceMinutes * 60 * 1000;
  const lateMs = checkInTime.getTime() - deadlineMs;

  if (lateMs > 0) {
    return { late: true, lateMinutes: Math.ceil(lateMs / (60 * 1000)) };
  }
  return { late: false, lateMinutes: 0 };
}

export function calculateOvertime(workedHours: number, scheduledHours: number = 8): number {
  return Math.max(0, Math.round((workedHours - scheduledHours) * 100) / 100);
}

export function startOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date = new Date()): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
