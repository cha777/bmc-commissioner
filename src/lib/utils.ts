import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

export const wait = (time: number) => new Promise((res) => setTimeout(res, time));

export const adjustToDateStart = (date: Date) => {
  date.setHours(0, 0, 0, 0);
};

export const adjustToDateEnd = (date: Date) => {
  date.setHours(23, 59, 59, 99);
};
