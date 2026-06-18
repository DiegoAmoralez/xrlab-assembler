import { getPriorityLabel } from "@/lib/types";

type PriorityBadgeProps = {
  priority: string;
};

export const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  return (
    <span className={`priority-${priority}`}>{getPriorityLabel(priority)}</span>
  );
};
