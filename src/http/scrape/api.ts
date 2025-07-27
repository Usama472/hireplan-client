import { post } from '../apiHelper'

export const scrapeWebsite = (id: string, url: string) =>
  post('/scraper/scrape', { id, url })
