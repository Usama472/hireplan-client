import * as applicantApi from "./applicant/api";
import * as applicantAuthApi from "./applicant-auth/api";
import * as attachmentApi from "./attachment/api";
import * as authApi from "./auth/api";
import * as automationApi from "./automation/api";
import * as availabilityApi from "./availability/api";
import * as companyApi from "./company/api";
import * as emailChatApi from "./email-chat/api";
import * as emailTemplateApi from "./email-template/api";
import * as globalSettingApi from "./global-setting/api";
import * as googleApi from "./google/api";
import * as holidaysApi from "./holidays/api";
import * as interviewApi from "./interview/api";
import * as jobTemplateApi from "./job-template/api";
import * as jobApi from "./job/api";
import * as jobDraftApi from "./job-draft/api";
import * as meetingApi from "./meeting/api";
import * as microsoftApi from "./microsoft/api";
import * as roleApi from "./role/api";
import * as smsApi from "./sms/api";
import * as staffApi from "./staff/api";
import * as userApi from "./user/api";
import * as zoomApi from "./zoom/api";

const API = {
  auth: authApi,
  user: userApi,
  job: jobApi,
  jobDraft: jobDraftApi,
  jobTemplate: jobTemplateApi,
  company: companyApi,
  attachment: attachmentApi,
  applicant: applicantApi,
  applicantAuth: applicantAuthApi,
  availability: availabilityApi,
  google: googleApi,
  microsoft: microsoftApi,
  zoom: zoomApi,
  meeting: meetingApi,
  holidays: holidaysApi,
  emailChat: emailChatApi,
  emailTemplate: emailTemplateApi,
  globalSetting: globalSettingApi,
  interview: interviewApi,
  role: roleApi,
  sms: smsApi,
  staff: staffApi,
  automation: automationApi,
};

export default API;
