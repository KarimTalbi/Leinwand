import {useState} from "react";
import {ChevronDown, KeyRound, LogOut, Save, Trash2, User, X} from "lucide-react";
import useStore from "@/store";
import {useShallow} from "zustand/react/shallow";
import {bgColor, flowButtonStyle, foreground, inputWithIcon, ring, text} from "@/lib/styles.ts";
import {cn} from "@/lib/utils.ts";

type ExpandedSection = "username" | "password" | null;
type ConfirmingAction = "delete" | "logout" | null;

export default function UserSettings() {
  const {
    currentUser,
    updateUsername,
    updatePassword,
    deleteUser,
    logout,
  } = useStore(useShallow((state) => ({
    currentUser: state.user,
    updateUsername: state.updateUsername,
    updatePassword: state.updatePassword,
    deleteUser: state.deleteUser,
    logout: state.logout,
  })));

  const [expanded, setExpanded] = useState<ExpandedSection>(null);
  const [confirming, setConfirming] = useState<ConfirmingAction>(null);

  const [newUsername, setNewUsername] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const toggle = (section: ExpandedSection) =>
    setExpanded((prev) => (prev === section ? null : section));

  const handleUsernameSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const val = newUsername.trim();
    if (!val) return;
    await updateUsername(val);
    setNewUsername("");
    setExpanded(null);
  };

  const handlePasswordSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) return;
    await updatePassword(currentPassword, newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setExpanded(null);
  };

  const passwordMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  return (
    <div className="flex flex-col gap-3">

      {/* Username & Password */}
      <div className={cn(bgColor, ring, "rounded-3xl")}>
        <div className="flex flex-col w-145 p-3 gap-1">

          {/* Change Username */}
          <div className="flex flex-col">
            <button
              onClick={() => toggle("username")}
              className={cn(
                "flex flex-row items-center justify-between w-full px-2 py-2 rounded-2xl text-sm transition-opacity hover:opacity-70",
                text
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <User size={16}/>
                <span>Change username</span>
                {currentUser?.username && (
                  <span className="badge badge-soft badge-sm badge-info">
                    {currentUser.username}
                  </span>
                )}
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200",
                  expanded === "username" && "rotate-180"
                )}
              />
            </button>

            {expanded === "username" && (
              <form onSubmit={handleUsernameSubmit}>
                <div className=" w-full gap-1 px-2 pb-2 pt-1">
                  <div className="flex flex-row justify-between pr-8">
                    <div className={cn(inputWithIcon, "w-1/2")}>
                      <User size={12}/>
                      <input
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder="New username..."
                        className="focus:outline-none w-full text-sm h-8"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!newUsername.trim()}
                      className={cn(flowButtonStyle, "btn-sm")}
                    >
                      <Save size={14}/>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className={cn("h-px opacity-10 mx-2", foreground)}/>

          {/* Change Password */}
          <div className="flex flex-col">
            <button
              onClick={() => toggle("password")}
              className={cn(
                "flex flex-row items-center justify-between w-full px-2 py-2 rounded-2xl text-sm transition-opacity hover:opacity-70",
                text
              )}
            >
              <div className="flex flex-row items-center gap-2">
                <KeyRound size={16}/>
                <span>Change password</span>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  "transition-transform duration-200",
                  expanded === "password" && "rotate-180"
                )}
              />
            </button>

            {expanded === "password" && (
              <form onSubmit={handlePasswordSubmit}>
                <div className="flex flex-col gap-3 px-2 pb-2 pt-2">
                  <div className="flex flex-row justify-between pr-8">

                    <div className={cn(inputWithIcon, "w-1/2")}>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Current password..."
                        className="focus:outline-none text-sm h-8 w-full"
                      />
                    </div>

                  </div>

                  <div className="flex flex-row justify-between pr-8">

                    <div className={cn(inputWithIcon, "w-1/2")}>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password..."
                        className="focus:outline-none text-sm h-8 w-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-row justify-between pr-8">


                    <div className={cn(inputWithIcon, passwordMismatch && "border-error", "w-1/2")}>

                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password..."
                        className="focus:outline-none  text-sm h-8 w-full"
                      />
                    </div>
                    {passwordMismatch && (
                      <p className="text-xs text-error px-1">Passwords do not match.</p>
                    )}

                    <button
                      type="submit"
                      disabled={!currentPassword || !newPassword || passwordMismatch}
                      className={cn(flowButtonStyle, "btn-sm")}
                    >
                      <Save size={14}></Save>
                    </button>

                  </div>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>

      {/* Logout & Delete */}
      <div className={cn(bgColor, ring, "rounded-3xl")}>
        <div className="flex flex-row w-145 p-3 gap-2 items-center justify-end">

          {/* Log out */}
          {confirming === "logout" ? (
            <div className="flex flex-row items-center gap-1">
              <span className="text-xs opacity-60 mr-1">Log out?</span>
              <button
                className={cn(flowButtonStyle, "btn-sm")}
                onClick={() => {
                  logout();
                  setConfirming(null);
                }}
              >
                <LogOut size={14} className={"text-error"}/>
              </button>
              <button
                className={cn(flowButtonStyle, "btn-sm")}
                onClick={() => setConfirming(null)}
              >
                <X size={14}></X>
              </button>
            </div>
          ) : (
            <div className="tooltip tooltip-bottom" data-tip="Log out">
              <button
                className={cn(flowButtonStyle, "btn-sm")}
                onClick={() => {
                  setConfirming("logout");
                }}
              >
                <LogOut size={14}/>
              </button>
            </div>
          )}

          {/* Delete user */}
          {confirming === "delete" ? (
            <div className="flex flex-row items-center gap-1">
              <span className="text-xs opacity-60 mr-1">Delete account?</span>
              <button
                className={cn(flowButtonStyle, "btn-sm text-error")}
                onClick={() => {
                  deleteUser();
                  setConfirming(null);
                }}
              >
                <Trash2 size={14}/>
              </button>
              <button
                className={cn(flowButtonStyle, "btn-sm")}
                onClick={() => setConfirming(null)}
              >
                <X size={14}/>
              </button>
            </div>
          ) : (
            <div className="tooltip tooltip-bottom" data-tip="Delete account">
              <button
                className={cn(flowButtonStyle, "btn-sm")}
                onClick={() => setConfirming("delete")}
              >
                <Trash2 size={14}/>
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}