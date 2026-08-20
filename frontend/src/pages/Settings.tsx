import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Palette, Database, LogOut, Loader2 } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { settingsApi } from "../api/settings";
import { useTheme } from "../context/ThemeContext";
import { useAuthStore } from "../store/authStore";

export default function Settings() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const [activeTab, setActiveTab] = useState<
    "profile" | "password" | "preferences" | "data"
  >("profile");
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // const [preferences, setPreferences] = useState({
  //   emailNotifications: true,
  //   reminderNotifications: true,
  //   theme: "light" as "light" | "dark" | "system",
  // });

  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    reminderNotifications: true,
    theme: theme,
  });

  useEffect(() => {
    setPreferences((prev) => ({ ...prev, theme }));
  }, [theme]);

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    setPreferences((prev) => ({ ...prev, theme: newTheme }));
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  async function handleSaveProfile() {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }

    setLoading(true);
    try {
      await settingsApi.updateProfile(
        profileData.firstName,
        profileData.lastName,
      );
      toast.success("Profile updated successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  async function handleChangePassword() {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      await settingsApi.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
      );
      toast.success("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  async function handleSavePreferences() {
    setLoading(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  function handleLogout() {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  async function handleDeleteAccount() {
    if (
      window.confirm(
        "Are you absolutely sure? This action cannot be undone. All your data will be permanently deleted.",
      )
    ) {
      setLoading(true);
      try {
        await settingsApi.deleteAccount();
        logout();
        toast.success("Account deleted");
        navigate("/");
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to delete account",
        );
        setLoading(false);
      }
    }
  };

  async function handleExportData() {
    setLoading(true);
    try {
      const blob = await settingsApi.exportData();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `hirewire-applications-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Data exported successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await settingsApi.getProfile();
        setProfileData({
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error("Failed to load profile");
      }
    };

    fetchUserProfile();
  }, []);

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "data", label: "Data", icon: Database },
  ] as const;

  return (
    <div>

      <main className="max-w-5xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="page-title">Settings</h1>
          <p className="page-description">
            Manage your account and preferences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* SIDEBAR NAVIGATION */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div className="ui-panel overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full px-4 py-3 text-left text-sm font-medium flex items-center gap-3 transition-colors border-l-2 ${
                      activeTab === tab.id
                        ? "bg-brand-soft border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* MAIN CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-3"
          >
            <div className="ui-panel-strong p-6 space-y-6">
              {/* PROFILE TAB */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      Profile Information
                    </h2>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          value={profileData.firstName}
                          onChange={(e) =>
                            handleProfileChange("firstName", e.target.value)
                          }
                        />
                        <Input
                          label="Last Name"
                          value={profileData.lastName}
                          onChange={(e) =>
                            handleProfileChange("lastName", e.target.value)
                          }
                        />
                      </div>
                      <Input
                        label="Email"
                        type="email"
                        value={profileData.email}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed. Contact support if you need to
                        update it.
                      </p>
                    </div>
                  </div>

                  <div className="border-t hairline pt-6 flex gap-3">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* PASSWORD TAB */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      Change Password
                    </h2>
                    <div className="space-y-4">
                      <Input
                        label="Current Password"
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "currentPassword",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        label="New Password"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                      />
                      <Input
                        label="Confirm New Password"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "confirmPassword",
                            e.target.value,
                          )
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long.
                      </p>
                    </div>
                  </div>

                  <div className="border-t hairline pt-6">
                    <Button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* PREFERENCES TAB */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Preferences</h2>

                    {/* Notifications */}
                    <div className="space-y-4 mb-6">
                      <h3 className="text-sm font-medium">Notifications</h3>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              emailNotifications: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded border-border"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            Email Notifications
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Receive updates about your applications
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.reminderNotifications}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              reminderNotifications: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 rounded border-border"
                        />
                        <div>
                          <p className="text-sm font-medium">Reminders</p>
                          <p className="text-xs text-muted-foreground">
                            Get reminded about pending actions
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Theme */}
                    <div className="space-y-3 border-t hairline pt-6">
                      <h3 className="text-sm font-medium">Theme</h3>
                      <div className="space-y-2">
                        {(
                          [
                            { value: "light", label: "Light" },
                            { value: "dark", label: "Dark" },
                            { value: "system", label: "System" },
                          ] as const
                        ).map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="radio"
                              name="theme"
                              value={option.value}
                              checked={preferences.theme === option.value}
                              onChange={(e) =>
                                handleThemeChange(
                                  e.target.value as "light" | "dark" | "system",
                                )
                              }
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t hairline pt-6">
                    <Button
                      onClick={handleSavePreferences}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* DATA TAB */}
              {activeTab === "data" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold mb-4">
                      Data Management
                    </h2>

                    <div className="space-y-4">
                      <div className="p-4 ui-panel-muted">
                        <h3 className="text-sm font-medium mb-2">
                          Export Your Data
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Download all your applications and data in CSV format.
                        </p>
                        <Button
                          onClick={handleExportData}
                          disabled={loading}
                          variant="outline"
                          className="gap-2"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Exporting...
                            </>
                          ) : (
                            "Export as CSV"
                          )}
                        </Button>
                      </div>

                      <div className="p-4 bg-status-danger-soft border border-status-danger/20 rounded-lg">
                        <h3 className="text-sm font-medium text-status-danger mb-2">
                          Delete Account
                        </h3>
                        <p className="text-xs text-status-danger mb-4">
                          This action is permanent. All your data will be
                          deleted.
                        </p>
                        <Button
                          onClick={handleDeleteAccount}
                          disabled={loading}
                          variant="danger"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            "Delete Account"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t hairline pt-6">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
