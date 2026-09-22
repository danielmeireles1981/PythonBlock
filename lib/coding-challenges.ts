import "server-only";

type CodingChallenge = { token: string; solution: string };
export const codingChallenges: Record<string, CodingChallenge[]> = {
  variaveis: [
    { token: "__PB_VARIAVEIS_1_OK__", solution: 'nome = "Ana"\nidade = 17\nativa = True\nprint(nome, idade, ativa)' },
    { token: "__PB_VARIAVEIS_2_OK__", solution: "estoque = 20\nsaida = 6\nestoque = estoque - saida\nprint(estoque)" },
    { token: "__PB_VARIAVEIS_3_OK__", solution: 'original = "azul"\ncopia = original\noriginal = "verde"\nprint(original, copia)' },
  ],
  operadores: [
    { token: "__PB_OPERADORES_1_OK__", solution: "preco = 18\nquantidade = 5\ntotal = preco * quantidade\nprint(total)" },
    { token: "__PB_OPERADORES_2_OK__", solution: "preco = 200\npercentual = 10\ndesconto = preco * percentual / 100\nfinal = preco - desconto\nprint(desconto, final)" },
    { token: "__PB_OPERADORES_3_OK__", solution: "total_minutos = 155\nhoras = total_minutos // 60\nminutos = total_minutos % 60\nprint(horas, minutos)" },
  ],
  entradas: [
    { token: "__PB_ENTRADAS_1_OK__", solution: 'nome = input("Nome: ")\nidade = int(input("Idade: "))\nproxima_idade = idade + 1\nprint(nome, proxima_idade)' },
    { token: "__PB_ENTRADAS_2_OK__", solution: 'horas = int(input("Horas: "))\nvalor = float(input("Valor: "))\nbonus = float(input("Bônus: "))\ntotal = horas * valor + bonus\nprint(total)' },
    { token: "__PB_ENTRADAS_3_OK__", solution: 'distancia = float(input("Distância: "))\ncombustivel = float(input("Combustível: "))\nconsumo = distancia / combustivel\nprint(consumo)' },
  ],
  "textos-iniciais": [
    { token: "__PB_TEXTOS_1_OK__", solution: 'nome = input("Nome: ")\ncurso = input("Curso: ")\ncracha = f"{nome} | {curso}"\nprint(cracha)' },
    { token: "__PB_TEXTOS_2_OK__", solution: 'palavra = input("Palavra: ")\ntamanho = len(palavra)\nprimeiro = palavra[0]\ninicio = palavra[:3]\nprint(tamanho, primeiro, inicio)' },
    { token: "__PB_TEXTOS_3_OK__", solution: 'produto = input("Produto: ")\npreco = float(input("Preço: "))\netiqueta = f"{produto}: R$ {preco:.2f}"\nprint(etiqueta)' },
  ],
};
