interface BadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const styles: Record<string, string> = {
  valid: 'bg-success-bg text-success',
  kurang_dapat_dipercaya: 'bg-error-bg text-error',
  perlu_verifikasi: 'bg-warning-bg text-warning',
  pending: 'bg-gray-100 text-text-secondary',
}

const labels: Record<string, string> = {
  valid: 'Terdaftar BPOM',
  kurang_dapat_dipercaya: 'Tidak Terdaftar',
  perlu_verifikasi: 'Perlu Dicek',
  pending: 'Belum Dicek',
}

const sizeClasses = {
  sm: 'px-2.5 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
}

export default function Badge({ status, size = 'md' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${styles[status] || styles.pending} ${sizeClasses[size]}`}
    >
      {labels[status] || status}
    </span>
  )
}
