"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Icon from "@/components/store/Icon";
import GoogleSignInButton from "./GoogleSignInButton";
import { signInSchema, signUpSchema, type SignInValues, type SignUpValues } from "@/lib/validators/auth";

type Mode = "signin" | "signup";

const fieldShell =
  "relative flex items-center rounded-xl bg-surface-container-low shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_2px_#164e33]";
const inputClass =
  "w-full bg-transparent px-4 py-3 min-h-12 font-body-md text-body-md text-on-surface focus:outline-none placeholder:text-outline";
const labelClass = "font-label-md text-label-md text-on-surface font-semibold";

function Divider({ children }: { children: string }) {
  return (
    <div className="relative flex py-space-md items-center">
      <div className="flex-grow bg-surface-container-highest h-px" />
      <span className="flex-shrink mx-4 font-label-caps text-label-caps uppercase text-outline">{children}</span>
      <div className="flex-grow bg-surface-container-highest h-px" />
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1 font-body-sm text-body-sm text-error">
      <Icon name="error" className="text-base" />
      {message}
    </p>
  );
}

function PasswordInput({
  id,
  placeholder,
  autoComplete,
  describedBy,
  invalid,
  registration,
}: {
  id: string;
  placeholder: string;
  autoComplete: string;
  describedBy?: string;
  invalid: boolean;
  registration: ReturnType<ReturnType<typeof useForm<SignInValues>>["register"]>;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={fieldShell}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className={inputClass}
        {...registration}
      />
      <button
        type="button"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className="w-11 h-11 mr-1 flex items-center justify-center text-outline hover:text-on-surface transition-colors"
      >
        <Icon name={visible ? "visibility_off" : "visibility"} className="text-xl" />
      </button>
    </div>
  );
}

function PendingNotice() {
  return (
    <div
      role="status"
      className="flex items-start gap-2 p-3 rounded-lg bg-secondary-fixed text-on-secondary-fixed font-body-sm text-body-sm"
    >
      <Icon name="info" className="text-lg shrink-0" />
      <span>Email and phone sign-in isn&apos;t connected yet. Please continue with Google for now.</span>
    </div>
  );
}

function SignInForm({ onSwitch }: { onSwitch: () => void }) {
  const [notice, setNotice] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { identifier: "", password: "", remember: true },
  });

  const onSubmit = async () => {
    // TODO(auth): call the real sign-in once the auth backend supports email/phone credentials.
    setNotice(false);
    await new Promise((r) => setTimeout(r, 500));
    setNotice(true);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-space-md">
      {notice && <PendingNotice />}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="signin-identifier" className={labelClass}>
          Nigerian Phone Number or Email
        </label>
        <div className={fieldShell}>
          <input
            id="signin-identifier"
            type="text"
            inputMode="email"
            autoComplete="username"
            placeholder="0803 456 7890 or name@email.com"
            aria-invalid={!!errors.identifier}
            aria-describedby={errors.identifier ? "signin-identifier-error" : undefined}
            className={inputClass}
            {...register("identifier")}
          />
        </div>
        <FieldError id="signin-identifier-error" message={errors.identifier?.message} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="signin-password" className={labelClass}>
            Account Password
          </label>
          <button type="button" onClick={() => setNotice(true)} className="font-label-md text-label-md text-secondary hover:text-primary transition-colors font-medium min-h-11">
            Forgot Password?
          </button>
        </div>
        <PasswordInput
          id="signin-password"
          placeholder="Enter your password"
          autoComplete="current-password"
          invalid={!!errors.password}
          describedBy={errors.password ? "signin-password-error" : undefined}
          registration={register("password")}
        />
        <FieldError id="signin-password-error" message={errors.password?.message} />
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none py-1 min-h-11">
        <input type="checkbox" className="w-4 h-4 rounded accent-primary cursor-pointer" {...register("remember")} />
        <span className="font-body-sm text-body-sm text-on-surface-variant">Remember this device for 30 days</span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 min-h-12 rounded-full bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
      >
        <span>{isSubmitting ? "Signing in..." : "Sign In to My Pantry"}</span>
        <Icon name="arrow_forward" className="text-lg" />
      </button>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        New to Iya Gbenga&apos;s Store?
        <button type="button" onClick={onSwitch} className="font-label-md text-label-md text-primary font-bold hover:underline ml-1 min-h-11">
          Create an account
        </button>
      </p>
    </form>
  );
}

function SignUpForm({ onSwitch }: { onSwitch: () => void }) {
  const [notice, setNotice] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { fullName: "", email: "", phone: "", region: "lagos-mainland", password: "", marketing: false },
  });

  const onSubmit = async () => {
    // TODO(auth): create the account (profiles row is created by a trigger on auth.users).
    setNotice(false);
    await new Promise((r) => setTimeout(r, 500));
    setNotice(true);
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-space-sm">
      {notice && <PendingNotice />}

      <div className="flex flex-col gap-1">
        <label htmlFor="signup-name" className={labelClass}>
          Full Name (First &amp; Last Name)
        </label>
        <div className={fieldShell}>
          <input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="e.g. Folashade Adeyemi"
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? "signup-name-error" : undefined}
            className={inputClass}
            {...register("fullName")}
          />
          <Icon name="badge" className="text-outline mr-3" />
        </div>
        <FieldError id="signup-name-error" message={errors.fullName?.message} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="signup-email" className={labelClass}>
            Email Address
          </label>
          <div className={fieldShell}>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="folashade@gmail.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
              className={inputClass}
              {...register("email")}
            />
          </div>
          <FieldError id="signup-email-error" message={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="signup-phone" className={labelClass}>
            Delivery WhatsApp Line
          </label>
          <div className={fieldShell}>
            <span aria-hidden="true" className="text-xs font-bold pl-3 pr-1 text-primary">
              +234
            </span>
            <input
              id="signup-phone"
              type="tel"
              autoComplete="tel-national"
              placeholder="0802 345 6789"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "signup-phone-error" : undefined}
              className={inputClass}
              {...register("phone")}
            />
          </div>
          <FieldError id="signup-phone-error" message={errors.phone?.message} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="signup-region" className={labelClass}>
          Primary Delivery Region
        </label>
        <div className={fieldShell}>
          <select
            id="signup-region"
            className={`${inputClass} cursor-pointer appearance-none`}
            {...register("region")}
          >
            <option value="lagos-island">Lagos (Island: Lekki, Ikoyi, Victoria Island, Ajah)</option>
            <option value="lagos-mainland">Lagos (Mainland: Ikeja, Yaba, Surulere, Magodo)</option>
          </select>
          <Icon name="expand_more" className="text-outline mr-3 pointer-events-none" />
        </div>
        <p className="font-body-sm text-body-sm text-outline">We currently deliver in Lagos only.</p>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="signup-password" className={labelClass}>
          Choose Password (Min 8 chars)
        </label>
        <PasswordInput
          id="signup-password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          invalid={!!errors.password}
          describedBy={errors.password ? "signup-password-error" : undefined}
          registration={register("password")}
        />
        <FieldError id="signup-password-error" message={errors.password?.message} />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <label className="flex items-start gap-2.5 cursor-pointer select-none min-h-11">
          <input type="checkbox" className="w-4 h-4 mt-0.5 rounded accent-primary cursor-pointer shrink-0" {...register("marketing")} />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Send me <strong className="text-on-surface">weekly market updates</strong> on WhatsApp.
          </span>
        </label>
        <p className="font-body-sm text-[12px] text-outline leading-relaxed">
          By creating an account you agree to our{" "}
          <Link href="/terms" className="text-primary underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-primary underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-6 min-h-12 rounded-full bg-primary hover:bg-primary-container text-on-primary font-title-md text-title-md font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 mt-1"
      >
        <span>{isSubmitting ? "Creating account..." : "Create My Pantry Account"}</span>
        <Icon name="check" className="text-lg" />
      </button>

      <p className="text-center font-body-sm text-body-sm text-on-surface-variant">
        Already an Iya Gbenga customer?
        <button type="button" onClick={onSwitch} className="font-label-md text-label-md text-primary font-bold hover:underline ml-1 min-h-11">
          Log in to your account
        </button>
      </p>
    </form>
  );
}

export default function AuthForms({ next, initialMode = "signin" }: { next: string; initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);

  const tab = (m: Mode, icon: string, label: string) => {
    const active = mode === m;
    return (
      <button
        type="button"
        role="tab"
        id={`tab-${m}`}
        aria-selected={active}
        aria-controls={`panel-${m}`}
        tabIndex={active ? 0 : -1}
        onClick={() => setMode(m)}
        className={`flex-1 py-2.5 min-h-11 rounded-full font-title-md text-title-md transition-all duration-200 flex items-center justify-center gap-2 ${
          active ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <Icon name={icon} className="text-lg" />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col">
      <div
        role="tablist"
        aria-label="Sign in or create an account"
        className="flex p-1 rounded-full bg-surface-container-low mb-space-lg shadow-sm"
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            const m = mode === "signin" ? "signup" : "signin";
            setMode(m);
            document.getElementById(`tab-${m}`)?.focus();
          }
        }}
      >
        {tab("signin", "login", "Sign In")}
        {tab("signup", "person_add", "Create Account")}
      </div>

      <div className="mb-space-md">
        {mode === "signin" ? (
          <>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Welcome Back to Market</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Sign in to check out, view your orders and keep your basket across devices.
            </p>
          </>
        ) : (
          <>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">Open Your Market Pantry</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Create an account to order authentic Nigerian groceries and track every order.
            </p>
          </>
        )}
      </div>

      <GoogleSignInButton next={next} label={mode === "signin" ? "Continue with Google" : "Sign up with Google"} />
      <Divider>{mode === "signin" ? "or sign in with email / phone" : "or enter your details manually"}</Divider>

      <div role="tabpanel" id={`panel-${mode}`} aria-labelledby={`tab-${mode}`}>
        {mode === "signin" ? (
          <SignInForm onSwitch={() => setMode("signup")} />
        ) : (
          <SignUpForm onSwitch={() => setMode("signin")} />
        )}
      </div>
    </div>
  );
}
