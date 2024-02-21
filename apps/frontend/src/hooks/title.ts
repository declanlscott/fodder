import { useEffect } from "react";

export type UseTitleProps = {
  title?: string;
  isLoading?: boolean;
};

export function useTitle({ title, isLoading = false }: UseTitleProps) {
  const appName = "Fodder";

  useEffect(() => {
    if (isLoading) {
      document.title = `Loading... | ${appName}`;
    } else if (title) {
      document.title = `${title} | ${appName}`;
    }

    return () => {
      document.title = appName;
    };
  }, [title, isLoading]);
}
