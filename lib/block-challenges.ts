import "server-only";

type BlockChallenge = { order: string[]; solution: string };

export const blockChallenges: Record<string, BlockChallenge[]> = {
  variaveis: [
    { order: ["name", "age", "active", "show"], solution: 'nome = "Luna"\nidade = 16\nativa = True\nprint(nome, idade, ativa)' },
    { order: ["price", "quantity", "available", "types"], solution: "preco = 12.5\nquantidade = 4\ndisponivel = True\nprint(type(preco), type(quantidade), type(disponivel))" },
    { order: ["points", "bonus", "update", "show"], solution: "pontos = 10\nbonus = 5\npontos = pontos + bonus\nprint(pontos)" },
    { order: ["a", "b", "support", "a-from-b", "b-from-support", "show"], solution: 'caixa_a = "azul"\ncaixa_b = "verde"\napoio = caixa_a\ncaixa_a = caixa_b\ncaixa_b = apoio\nprint(caixa_a, caixa_b)' },
    { order: ["original", "copy", "change", "show-copy"], solution: 'original = "azul"\ncopia = original\noriginal = "verde"\nprint(original, copia)' },
  ],
  operadores: [
    { order: ["price", "quantity", "total", "show"], solution: "preco = 25\nquantidade = 4\ntotal = preco * quantidade\nprint(total)" },
    { order: ["price", "discount", "final", "show"], solution: "preco = 80\ndesconto = 15\nfinal = preco - desconto\nprint(final)" },
    { order: ["students", "size", "groups", "remainder", "show"], solution: "estudantes = 23\ntamanho = 5\ngrupos = estudantes // tamanho\nsobra = estudantes % tamanho\nprint(grupos, sobra)" },
    { order: ["first", "second", "average", "show"], solution: "nota_1 = 7\nnota_2 = 9\nmedia = (nota_1 + nota_2) / 2\nprint(media)" },
    { order: ["side", "area", "perimeter", "show-square"], solution: "lado = 4\narea = lado ** 2\nperimetro = lado * 4\nprint(area, perimetro)" },
  ],
  entradas: [
    { order: ["name", "age", "convert", "show"], solution: 'nome = input("Nome: ")\nidade = input("Idade: ")\nidade = int(idade)\nprint(nome, idade + 1)' },
    { order: ["product", "quantity", "price", "total", "show"], solution: 'produto = input("Produto: ")\nquantidade = int(input("Quantidade: "))\npreco = float(input("Preço: "))\ntotal = quantidade * preco\nprint(produto, total)' },
    { order: ["celsius", "formula", "show"], solution: 'celsius = float(input("Celsius: "))\nfahrenheit = celsius * 9 / 5 + 32\nprint(fahrenheit)' },
    { order: ["minutes", "hours", "remaining", "show"], solution: 'minutos = int(input("Minutos: "))\nhoras = minutos // 60\nrestantes = minutos % 60\nprint(horas, restantes)' },
    { order: ["distance", "fuel", "consumption", "show-consumption"], solution: 'distancia = float(input("Distância: "))\ncombustivel = float(input("Combustível: "))\nconsumo = distancia / combustivel\nprint(consumo)' },
  ],
  "textos-iniciais": [
    { order: ["name", "message", "show"], solution: 'nome = "Luna"\nmensagem = f"Olá, {nome}!"\nprint(mensagem)' },
    { order: ["name", "role", "badge", "show"], solution: 'nome = input("Nome: ")\ncargo = input("Cargo: ")\ncracha = f"{nome} | {cargo}"\nprint(cracha)' },
    { order: ["word", "length", "slice", "show"], solution: 'palavra = input("Palavra: ")\ntamanho = len(palavra)\ninicio = palavra[:3]\nprint(tamanho, inicio)' },
    { order: ["product", "price", "label", "show"], solution: 'produto = "Teclado"\npreco = 149.9\netiqueta = f"{produto}: R$ {preco:.2f}"\nprint(etiqueta)' },
    { order: ["first-name", "last-name", "initials", "show-initials"], solution: 'nome = input("Nome: ")\nsobrenome = input("Sobrenome: ")\niniciais = nome[0] + sobrenome[0]\nprint(iniciais)' },
  ],
};
