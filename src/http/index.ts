import * as applicantApi from "./applicant/api";
import * as attachmentApi from "./attachment/api";
import * as authApi from "./auth/api";
import * as availabilityApi from "./availability/api";
import * as companyApi from "./company/api";
import * as emailChatApi from "./email-chat/api";
import * as emailTemplateApi from "./email-template/api";
import * as globalSettingApi from "./global-setting/api";
import * as googleApi from "./google/api";
import * as interviewApi from "./interview/api";
import * as microsoftApi from "./microsoft/api";
import * as jobTemplateApi from "./job-template/api";
import * as jobApi from "./job/api";
import * as roleApi from "./role/api";
import * as staffApi from "./staff/api";
import * as userApi from "./user/api";

const API = {
  auth: authApi,
  user: userApi,
  job: jobApi,
  jobTemplate: jobTemplateApi,
  company: companyApi,
  attachment: attachmentApi,
  applicant: applicantApi,
  availability: availabilityApi,
  google: googleApi,
  microsoft: microsoftApi,
  emailChat: emailChatApi,
  emailTemplate: emailTemplateApi,
  globalSetting: globalSettingApi,
  interview: interviewApi,
  role: roleApi,
  staff: staffApi,
};

export default API;
