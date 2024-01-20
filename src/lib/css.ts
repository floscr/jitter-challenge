export const cssVar = function (name: string): string | null {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};

export const cssVarHsla = function (
  name: string,
  alpha = 1,
): string | undefined {
  const value = cssVar(name);
  if (value) {
    const canvasHsla = value.split(" ").join(",");
    return `HSLA(${canvasHsla}, ${alpha})`;
  }
};
