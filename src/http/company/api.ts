import { get } from '../apiHelper'

export const getPublicCompany = (slug: string) => get(`/companies/p/${slug}`)
export const getCompanySlug = (companyId: string) => get(`/companies/${companyId}/slug`)
