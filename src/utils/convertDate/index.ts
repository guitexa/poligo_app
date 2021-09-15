const convertDate = (dateToConvert: string): string => {
  const day = dateToConvert.split('/')[0];
  const month = dateToConvert.split('/')[1];
  const year = dateToConvert.split('/')[2];

  return `${year}-${`0${month}`.slice(-2)}-${`0${day}`.slice(-2)}`;
};

export default convertDate;
