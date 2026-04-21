"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitCustomer, submitVendor } from "@/lib/api/join";

type JoinForm = {
  name: string;
  email: string;
  phone_number: string;
  category: string;
  comments: string;
};

type DialogType = "customer" | "vendor" | null;

const CATEGORIES = ["Insurance", "Automation", "Real Estate", "Electronics", "Other"];

const INITIAL_FORM: JoinForm = {
  name: "",
  email: "",
  phone_number: "",
  category: "",
  comments: "",
};

const CUSTOMER_COPY = {
  badge: "Customer onboarding",
  title: "Start Saving with Group Buying",
  description:
    "Share your details and we will match you with active high-value deals in your preferred categories.",
  submitLabel: "Get Started",
  successMessage: "Your request was submitted. Our team will connect you with the next available deals.",
};

const VENDOR_COPY = {
  badge: "Vendor onboarding",
  title: "Become a Vendor Partner",
  description:
    "Join the SaveMyPay network to receive demand from qualified bulk buyers and close deals faster.",
  submitLabel: "Join Vendor Network",
  successMessage: "Thanks for registering. Our partnerships team will contact you shortly.",
};

export function JoinDialog({
  open,
  onOpenChange,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DialogType;
}) {
  const [form, setForm] = useState<JoinForm>(INITIAL_FORM);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setForm(INITIAL_FORM);
    setError("");
    setSuccess(false);
    setLoading(false);
  };

  useEffect(() => {
    if (open) {
      resetState();
    }
  }, [open]);

  if (!type) return null;

  const content = type === "customer" ? CUSTOMER_COPY : VENDOR_COPY;

  const update = (key: keyof JoinForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
  };

  const validate = (): string => {
    if (!form.name.trim()) return "Name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) return "Valid email is required";

    const phoneRegex = /^[0-9]{10}$/;
    if (!form.phone_number.trim() || !phoneRegex.test(form.phone_number.trim()))
      return "Phone number must be 10 digits";

    if (type === "vendor" && !form.category.trim()) return "Please select a category";

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setLoading(true);
  
    const name = form.name.trim();
    const email = form.email.trim();
    const phoneNumber = form.phone_number.trim();
    const category = form.category.trim();
    const comments = form.comments.trim();

    try {
      let res;

      if (type === "customer") {
        res = await submitCustomer({
          name,
          email,
          phone_number: phoneNumber,
        });
      } else {
        res = await submitVendor({
          name,
          email,
          phone_number: phoneNumber,
          category,
          comments: comments || undefined,
        });
      }

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.message || "Submission failed");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Server error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetState();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="w-[calc(100%-1rem)] max-w-[540px] border-0 bg-transparent p-0 shadow-none [&>button]:right-5 [&>button]:top-5 [&>button]:text-[#163B63]/65 [&>button]:hover:text-[#163B63]">
        {!success ? (
          <div className="max-h-[86vh] overflow-y-auto rounded-2xl border border-[rgba(232,168,48,0.25)] bg-[#f5f4f6] text-[#163B63] shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
            <div className="border-b border-[#e0e8f0] px-5 py-5 sm:px-7">
              <span className="inline-flex items-center rounded-full border border-[rgba(232,168,48,0.35)] bg-[rgba(232,168,48,0.12)] px-3 py-1 text-[11px] font-semibold tracking-[0.4px] text-[#163B63]">
                {content.badge}
              </span>
              <DialogHeader className="mt-3 text-left">
                <DialogTitle className="text-xl font-bold leading-tight text-[#163B63] sm:text-2xl">
                  {content.title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-[#7A8CA3] sm:text-base">
                  {content.description}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form className="space-y-4 px-5 py-5 sm:px-7 sm:py-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4">
                <Field label="Full Name" htmlFor="join-name">
                  <Input
                    id="join-name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="Enter your full name"
                    className="h-11 rounded-xl border-[#dbe4ef] bg-white text-[#163B63] placeholder:text-[#7A8CA3]/70 focus-visible:ring-2 focus-visible:ring-[#e8a830] focus-visible:ring-offset-0"
                  />
                </Field>

                <Field label="Email Address" htmlFor="join-email">
                  <Input
                    id="join-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="name@example.com"
                    className="h-11 rounded-xl border-[#dbe4ef] bg-white text-[#163B63] placeholder:text-[#7A8CA3]/70 focus-visible:ring-2 focus-visible:ring-[#e8a830] focus-visible:ring-offset-0"
                  />
                </Field>
              </div>

              <Field label="Phone Number" htmlFor="join-phone">
                <Input
                  id="join-phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone_number}
                  onChange={(e) =>
                    update("phone_number", e.target.value.replace(/\D/g, "").slice(0, 10))
                  }
                  placeholder="10-digit mobile number"
                  className="h-11 rounded-xl border-[#dbe4ef] bg-white text-[#163B63] placeholder:text-[#7A8CA3]/70 focus-visible:ring-2 focus-visible:ring-[#e8a830] focus-visible:ring-offset-0"
                />
              </Field>

              {type === "vendor" && (
                <>
                  <Field label="Business Category" htmlFor="join-category">
                    <select
                      id="join-category"
                      value={form.category}
                      onChange={(e) => update("category", e.target.value)}
                      className="h-11 w-full rounded-xl border border-[#dbe4ef] bg-white px-3 text-sm text-[#163B63] focus:outline-hidden focus:ring-2 focus:ring-[#e8a830]"
                    >
                      <option value="" className="bg-white text-[#163B63]">
                        Select category
                      </option>
                      {CATEGORIES.map((categoryOption) => (
                        <option key={categoryOption} value={categoryOption} className="bg-white text-[#163B63]">
                          {categoryOption}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Comments (Optional)" htmlFor="join-comments">
                    <textarea
                      id="join-comments"
                      rows={3}
                      value={form.comments}
                      onChange={(e) => update("comments", e.target.value)}
                      placeholder="Tell us about your products or preferred deal size."
                      className="w-full resize-none rounded-xl border border-[#dbe4ef] bg-white px-3 py-2 text-sm text-[#163B63] placeholder:text-[#7A8CA3]/70 focus:outline-hidden focus:ring-2 focus:ring-[#e8a830]"
                    />
                  </Field>
                </>
              )}

              {error ? (
                <p className="rounded-lg border border-[#f0883e]/50 bg-[#f0883e]/10 px-3 py-2 text-sm text-[#9c4d1f]">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-xl bg-[linear-gradient(135deg,#e8a830,#f5c96a)] text-sm font-bold text-[#0f2347] hover:opacity-95"
              >
                {loading ? "Submitting..." : content.submitLabel}
              </Button>

              <p className="text-center text-xs text-[#7A8CA3]">
                We use your details only to contact you about relevant opportunities.
              </p>
            </form>
          </div>
        ) : (
          <div className="rounded-2xl border border-[rgba(232,168,48,0.25)] bg-[#f5f4f6] px-6 py-10 text-center text-[#163B63] shadow-[0_24px_60px_rgba(0,0,0,0.2)] sm:px-8">
            <div className="mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-[#6ec6c0]">
              ✅
            </div>
            <h3 className="mb-2 text-xl font-bold">Request Submitted</h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-[#7A8CA3]">
              {content.successMessage}
            </p>
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-10 rounded-xl bg-[linear-gradient(135deg,#e8a830,#f5c96a)] px-8 font-bold text-[#0f2347]"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-[#35557b]">
        {label}
      </Label>
      {children}
    </div>
  );
}
