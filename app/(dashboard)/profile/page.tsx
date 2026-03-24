import { PageHeader } from "@/components/admin/PageHeader";
import ProfileForm from "./ProfileForm";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin Account"
        title="Profile"
        description="View the current single-admin account details used for this dashboard session."
      />
      <ProfileForm />
    </div>
  );
}
