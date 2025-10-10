import { APP_NAME, COMPONENT_STYLES } from "@/constants";

export function ApplicantHeader() {
  return (
    <header className={`w-full z-50 sticky top-0 ${COMPONENT_STYLES.header.main}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center min-w-0">
            <div className="flex items-center space-x-2 min-w-0">
              <img src="/logo.png" alt="HirePlan" className="w-8 h-8 flex-shrink-0" />
              <span className="text-lg sm:text-xl font-bold truncate text-gray-900">
                {APP_NAME}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <span className={`text-sm ${COMPONENT_STYLES.text.muted}`}>
              Applicant Portal
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
