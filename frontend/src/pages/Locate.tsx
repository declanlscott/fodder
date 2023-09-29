import { FodCard } from "~/components/FodCard";
import { Layout } from "~/components/Layout";
import { LocateCard } from "~/components/LocateCard";
import { useRestaurants } from "~/lib/hooks";

export function Locate() {
  const { data } = useRestaurants();

  return (
    <Layout>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div className="col-span-1">
          <LocateCard />
        </div>

        <div className="col-span-1 lg:col-span-2 xl:col-span-3">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {data?.map((restaurant) => (
              <FodCard key={restaurant.slug} restaurant={restaurant} />
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
