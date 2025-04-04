"use client";

import { useNoteDetail } from "~/atoms/notes";

// type Props = {
//   params: Promise<{ noteId: string }>;
// };

export default function page() {
  // const { noteId } = await params;
  const { data, isFetching } = useNoteDetail();

  return <div className="px-1 py-4">{JSON.stringify(data, null, 2)}</div>;
}
