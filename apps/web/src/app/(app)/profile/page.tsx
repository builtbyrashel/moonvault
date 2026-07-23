import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/api';
import { Avatar } from '@/components/avatar';
import { EditDisplayNameForm } from '@/components/edit-display-name-form';
import { ChangePasswordForm } from '@/components/change-password-form';

interface ProfileData {
  id: string;
  email: string;
  displayName: string;
  memberSince: string;
  stats: {
    uploadCount: number;
    publicUploadCount: number;
    totalBookmarksReceived: number;
  };
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default async function ProfilePage() {
  const res = await serverFetch('/me/profile');
  if (res.status === 401) redirect('/login');
  if (!res.ok) throw new Error('Failed to load profile');

  const profile: ProfileData = await res.json();

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-4 mb-8">
        <Avatar id={profile.id} displayName={profile.displayName} size={56} />
        <div>
          <div className="font-display font-semibold text-lg">
            {profile.displayName}
          </div>
          <div className="text-sm text-slate">
            Member since {formatMemberSince(profile.memberSince)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-paper-light rounded-lg p-3 text-center">
          <div className="font-mono text-lg">{profile.stats.uploadCount}</div>
          <div className="text-xs text-slate">Uploads</div>
        </div>
        <div className="bg-paper-light rounded-lg p-3 text-center">
          <div className="font-mono text-lg">
            {profile.stats.publicUploadCount}
          </div>
          <div className="text-xs text-slate">Public</div>
        </div>
        <div className="bg-paper-light rounded-lg p-3 text-center">
          <div className="font-mono text-lg">
            {profile.stats.totalBookmarksReceived}
          </div>
          <div className="text-xs text-slate">Bookmarks received</div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-sm font-medium text-slate mb-3">Display name</h2>
        <EditDisplayNameForm initialDisplayName={profile.displayName} />
      </div>

      <div>
        <h2 className="text-sm font-medium text-slate mb-3">Password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
