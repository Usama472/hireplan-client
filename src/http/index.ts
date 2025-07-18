import * as authApi from './auth/api'
import * as jobApi from './job/api'
import * as userApi from './user/api'

const API = {
  auth: authApi,
  user: userApi,
  job: jobApi,
}

export default API
