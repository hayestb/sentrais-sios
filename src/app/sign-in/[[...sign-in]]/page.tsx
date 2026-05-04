import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded bg-[#0EA5E9] flex items-center justify-center">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          <div className="text-left">
            <div className="text-base font-semibold text-foreground">SIOS</div>
            <div className="text-[10px] text-muted-foreground">Sentrais Innovation OS</div>
          </div>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
