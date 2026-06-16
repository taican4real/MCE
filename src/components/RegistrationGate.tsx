import React, { useState } from "react";
import { ShieldCheck, ArrowRight, Clipboard, Check, KeySquare, HelpCircle, Loader2, User as UserIcon, Shield } from "lucide-react";
import { saveParticipantScore, fetchParticipant } from "../lib/firestoreUtils";

interface RegistrationGateProps {
  onUnlock: (user: any) => void;
}

export default function RegistrationGate({ onUnlock }: RegistrationGateProps) {
  const [isRegistering, setIsRegistering] = useState<boolean>(true);
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [institution, setInstitution] = useState<string>("");
  const [role, setRole] = useState<"participant" | "admin">("participant");
  const [accessCode, setAccessCode] = useState<string>("");
  
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCopied, setSuccessCopied] = useState<boolean>(false);

  // Helper to generate a unique random access code in format: MCE-XXXX-XXXX
  const generateUniqueCode = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // readable chars (omitting 0, 1, I, O)
    let part1 = "";
    let part2 = "";
    for (let i = 0; i < 4; i++) {
      part1 += chars.charAt(Math.floor(Math.random() * chars.length));
      part2 += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `MCE-${part1}-${part2}`;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const uniqueCode = generateUniqueCode();
      const displayNamePrefix = institution.trim() 
        ? `${fullName.trim()} (${institution.trim()})` 
        : fullName.trim();

      // Save participant to Firestore right away with score = 0, answered = 0 (showing they registered)
      await saveParticipantScore(
        uniqueCode,
        displayNamePrefix,
        email.trim(),
        0, // score
        0, // time used
        0, // answered count
        0, // tab switch count
        false, // anti-cheat violated
        role
      );

      // Save user profile locally
      const mockUser = {
        uid: uniqueCode,
        displayName: displayNamePrefix,
        email: email.trim(),
        emailVerified: true,
        isAnonymous: false,
        providerData: [],
        role: role
      };

      setGeneratedCode(uniqueCode);
      // Auto-save the sandbox user to local storage for persistent browser session
      localStorage.setItem("sandbox_user", JSON.stringify(mockUser));
      localStorage.setItem("sandbox_token", "custom_registered_token_" + uniqueCode);
    } catch (err: any) {
      console.error("Failed to register participant:", err);
      setErrorMsg("Failed to connect to database. Please check your network and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const codeToVerify = accessCode.trim().toUpperCase();
    if (!codeToVerify) {
      setErrorMsg("Please enter an access code.");
      return;
    }

    setIsLoading(true);
    try {
      // Direct offline/online check: format should be MCE-XXXX-XXXX
      const codeRegex = /^MCE-[A-Z2-9]{4}-[A-Z2-9]{4}$/;
      if (!codeRegex.test(codeToVerify)) {
        setErrorMsg("Invalid code format. Format must be MCE-XXXX-XXXX");
        setIsLoading(false);
        return;
      }

      // Try reading user's profile from Firestore or local backups
      const profile = await fetchParticipant(codeToVerify);

      const mockUser = {
        uid: codeToVerify,
        displayName: profile?.displayName || `Authorized Participant (${codeToVerify})`,
        email: profile?.email || "registered-user@mce-training.org",
        emailVerified: true,
        isAnonymous: false,
        providerData: [],
        role: profile?.role || "participant"
      };

      // Let's activate this user
      localStorage.setItem("sandbox_user", JSON.stringify(mockUser));
      localStorage.setItem("sandbox_token", "custom_registered_token_" + codeToVerify);
      onUnlock(mockUser);
    } catch (err: any) {
      setErrorMsg("Error verifying access code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setSuccessCopied(true);
      setTimeout(() => setSuccessCopied(false), 3000);
    }
  };

  const handleEnterLibrary = () => {
    if (generatedCode) {
      const mockUser = {
        uid: generatedCode,
        displayName: institution.trim() ? `${fullName.trim()} (${institution.trim()})` : fullName.trim(),
        email: email.trim(),
        emailVerified: true,
        isAnonymous: false,
        providerData: [],
        role: role
      };
      onUnlock(mockUser);
    }
  };

  if (generatedCode) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 md:p-8 max-w-xl mx-auto my-12 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Registration Completed</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Your participant profile has been successfully cataloged. On calibration reports and the admin leaderboard, you will be identified as:
          </p>
          <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-lg text-xs font-bold text-slate-700 max-w-sm mx-auto">
            {fullName} {institution && <span className="text-slate-400 font-medium">({institution})</span>}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-5 rounded-2xl max-w-sm mx-auto space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 rounded-full blur-xl"></div>
          <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">Your Unique Access Code</span>
          <div className="text-lg sm:text-2xl font-mono font-black tracking-widest text-amber-400 py-1.5 border border-slate-700/60 bg-slate-950/40 rounded-xl">
            {generatedCode}
          </div>
          <p className="text-[10px] text-slate-400 font-sans leading-normal">
            ⚠️ <strong>Save this code!</strong> You can use this code to log back into your training session on any other computer or browser tab.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-xs sm:max-w-md mx-auto">
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {successCopied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                Copied!
              </>
            ) : (
              <>
                <Clipboard className="w-4 h-4 text-slate-500" />
                Copy Access Code
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleEnterLibrary}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs group"
          >
            <span>Enter Study Library</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-250/60 rounded-2xl shadow-xl max-w-4xl mx-auto my-12 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
      
      {/* Informative Promo Side Cover */}
      <div className="md:col-span-5 bg-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative mesh background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom_right,rgba(37,99,235,0.15),transparent)] pointer-events-none"></div>
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-blue-600/20 rounded-full blur-2xl"></div>

        <div className="space-y-4 relative z-10">
          <div className="inline-flex px-3 py-1 bg-blue-900/40 border border-blue-700/40 rounded-full text-[10px] text-blue-400 uppercase tracking-widest font-extrabold">
            Credentials Required
          </div>
          <h2 className="text-2xl font-black leading-tight tracking-tight uppercase">
            Start Your Pedagogy Calibration
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            The Microsoft Certified Educator (MCE) 21CLD curriculum calibrates teaching style across six critical rubrics. Register now to claim your credential and begin.
          </p>
        </div>

        <div className="space-y-3 pt-6 border-t border-slate-800 relative z-10 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 bg-blue-550/20 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">1</span>
            <p className="text-slate-350">Register with your name and educational institution email.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 bg-blue-550/20 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">2</span>
            <p className="text-slate-350">Obtain a unique MCE Access Code immediately upon submittal.</p>
          </div>
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 bg-blue-550/20 border border-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">3</span>
            <p className="text-slate-350">Unlock the rubrics, training speaker slides, and complete the Calibration Test.</p>
          </div>
        </div>

        <span className="text-[9px] text-slate-550 block mt-8 font-mono select-none">
          MCE 21CLD Study Portal Code Registration Gateway.
        </span>
      </div>

      {/* Main Interactive Form Body */}
      <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center space-y-6">
        
        {/* Registration vs Access Code Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setErrorMsg(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isRegistering ? "bg-white text-slate-900 shadow-3xs" : "text-slate-550 hover:text-slate-800"
            }`}
          >
            New Participant
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setErrorMsg(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              !isRegistering ? "bg-white text-slate-900 shadow-3xs" : "text-slate-550 hover:text-slate-800"
            }`}
          >
            I Have a Code
          </button>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            {isRegistering ? "Register New Account" : "Access with Code"}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isRegistering 
              ? "Provide your details to register and generate your training key." 
              : "Paste your generated access code below to resume your calibration."
            }
          </p>
        </div>

        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-medium animate-shake">
            ⚠️ {errorMsg}
          </div>
        )}

        {isRegistering ? (
          /* Registration Form */
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="reg-name" className="text-[10.5px] uppercase tracking-wider font-extrabold text-slate-450 block">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. HENRY OMOTAYO ADETUNJI"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-medium outline-none transition-all placeholder:text-slate-350 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-email" className="text-[10.5px] uppercase tracking-wider font-extrabold text-slate-455 block">
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. taican4real@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-medium outline-none transition-all placeholder:text-slate-350 text-slate-900"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-inst" className="text-[10.5px] uppercase tracking-wider font-extrabold text-slate-450 block">
                Institution/School <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                id="reg-inst"
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. DEXTER ACADEMY"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white rounded-xl text-xs font-medium outline-none transition-all placeholder:text-slate-350 text-slate-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10.5px] uppercase tracking-wider font-extrabold text-slate-450 block font-sans">
                Select Your Role <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("participant")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    role === "participant"
                      ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                      : "bg-slate-50 border-slate-205 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <UserIcon className={`w-3.5 h-3.5 ${role === "participant" ? "text-blue-600" : "text-slate-400"}`} />
                  <span>Participant</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    role === "admin"
                      ? "bg-amber-50 border-amber-500 text-amber-800 shadow-2xs"
                      : "bg-slate-50 border-slate-205 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Shield className={`w-3.5 h-3.5 ${role === "admin" ? "text-amber-600" : "text-slate-400"}`} />
                  <span>Administrator (Admin)</span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Registering...
                </>
              ) : (
                <>
                  <span>Create Account & Get Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Code Login Form */
          <form onSubmit={handleCodeLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="login-code" className="text-[10.5px] uppercase tracking-wider font-extrabold text-slate-450 block">
                Enter Your Access Code
              </label>
              <div className="relative flex items-center">
                <KeySquare className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  id="login-code"
                  type="text"
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  placeholder="MCE-XXXX-XXXX"
                  className="w-full pl-10 pr-3.5 py-3 bg-slate-50 border border-slate-205 focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-100 rounded-xl text-sm font-mono font-bold uppercase tracking-wider outline-none transition-all placeholder:text-slate-350 text-slate-900"
                />
              </div>
              <span className="text-[10px] text-slate-400 flex items-center gap-1.5 selection:bg-transparent">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Example format: MCE-HG7B-A48L. Validates instantly offline/online.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Verifying...
                </>
              ) : (
                <>
                  <span>Verify and Access Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
