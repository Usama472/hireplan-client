import { post } from '../apiHelper'

export const scrapeWebsite = (url: string) => post('/scraper/scrape', { url })
