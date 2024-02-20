export function beforeOpening() {
  const now = new Date();

  const chicagoNow = new Date(
    now.toLocaleString("en-US", { timeZone: "America/Chicago" }),
  );
  const chicagoFourAm = new Date(
    chicagoNow.getFullYear(),
    chicagoNow.getMonth(),
    chicagoNow.getDate(),
    4,
    0,
    0,
  );

  if (chicagoNow.getTime() > chicagoFourAm.getTime()) {
    chicagoFourAm.setDate(chicagoFourAm.getDate() + 1);
  }

  return chicagoFourAm.toUTCString();
}
