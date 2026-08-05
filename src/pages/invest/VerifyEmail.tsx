import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { CheckCircle, XCircle, MailWarning, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { useInvestor } from "@/hooks/use-investor";
import InvestAuthShell from "@/components/invest/InvestAuthShell";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const justSent = searchParams.get("sent") === "1";
  const { refetch } = useInvestor();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token" | "sent">(
    token ? "loading" : justSent ? "sent" : "no-token",
  );
  const [errorMessage, setErrorMessage] = useState("");

  const verify = trpc.investorAuth.verifyEmail.useMutation({
    onSuccess: () => {
      setStatus("success");
      refetch();
    },
    onError: (err) => {
      setStatus("error");
      setErrorMessage(err.message);
    },
  });

  const fired = useRef(false);

  useEffect(() => {
    if (token && !fired.current) {
      fired.current = true;
      verify.mutate({ token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <InvestAuthShell title="Email Verification" subtitle="Confirming your email address">
      <div className="text-center py-4">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 border-4 border-[#1e3a5f] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email address...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Email Verified!</h3>
            <p className="text-sm text-gray-600 mb-6">
              Your email has been verified successfully. You now have full access to your
              investor dashboard.
            </p>
            <Link to="/invest/dashboard">
              <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87]">
                Go to Dashboard
              </Button>
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Verification Failed</h3>
            <p className="text-sm text-gray-600 mb-6">{errorMessage}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/invest/login">
                <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f]">
                  Go to Login
                </Button>
              </Link>
              <Link to="/invest/resend-verification">
                <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87]">
                  Resend Verification Email
                </Button>
              </Link>
            </div>
          </>
        )}

        {status === "sent" && (
          <>
            <div className="w-16 h-16 bg-[#c8956c]/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailCheck className="w-8 h-8 text-[#b07d52]" />
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">Check Your Inbox</h3>
            <p className="text-sm text-gray-600 mb-6">
              We've emailed you a verification link. Click it within 24 hours to activate your
              account — and check your spam folder if you don't see it.
            </p>
            <Link to="/invest/dashboard">
              <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87]">
                Continue to Dashboard
              </Button>
            </Link>
          </>
        )}

        {status === "no-token" && (
          <>
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MailWarning className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-2">No Verification Token</h3>
            <p className="text-sm text-gray-600 mb-6">
              This page expects a verification link from your email. If you didn't receive it,
              request a new one below.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/invest/login">
                <Button variant="outline" className="border-[#1e3a5f] text-[#1e3a5f]">
                  Go to Login
                </Button>
              </Link>
              <Link to="/invest/resend-verification">
                <Button className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87]">
                  Resend Verification Email
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </InvestAuthShell>
  );
}
