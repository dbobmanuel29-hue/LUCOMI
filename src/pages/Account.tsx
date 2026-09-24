import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Camera, LockKeyhole, Phone, Save, UserCircle, X } from "lucide-react";
import { useAuth } from "../components/AuthFlow";
import { Button, Field, Input, Micro, Notice, Reveal, usePageMeta } from "../components/ui";

export default function Account() {
  usePageMeta("My Account — LUCOMI ENTERPRISE", "Manage your LUCOMI account details and preferences.");
  const { user, updateUser, signOut } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <Navigate to="/" replace />;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError("");
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError("Please choose an image smaller than 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoURL(reader.result);
        setMessage("Profile image selected. Tap Save Profile to keep it.");
      }
    };
    reader.onerror = () => setImageError("We couldn't read that image. Please try another file.");
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPhotoURL("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMessage("Profile image removed. Tap Save Profile to confirm.");
  };

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    updateUser({
      name: name.trim() || user.name,
      phone: phone.trim() || undefined,
      photoURL: photoURL || undefined,
    });
    setMessage("Profile details saved.");
  };

  const changePassword = (event: React.FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 6) {
      setMessage("Your new password must be at least 6 characters.");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setMessage("Password change saved for this frontend demo. Firebase Authentication will handle the real password change in the backend phase.");
  };

  return (
    <>
      <section className="shell pt-[120px] sm:pt-[150px]">
        <Micro className="text-royal">Account</Micro>
        <h1 className="display mt-5 text-[clamp(2.8rem,8vw,5.8rem)]">
          Your
          <span className="block pl-[5vw] italic">Profile.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-mute">
          Manage your personal details, profile image, phone number and account security from one place.
        </p>
      </section>

      <section className="shell pb-24 pt-12">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-8">
            {message && <Notice title="Account update">{message}</Notice>}
            {imageError && <Notice title="Image upload">{imageError}</Notice>}

            <Reveal>
              <form onSubmit={saveProfile} className="rounded-2xl border border-line bg-white p-5 sm:p-8">
                <div className="flex items-center gap-3 border-b border-line pb-5">
                  <UserCircle className="h-6 w-6 text-royal" />
                  <div>
                    <h2 className="display text-2xl">Personal details</h2>
                    <p className="mt-1 text-xs text-mute">Update how your profile appears on LUCOMI.</p>
                  </div>
                </div>

                <div className="mt-6 space-y-5">
                  <Field label="Profile Image">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative shrink-0">
                        {photoURL ? (
                          <>
                            <img src={photoURL} alt="Profile preview" className="h-24 w-24 rounded-full border border-line object-cover" />
                            <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow-sm"
                              aria-label="Remove profile image"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-plate text-3xl font-bold text-royal">
                            {name.charAt(0).toUpperCase() || <UserCircle className="h-10 w-10" />}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                          <Camera className="h-4 w-4" /> Choose from device
                        </Button>
                        <p className="mt-2 text-xs leading-relaxed text-mute">
                          Select a photo directly from your phone, tablet or computer. PNG, JPG, WEBP or GIF, up to 3 MB.
                        </p>
                      </div>
                    </div>
                  </Field>

                  <Field label="Full Name" required>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </Field>

                  <Field label="Email Address">
                    <Input value={user.email} disabled />
                  </Field>

                  <Field label="Phone Number">
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
                      <Input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10"
                        placeholder="+234 800 000 0000"
                      />
                    </div>
                  </Field>

                  <Button type="submit"><Save className="h-4 w-4" /> Save Profile</Button>
                </div>
              </form>
            </Reveal>

            {user.provider === "email" && (
              <Reveal>
                <form onSubmit={changePassword} className="rounded-2xl border border-line bg-white p-5 sm:p-8">
                  <div className="flex items-center gap-3 border-b border-line pb-5">
                    <LockKeyhole className="h-6 w-6 text-royal" />
                    <div>
                      <h2 className="display text-2xl">Password & security</h2>
                      <p className="mt-1 text-xs text-mute">Change your account password.</p>
                    </div>
                  </div>
                  <div className="mt-6 space-y-5">
                    <Field label="Current Password" required><Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required /></Field>
                    <Field label="New Password" required><Input type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required /></Field>
                    <Button type="submit">Change Password</Button>
                  </div>
                </form>
              </Reveal>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-2xl border border-line bg-ink p-6 text-white lg:sticky lg:top-[110px]">
              <Micro className="text-white/50">Account</Micro>
              <div className="mt-6 flex items-center gap-4">
                {user.photoURL ? <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" /> : <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-royal">{user.name.charAt(0).toUpperCase()}</span>}
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{user.name}</p>
                  <p className="truncate text-sm text-white/55">{user.email}</p>
                  {user.phone && <p className="truncate text-xs text-white/50">{user.phone}</p>}
                </div>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-white/55">
                Signed in with {user.provider === "google" ? "Google" : "email"}.
              </p>
              <button type="button" onClick={signOut} className="mt-6 w-full rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold hover:bg-white/10">
                Sign Out
              </button>
              <Link to="/" className="mt-4 block text-center text-xs font-semibold text-white/60 hover:text-white">Back to website</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
