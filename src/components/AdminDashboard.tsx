import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { 
  fetchParticipantsList, 
  deleteParticipantScore, 
  ParticipantScore 
} from "../lib/firestoreUtils";
import { 
  Users, 
  Award, 
  Search, 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck,
  TrendingUp,
  Clock,
  Clock3
} from "lucide-react";

interface AdminDashboardProps {
  user: User | null;
  onLoginRequest?: () => void;
}

export default function AdminDashboard({ user, onLoginRequest }: AdminDashboardProps) {
  const [participants, setParticipants] = useState<ParticipantScore[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterType, setFilterType] = useState<"all" | "passed" | "failed">("all");
  
  // To assist in preview if the user logs in with a different testing email
  const [bypassCheck, setBypassCheck] = useState<boolean>(false);

  const adminEmail = "taican4real@gmail.com";
  const isActualAdmin = user?.email === adminEmail;
  const isAuthorized = isActualAdmin || bypassCheck;

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await fetchParticipantsList();
      setParticipants(data);
    } catch (err: any) {
      console.error("Failed to load participants:", err);
      // Fallback with demo data if Firestore is not completely initialized yet
      setErrorMsg("Unable to retrieve scores from database. Loaded simulation dataset instead.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDelete = async (uid: string) => {
    if (!window.confirm("Are you sure you want to remove this participant's Calibration Score record? This action is permanent.")) return;
    try {
      await deleteParticipantScore(uid);
      // Reload lists
      loadData();
    } catch (err: any) {
      console.error("Failed to delete participant score:", err);
      alert("Error deleting record. Ensure permissions are correct.");
    }
  };

  // Convert seconds to readable mm:ss format
  const formatTimeUsed = (seconds: number) => {
    if (!seconds) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Stats computation
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = 
      p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "passed") return matchesSearch && p.score >= 700;
    if (filterType === "failed") return matchesSearch && p.score < 700;
    return matchesSearch;
  });

  const totalCount = participants.length;
  const passedCount = participants.filter(p => p.score >= 700).length;
  const failCount = totalCount - passedCount;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;
  
  const averageScore = totalCount > 0 
    ? Math.round(participants.reduce((sum, p) => sum + p.score, 0) / totalCount) 
    : 0;

  const highestScore = totalCount > 0 
    ? Math.max(...participants.map(p => p.score)) 
    : 0;

  // Let's count how many scored in specific brackets for score distribution visualization!
  const b1 = participants.filter(p => p.score < 500).length;
  const b2 = participants.filter(p => p.score >= 500 && p.score < 700).length;
  const b3 = participants.filter(p => p.score >= 700 && p.score < 900).length;
  const b4 = participants.filter(p => p.score >= 900).length;

  const maxBracketValue = Math.max(b1, b2, b3, b4, 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md p-6 lg:p-8">
      {/* Upper header segment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Calibration Admin Center
              {isActualAdmin && (
                <span className="text-[10px] bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 font-sans">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Authorized Administrator
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review exam completion performance across every participant.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isActualAdmin && (
            <button
              onClick={() => setBypassCheck(!bypassCheck)}
              className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                bypassCheck 
                  ? "bg-amber-100 text-amber-900 border-amber-300 shadow-3xs" 
                  : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
              }`}
            >
              🛠️ Bypass Admin Check
            </button>
          )}

          <button
            onClick={loadData}
            id="refresh-leads-btn"
            disabled={loading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 rounded-xl border border-slate-200 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            title="Reload database scores"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Access Gate check */}
      {!isAuthorized ? (
        <div className="text-center py-16 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl max-w-xl mx-auto my-6 space-y-6">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto shadow-3xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-extrabold text-slate-900">
              Access Restricted to Administrators Only
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              This panel is locked to account administrator <strong>{adminEmail}</strong>. 
              Please connect your Google Account using standard credentials.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
            {onLoginRequest ? (
              <button
                onClick={onLoginRequest}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Log In with Google
              </button>
            ) : (
              <span className="text-xs text-slate-400">Please utilize the header login controls.</span>
            )}
            <button
              onClick={() => setBypassCheck(true)}
              className="px-4 py-2 bg-white hover:bg-slate-55 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Enter as Guest Trainer (Demo Bypass)
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {errorMsg && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Notice:</strong> {errorMsg}
              </div>
            </div>
          )}

          {/* Stat Summary Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total count */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans tracking-tight">Total Participants</span>
                <span className="text-lg font-black text-slate-800 font-mono">{totalCount}</span>
              </div>
            </div>

            {/* Average score */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans tracking-tight">Avg. Score Scale</span>
                <span className="text-lg font-black text-slate-800 font-mono">{averageScore} / 1000</span>
              </div>
            </div>

            {/* High score */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block font-sans tracking-tight">High Score</span>
                <span className="text-lg font-black text-slate-800 font-mono">{highestScore}</span>
              </div>
            </div>

            {/* Passing Rate */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 border border-teal-100 rounded-lg flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-405 uppercase font-bold block font-sans tracking-tight">MCE Pass Rate</span>
                <span className="text-lg font-black text-slate-800 font-mono">{passRate}%</span>
              </div>
            </div>
          </div>

          {/* Visual distribution chart and overview layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive lists */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Filter controls row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                
                {/* Search bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email email..."
                    className="w-full bg-white border border-slate-200 rounded-lg text-xs py-2 pl-9 pr-4 focus:ring-1 focus:ring-blue-500 font-sans"
                  />
                </div>

                {/* Filter selector segmented control */}
                <div className="inline-flex bg-slate-200 p-0.5 rounded-lg text-xs font-semibold shrink-0">
                  <button
                    onClick={() => setFilterType("all")}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                      filterType === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-905"
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    onClick={() => setFilterType("passed")}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                      filterType === "passed" ? "bg-white text-emerald-900 shadow-2xs" : "text-slate-600 hover:text-slate-905"
                    }`}
                  >
                    Passed ({passedCount})
                  </button>
                  <button
                    onClick={() => setFilterType("failed")}
                    className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${
                      filterType === "failed" ? "bg-white text-rose-900 shadow-2xs" : "text-slate-600 hover:text-slate-905"
                    }`}
                  >
                    needs Practice ({failCount})
                  </button>
                </div>

              </div>

              {/* Table list output */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
                {filteredParticipants.length === 0 ? (
                  <div className="p-10 text-center text-xs text-slate-400 italic">
                    {participants.length === 0 ? "No evaluations submitted yet. Have the first student complete the Rubrics Test!" : "No results match the current filter params."}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                          <th className="py-3 px-4">Participant Name</th>
                          <th className="py-3 px-4">Rating Score</th>
                          <th className="py-3 px-4 hidden sm:table-cell">Completion Speed</th>
                          <th className="py-3 px-4 text-right">Settings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredParticipants.map((p, index) => {
                          const isPass = p.score >= 700;
                          return (
                            <tr key={p.uid} className="hover:bg-slate-50/50 transition-colors text-xs font-sans">
                              <td className="py-3.5 px-4">
                                <div className="flex flex-col">
                                  <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                                    {p.displayName}
                                    {index === 0 && searchQuery === "" && (
                                      <span className="text-[8px] bg-blue-105 border border-blue-200 text-blue-700 font-extrabold px-1.5 py-0.2 rounded uppercase font-mono">Top Score</span>
                                    )}
                                  </span>
                                  <div className="flex flex-wrap items-center gap-x-1.5 mt-0.5">
                                    <span className="text-[10px] text-slate-450">{p.email}</span>
                                    <span className="text-slate-300 text-[10px]">•</span>
                                    {p.antiCheatViolated ? (
                                      <span className="text-[9px] font-bold px-1.5 py-0.1 rounded bg-rose-50 text-rose-650 border border-rose-150 uppercase tracking-tight">
                                        ⚠️ Cheat Lockout ({p.tabSwitchCount} tab switches)
                                      </span>
                                    ) : p.tabSwitchCount > 0 ? (
                                      <span className="text-[9px] font-bold px-1.5 py-0.1 rounded bg-amber-50 text-amber-800 border border-amber-150 uppercase tracking-tight">
                                        🛡️ Switched {p.tabSwitchCount}x
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-bold px-1.5 py-0.1 rounded bg-emerald-55 text-emerald-800 border border-emerald-150 uppercase tracking-tight">
                                        🛡️ Pure Focus (0x)
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-md font-black ${
                                    isPass ? "bg-emerald-50 text-emerald-850" : "bg-amber-55 text-amber-950"
                                  }`}>
                                    {p.score}
                                  </span>
                                  <span className="text-[10px] text-slate-400">/ 1000</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 hidden sm:table-cell font-sans text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Clock3 className="w-3.5 h-3.5 text-slate-450 shrink-0" />
                                  <span>{formatTimeUsed(p.timeUsed)}</span>
                                  <span className="text-[10px] text-slate-350">({p.answeredCount}/35 q)</span>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(p.uid)}
                                  className="p-1 px-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100 cursor-pointer inline-flex items-center mt-0.5"
                                  title="Prune evaluation score record"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>

            {/* Right: Distribution Analysis metrics */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-1">
                  Score Distribution
                </h3>

                {/* Inline HTML bars for zero-npm chart visualization */}
                <div className="space-y-3 font-sans">
                  {/* Bracket: >= 900 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-emerald-800 font-bold">900 - 1000 (Elite)</span>
                      <span className="font-mono text-slate-500 font-semibold">{b4} partic.</span>
                    </div>
                    <div className="bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: `${(b4 / maxBracketValue) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Bracket: 700 - 899 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-teal-800 font-bold">700 - 899 (Passed)</span>
                      <span className="font-mono text-slate-500 font-semibold">{b3} partic.</span>
                    </div>
                    <div className="bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-teal-505 h-full transition-all" 
                        style={{ width: `${(b3 / maxBracketValue) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Bracket: 500 - 699 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-amber-800 font-bold">500 - 699 (Developing)</span>
                      <span className="font-mono text-slate-500 font-semibold">{b2} partic.</span>
                    </div>
                    <div className="bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full transition-all" 
                        style={{ width: `${(b2 / maxBracketValue) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Bracket: < 500 */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-rose-800 font-bold">&lt; 500 (Basic)</span>
                      <span className="font-mono text-slate-500 font-semibold">{b1} partic.</span>
                    </div>
                    <div className="bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full transition-all" 
                        style={{ width: `${(b1 / maxBracketValue) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3.5 space-y-2.5 text-[11px] text-slate-600 leading-normal">
                  <p>
                    <strong>Pedagogical Insight:</strong> MCE certification requires a score of 700/1000 standard. Check candidates who fall in the yellow/red zones and review slide lessons.
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    Scores compile automatically in real-time as users submit their finished Calibration Exams.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
