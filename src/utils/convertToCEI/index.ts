const convertToCEI = (ceiToConvert: string): string => {
  return ceiToConvert.replace(/(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4');
};

export default convertToCEI;
