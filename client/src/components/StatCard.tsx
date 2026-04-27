interface StatCardProps {
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}

export function StatCard({ label, value, subtext, color = "#111827" }: StatCardProps) {
  return (
    <div style={{
      background: "#fff",
      borderRadius: 12,
      padding: "20px 24px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
    }}>
      <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500, marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1.2 }}>
        {value}
      </div>
      {subtext && (
        <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 4 }}>{subtext}</div>
      )}
    </div>
  );
}
