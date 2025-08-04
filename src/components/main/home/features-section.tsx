import {
  BarChart3,
  Brain,
  Clock,
  Shield,
  Target,
  Users,
  Zap,
} from "lucide-react";
export function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Matching",
      description:
        "Advanced machine learning algorithms analyze resumes, skills, and job requirements to find perfect matches with 95% accuracy.",
      color: "blue",
    },
    {
      icon: Clock,
      title: "Lightning Fast Screening",
      description:
        "Reduce screening time from hours to minutes. Our AI processes hundreds of candidates instantly.",
      color: "green",
    },
    {
      icon: Target,
      title: "Precision Filtering",
      description:
        "Set custom criteria and weights. Our AI understands nuanced requirements beyond keyword matching.",
      color: "purple",
    },
    {
      icon: BarChart3,
      title: "Smart Analytics",
      description:
        "Get actionable insights on candidate quality, market trends, and hiring performance metrics.",
      color: "orange",
    },
    {
      icon: Shield,
      title: "Bias-Free Hiring",
      description:
        "Eliminate unconscious bias with objective, data-driven evaluation that focuses on skills and qualifications.",
      color: "red",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Seamless workflow for hiring teams with real-time collaboration, comments, and decision tracking.",
      color: "indigo",
    },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    red: "bg-red-50 text-red-600 border-red-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
  };

  return (
    <section id="features" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
            <Zap className="h-4 w-4" />
            <span>Powerful Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Everything you need to hire smarter,
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              not harder
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive AI platform streamlines every step of your hiring
            process, from candidate discovery to final selection. Transform
            weeks of work into days.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 hover:-translate-y-1"
            >
              <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 border ${
                  colorClasses[feature.color as keyof typeof colorClasses]
                }`}
              >
                <feature.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
