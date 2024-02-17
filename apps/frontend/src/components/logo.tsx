import { cn } from "@repo/ui/utils";

function Logo({ className, ...props }: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1624 434.667"
      className={cn("fill-primary h-8 -rotate-6 stroke-none", className)}
      {...props}
    >
      <path d="M291.249 76.676c-7.808 28.547-22.243 56.27-33.231 83.742-3.126 7.816-6.65 25.774-13.848 30.536-8.64 5.714-31.713 1.366-41.98 1.366l-11.963 33.231h41.206c-15.29 45.2-34.592 99.785-70.45 132.8-21.796 20.068-55.324 29.576-81.082 11.039-23.32-16.782-27.163-53.215-5.194-72.952 11.981-10.765 27.079-12.4 42.411-12.4v-54.5c-30.196 0-57.702 4.371-81.078 25.487-46.167 41.703-41.6 123.331 9.3 159.22 14.94 10.535 32.548 16.338 50.51 18.84 14.932 2.081 30.38 1.81 45.195-.985 56.48-10.652 95.973-57.34 117.734-108.185 12.88-30.095 21.34-64.388 37.198-92.97 7.285-13.127 32.554-.915 44.089-6.196 7.582-3.471 12.898-24.795 14.987-32.429h-42.536c4.953-18.109 14.025-35.727 21.002-53.17 14.266-35.664 25-81.543 61.41-101.022L384.297.91c-31.615.653-52.87 25.943-83.742 25.236-74.859-1.713-165.346-57.452-232.598-.693-37.296 31.477-39.952 96.103-3.888 129.25 23.867 21.937 61.818 26.59 91.598 15.77 8.324-3.023 25.44-9.248 29.03-18.153 3.167-7.858-13.285-25.365-17.477-31.777-1.63-2.493-3.434-6.545-6.515-7.536-6.442-2.073-21.082 10.322-28.964 11.278-29.667 3.597-49.966-25.997-33.276-51.596 12.492-19.16 35.318-20.492 55.874-19.92 46.37 1.292 90.162 23.78 136.911 23.908m494.477 97.035c-4.575-9.656-8.936-19.076-17.3-26.148-25.675-21.714-65.591-12.82-89.039 7.783-19.92 17.504-34.696 39.824-46.18 63.559-19.859 41.043-33.96 87.56-86.744 94.376 16.432-42.354 36.736-93.239 16.596-138.241-21.752-48.605-89.592-47.992-129.581-24.948-18.358 10.579-33.317 25.306-45.888 42.228-6.944 9.348-13.082 20.049-18.064 30.573-25.145 53.126-43.972 149.52 33.38 168.953 31.886 8.01 66.41-.261 93.046-18.802 10.178-7.084 18.347-19.718 29.243-25.166 7.571-3.785 18.356-.539 26.585-1.983 18.309-3.212 36.337-11.229 50.511-23.31 0 13.063-.892 25.982 3.353 38.549 2.056 6.086 5.26 12.227 9.313 17.227 31.731 39.147 85.3 3.11 110.954-22.544 12.334 58.971 85.637 39.522 118.302 11.564 10.682-9.143 19.563-20.059 29.243-30.174 1.26 9.964 2.269 19.996 6.515 29.244 25.297 55.092 89.567 18.233 118.434-10.634 9.673 65.5 95.3 34.208 124.948 5.297 10.713-10.446 19.387-23.436 30.573-33.211 1.46 70.368 89.58 74.193 139.57 59.233 63.12-18.89 104.752-74.384 134.664-129.683 10.413-19.252 23.03-39.929 28.833-61.145 4.501 2.602 8.235 5.687 11.963 9.324 20.82 20.312 8.868 37.627-.531 61.125-12.795 31.987-33.115 76.32-11.293 108.997 9.562 14.318 26.163 18.636 42.396 18.61 44.176-.068 75.497-42.096 97.102-75.766 6.062-9.449 29.373-36.317 23.416-47.733-2.858-5.478-14.801-14.951-21.31-10.697-6.545 4.276-11.269 17.285-15.399 23.87-11.417 18.204-23.08 37.16-37.512 53.17-5.609 6.221-17.724 19.861-27.436 14.378-11.347-6.407-3.932-27.665-1.19-36.976 8.323-28.262 36.366-66.872 27.805-97.034-6.018-21.202-26.96-35.898-44.146-47.82-6.81-4.724-18.703-10.302-22.846-17.698-4.581-8.18 10.64-32.245 13.54-40.822-8.331-4.621-18.406-14.21-27.913-15.689-17.842-2.774-38 26.693-42.257 40.945-2.75 9.209-2.008 19.326 2.375 27.914 2.489 4.877 9.65 10.458 8.8 16.33-2.29 15.82-15.966 34.557-23.089 48.803-29.2 58.4-85.502 135.193-161.166 123.034-19.734-3.17-33.081-17.808-33.225-37.963-.036-5.034-.493-14.101 4.399-17.238 4.786-3.069 15.28-.044 20.85-.042 17.288.007 35.03.826 51.84-4.04 15.898-4.602 30.323-11.215 42.532-22.665 33.892-31.786 52.214-100.689 2.663-127.057-12.701-6.76-27.058-8.41-41.206-8.405-11.29.004-22.508 1.716-33.231 5.322-75.297 25.316-86.866 103.878-128.173 160.833-12.987 17.907-33.316 46.754-56.592 51.334-12.249 2.41-15.545-8.004-14.237-18.103 2.445-18.87 10.958-36.996 17.96-54.5 31.239-78.095 62.717-156.132 94.64-233.945H1130l-19.383 1.366-14.979 33.194-37.417 93.047c-5.006-9.388-8.975-18.86-17.333-25.964-25.834-21.957-65.37-13.17-89.007 7.6-46.913 41.22-56.521 104.85-94.38 152.617-11.818 14.911-33.911 46.39-55.819 44.996-10.423-.663-11.248-11.65-9.821-19.74 3.35-18.997 11.205-36.705 18.323-54.5 31.048-77.617 63.615-154.677 93.845-232.616h-46.524L838.23 47.47l-15.55 34.523-36.954 91.718m-301.737 5.754c33.499-5.874 24.558 39.231 20.092 58.05-1.532 6.457-3.15 19.74-8.807 23.908-11.8 8.693-23.714 4.58-32.866 19.956-10.351 17.393 2.253 25.127 3.22 41.207.76 12.66-22.758 26.833-33.48 28.368-26.859 3.846-23.536-31.97-20.455-48.307 6.337-33.603 20.477-69.32 40.596-97.035 7.848-10.81 17.633-23.68 31.7-26.147m804.19 9.267c21.834-3.224 20.682 14.947 14.244 30.173-8.66 20.486-22.159 39.727-46.146 42.305-4.85.52-22.101 2.738-25.08-1.9-3.22-5.015 5.193-17.452 7.617-21.796 10.582-18.97 25.65-45.28 49.365-48.782m-546.318 1.349c17.337-2.128 28.42 17.443 24.212 32.812-2.991 10.922-8.58 21.4-12.78 31.901-12.474 31.185-27.256 83.79-68.589 86.276-26.088 1.568-17.996-30.912-14.123-46.398 7.145-28.575 19.828-57.75 37.9-81.084 8.224-10.617 19.35-21.785 33.38-23.507m272.495-.001c17.03-2.015 28.616 17.629 24.052 32.813-3.408 11.34-8.893 22.298-13.404 33.23-12.678 30.727-26.794 82.431-67.806 84.947-25.818 1.584-18.593-30.727-14.415-46.398 7.584-28.447 19.755-57.716 37.897-81.084 8.462-10.9 19.246-21.8 33.676-23.508z" />
    </svg>
  );
}

export default Logo;
