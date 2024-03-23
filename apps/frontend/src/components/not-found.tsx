import { DroppedCone } from "~/components/dropped-cone";
import { useTitle } from "~/hooks/title";

type NotFoundProps = {
  page?: string;
};

export function NotFound(props: NotFoundProps) {
  const { page = "Page" } = props;

  useTitle({ title: `${page} Not Found` });

  return (
    <div className="mt-8 flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
      <DroppedCone className="w-48" />

      <div className="flex flex-col items-center gap-2">
        <span className="text-9xl font-bold">404</span>
        <span className="text-center text-xl">{page} not found.</span>
      </div>
    </div>
  );
}
