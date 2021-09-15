const isCEI = (cei: string): boolean => {
  // Retira qualquer tipo de mascara e deixa apenas números.
  cei.replace(/[^\d]+/g, '');

  if (cei === '') {
    return false;
  }

  if (cei.length !== 12) {
    return false;
  }

  const peso = '74185216374';
  let soma = 0;

  // Faz um for para multiplicar os números do CEI digitado pelos números do peso.
  // E somar o total de cada número multiplicado.
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < 12; i++) {
    const fator = peso.substring(i - 1, i);
    const valor = cei.substring(i - 1, i);
    soma += Number(fator) * Number(valor);
  }

  // Pega o length do resultado da soma e desconta 2 para pegar somente a dezena.
  const len = soma.toString().length - 2;

  // pega a dezena
  const dezena = soma.toString().substring(len);

  // pega o algarismo da dezena
  const algdezena = dezena.toString().substring(0, 1);

  // pega o algarismo da unidade
  // eslint-disable-next-line radix
  const unidade = parseInt(String(soma)) - parseInt(String(soma / 10)) * 10;

  // soma o algarismo da dezena com o algarismo da unidade.
  // eslint-disable-next-line radix
  soma = parseInt(algdezena) + unidade;

  // pega o dígito (último número) do cei digitado
  const digitoCEI = cei.substring(11);
  const digitoEncontrado = 10 - soma;

  if (
    Number(digitoCEI) === digitoEncontrado ||
    Number(digitoCEI) === digitoEncontrado * -1
  ) {
    return true;
  }
  return false;
};

export default isCEI;
