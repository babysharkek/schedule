"use client";

export function IosRow({
  label,
  value,
  onClick,
  danger,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="ios-row flex items-center justify-between"
      disabled={!onClick}
    >
      <span
        className={`text-[15px] ${danger ? "text-bad" : "text-label"}`}
      >
        {label}
      </span>
      {value ? (
        <span className="text-[15px] text-label-2">{value}</span>
      ) : null}
    </button>
  );
}