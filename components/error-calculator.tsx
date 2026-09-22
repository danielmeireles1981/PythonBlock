"use client";
import { useState } from "react";
import { Bug, Check, Play, RotateCcw, Square } from "lucide-react";
import { api, xp } from "./api";
import { usePython } from "./use-python";
const challenges = [
  {
    title: "Operador perdido",
    broken: "12 + * 3",
    answer: "12 + 3",
    expected: "15",
    clue: "Há dois operadores juntos. Mantenha apenas a soma.",
  },
  {
    title: "Divisão inteira separada",
    broken: "18 / / 3",
    answer: "18 // 3",
    expected: "6",
    clue: "A divisão inteira usa duas barras juntas: //.",
  },
  {
    title: "Parêntese aberto",
    broken: "(7 + 5",
    answer: "(7 + 5)",
    expected: "12",
    clue: "Todo parêntese aberto precisa ser fechado.",
  },
  {
    title: "Potência incompleta",
    broken: "2 **",
    answer: "2 ** 4",
    expected: "16",
    clue: "O operador ** precisa de um expoente depois dele. Resultado deve ser 16.",
  },
];
export default function ErrorCalculator({
  notify,
  refresh,
  rewards,
}: {
  notify: (message: string) => void;
  refresh: () => Promise<void>;
  rewards: string[];
}) {
  const [selected, setSelected] = useState(0),
    [expression, setExpression] = useState(challenges[0].broken),
    [results, setResults] = useState<Record<number, string>>({}),
    [feedback, setFeedback] = useState("");
  const python = usePython(),
    current = challenges[selected];
  function choose(index: number) {
    setSelected(index);
    setExpression(challenges[index].broken);
    setFeedback("");
    python.clear();
  }
  function reset() {
    setExpression(current.broken);
    setFeedback("Expressão restaurada. Procure o erro novamente.");
    python.clear();
  }
  async function validate() {
    setFeedback("Executando a expressão corrigida…");
    try {
      if (!/^[\d\s.+*/%()-]+$/.test(expression)) {
        setFeedback(
          "Use somente números, parênteses e operadores nesta atividade.",
        );
        return;
      }
      await python.run("print(" + expression + ")", "");
      const response = await api("lessons/detetive/calculator", {
        challenge: selected + 1,
        expression,
      });
      if (!response.correct) {
        setFeedback(
          response.feedback ||
            "A expressão executou, mas ainda não corrige exatamente o erro apresentado.",
        );
        return;
      }
      setResults((value) => ({ ...value, [selected]: current.expected }));
      setFeedback(
        response.gain
          ? "Correção validada! +" + xp(response.gain) + " XP"
          : "Correção validada novamente. Este desafio já pontuou.",
      );
      await refresh();
    } catch {
      setFeedback(
        "O Python ainda encontrou um erro. Use a pista, ajuste a expressão e tente novamente.",
      );
    }
  }
  return (
    <section className="card error-calculator">
      <div className="row between wrap">
        <div>
          <p className="eyebrow">CAÇA-ERROS · CALCULADORA</p>
          <h2>Conserte as expressões</h2>
          <p className="muted">
            Cada cartão contém um erro real de sintaxe. Corrija, execute e
            valide a resposta.
          </p>
        </div>
        <div className="bug-visual" aria-hidden="true">
          <Bug /> <span>erro</span>
          <b>→</b>
          <Check /> <span>corrigido</span>
        </div>
      </div>
      <div className="error-challenge-tabs">
        {challenges.map((item, index) => (
          <button
            key={item.title}
            aria-pressed={selected === index}
            className={selected === index ? "active" : ""}
            onClick={() => choose(index)}
          >
            <span>
              {rewards.includes("calculator:" + (index + 1)) ? "✓" : "🐞"}
            </span>
            <small>DESAFIO {index + 1}</small>
            <strong>{item.title}</strong>
          </button>
        ))}
      </div>
      <div className="error-calculator-grid">
        <div>
          <div className="broken-expression">
            <span>EXPRESSÃO COM ERRO</span>
            <code>{current.broken}</code>
          </div>
          <label>
            Sua correção
            <input
              aria-label="Expressão corrigida"
              value={expression}
              maxLength={160}
              onChange={(event) => {
                setExpression(event.target.value);
                setFeedback("");
              }}
            />
          </label>
          <div className="row wrap">
            <button
              className="primary"
              disabled={python.running}
              onClick={validate}
            >
              <Play size={15} />
              {python.running ? "Verificando…" : "Executar e validar"}
            </button>
            {python.running && (
              <button onClick={python.stop}>
                <Square size={15} /> Parar
              </button>
            )}
            <button disabled={python.running} onClick={reset}>
              <RotateCcw size={15} /> Restaurar erro
            </button>
          </div>
        </div>
        <div>
          <div className="clue-card">
            <strong>💡 Pista</strong>
            <p>{current.clue}</p>
          </div>
          <h3>Resultado esperado</h3>
          <div className="expected-result">{results[selected] ?? "?"}</div>
          <h3>Saída do Python</h3>
          <pre className="code-output" aria-live="polite">
            {python.output || "Corrija e execute para ver o resultado."}
          </pre>
        </div>
      </div>
      <p
        className={
          feedback.includes("validada")
            ? "success error-feedback"
            : "error-feedback"
        }
        role="status"
      >
        {feedback || "Escolha um desafio e investigue a expressão."}
      </p>
      <p className="tiny">
        Cada correção vale 10 XP uma única vez. A resposta é conferida pelo
        servidor depois que o Python executa.
      </p>
    </section>
  );
}
