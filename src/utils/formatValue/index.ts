const formatValue = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

export default formatValue;
