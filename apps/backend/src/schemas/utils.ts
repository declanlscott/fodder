import { BaseSchema, flatten, SchemaIssues } from "valibot";

export function formatIssues<Schema extends BaseSchema>({
  issues,
}: {
  issues: SchemaIssues;
}) {
  Object.values(flatten<Schema>(issues).nested).map((messages) =>
    (messages as [string, ...string[]]).join(", "),
  );
}
