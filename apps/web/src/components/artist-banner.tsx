'use client';

import { useState } from 'react';
import { Avatar, colorForId } from './avatar';
import { EditDisplayNameForm } from './edit-display-name-form';
import { ChangePasswordForm } from './change-password-form';

interface ArtistBannerProps {
  id: string;
  displayName: string;
  memberSince: string;
  stats: { publicUploadCount: number; bookmarksReceived: number };
  isOwner: boolean;
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function ArtistBanner({
  id,
  displayName,
  memberSince,
  stats,
  isOwner,
}: ArtistBannerProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="mb-6">
      <div
        className="rounded-t-lg"
        style={{
          height: 'clamp(90px, 12vw, 200px)',
          backgroundColor: colorForId(id + 'banner'),
        }}
      />
      <div className="px-1">
        <div
          style={{ marginTop: 'clamp(-34px, -4.5vw, -56px)' }}
          className="mb-2"
        >
          <div className="ring-4 ring-paper rounded-full inline-block">
            <Avatar
              id={id}
              displayName={displayName}
              size="clamp(56px, 7vw, 96px)"
            />
          </div>
        </div>
        <div className="flex justify-between items-end flex-wrap gap-3">
          <div>
            <div className="font-display font-semibold text-lg">
              {displayName}
            </div>
            <div className="text-sm text-slate">
              Member since {formatMemberSince(memberSince)}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="bg-paper-light rounded-lg px-3.5 py-1.5 text-center">
              <div className="font-mono text-sm">{stats.publicUploadCount}</div>
              <div className="text-[11px] text-slate">public</div>
            </div>
            <div className="bg-paper-light rounded-lg px-3.5 py-1.5 text-center">
              <div className="font-mono text-sm">{stats.bookmarksReceived}</div>
              <div className="text-[11px] text-slate">bookmarks</div>
            </div>
            {isOwner && (
              <button
                onClick={() => setEditing((v) => !v)}
                className="text-sm text-ink border border-ink/20 rounded-full px-3.5 py-1.5"
              >
                {editing ? 'Close' : 'Edit profile'}
              </button>
            )}
          </div>
        </div>
      </div>

      {isOwner && editing && (
        <div className="mt-5 pt-5 border-t border-ink/10 space-y-6">
          <div>
            <h2 className="text-sm font-medium text-slate mb-3">Display name</h2>
            <EditDisplayNameForm initialDisplayName={displayName} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate mb-3">Password</h2>
            <ChangePasswordForm />
          </div>
        </div>
      )}
    </div>
  );
}