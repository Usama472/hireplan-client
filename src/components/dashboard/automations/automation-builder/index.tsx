import TriggerSection from "./trigger-section";

interface AutomationBuilderProps {
  mode?: string;
  onSave?: (automation: any) => void;
  automation?: any;
  isPageLayout?: boolean;
}

export default function AutomationBuilder(props?: AutomationBuilderProps) {
  return (
    <div className="rounded-lg p-2.5 sm:p-3 min-h-[400px]">
      {/* Always show trigger selection at the top */}
      <div>
        <h3 className="text-base font-semibold mb-2.5">
          When should this automation run?
        </h3>
        <TriggerSection />
      </div>
    </div>
  );
}
