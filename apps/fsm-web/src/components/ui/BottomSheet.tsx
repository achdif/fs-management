import type { ReactNode } from 'react';
import Button from './Button';

interface Props {
  open: boolean;
  title: string;
  message?: string;
  /** Emoji/glyph ikon di lingkaran 56px (sesuai Figma: ✕, 📶, dll) */
  icon?: string;
  /** Background lingkaran ikon */
  iconBg?: string;
  /** Warna glyph ikon */
  iconColor?: string;
  /** Kode error yang tampil di pill abu-abu */
  errorCode?: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  children?: ReactNode;
  onClose?: () => void;
}

export default function BottomSheet({
  open,
  title,
  message,
  icon,
  iconBg = 'bg-danger',
  iconColor = 'text-white',
  errorCode,
  primaryLabel = 'Try Again',
  onPrimary,
  secondaryLabel = 'Cancel',
  onSecondary,
  children,
  onClose,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true">
      <button aria-label="Close" className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[430px] rounded-t-[28px] bg-white px-6 pb-8 pt-3 shadow-2xl">
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-handle" />

        {icon && (
          <div
            className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-[28px] ${iconBg} ${iconColor}`}
          >
            {icon}
          </div>
        )}

        <h2 className="mt-4 text-center text-[24px] font-bold text-ink">{title}</h2>
        {message && (
          <p className="mt-2 text-center text-[14px] leading-relaxed text-subtle">{message}</p>
        )}

        {errorCode && (
          <div className="mx-auto mt-4 flex h-8 w-full max-w-[327px] items-center justify-center rounded-xl bg-surface">
            <span className="text-[12px] font-medium tracking-wide text-primary">{errorCode}</span>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          {children ?? (
            <>
              <Button variant="primary" onClick={onPrimary} className="flex-1">
                {primaryLabel}
              </Button>
              <Button variant="secondary" onClick={onSecondary ?? onClose} className="flex-1">
                {secondaryLabel}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
