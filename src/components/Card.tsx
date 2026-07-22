export default function Card({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
