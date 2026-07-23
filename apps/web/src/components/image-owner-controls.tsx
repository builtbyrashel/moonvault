'use client';

import { useState } from 'react';
import { EditImageForm } from './edit-image-form';
import { DeleteImageButton } from './delete-image-button';

interface ImageOwnerControlsProps {
  imageId: string;
  title: string | null;
  isPublic: boolean;
  tags: string[];
}

export function ImageOwnerControls({
  imageId,
  title,
  isPublic,
  tags,
}: ImageOwnerControlsProps) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <EditImageForm
        imageId={imageId}
        initialTitle={title}
        initialIsPublic={isPublic}
        initialTags={tags}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <div className="flex gap-4 pt-4 border-t border-ink/10">
      <button onClick={() => setEditing(true)} className="text-sm text-ink">
        Edit
      </button>
      <DeleteImageButton imageId={imageId} />
    </div>
  );
}
