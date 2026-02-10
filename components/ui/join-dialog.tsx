"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { submitCustomer, submitVendor } from "@/lib/api/join";

type JoinForm = {
  name?: string;
  email?: string;
  phone_number?: string;
  category?: string;
  comments?: string;
};

type DialogType = "customer" | "vendor" | null;

const CATEGORIES = [
  "Insurance",
  "Automation",
  "Real Estate",
  "Electronics",
  "Other",
];


export function JoinDialog({
  open,
  onOpenChange,
  type,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: DialogType;
}) {
  const [form, setForm] = useState<JoinForm>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setForm({});
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

  const update = (key: keyof JoinForm, value: string) =>
    setForm({ ...form, [key]: value });

  const validate = () => {
    if (!form.name) return "Name is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email || !emailRegex.test(form.email))
      return "Valid email is required";

    const phoneRegex = /^[0-9]{10}$/;
    if (!form.phone_number || !phoneRegex.test(form.phone_number))
      return "Phone number must be 10 digits";

    if (type === "vendor" && !form.category)
      return "Please select a category";

    return "";
  };

  // const handleSubmit = async () => {
  //   setError("");
  //   const validationError = validate();
  //   if (validationError) {
  //     setError(validationError);
  //     return;
  //   }
  
  //   setLoading(true);
  //   try {
  //     const res =
  //       type === "customer"
  //         ? await submitCustomer(form)
  //         : await submitVendor(form);
  //     console.log("res",res)
  //     if (res.success) {
  //       setSuccess(true);
  //     } else {
  //       setError(res.message || "Submission failed");
  //     }
  //   } catch (err: unknown) {
  //     const message = err instanceof Error ? err.message : "Server error";
  //     setError(message);
  //   }
  //    finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setLoading(true);
  
    try {
      // const payload = form as {
      //   name: string;
      //   email: string;
      //   phone_number: string;
      //   category?: string;
      //   comments?: string;
      // };
  
      // const res =
      //   type === "customer"
      //     ? await submitCustomer(payload)
      //     : await submitVendor(payload);

      let res;

      if (type === "customer") {
        res = await submitCustomer(form as {
          name: string;
          email: string;
          phone_number: string;
        });
      } else {
        res = await submitVendor(form as {
          name: string;
          email: string;
          phone_number: string;
          category: string;
          comments?: string;
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

      <DialogContent className="sm:max-w-md">
        {!success ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {type === "customer"
                  ? "Start Saving Today"
                  : "Become a Vendor Partner"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pt-4">
              <Field label="Name">
                <Input onChange={(e) => update("name", e.target.value)} />
              </Field>

              <Field label="Email">
                <Input type="email" onChange={(e) => update("email", e.target.value)} />
              </Field>

              <Field label="Phone">
                {/* <Input onChange={(e) => update("phone_number", e.target.value)} /> */}

                <Input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone_number ?? ""}
                  onChange={(e) => update("phone_number", e.target.value)}
                />

              </Field>

              {type === "vendor" && (
                <>
                  <Field label="Category">
                    <select
                      className="w-full border rounded-md p-2 text-sm"
                      onChange={(e) =>
                        update("category", e.target.value)
                      }
                    >
                      <option value="">Select category</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Comments">
                    <textarea
                      rows={3}
                      className="w-full border rounded-md p-2 text-sm"
                      onChange={(e) =>
                        update("comments", e.target.value)
                      }
                    />
                  </Field>
                </>
              )}

              {error && (
                <p className="text-red-500 text-sm">{error}</p>
              )}

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </>
        ) : (
          // SUCCESS STATE
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-2">
              🎉 Success!
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {type === "customer"
                ? "We’ll contact you with the best deals soon."
                : "Our team will reach out to you shortly."}
            </p>
            <Button onClick={() => onOpenChange(false)}>
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
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}
