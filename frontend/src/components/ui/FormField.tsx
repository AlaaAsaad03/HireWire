import { forwardRef, useState, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { AlertCircle, CheckCircle } from "lucide-react";

interface FormFieldProps extends InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label?: string;
  error?: string;
  hint?: string;
  success?: string;
  isTextarea?: boolean;
  rows?: number;
  validate?: (value: string) => string | undefined;
}

const FormField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  FormFieldProps
>(
  (
    {
      className,
      label,
      error,
      hint,
      success,
      isTextarea,
      rows = 3,
      validate,
      onChange,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [touched, setTouched] = useState(false);
    const [validationError, setValidationError] = useState<
      string | undefined
    >();

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      if (validate && touched) {
        const error = validate(e.target.value);
        setValidationError(error);
      }
      onChange?.(e as any);
    };

    const handleBlur = (
      e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setTouched(true);
      if (validate) {
        const error = validate(e.target.value);
        setValidationError(error);
      }
      onBlur?.(e as any);
    };

    const displayError = error || validationError;
    const hasError = Boolean(displayError);
    const hasSuccess = success && !hasError;

    const baseInputStyles = cn(
      "flex h-11 w-full rounded-lg border bg-background px-4 py-2 text-base transition-all duration-200",
      "placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      hasError && "border-destructive focus:ring-destructive pr-10",
      hasSuccess && "border-green-500 focus:ring-green-500 pr-10",
      !hasError &&
        !hasSuccess &&
        "border-border focus:ring-primary focus:border-transparent",
      className,
    );

    const textareaStyles = cn(
      "flex w-full rounded-lg border bg-background px-4 py-2 text-base transition-all duration-200",
      "placeholder:text-muted-foreground resize-none",
      "focus:outline-none focus:ring-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      hasError && "border-destructive focus:ring-destructive",
      hasSuccess && "border-green-500 focus:ring-green-500",
      !hasError &&
        !hasSuccess &&
        "border-border focus:ring-primary focus:border-transparent",
      className,
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {isTextarea ? (
            <textarea
              ref={ref as any}
              className={textareaStyles}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={rows}
              {...(props as any)}
            />
          ) : (
            <input
              ref={ref as any}
              className={baseInputStyles}
              onChange={handleChange}
              onBlur={handleBlur}
              {...props}
            />
          )}

          {/* Success/Error Icon */}
          {(hasError || hasSuccess) && !isTextarea && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError && <AlertCircle className="w-5 h-5 text-destructive" />}
              {hasSuccess && <CheckCircle className="w-5 h-5 text-green-500" />}
            </div>
          )}
        </div>

        {/* Hint Text */}
        {hint && !hasError && !hasSuccess && (
          <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>
        )}

        {/* Error Message */}
        {hasError && (
          <p className="mt-1.5 text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {displayError}
          </p>
        )}

        {/* Success Message */}
        {hasSuccess && (
          <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            {success}
          </p>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";

export default FormField;
