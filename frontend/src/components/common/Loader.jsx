import { Loader2 } from 'lucide-react';

export default function Loader({ fullPage = false, label = 'Loading…', className = '' }) {
  const spinner = (
    <div role="status" className={`flex items-center justify-center gap-2 py-10 text-ink/60 ${className}`}>
      <Loader2 className="animate-spin text-primary" size={22} />
      <span className="text-sm">{label}</span>
    </div>
  );
  return fullPage ? <div className="flex h-screen items-center justify-center bg-cream">{spinner}</div> : spinner;
}