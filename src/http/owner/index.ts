// Owner authentication service
export { ownerAuthService } from './auth';

// Owner management service
export { ownerManagementService } from './management';

// Owner subscription service
export { ownerSubscriptionService } from './subscriptions';

// Owner dashboard service
export { ownerDashboardService } from './dashboard';

// Owner support service
export { ownerSupportService } from './support';

// Re-export types
export type { Company, User, SuspendedAccountSummary } from './management';
export type { OwnerSubscription, SubscriptionAnalytics, RevenueData } from './subscriptions';
export type { OwnerLoginRequest, OwnerLoginResponse, OwnerUser } from './auth';
export type { DashboardStats, RecentActivity, SystemHealth } from './dashboard';
export type { SupportTicket } from './support';
