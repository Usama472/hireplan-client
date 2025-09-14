import TriggerSection from "./trigger-section";

export default function AutomationBuilder() {
  return (
    <div className="rounded-lg p-6 min-h-[500px]">
      {/* Always show trigger selection at the top */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          When should this automation run?
        </h3>
        <TriggerSection />
      </div>
    </div>
  );
}
