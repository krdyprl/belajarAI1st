export default function Card({
  children,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`glass rounded-2xl p-5 sm:p-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
