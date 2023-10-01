import { useParams } from "react-router-dom";

import { FlavorDetailsCard } from "~/components/FlavorDetailsCard";

export function FlavorPage() {
  const { slug } = useParams();

  if (!slug) {
    return null;
  }

  return <FlavorDetailsCard slug={slug} />;
}
