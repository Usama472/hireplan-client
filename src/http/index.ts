import * as applicantApi from './applicant/api'
import * as attachmentApi from './attachment/api'
import * as authApi from './auth/api'
import * as availabilityApi from './availability/api'
import * as companyApi from './company/api'
import * as jobApi from './job/api'
import * as userApi from './user/api'

const API = {
  auth: authApi,
  user: userApi,
  job: jobApi,
  company: companyApi,
  attachment: attachmentApi,
  applicant: applicantApi,
  availability: availabilityApi,
}

export default API
