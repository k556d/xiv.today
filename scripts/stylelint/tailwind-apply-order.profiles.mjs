function splitVariants(token) {
  const state = Array.from(token).reduce(
    ({ parts, current, depth }, char) => {
      switch (true) {
        case char === "[":
          return { parts, current: `${current}${char}`, depth: depth + 1 };
        case char === "]":
          return { parts, current: `${current}${char}`, depth: Math.max(depth - 1, 0) };
        case char === ":" && depth === 0:
          return { parts: [...parts, current], current: "", depth };
        default:
          return { parts, current: `${current}${char}`, depth };
      }
    },
    { parts: [], current: "", depth: 0 }
  );

  return [...state.parts, state.current];
}

function matchesBaseUtility(token, predicate) {
  const parts = splitVariants(token);

  return parts.length === 1 && predicate((parts.at(-1) ?? token).replace(/^!/, "").replace(/^-/, ""));
}

function matchExact(values) {
  return (token) => matchesBaseUtility(token, (utility) => values.includes(utility));
}

function matchPrefix(prefixes) {
  return (token) => matchesBaseUtility(token, (utility) => prefixes.some((prefix) => utility.startsWith(prefix)));
}

function matchVariant(variants) {
  return (token) => splitVariants(token).some((variant) => variants.includes(variant));
}

function createProfile(name, matchers) {
  return {
    name,
    match: (token) => matchers.some((matcher) => matcher(token)),
  };
}

export const profiles = [
  createProfile("layout", [
    matchExact([
      "block",
      "inline",
      "inline-block",
      "inline-flex",
      "inline-grid",
      "flex",
      "grid",
      "contents",
      "hidden",
      "relative",
      "absolute",
      "fixed",
      "sticky",
      "static",
    ]),
    matchPrefix([
      "inset-",
      "top-",
      "right-",
      "bottom-",
      "left-",
      "z-",
      "w-",
      "h-",
      "min-w-",
      "min-h-",
      "max-w-",
      "max-h-",
      "size-",
      "basis-",
      "overflow-",
      "overscroll-",
      "object-",
      "float-",
      "clear-",
      "isolate-",
      "columns-",
      "box-",
      "aspect-",
      "flex-",
      "grid-",
      "place-",
      "justify-",
      "items-",
      "content-",
      "self-",
      "order-",
      "grow-",
      "shrink-",
      "container-",
    ]),
  ]),

  createProfile("spacing", [
    matchPrefix([
      "m-",
      "mx-",
      "my-",
      "mt-",
      "mr-",
      "mb-",
      "ml-",
      "p-",
      "px-",
      "py-",
      "pt-",
      "pr-",
      "pb-",
      "pl-",
      "gap-",
      "space-",
      "scroll-m-",
      "scroll-p-",
    ]),
  ]),

  createProfile("borders and radius", [
    matchExact([
      "border",
      "ring",
      "outline",
      "divide",
    ]),
    matchPrefix([
      "rounded-",
      "border-",
      "ring-",
      "outline-",
      "divide-",
    ]),
  ]),

  createProfile("typography", [
    matchExact([
      "italic",
      "not-italic",
      "underline",
      "overline",
      "line-through",
      "no-underline",
      "antialiased",
      "subpixel-antialiased",
      "truncate",
      "uppercase",
      "lowercase",
      "capitalize",
      "normal-case",
      "wrap",
      "nowrap",
      "balance",
      "pretty",
      "ellipsis",
      "clip",
      "text-xs",
      "text-sm",
      "text-base",
      "text-lg",
      "text-xl",
      "text-2xl",
      "text-3xl",
      "text-4xl",
      "text-5xl",
      "text-6xl",
      "text-7xl",
      "text-8xl",
      "text-9xl",
      "text-left",
      "text-center",
      "text-right",
      "text-justify",
      "text-start",
      "text-end",
    ]),
    matchPrefix([
      "font-",
      "leading-",
      "tracking-",
      "whitespace-",
      "break-",
      "list-",
      "indent-",
    ]),
  ]),

  createProfile("color and background", [
    matchPrefix([
      "bg-",
      "from-",
      "via-",
      "to-",
      "fill-",
      "stroke-",
      "accent-",
      "caret-",
      "placeholder-",
      "text-",
      "decoration-",
    ]),
  ]),

  createProfile("shadows and effects", [
    matchPrefix([
      "shadow-",
      "backdrop-",
      "blur-",
      "brightness-",
      "contrast-",
      "drop-shadow-",
      "filter-",
      "grayscale-",
      "hue-rotate-",
      "invert-",
      "saturate-",
      "sepia-",
      "mix-blend-",
      "opacity-",
      "transform-",
      "translate-",
      "rotate-",
      "scale-",
      "skew-",
      "origin-",
      "will-change-",
    ]),
  ]),

  createProfile("transitions and motion", [
    matchExact(["transition"]),
    matchPrefix([
      "transition-",
      "duration-",
      "ease-",
      "delay-",
      "animate-",
      "motion-",
    ]),
  ]),

  createProfile("interaction states", [
    matchVariant([
      "hover",
      "focus",
      "focus-visible",
      "focus-within",
      "active",
      "visited",
      "disabled",
      "enabled",
      "checked",
      "indeterminate",
      "required",
      "invalid",
      "valid",
      "empty",
      "placeholder-shown",
      "read-only",
      "read-write",
      "open",
    ]),
  ]),

  createProfile("responsive overrides", [
    matchVariant([
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
      "max-sm",
      "max-md",
      "max-lg",
      "max-xl",
      "max-2xl",
    ]),
  ]),
];
