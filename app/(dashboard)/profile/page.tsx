import { PageHeader } from "@/components/admin/PageHeader";
import ProfileForm from "./ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Identity"
        title="Profile"
        description="Manage the current admin profile. This scaffold persists locally and is ready for backend integration."
      />
      <ProfileForm />
    </div>
  );
}
