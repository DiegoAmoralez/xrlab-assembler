import { getStatusLabel } from "@/lib/types";

type StatusBadgeProps = {
  status: string;
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  return (
    <span className={`status-${status}`}>{getStatusLabel(status)}</span>
  );
};
