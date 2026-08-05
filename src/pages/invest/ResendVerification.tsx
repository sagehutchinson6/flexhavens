import { useState } from "react";
import { useNavigate } from "react-router";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import InvestAuthShell from "@/components/invest/InvestAuthShell";

export default function ResendVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);

  const mutation = trpc.auth.resendVerification.useMutation({
    onSuccess: () => {
      toast.success("If an account exists and is awaiting verification, a new verification email has been sent.");
      navigate("/invest/login");
    },
    onError: (err) => {
      toast.error(err.message);
      setIsPending(false);
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsPending(true);
    mutation.mutate({ email });
  };

  return (
    <InvestAuthShell title="Resend Verification Email" subtitle="Enter your email to receive a new verification link">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="resend-email">Email Address</Label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="resend-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" disabled={isPending} className="w-full h-12 bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-base font-semibold">
          {isPending ? "Sending..." : "Send Verification Email"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>
    </InvestAuthShell>
  );
}
