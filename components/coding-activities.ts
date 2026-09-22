export type CodingActivity = {
  title: string;
  goal: string;
  requirements: string[];
  hint: string;
  starter: string;
  stdin: string;
  inputLabel?: string;
  test: string;
};

export const codingActivities: Record<string, CodingActivity[]> = {
  variaveis: [
    {
      title: "Ficha de estudante",
      goal: "Crie as variáveis nome, idade e ativa com os valores Ana, 17 e True. Mostre os três valores na mesma linha.",
      requirements: ["Use três tipos de dados: texto, inteiro e booleano.", "Mantenha exatamente os nomes de variáveis pedidos.", "Mostre os valores somente depois das atribuições."],
      hint: "Textos usam aspas. True é escrito sem aspas e com a primeira letra maiúscula.",
      starter: "# Crie nome, idade e ativa\n\n# Mostre os três valores\n",
      stdin: "",
      test: '\nassert nome == "Ana"\nassert idade == 17\nassert ativa is True\nrobo.words.append("__PB_VARIAVEIS_1_OK__")',
    },
    {
      title: "Estoque atualizado",
      goal: "Um estoque começa com 20 unidades e registra uma saída de 6. Crie estoque e saida, atualize estoque e mostre o valor restante.",
      requirements: ["Comece estoque com 20.", "Guarde 6 em saida.", "Atualize a variável estoque em vez de criar outro nome."],
      hint: "A atualização pode usar estoque nos dois lados do sinal de atribuição.",
      starter: "# Guarde os valores iniciais\n\n# Atualize e mostre o estoque\n",
      stdin: "",
      test: '\nassert estoque == 14\nassert saida == 6\nrobo.words.append("__PB_VARIAVEIS_2_OK__")',
    },
    {
      title: "Cópia independente",
      goal: "Guarde azul em original, copie esse valor para copia e depois mude original para verde. Mostre original e copia.",
      requirements: ["Crie original antes de fazer a cópia.", "A variável copia deve receber original.", "Depois da mudança, copia ainda deve conter azul."],
      hint: "Quando copia recebe original, o texto atual é guardado nela. Alterar original depois não muda copia.",
      starter: "# Crie original e copia\n\n# Altere apenas original\n\n# Mostre as duas variáveis\n",
      stdin: "",
      test: '\nassert original == "verde"\nassert copia == "azul"\nrobo.words.append("__PB_VARIAVEIS_3_OK__")',
    },
  ],
  operadores: [
    {
      title: "Total da compra",
      goal: "Um item custa 18 reais e a quantidade é 5. Calcule o total da compra e mostre o resultado.",
      requirements: ["Use as variáveis preco e quantidade.", "Guarde o cálculo em total.", "Use multiplicação."],
      hint: "O total é o preço de uma unidade vezes a quantidade.",
      starter: "preco = 18\nquantidade = 5\n\n# Calcule e mostre total\n",
      stdin: "",
      test: '\nassert total == 90\nrobo.words.append("__PB_OPERADORES_1_OK__")',
    },
    {
      title: "Desconto percentual",
      goal: "Um produto custa 200 reais e tem 10% de desconto. Calcule o valor do desconto e o preço final. Mostre os dois.",
      requirements: ["Use preco e percentual.", "Calcule desconto antes de final.", "O preço final deve ser 180."],
      hint: "Dez por cento pode ser representado por 10 / 100. Depois, subtraia o desconto do preço.",
      starter: "preco = 200\npercentual = 10\n\n# Calcule desconto e final\n\n# Mostre os resultados\n",
      stdin: "",
      test: '\nassert desconto == 20\nassert final == 180\nrobo.words.append("__PB_OPERADORES_2_OK__")',
    },
    {
      title: "Duração de uma atividade",
      goal: "Converta 155 minutos em horas completas e minutos restantes. Mostre primeiro as horas e depois os minutos.",
      requirements: ["Use total_minutos com valor 155.", "Use // para horas.", "Use % para os minutos restantes."],
      hint: "Uma hora possui 60 minutos. A divisão inteira encontra as horas e o resto encontra o que sobrou.",
      starter: "total_minutos = 155\n\n# Calcule horas e minutos\n\n# Mostre os dois valores\n",
      stdin: "",
      test: '\nassert horas == 2\nassert minutos == 35\nrobo.words.append("__PB_OPERADORES_3_OK__")',
    },
  ],
  entradas: [
    {
      title: "Idade no próximo ano",
      goal: "Pergunte o nome e a idade. Converta a idade para inteiro e mostre uma mensagem com a idade que a pessoa terá no próximo ano.",
      requirements: ["Faça duas perguntas na ordem nome e idade.", "Use int() na idade.", "Guarde o resultado em proxima_idade."],
      hint: "input() devolve texto. Converta idade antes de somar 1.",
      starter: "# Pergunte nome e idade\n\n# Converta e calcule proxima_idade\n\n# Mostre nome e proxima_idade\n",
      stdin: "Caio\n18",
      inputLabel: "Nome: Caio · Idade: 18",
      test: '\nassert nome == "Caio"\nassert idade == 18\nassert proxima_idade == 19\nrobo.words.append("__PB_ENTRADAS_1_OK__")',
    },
    {
      title: "Orçamento com bônus",
      goal: "Leia horas, valor por hora e bônus. Converta os dados, calcule horas × valor + bônus e mostre o total.",
      requirements: ["Leia nessa ordem: horas, valor e bônus.", "horas deve ser int; valor e bonus devem ser float.", "Guarde o resultado em total."],
      hint: "Você pode envolver cada input com int() ou float() no momento da leitura.",
      starter: "# Leia horas, valor e bônus\n\n# Calcule total\n\n# Mostre o total\n",
      stdin: "6\n25.50\n20",
      inputLabel: "Horas: 6 · Valor: 25.50 · Bônus: 20",
      test: '\nassert horas == 6\nassert valor == 25.5\nassert bonus == 20.0\nassert total == 173.0\nrobo.words.append("__PB_ENTRADAS_2_OK__")',
    },
    {
      title: "Consumo médio",
      goal: "Leia a distância percorrida e o combustível gasto como números decimais. Calcule km por litro e mostre o consumo.",
      requirements: ["Leia distancia antes de combustivel.", "Converta as duas entradas com float().", "Guarde a divisão em consumo."],
      hint: "Consumo médio é distância dividida pelo combustível utilizado.",
      starter: "# Leia distancia e combustivel\n\n# Calcule consumo\n\n# Mostre o resultado\n",
      stdin: "420\n35",
      inputLabel: "Distância: 420 · Combustível: 35",
      test: '\nassert distancia == 420.0\nassert combustivel == 35.0\nassert consumo == 12.0\nrobo.words.append("__PB_ENTRADAS_3_OK__")',
    },
  ],
  "textos-iniciais": [
    {
      title: "Crachá personalizado",
      goal: "Leia nome e curso. Crie cracha no formato Nome | Curso usando f-string e mostre o resultado.",
      requirements: ["Pergunte nome antes de curso.", "Guarde a mensagem em cracha.", "Use uma f-string com o separador |."],
      hint: "Coloque {nome} e {curso} dentro da mesma f-string, separados por |.",
      starter: "# Leia nome e curso\n\n# Monte cracha com f-string\n\n# Mostre o crachá\n",
      stdin: "Bia\nPython",
      inputLabel: "Nome: Bia · Curso: Python",
      test: '\nassert nome == "Bia"\nassert curso == "Python"\nassert cracha == "Bia | Python"\nrobo.words.append("__PB_TEXTOS_1_OK__")',
    },
    {
      title: "Resumo de uma palavra",
      goal: "Leia uma palavra. Guarde seu tamanho, o primeiro caractere e os três primeiros caracteres. Mostre essas informações.",
      requirements: ["Use len() para tamanho.", "Use o índice 0 para primeiro.", "Use o recorte até a posição 3 para inicio."],
      hint: "Os índices começam em zero. O limite final de um recorte não é incluído.",
      starter: "# Leia palavra\n\n# Calcule tamanho, primeiro e inicio\n\n# Mostre as informações\n",
      stdin: "Python",
      inputLabel: "Palavra: Python",
      test: '\nassert palavra == "Python"\nassert tamanho == 6\nassert primeiro == "P"\nassert inicio == "Pyt"\nrobo.words.append("__PB_TEXTOS_2_OK__")',
    },
    {
      title: "Etiqueta de produto",
      goal: "Leia produto e preço. Converta o preço e crie etiqueta no formato Produto: R$ 0.00, com duas casas decimais.",
      requirements: ["Converta preco com float().", "Guarde a mensagem em etiqueta.", "Use :.2f para as duas casas."],
      hint: "Dentro da f-string, escreva {preco:.2f} para controlar a apresentação do número.",
      starter: "# Leia produto e preco\n\n# Monte etiqueta com duas casas\n\n# Mostre a etiqueta\n",
      stdin: "Mouse\n89.9",
      inputLabel: "Produto: Mouse · Preço: 89.9",
      test: '\nassert produto == "Mouse"\nassert preco == 89.9\nassert etiqueta == "Mouse: R$ 89.90"\nrobo.words.append("__PB_TEXTOS_3_OK__")',
    },
  ],
};
