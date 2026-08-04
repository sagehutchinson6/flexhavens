import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import InvestCalculator from "@/sections/invest/InvestCalculator";

export default function CalculatorTab({ setTab }: { setTab: (tab: string) => void }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        <InvestCalculator />
      </div>
      <div className="flex justify-center">
        <Button
          onClick={() => setTab("invest")}
          className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] h-11 px-8"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Ready? Start Investing
        </Button>
      </div>
    </div>
  );
}
