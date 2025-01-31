export function toPercentageFormat(num: number) {
  const formatter = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 2,
  });

  return `${formatter.format(num)}%`;
}
