import { allTriggers } from "@/constants/automations-constants";
import { useParams } from "react-router";

function TriggersPage() {
  const { triggerId } = useParams();
  console.log(triggerId);

  const trigger = allTriggers.find((t) => t.type === triggerId);

  if (!trigger) {
    return <div>Trigger not found</div>;
  }

  return (
    <div>
      <div>
        <h1>{trigger.label}</h1>
      </div>
    </div>
  );
}

export default TriggersPage;
