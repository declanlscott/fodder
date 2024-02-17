import { cn } from "@repo/ui/utils";

export function DroppedCone({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 788 905.333"
      className={cn("fill-primary stroke-none", className)}
      {...props}
    >
      <path d="M188.279 780.097c0 25.906 10.113 49.396 35.895 59.39 23.102 8.957 52.778 4.423 77.108 4.423H426.25c21.386 0 45.932 3.226 66.473-3.924 26.068-9.073 37.221-34.1 37.224-59.89H668.21c25.095 0 52.707 3.304 77.108-3.375 35.478-9.712 50.505-55.01 33.18-85.698-14.932-26.448-40.07-30.577-67.746-30.577-7.823 0-34.511 4.23-37.32-5.462-1.68-5.794 3.741-14.397 5.597-19.797 4.62-13.442 8.694-28.396 10.232-42.543 5.282-48.613 1.794-95.44-17.818-140.922-19.392-44.972-51.553-83.806-92.306-110.988-15.898-10.604-36.658-15.895-51.57-27.112-20.994-15.792-40.737-35.937-61.433-52.729-66.236-53.74-132.94-106.95-199.418-160.406-30.592-24.6-61.275-49.07-91.732-73.842-13.958-11.353-29.566-27.109-49.19-25.374C104.91 3.117 88.338 19.907 87.38 40.922c-.494 10.826 3.261 21.381 4.986 31.907 4.666 28.467 12.086 56.589 16.32 85.085 6.955 46.804 18.417 93.07 27.134 139.592 12.46 66.504 24.587 133.14 38.215 199.418 2.086 10.142 8.068 19.644 9.8 29.248 2.484 13.761-2.03 30.69-.647 45.2 1.482 15.565 2.89 31.393 7.164 46.532 2.641 9.356 10.149 22.25 9.557 31.905-.958 15.639-29.284 10.637-39.548 10.637H81.923c-15.737 0-31.948-1.454-46.531 5.682-42.297 20.697-46.405 84.123-2.659 106.516 18.223 9.328 38.673 7.453 58.496 7.453h97.05m-49.19-668.714-13.294-69.131c6.264-.937 9.899 2.674 14.623 6.536 17.327 14.166 11.958 25.51 5.99 45.312-1.826 6.062-1.786 13.493-7.319 17.283m35.895 174.158c-9.492-11.002-10.131-38.86-12.543-53.178-3.905-23.18-15.259-50.96-13.528-74.449 2.045-27.743 16.105-54.991 20.753-82.426 13.67 3.554 26.496 17.869 37.225 26.701 3.776 3.108 10.642 7 11.876 12.08 3.283 13.514-9.155 39.692-12.933 52.951-11.12 39.03-17.812 79.882-30.85 118.321m34.566 171.5h-3.989c-2.445-28.047-10.043-57.533-15.972-85.086-2.76-12.82-7.963-28.045-7.148-41.212 1.21-19.58 10.15-40.906 15.25-59.826 12.537-46.497 30.672-95.94 37.118-143.58 13.851 3.622 27.43 19.403 38.554 28.198 4.309 3.407 9.862 7.02 10.315 13.016.65 8.624-4.375 19.654-6.665 27.917-5.506 19.867-10.355 39.923-15.721 59.825-10.362 38.433-19.02 77.374-29.884 115.662-7.842 27.636-17.677 56.649-21.858 85.085m93.061-277.855 31.907 25.54 13.77 13.24-3.241 19.716-12.62 47.86L306.01 386.58l-10.794 36.946-36.475 23.178-31.907 16.984 18.719-74.449 35.895-136.933 12.319-47.86 8.845-25.26m17.283 228.666 13.397-53.178 31.805-122.31c13.13 3.15 25.407 17.833 35.895 26.025 4.324 3.378 10.699 6.939 12.372 12.534 2.038 6.817-2.865 17.279-4.535 23.925-3.909 15.56-8.573 30.918-12.285 46.531-1.8 7.573-2.888 18.536-7.328 25.013-4.073 5.943-12.775 9.394-18.802 13.01-15.24 9.144-33.154 24.467-50.519 28.45m151.557-93.062-14.623 12.763-43.872 24.462c4.174-21.515 8.736-48.23 18.612-67.802l39.883 30.577M225.503 515.536c3.265-10.678 20.255-16.73 29.248-22.302 27.674-17.147 55.84-33.538 83.756-50.286l110.344-66.272c14.467-8.685 33.918-26.19 50.519-29.366 11.16-2.134 27.532 8.667 37.225 13.306 38.653 18.5 78.9 55.753 94.603 96.42 3.275 8.48-5.338 10.861-10.848 15.264-9.56 7.64-16.838 17.164-21.184 28.612-7.212 18.997-4.892 43.673-5.386 63.814-.22 8.983 1.81 21.967-9.346 25.175-19.924 5.729-15.719-30.475-19.65-41.129-10.476-28.389-44.612-43.204-72.061-30.519-40.486 18.71-33.237 64.197-33.237 100.98 0 12.661-1.184 32.469-19.94 27.342-16.429-4.49-10.637-34.528-10.637-47.284 0-40.134 5.577-101.723-50.519-106.232-44.615-3.585-58.496 36.89-58.496 72.996 0 11.482 5.537 40.37-9.325 44.276-6.744 1.773-12.614-3.42-14.08-9.715-3.041-13.056.426-26.685-3.875-39.879-9.54-29.265-37.526-45.181-67.11-45.201m418.637-12.07c4.396-.643 5.278 6.467 5.902 9.411 2.352 11.1 3.525 23.236 3.543 34.566.035 21.478-1.906 43.038-7.638 63.813-6.77 24.534-20.568 47.023-2.294 70.456 15.41 19.76 41.842 18.166 64.44 18.166 9.3 0 19.173-2.845 27.913 1.967 13.422 7.39 14.692 27.72 1.315 35.898-6.078 3.716-14.443 2.47-21.252 2.47H670.87c-55.268 0-113.92-5.674-168.84.23-3.594.387-7.35 1.227-10.63 2.78-31.765 15.032 18.804 45.433-10.662 59.289-14.017 6.59-40.41 1.515-55.816 1.515H293.305c-15.14 0-45.409 5.76-58.438-2.47-24.897-15.726 20.465-40.594-6.724-57.55-11.6-7.234-30.791-3.794-43.853-3.794H81.923c-15.454 0-47.78 1.827-41.507-23.93 5.784-23.747 46.736-18.735 65.437-16.738 10.317 1.102 21.437-.664 31.907-.54 33.882.403 94.77 8.33 100.792-39.888 1.837-14.717-3.259-26.224-7.458-39.884-4.886-15.895-8.324-32.593-9.46-49.19-.372-5.425-1.809-14.588 5.277-15.755 32.399-5.335 28.416 30.926 30.744 50.321 3.015 25.117 27.377 46.566 52.933 45.077 43.73-2.547 47.86-44.569 47.86-78.313 0-13.164-4.203-41.587 17.283-39.326 20.056 2.111 13.295 36.005 13.295 49.962 0 39.032-5.21 89.498 42.542 102.652 6.492 1.789 14.607 1.559 21.271.813 47.06-5.269 45.202-55.384 45.202-90.171 0-12.138-4.42-34.79 9.363-41.094 26.105-11.94 20.89 27.178 25.448 39.765 11.676 32.236 50.37 45.563 78.172 25.14 25.702-18.88 22.62-53.86 22.62-82.307 0-8.482-2.166-31.487 10.497-33.34m-62.345 291.875c-41.656 7.805-55.917 60.97-28.24 90.88 18.854 20.375 55.755 21.271 81.418 16.444 45.442-8.546 66.694-62.333 29.96-95.478-18.828-16.989-59.354-16.302-83.138-11.846m6.652 38.616c10.003-3.04 38.521-3.923 47.835.884 11.103 5.731 10.484 23.452-1.314 28.023-9.813 3.802-41.526 4.186-50.456-1.483-10.568-6.71-7.94-23.814 3.935-27.424z" />
    </svg>
  );
}
