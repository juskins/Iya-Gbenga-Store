import type { ReactNode } from "react";

export const inputClass =
  "w-full min-h-11 bg-surface-container-low rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface shadow-sm focus:outline-none focus:bg-surface-container-lowest focus-visible:ring-2 focus-visible:ring-primary aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-error";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  className?: string;
  children: (a11y: { id: string; "aria-describedby"?: string; "aria-invalid": boolean }) => ReactNode;
};

/** Labelled form field with inline error wired through aria-describedby. */
export default function Field({ id, label, error, hint, optional, className = "", children }: FieldProps) {
  const errId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-label-md text-label-md text-on-surface-variant mb-1.5">
        {label}
        {optional && <span className="font-normal text-outline"> (optional)</span>}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 font-body-sm text-body-sm text-on-surface-variant">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} role="alert" className="mt-1.5 flex items-start gap-1 font-body-sm text-body-sm text-error">
          <span aria-hidden="true" className="material-symbols-outlined !text-base leading-none mt-px">
            error
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
