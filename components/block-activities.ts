export type BlockKind = "value" | "input" | "math" | "text" | "say" | "convert";
export type LearningBlock = { id: string; label: string; code: string; kind: BlockKind };
export type BlockActivity = {
  title: string;
  goal: string;
  steps: string[];
  hint: string;
  blocks: LearningBlock[];
  required: number;
  stdin: string;
  inputLabel?: string;
  memory: [string, string][];
};

const block = (id: string, label: string, code: string, kind: BlockKind): LearningBlock => ({ id, label, code, kind });

export const blockActivities: Record<string, BlockActivity[]> = {
  variaveis: [
    {
      title: "Crie uma ficha simples",
      goal: "Monte um programa que guarde o nome Luna, a idade 16 e a informação de que a estudante está ativa. Ao final, mostre os três valores.",
      steps: ["Escolha quatro blocos.", "Guarde os três valores antes de tentar mostrá-los.", "Execute e confira as caixas da memória."],
      hint: "Uma variável precisa existir antes de aparecer em print(). Comece pelos três blocos que guardam valores.",
      required: 4, stdin: "", memory: [["nome", '"Luna"'], ["idade", "16"], ["ativa", "True"]],
      blocks: [
        block("show", "Mostrar a ficha", "print(nome, idade, ativa)", "say"),
        block("age", "Guardar 16 em idade", "idade = 16", "value"),
        block("name", "Guardar Luna em nome", 'nome = "Luna"', "value"),
        block("active", "Guardar verdadeiro em ativa", "ativa = True", "value"),
        block("wrong-active", "Guardar texto em ativa", 'ativa = "True"', "text"),
        block("early-show", "Mostrar somente o nome", "print(nome)", "say"),
      ],
    },
    {
      title: "Reconheça os tipos",
      goal: "Guarde o preço 12.5, a quantidade 4 e a disponibilidade verdadeira. Depois, mostre o tipo de cada variável.",
      steps: ["Escolha quatro blocos.", "Identifique decimal, inteiro e booleano.", "Consulte os três tipos somente depois de guardar os valores."],
      hint: "Valores decimais usam ponto. True sem aspas é booleano; entre aspas seria texto.",
      required: 4, stdin: "", memory: [["preco", "12.5 (float)"], ["quantidade", "4 (int)"], ["disponivel", "True (bool)"]],
      blocks: [
        block("price", "Guardar preço decimal", "preco = 12.5", "value"),
        block("quantity", "Guardar quantidade inteira", "quantidade = 4", "value"),
        block("available", "Guardar disponibilidade", "disponivel = True", "value"),
        block("types", "Mostrar os três tipos", "print(type(preco), type(quantidade), type(disponivel))", "say"),
        block("comma-price", "Usar vírgula no preço", "preco = 12,5", "value"),
        block("text-quantity", "Guardar quantidade como texto", 'quantidade = "4"', "text"),
      ],
    },
    {
      title: "Atualize uma pontuação",
      goal: "A pontuação começa em 10 e recebe um bônus de 5. Atualize a própria variável pontos e mostre o valor final.",
      steps: ["Escolha quatro blocos.", "Crie pontos e bonus.", "Use o valor anterior de pontos na atualização."],
      hint: "Na atualização, pontos aparece nos dois lados de =. O lado direito é calculado primeiro.",
      required: 4, stdin: "", memory: [["pontos", "15"], ["bonus", "5"]],
      blocks: [
        block("points", "Iniciar pontos", "pontos = 10", "value"),
        block("bonus", "Guardar bônus", "bonus = 5", "value"),
        block("update", "Somar o bônus aos pontos", "pontos = pontos + bonus", "math"),
        block("show", "Mostrar a pontuação", "print(pontos)", "say"),
        block("replace", "Substituir pontos pelo bônus", "pontos = bonus", "math"),
        block("subtract", "Diminuir o bônus", "pontos = pontos - bonus", "math"),
      ],
    },
    {
      title: "Troque o conteúdo das caixas",
      goal: "Comece com caixa_a contendo azul e caixa_b contendo verde. Use a variável apoio para trocar os conteúdos e mostre o resultado.",
      steps: ["Escolha seis blocos.", "Guarde temporariamente o conteúdo de caixa_a.", "Faça a troca antes de mostrar as caixas."],
      hint: "Depois de apoio receber caixa_a, caixa_a pode receber caixa_b sem perder o valor azul.",
      required: 6, stdin: "", memory: [["caixa_a", '"verde"'], ["caixa_b", '"azul"'], ["apoio", '"azul"']],
      blocks: [
        block("a", "Guardar azul na caixa A", 'caixa_a = "azul"', "value"),
        block("b", "Guardar verde na caixa B", 'caixa_b = "verde"', "value"),
        block("support", "Guardar caixa A no apoio", "apoio = caixa_a", "value"),
        block("a-from-b", "Levar caixa B para A", "caixa_a = caixa_b", "value"),
        block("b-from-support", "Levar apoio para B", "caixa_b = apoio", "value"),
        block("show", "Mostrar as duas caixas", "print(caixa_a, caixa_b)", "say"),
        block("b-from-a", "Copiar caixa A para B", "caixa_b = caixa_a", "value"),
        block("clear", "Esvaziar o apoio", 'apoio = ""', "text"),
      ],
    },
    {
      title: "Preserve uma cópia",
      goal: "Guarde azul em original, copie o valor para copia, mude somente original para verde e mostre as duas variáveis.",
      steps: ["Escolha quatro blocos.", "Faça a cópia antes da alteração.", "Mostre original e copia no final."],
      hint: "copia deve receber original enquanto ela ainda contém azul.",
      required: 4, stdin: "", memory: [["original", '"verde"'], ["copia", '"azul"']],
      blocks: [block("original", "Guardar azul em original", 'original = "azul"', "value"), block("copy", "Copiar o valor de original", "copia = original", "value"), block("change", "Mudar original para verde", 'original = "verde"', "value"), block("show-copy", "Mostrar original e cópia", "print(original, copia)", "say"), block("late-copy", "Copiar depois da mudança", "copia = original", "value"), block("change-copy", "Mudar também a cópia", 'copia = "verde"', "value")],
    },
  ],
  operadores: [
    {
      title: "Calcule uma compra",
      goal: "Cada caderno custa 25 reais. Calcule o valor de 4 cadernos e mostre o total.",
      steps: ["Escolha quatro blocos.", "Guarde preço e quantidade.", "Calcule antes de mostrar."],
      hint: "O total é o preço de uma unidade multiplicado pela quantidade.",
      required: 4, stdin: "", memory: [["preco", "25"], ["quantidade", "4"], ["total", "100"]],
      blocks: [
        block("total", "Multiplicar preço e quantidade", "total = preco * quantidade", "math"),
        block("show", "Mostrar o total", "print(total)", "say"),
        block("quantity", "Guardar 4 em quantidade", "quantidade = 4", "value"),
        block("price", "Guardar 25 em preço", "preco = 25", "value"),
        block("add", "Somar preço e quantidade", "total = preco + quantidade", "math"),
        block("reverse", "Dividir quantidade pelo preço", "total = quantidade / preco", "math"),
      ],
    },
    {
      title: "Aplique um desconto",
      goal: "Um produto custa 80 reais e recebe 15 reais de desconto. Calcule e mostre o preço final.",
      steps: ["Escolha quatro blocos.", "Guarde os dois valores.", "Retire o desconto do preço."],
      hint: "Desconto reduz o preço. Observe a ordem dos valores na subtração.",
      required: 4, stdin: "", memory: [["preco", "80"], ["desconto", "15"], ["final", "65"]],
      blocks: [
        block("price", "Guardar o preço", "preco = 80", "value"),
        block("discount", "Guardar o desconto", "desconto = 15", "value"),
        block("final", "Calcular o preço final", "final = preco - desconto", "math"),
        block("show", "Mostrar o preço final", "print(final)", "say"),
        block("add", "Acrescentar o desconto", "final = preco + desconto", "math"),
        block("reverse", "Inverter a subtração", "final = desconto - preco", "math"),
      ],
    },
    {
      title: "Forme grupos completos",
      goal: "Distribua 23 estudantes em grupos de 5. Mostre quantos grupos completos podem ser formados e quantos estudantes sobram.",
      steps: ["Escolha cinco blocos.", "Use divisão inteira para os grupos.", "Use o resto para descobrir quantos sobram."],
      hint: "// encontra o quociente inteiro e % encontra o resto da mesma divisão.",
      required: 5, stdin: "", memory: [["estudantes", "23"], ["tamanho", "5"], ["grupos", "4"], ["sobra", "3"]],
      blocks: [
        block("students", "Guardar total de estudantes", "estudantes = 23", "value"),
        block("size", "Guardar tamanho do grupo", "tamanho = 5", "value"),
        block("groups", "Calcular grupos completos", "grupos = estudantes // tamanho", "math"),
        block("remainder", "Calcular quem sobra", "sobra = estudantes % tamanho", "math"),
        block("show", "Mostrar grupos e sobra", "print(grupos, sobra)", "say"),
        block("decimal", "Fazer divisão decimal", "grupos = estudantes / tamanho", "math"),
        block("multiply", "Multiplicar os valores", "sobra = estudantes * tamanho", "math"),
      ],
    },
    {
      title: "Calcule a média",
      goal: "As notas são 7 e 9. Calcule a média aritmética das duas e mostre o resultado.",
      steps: ["Escolha quatro blocos.", "Guarde as duas notas.", "Use parênteses para somar antes de dividir."],
      hint: "A média é a soma dos dois valores dividida por 2. Os parênteses garantem essa ordem.",
      required: 4, stdin: "", memory: [["nota_1", "7"], ["nota_2", "9"], ["media", "8.0"]],
      blocks: [
        block("first", "Guardar a primeira nota", "nota_1 = 7", "value"),
        block("second", "Guardar a segunda nota", "nota_2 = 9", "value"),
        block("average", "Calcular a média", "media = (nota_1 + nota_2) / 2", "math"),
        block("show", "Mostrar a média", "print(media)", "say"),
        block("no-parens", "Calcular sem parênteses", "media = nota_1 + nota_2 / 2", "math"),
        block("difference", "Calcular a diferença", "media = (nota_1 - nota_2) / 2", "math"),
      ],
    },
    {
      title: "Área e perímetro",
      goal: "Um quadrado tem lado 4. Calcule sua área com potência, calcule o perímetro e mostre os dois resultados.",
      steps: ["Escolha quatro blocos.", "Use ** 2 para a área.", "Multiplique o lado por 4 para o perímetro."],
      hint: "A área usa lado ao quadrado; o perímetro soma os quatro lados iguais.",
      required: 4, stdin: "", memory: [["lado", "4"], ["area", "16"], ["perimetro", "16"]],
      blocks: [block("side", "Guardar o lado", "lado = 4", "value"), block("area", "Calcular a área", "area = lado ** 2", "math"), block("perimeter", "Calcular o perímetro", "perimetro = lado * 4", "math"), block("show-square", "Mostrar área e perímetro", "print(area, perimetro)", "say"), block("area-double", "Dobrar o lado para a área", "area = lado * 2", "math"), block("perimeter-square", "Elevar para o perímetro", "perimetro = lado ** 4", "math")],
    },
  ],
  entradas: [
    {
      title: "Calcule a idade no próximo ano",
      goal: "Pergunte o nome e a idade. Converta a idade para inteiro e mostre o nome acompanhado da idade que a pessoa terá no próximo ano.",
      steps: ["Escolha quatro blocos.", "As respostas chegam na ordem das perguntas.", "Converta a idade antes de somar 1."],
      hint: "input() devolve texto. Use int() na idade antes de fazer a soma.",
      required: 4, stdin: "Luna\n16", inputLabel: "Nome: Luna · Idade: 16", memory: [["nome", '"Luna"'], ["idade", "16 (int)"]],
      blocks: [
        block("name", "Perguntar o nome", 'nome = input("Nome: ")', "input"),
        block("age", "Perguntar a idade", 'idade = input("Idade: ")', "input"),
        block("convert", "Converter idade para inteiro", "idade = int(idade)", "convert"),
        block("show", "Mostrar nome e próxima idade", "print(nome, idade + 1)", "say"),
        block("float", "Converter idade para decimal", "idade = float(idade)", "convert"),
        block("join", "Juntar idade com texto 1", 'print(nome, idade + "1")', "text"),
      ],
    },
    {
      title: "Monte um orçamento",
      goal: "Pergunte o produto, a quantidade e o preço unitário. Converta os números, calcule e mostre o valor total.",
      steps: ["Escolha cinco blocos.", "Use int para quantidade e float para preço.", "Multiplique somente depois das conversões."],
      hint: "Produto permanece texto. Quantidade é inteira; preço pode ter casas decimais.",
      required: 5, stdin: "Caderno\n3\n12.50", inputLabel: "Produto: Caderno · Quantidade: 3 · Preço: 12.50", memory: [["produto", '"Caderno"'], ["quantidade", "3"], ["preco", "12.5"], ["total", "37.5"]],
      blocks: [
        block("product", "Perguntar o produto", 'produto = input("Produto: ")', "input"),
        block("quantity", "Ler quantidade como inteiro", 'quantidade = int(input("Quantidade: "))', "convert"),
        block("price", "Ler preço como decimal", 'preco = float(input("Preço: "))', "convert"),
        block("total", "Calcular o total", "total = quantidade * preco", "math"),
        block("show", "Mostrar produto e total", "print(produto, total)", "say"),
        block("text-quantity", "Ler quantidade como texto", 'quantidade = input("Quantidade: ")', "input"),
        block("sum", "Somar quantidade e preço", "total = quantidade + preco", "math"),
      ],
    },
    {
      title: "Converta uma temperatura",
      goal: "Leia uma temperatura em Celsius, converta para Fahrenheit pela fórmula C × 9 ÷ 5 + 32 e mostre o resultado.",
      steps: ["Escolha três blocos.", "Converta a entrada para decimal.", "Aplique a fórmula completa antes de mostrar."],
      hint: "Você pode converter no mesmo bloco que chama input(). Multiplicação e divisão acontecem antes da soma.",
      required: 3, stdin: "20", inputLabel: "Temperatura em Celsius: 20", memory: [["celsius", "20.0"], ["fahrenheit", "68.0"]],
      blocks: [
        block("celsius", "Ler Celsius como decimal", 'celsius = float(input("Celsius: "))', "convert"),
        block("formula", "Converter para Fahrenheit", "fahrenheit = celsius * 9 / 5 + 32", "math"),
        block("show", "Mostrar Fahrenheit", "print(fahrenheit)", "say"),
        block("missing", "Somar apenas 32", "fahrenheit = celsius + 32", "math"),
        block("reverse", "Usar a fórmula inversa", "fahrenheit = (celsius - 32) * 5 / 9", "math"),
      ],
    },
    {
      title: "Separe horas e minutos",
      goal: "Leia um total de 135 minutos. Calcule quantas horas completas existem e quantos minutos restam. Mostre os dois valores.",
      steps: ["Escolha quatro blocos.", "Converta a entrada para inteiro.", "Use 60 na divisão inteira e no resto."],
      hint: "Horas completas usam //. Os minutos que não completam outra hora usam %.",
      required: 4, stdin: "135", inputLabel: "Total de minutos: 135", memory: [["minutos", "135"], ["horas", "2"], ["restantes", "15"]],
      blocks: [
        block("minutes", "Ler minutos como inteiro", 'minutos = int(input("Minutos: "))', "convert"),
        block("hours", "Calcular horas completas", "horas = minutos // 60", "math"),
        block("remaining", "Calcular minutos restantes", "restantes = minutos % 60", "math"),
        block("show", "Mostrar horas e minutos", "print(horas, restantes)", "say"),
        block("decimal", "Calcular horas decimais", "horas = minutos / 60", "math"),
        block("subtract", "Subtrair 60 uma vez", "restantes = minutos - 60", "math"),
      ],
    },
    {
      title: "Calcule o consumo",
      goal: "Leia distância 420 e combustível 35 como decimais. Calcule quantos quilômetros foram percorridos por litro e mostre o resultado.",
      steps: ["Escolha quatro blocos.", "Leia distância antes de combustível.", "Divida distância por combustível."],
      hint: "Os dois valores podem ter casas decimais, por isso use float() nas entradas.",
      required: 4, stdin: "420\n35", inputLabel: "Distância: 420 · Combustível: 35", memory: [["distancia", "420.0"], ["combustivel", "35.0"], ["consumo", "12.0"]],
      blocks: [block("distance", "Ler distância como decimal", 'distancia = float(input("Distância: "))', "convert"), block("fuel", "Ler combustível como decimal", 'combustivel = float(input("Combustível: "))', "convert"), block("consumption", "Calcular quilômetros por litro", "consumo = distancia / combustivel", "math"), block("show-consumption", "Mostrar o consumo", "print(consumo)", "say"), block("reverse-consumption", "Inverter a divisão", "consumo = combustivel / distancia", "math"), block("integer-distance", "Ler distância como inteiro", 'distancia = int(input("Distância: "))', "convert")],
    },
  ],
  "textos-iniciais": [
    {
      title: "Crie uma saudação",
      goal: "Guarde o nome Luna, crie uma mensagem com f-string e mostre exatamente: Olá, Luna!",
      steps: ["Escolha três blocos.", "Guarde o nome primeiro.", "Monte a mensagem antes de mostrá-la."],
      hint: "Dentro da f-string, {nome} será substituído pelo conteúdo da variável.",
      required: 3, stdin: "", memory: [["nome", '"Luna"'], ["mensagem", '"Olá, Luna!"']],
      blocks: [
        block("show", "Mostrar a mensagem", "print(mensagem)", "say"),
        block("message", "Criar a saudação", 'mensagem = f"Olá, {nome}!"', "text"),
        block("name", "Guardar Luna em nome", 'nome = "Luna"', "value"),
        block("literal", "Mostrar chaves como texto", 'mensagem = "Olá, {nome}!"', "text"),
        block("early", "Mostrar antes de criar", "print(mensagem)", "say"),
      ],
    },
    {
      title: "Monte um crachá",
      goal: "Pergunte o nome e o cargo. Crie uma única linha no formato Nome | Cargo e mostre o crachá.",
      steps: ["Escolha quatro blocos.", "Leia as duas respostas.", "Use uma f-string no formato pedido."],
      hint: "O caractere | pode ficar entre {nome} e {cargo} dentro da f-string.",
      required: 4, stdin: "Marina\nDesenvolvedora", inputLabel: "Nome: Marina · Cargo: Desenvolvedora", memory: [["nome", '"Marina"'], ["cargo", '"Desenvolvedora"'], ["cracha", '"Marina | Desenvolvedora"']],
      blocks: [
        block("name", "Perguntar o nome", 'nome = input("Nome: ")', "input"),
        block("role", "Perguntar o cargo", 'cargo = input("Cargo: ")', "input"),
        block("badge", "Montar o crachá", 'cracha = f"{nome} | {cargo}"', "text"),
        block("show", "Mostrar o crachá", "print(cracha)", "say"),
        block("comma", "Guardar nome e cargo separados", "cracha = nome, cargo", "text"),
        block("literal", "Usar nomes sem chaves", 'cracha = "nome | cargo"', "text"),
      ],
    },
    {
      title: "Investigue uma palavra",
      goal: "Leia uma palavra, descubra quantos caracteres ela possui, separe seus três primeiros caracteres e mostre as duas informações.",
      steps: ["Escolha quatro blocos.", "Leia a palavra antes de usar len().", "O recorte deve parar antes do índice 3."],
      hint: "len(palavra) conta os caracteres. palavra[:3] pega as posições 0, 1 e 2.",
      required: 4, stdin: "Python", inputLabel: "Palavra: Python", memory: [["palavra", '"Python"'], ["tamanho", "6"], ["inicio", '"Pyt"']],
      blocks: [
        block("word", "Perguntar a palavra", 'palavra = input("Palavra: ")', "input"),
        block("length", "Contar caracteres", "tamanho = len(palavra)", "text"),
        block("slice", "Separar os três primeiros", "inicio = palavra[:3]", "text"),
        block("show", "Mostrar tamanho e início", "print(tamanho, inicio)", "say"),
        block("index", "Pegar apenas o índice 3", "inicio = palavra[3]", "text"),
        block("four", "Separar quatro caracteres", "inicio = palavra[:4]", "text"),
      ],
    },
    {
      title: "Formate um preço",
      goal: "Guarde o produto Teclado e o preço 149.9. Crie e mostre a mensagem Teclado: R$ 149.90, com duas casas decimais.",
      steps: ["Escolha quatro blocos.", "Preço deve ser um número decimal.", "Use :.2f dentro da f-string."],
      hint: "A formatação {preco:.2f} mantém duas casas depois do ponto na mensagem.",
      required: 4, stdin: "", memory: [["produto", '"Teclado"'], ["preco", "149.9"], ["etiqueta", '"Teclado: R$ 149.90"']],
      blocks: [
        block("product", "Guardar o produto", 'produto = "Teclado"', "value"),
        block("price", "Guardar o preço", "preco = 149.9", "value"),
        block("label", "Formatar a etiqueta", 'etiqueta = f"{produto}: R$ {preco:.2f}"', "text"),
        block("show", "Mostrar a etiqueta", "print(etiqueta)", "say"),
        block("no-format", "Usar o preço sem formatação", 'etiqueta = f"{produto}: R$ {preco}"', "text"),
        block("text-price", "Guardar o preço como texto", 'preco = "149.9"', "text"),
      ],
    },
    {
      title: "Crie iniciais",
      goal: "Leia nome Bia e sobrenome Lima. Junte o primeiro caractere de cada texto e mostre as iniciais BL.",
      steps: ["Escolha quatro blocos.", "Leia nome e sobrenome.", "Use o índice zero nos dois textos."],
      hint: "O operador + também junta textos. Use nome[0] e sobrenome[0].",
      required: 4, stdin: "Bia\nLima", inputLabel: "Nome: Bia · Sobrenome: Lima", memory: [["nome", '"Bia"'], ["sobrenome", '"Lima"'], ["iniciais", '"BL"']],
      blocks: [block("first-name", "Perguntar o nome", 'nome = input("Nome: ")', "input"), block("last-name", "Perguntar o sobrenome", 'sobrenome = input("Sobrenome: ")', "input"), block("initials", "Juntar as iniciais", "iniciais = nome[0] + sobrenome[0]", "text"), block("show-initials", "Mostrar as iniciais", "print(iniciais)", "say"), block("second-letters", "Usar os segundos caracteres", "iniciais = nome[1] + sobrenome[1]", "text"), block("full-names", "Juntar os nomes completos", "iniciais = nome + sobrenome", "text")],
    },
  ],
};

export const blockKindLabels: Record<BlockKind, string> = {
  value: "Variável", input: "Entrada", math: "Operação", text: "Texto", say: "Saída", convert: "Conversão",
};
