import * as authApi from './auth/api'
import * as companyApi from './company/api'
import * as jobApi from './job/api'
import * as userApi from './user/api'

const API = {
  auth: authApi,
  user: userApi,
  job: jobApi,
  company: companyApi,
}

export default API
