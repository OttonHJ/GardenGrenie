export const DateUtil = {
  getHour: (date: string) => {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  },
};
