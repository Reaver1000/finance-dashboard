interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div style={{
      padding: "16px 20px",
      background: "#FEF2F2",
      border: "1px solid #FECACA",
      borderRadius: 8,
      color: "#DC2626",
      fontSize: 14,
    }}>
      Failed to load data: {message}
    </div>
  );
}
