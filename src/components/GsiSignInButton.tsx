import { User } from "firebase/auth";

interface GsiSignInButtonProps {
  onSignIn: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  user: User | null;
}

export default function GsiSignInButton({
  onSignIn,
  onLogout,
  isLoggingIn,
  user,
}: GsiSignInButtonProps) {
  if (user) {
    return (
      <div id="user-profile-badge" className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={user.displayName || "User Avatar"}
            className="w-7 h-7 rounded-full border border-slate-200"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="flex flex-col items-start leading-none">
          <span className="text-xs font-semibold text-slate-800">
            {user.displayName || user.email}
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">
            Account Connected
          </span>
        </div>
        <button
          onClick={onLogout}
          id="btn-logout"
          className="ml-2 text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={onSignIn}
      disabled={isLoggingIn}
      id="gsi-signin-btn"
      className="gsi-material-button group cursor-pointer disabled:opacity-50 transition-all border border-slate-300 hover:border-slate-400"
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxSizing: "border-box",
        color: "#1f1f1f",
        fontFamily: "'Roboto', sans-serif",
        fontSize: "14px",
        fontWeight: 500,
        height: "40px",
        letterSpacing: "0.25px",
        outline: "none",
        overflow: "hidden",
        padding: "0 12px",
        position: "relative",
        textAlign: "center",
        verticalAlign: "middle",
        width: "auto",
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      <div className="flex items-center justify-center gap-3">
        <div className="w-5 h-5 flex items-center justify-center">
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            style={{ display: "block" }}
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            ></path>
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            ></path>
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            ></path>
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            ></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
        </div>
        <span
          className="text-sm text-slate-700 font-semibold truncate select-none text-left"
          style={{ fontFamily: "inherit" }}
        >
          {isLoggingIn ? "Logging in..." : "Continue with Google"}
        </span>
      </div>
    </button>
  );
}
