import { get } from "../apiHelper";

export const getExtendedHolidays = () => get("/holidays");

export const getHolidays = (year: number) => get(`/holidays/${year}`);
