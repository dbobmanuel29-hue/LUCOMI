import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Camera, LockKeyhole, Phone, Save, UserCircle, X } from "lucide-react";
import { useAuth } from "../components/AuthFlow";
import { doc, getDoc, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { uploadToCloudinary } from "../lib/api";
import { Button, Field, Input, Micro, Notice, Reveal, usePageMeta } from "../components/ui";

export default function Account() {
  usePageMeta("My Account — LUCOMI ENTERPRISE", "Manage your LUCOMI account details and preferences.");
  const { user, isAdmin, updateUser, signOut } = useAuth();
  const [profileImageChangedAt, setProfileImageChangedAt] = useState<Timestamp | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;

    setName(user.name ?? "");
    setPhone(user.phone ?? "");
    setPhotoURL(user.photoURL ?? "");

    void getDoc(doc(db, "users", user.uid)).then((snapshot) => {
      const data = snapshot.data();
      const value = data?.profileImageChangedAt;
      setProfileImageChangedAt(value instanceof Timestamp ? value : null);

      if (typeof data?.name === "string" && data.name.trim()) setName(data.name);
      if (typeof data?.phone === "string") setPhone(data.phone);
      if (typeof data?.photoURL === "string") setPhotoURL(data.photoURL);
    }).catch(() => {});
  }, [user?.uid]);

  const profileImageLocked =
    !isAdmin &&
    !!profileImageChangedAt &&
    new Date().getFullYear() === profileImageChangedAt.toDate().getFullYear() &&
    new Date().getMonth() === profileImageChangedAt.toDate().getMonth();

  if (!user) return <Navigate to="/" replace />;

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError("");
    if (profileImageLocked) {
      setImageError("You can change your profile picture once per month. Please try again next month.");
      event.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setImageError("Please choose an image file.");
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      setImageError("Please choose an image smaller than 3 MB.");
      return;
    }

    // Show the selected image immediately while Cloudinary uploads in the background.
    // The preview is replaced with the permanent Cloudinary URL once the upload completes.
    const localPreview = URL.createObjectURL(file);
    setPhotoURL(localPreview);
    setMessage("Profile image selected. Uploading...");
    setImageUploading(true);

    try {
      const url = await uploadToCloudinary(file, "lucomi/profiles");
      setPhotoURL(url);
      setMessage("Profile image uploaded. Tap Save Profile to keep it.");
      URL.revokeObjectURL(localPreview);
    } catch (error) {
      URL.revokeObjectURL(localPreview);
      setPhotoURL(user?.photoURL ?? "");
      setImageError(error instanceof Error ? error.message : "We couldn't upload that image. Please try again.");
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  const removeImage = () => {
    setPhotoURL("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setMessage("Profile image removed. Tap Save Profile to confirm.");
  };

  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      if (imageUploading) {
        setMessage("Please wait for the profile image upload to finish before saving.");
        return;
      }

      const profileImageChanged = photoURL !== (user.photoURL ?? "");
      await updateUser({
        name: name.trim() || user.name,
        phone: phone.trim() || undefined,
        photoURL,
      });
      if (profileImageChanged && photoURL) {
        if (!isAdmin) setProfileImageChangedAt(Timestamp.now());
        setMessage("Profile picture updated successfully. Your profile has been saved.");
      } else if (profileImageChanged && !photoURL) {
        if (!isAdmin) setProfileImageChangedAt(Timestamp.now());
        setMessage("Profile picture removed successfully. Your profile has been saved.");
      } else {
        setMessage("Profile updated successfully. Your changes have been saved.");
      }
    } catch (error) {
      console.error("Profile save failed:", error);
      setMessage("We couldn't save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
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
            {message && <Notice title="Profile updated successfully">{message}</Notice>}
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
                        <Button type="button" variant="outline" disabled={profileImageLocked || imageUploading} onClick={() => fileInputRef.current?.click()}>
                          <Camera className="h-4 w-4" /> {imageUploading ? "Uploading..." : profileImageLocked ? "Available next month" : "Choose from device"}
                        </Button>
                        <p className="mt-2 text-xs leading-relaxed text-mute">
                          {profileImageLocked
                            ? "Your profile picture has already been changed this month. You can choose another picture next month."
                            : "Select a photo directly from your phone, tablet or computer. PNG, JPG, WEBP or GIF, up to 3 MB."}
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

                  <Button type="submit" disabled={saving}><Save className="h-4 w-4" /> {saving ? "Saving..." : "Save Profile"}</Button>
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
