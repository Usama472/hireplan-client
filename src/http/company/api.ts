import { get } from '../apiHelper'

export const getPublicCompany = (slug: string) => get(`/companies/p/${slug}`)
