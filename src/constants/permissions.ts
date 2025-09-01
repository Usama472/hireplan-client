export const PERMISSIONS = {
  JOB_CREATE: "j1cr8745",
  JOB_UPDATE: "j2up9321",
  JOB_DELETE: "j3dl6578",
  JOB_GET: "j4gt2390",
  EMAIL_TEMPLATE_CREATE: "e1cr4567",
  EMAIL_TEMPLATE_READ: "e2rd8912",
  EMAIL_TEMPLATE_UPDATE: "e3up3456",
  EMAIL_TEMPLATE_DELETE: "e4dl7890",
  CHAT_ACCESS: "c1ac2345",
  COMPANY_UPDATE: "cu1p6789",
  STAFF_CREATE: "s1cr5678",
  STAFF_READ: "s2rd9012",
  STAFF_UPDATE: "s3up3456",
  STAFF_DELETE: "s4dl7890",
  PAYMENT_PERMISSIONS: "p1fj3423",
  GLOBAL_SETTINGS: "g1gs3423",
  SCHEDULING_ACCESS: "s1in4567",
};

export const SHOW_PERMISSIONS = [
  {
    name: "Allow user to create jobs",
    code: PERMISSIONS.JOB_CREATE,
    type: "job",
  },
  {
    name: "Allow user to update jobs",
    code: PERMISSIONS.JOB_UPDATE,
    type: "job",
  },
  {
    name: "Allow user to delete jobs",
    code: PERMISSIONS.JOB_DELETE,
    type: "job",
  },
  {
    name: "Allow user to get jobs",
    code: PERMISSIONS.JOB_GET,
    type: "job",
  },
  {
    name: "Allow user to create email templates",
    code: PERMISSIONS.EMAIL_TEMPLATE_CREATE,
    type: "email",
  },
  {
    name: "Allow user to read email templates",
    code: PERMISSIONS.EMAIL_TEMPLATE_READ,
    type: "email",
  },
  {
    name: "Allow user to update email templates",
    code: PERMISSIONS.EMAIL_TEMPLATE_UPDATE,
    type: "email",
  },
  {
    name: "Allow user to delete email templates",
    code: PERMISSIONS.EMAIL_TEMPLATE_DELETE,
    type: "email",
  },
  {
    name: "Allow user to access chats",
    code: PERMISSIONS.CHAT_ACCESS,
    type: "chat",
  },
  {
    name: "Allow user to update company",
    code: PERMISSIONS.COMPANY_UPDATE,
    type: "company",
  },
  {
    name: "Allow user to create staff",
    code: PERMISSIONS.STAFF_CREATE,
    type: "staff",
  },
  {
    name: "Allow user to read staff",
    code: PERMISSIONS.STAFF_READ,
    type: "staff",
  },
  {
    name: "Allow user to update staff",
    code: PERMISSIONS.STAFF_UPDATE,
    type: "staff",
  },
  {
    name: "Allow user to delete staff",
    code: PERMISSIONS.STAFF_DELETE,
    type: "staff",
  },
  {
    name: "Allow user to manage scheduling",
    code: PERMISSIONS.SCHEDULING_ACCESS,
    type: "scheduling",
  },
];
