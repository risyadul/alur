// Tanpa "use client": komponen ini selalu ditarik ke graf klien lewat AlurApp,
// yang memegang batas client. Menandainya sebagai entry akan mewajibkan props
// serializable — padahal props-nya memang berisi callback.
import { useId } from "react";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isMultiline?: boolean;
  hasAutoFocus?: boolean;
};

/** Cincin fokus hijau — PRD §10 mensyaratkan fokus keyboard terlihat. */
const FIELD_CLASS =
  "t-body w-full rounded-[10px] border border-line bg-surface px-[13px] text-ink transition placeholder:text-muted focus:border-green focus:shadow-[0_0_0_3px_rgb(42_106_85/0.16)] focus:outline-none";

export function Field({
  label,
  value,
  onChange,
  placeholder,
  isMultiline = false,
  hasAutoFocus = false,
}: Props) {
  const id = useId();

  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="t-label text-ink">
        {label}
      </label>
      {isMultiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          autoFocus={hasAutoFocus}
          className={`${FIELD_CLASS} resize-none py-[11px]`}
        />
      ) : (
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={hasAutoFocus}
          className={`${FIELD_CLASS} h-11`}
        />
      )}
    </div>
  );
}
