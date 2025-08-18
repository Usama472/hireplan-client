import * as applicantApi from "./applicant/api";
import * as attachmentApi from "./attachment/api";
import * as authApi from "./auth/api";
import * as availabilityApi from "./availability/api";
import * as companyApi from "./company/api";
import * as googleApi from "./google/api";
import * as jobApi from "./job/api";
import * as userApi from "./user/api";
import * as emailTemplateApi from "./email-template/api";
import * as globalSettingApi from "./global-setting/api";
import * as interviewApi from './interview/api';

const API = {
  auth: authApi,
  user: userApi,
  job: jobApi,
  company: companyApi,
  attachment: attachmentApi,
  applicant: applicantApi,
  availability: availabilityApi,
  google: googleApi,
  emailTemplate: emailTemplateApi,
  globalSetting: globalSettingApi,
  interview:interviewApi
};

export default API;
