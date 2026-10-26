import { jalaaliMonthLength, toGregorian, toJalaali } from 'jalaali-js'

export type JalaliDate = {
  jy: number
  jm: number
  jd: number
}

export const JALALI_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
] as const

export const JALALI_WEEKDAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
] as const

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(value: number | string): string {
  return String(value).replace(
    /[0-9]/g,
    (digit) => PERSIAN_DIGITS[Number(digit)],
  )
}

export function todayJalali(): JalaliDate {
  return toJalaali(new Date())
}

export function addJalaliDays(date: JalaliDate, days: number): JalaliDate {
  const gregorian = toGregorian(date.jy, date.jm, date.jd)
  const next = new Date(
    Date.UTC(gregorian.gy, gregorian.gm - 1, gregorian.gd) + days * 86_400_000,
  )
  return toJalaali(
    next.getUTCFullYear(),
    next.getUTCMonth() + 1,
    next.getUTCDate(),
  )
}

export function addJalaliMonths(
  jy: number,
  jm: number,
  delta: number,
): { jy: number; jm: number } {
  const months = jy * 12 + (jm - 1) + delta
  return { jy: Math.floor(months / 12), jm: (months % 12) + 1 }
}

export function jalaliMonthDays(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm)
}

export function jalaliWeekdayIndex(date: JalaliDate): number {
  const gregorian = toGregorian(date.jy, date.jm, date.jd)
  const weekday = new Date(
    gregorian.gy,
    gregorian.gm - 1,
    gregorian.gd,
  ).getDay()
  return (weekday + 1) % 7
}

export function formatJalali(date: JalaliDate): string {
  const month = String(date.jm).padStart(2, '0')
  const day = String(date.jd).padStart(2, '0')
  return toPersianDigits(`${date.jy}/${month}/${day}`)
}

export function formatJalaliLong(date: JalaliDate): string {
  return `${toPersianDigits(date.jd)} ${JALALI_MONTHS[date.jm - 1]} ${toPersianDigits(date.jy)}`
}

export function sameJalaliDate(a: JalaliDate, b: JalaliDate): boolean {
  return a.jy === b.jy && a.jm === b.jm && a.jd === b.jd
}
