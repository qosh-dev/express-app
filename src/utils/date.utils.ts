export const DateUtils = {
  datesAreEqual: (a: Date, b: Date) => {
    return (
      a.getDay() === b.getDay() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    )
  },
}
