"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinWaitlist } from "@/lib/api/waitlist";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

interface WaitlistDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WaitlistDialog({ open, onOpenChange }: WaitlistDialogProps) {
    const [waitlistEmail, setWaitlistEmail] = useState("");
    const [waitlistJoined, setWaitlistJoined] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
        if (!newOpen) {
            // Reset state when dialog closes
            setTimeout(() => {
                setWaitlistJoined(false);
                setWaitlistEmail("");
            }, 200);
        }
    };

    const handleJoinWaitlist = async () => {
        if (!waitlistEmail || !waitlistEmail.includes("@")) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsLoading(true);
        try {
            const joinResponse = await joinWaitlist(waitlistEmail);
            if (joinResponse.status === 1) {
                setWaitlistJoined(true);
                toast.success("Successfully joined the waitlist!");
            } else {
                toast.error(joinResponse.msg || "Failed to join waitlist");
            }
        } catch (error) {
            console.error("Waitlist error:", error);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        handleOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                {!waitlistJoined ? (
                    // Join Waitlist Form
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Image
                                        src="/assets/D-logo.svg"
                                        alt="DeCharge"
                                        width={24}
                                        height={24}
                                    />
                                </div>
                                <div>
                                    <DialogTitle className="text-lg font-semibold">
                                        Join the Exclusive Waitlist
                                    </DialogTitle>
                                    <DialogDescription className="text-sm text-gray-500">
                                        Get early access to our energy backed yield pools
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="waitlist-email" className="text-sm font-medium">
                                    Email Address
                                </Label>
                                <Input
                                    id="waitlist-email"
                                    type="email"
                                    placeholder="your.email@example.com"
                                    value={waitlistEmail}
                                    onChange={(e) => setWaitlistEmail(e.target.value)}
                                    className="w-full"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            handleJoinWaitlist();
                                        }
                                    }}
                                />
                            </div>
                            <Button
                                onClick={handleJoinWaitlist}
                                disabled={isLoading}
                                className="w-full bg-[#001FEC] hover:bg-blue-700 text-white"
                            >
                                {isLoading ? "Joining..." : "Join Waitlist"}
                            </Button>
                            <p className="text-xs text-gray-400 text-center">
                                We never share your email.
                            </p>
                        </div>
                    </>
                ) : (
                    // Success View
                    <>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Waitlist Success</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center text-center py-4">
                            <div className="w-20 h-20 mb-4">
                                <Image
                                    src="/assets/titan/approve.gif"
                                    alt="Success"
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                    unoptimized
                                />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                You're on the Waitlist! 🎉
                            </h3>
                            <p className="text-gray-500 text-sm mb-1">
                                Thank you for joining the exclusive waitlist.
                            </p>
                            <p className="text-gray-500 text-sm mb-6">
                                You'll be notified as soon as new pools go live.
                            </p>
                            <div className="space-y-3 w-full">
                                <Button
                                    onClick={handleClose}
                                    className="w-full bg-[#001FEC] hover:bg-blue-700 text-white"
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        handleClose();
                                        window.open("https://x.com/decharge/status/1990807561667563704?s=46", "_blank");
                                    }}
                                    className="w-full"
                                >
                                Learn more
                                </Button>
                            </div>
                            <p className="text-xs text-gray-400 mt-4">
                                We've sent a confirmation to your email.
                            </p>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
