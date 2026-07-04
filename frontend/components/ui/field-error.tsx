export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[12px] text-crimson">{message}</p>;
}
