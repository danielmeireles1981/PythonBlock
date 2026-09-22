"use client";

import { useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, Check, GripVertical, Lightbulb, Play, Plus, RotateCcw, X } from "lucide-react";
import type { User } from "@/lib/auth";
import { api, xp } from "./api";
import { blockActivities, blockKindLabels } from "./block-activities";
import { usePython } from "./use-python";

const rewardKey = (lessonId: string, exercise: number) => `blocks:${lessonId}:${exercise}`;

export default function CodeBlocks({ lessonId, data, user, notify, refresh, onUse }: {
  lessonId: string;
  data: any;
  user: User;
  notify: (message: string) => void;
  refresh: () => Promise<void>;
  onUse: (code: string, stdin: string) => void;
}) {
  const lessonActivities = blockActivities[lessonId];
  const [exercise, setExercise] = useState(1);
  const [orders, setOrders] = useState<Record<number, string[]>>({});
  const [feedback, setFeedback] = useState("Escolha os blocos que resolvem o desafio. Alguns blocos não serão usados.");
  const [hint, setHint] = useState(false);
  const [solution, setSolution] = useState("");
  const [rewards, setRewards] = useState<string[]>(data.rewards);
  const [hints, setHints] = useState<string[]>(data.hints);
  const [checked, setChecked] = useState("");
  const [success, setSuccess] = useState(false);
  const [over, setOver] = useState<number | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const python = usePython();
  if (!lessonActivities) return null;

  const activity = lessonActivities[exercise - 1];
  const order = orders[exercise] || [];
  const code = order.map((id) => activity.blocks.find((item) => item.id === id)!.code).join("\n");
  const current = checked === code && checked !== "";
  const key = rewardKey(lessonId, exercise);

  function updateOrder(next: string[], message: string) {
    setOrders((previous) => ({ ...previous, [exercise]: next }));
    setFeedback(message);
    setChecked("");
    setSuccess(false);
    setConfirm(false);
  }

  function insert(id: string, index: number) {
    if (python.running || busy || !activity.blocks.some((item) => item.id === id)) return;
    const old = order.indexOf(id);
    const next = order.filter((item) => item !== id);
    if (old < 0 && next.length >= activity.required) {
      setFeedback(`Este desafio usa ${activity.required} blocos. Remova um bloco antes de escolher outro.`);
      return;
    }
    next.splice(old >= 0 && old < index ? index - 1 : index, 0, id);
    updateOrder(next, "Sequência atualizada. Execute quando estiver pronta.");
  }

  function drop(event: DragEvent, index: number) {
    event.preventDefault();
    setOver(null);
    insert(event.dataTransfer.getData("text/plain"), index);
  }

  function move(index: number, delta: number) {
    const next = [...order];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    updateOrder(next, "Bloco movido. Execute novamente para conferir a ordem.");
  }

  function chooseExercise(next: number) {
    if (python.running || busy) return;
    setExercise(next);
    setHint(false);
    setSolution("");
    setChecked("");
    setSuccess(false);
    setConfirm(false);
    python.clear();
    setFeedback("Novo desafio selecionado. Leia o objetivo e escolha apenas os blocos necessários.");
  }

  async function run() {
    setChecked("");
    setSuccess(false);
    setConfirm(false);
    setFeedback("Executando sua sequência no Python…");
    try {
      await python.run(code, activity.stdin);
      setBusy(true);
      const result = await api(`lessons/${lessonId}/blocks`, { exercise, order });
      setChecked(code);
      setSuccess(result.correct);
      setFeedback(result.correct
        ? result.gain ? `Desafio concluído! +${xp(result.gain)} XP.` : "Sequência correta! Este desafio já havia pontuado."
        : result.feedback);
      if (result.correct) {
        setRewards((previous) => previous.includes(key) ? previous : [...previous, key]);
        await refresh();
      }
    } catch {
      setChecked(code);
      setFeedback("O Python encontrou um problema. Leia a saída, confira os blocos escolhidos e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  const completed = lessonActivities.filter((_, index) => rewards.includes(rewardKey(lessonId, index + 1))).length;

  return <section className="block-studio" aria-label="Oficina de blocos">
    <div className="studio-heading"><div><p className="eyebrow">OFICINA DE BLOCOS · {completed}/{lessonActivities.length} DESAFIOS CONCLUÍDOS</p><h2>Pratique antes do laboratório</h2><p>Escolha um desafio, monte o código e execute. Cada acerto vale 25 XP na primeira conclusão.</p></div><span className="studio-badge">🧩 Escolha → ordene → execute</span></div>

    <div className="block-challenge-tabs" aria-label="Desafios de montagem">
      {lessonActivities.map((item, index) => {
        const done = rewards.includes(rewardKey(lessonId, index + 1));
        return <button key={item.title} className={exercise === index + 1 ? "active" : ""} aria-pressed={exercise === index + 1} disabled={python.running || busy} onClick={() => chooseExercise(index + 1)}><span>{done ? <Check size={16} /> : index + 1}</span><strong>{item.title}</strong><small>{done ? "Concluído" : "25 XP"}</small></button>;
      })}
    </div>

    <article className="block-brief"><div><span className="eyebrow">DESAFIO {exercise} DE {lessonActivities.length}</span><h2>{activity.title}</h2><p>{activity.goal}</p></div><ol>{activity.steps.map((step) => <li key={step}>{step}</li>)}</ol></article>

    <div className="block-legend">{Object.entries(blockKindLabels).map(([kind, label]) => <span key={kind} className={`legend-${kind}`}>{label}</span>)}</div>
    <p className="tiny">Arraste ou clique para adicionar. Alguns blocos são alternativas incorretas e devem permanecer na prateleira. Use Tab e Enter no teclado; as setas mudam a ordem.</p>

    <div className="studio-grid">
      <div className="block-shelf"><h3>1. Escolha os blocos</h3><p className="tiny">Use exatamente {activity.required}. Compare cada instrução com o objetivo.</p>
        {activity.blocks.map((item) => <button key={item.id} className={`scratch-block block-${item.kind}`} draggable={!python.running && !busy && !order.includes(item.id)} onDragStart={(event) => { event.dataTransfer.setData("text/plain", item.id); event.dataTransfer.effectAllowed = "move"; }} disabled={python.running || busy || order.includes(item.id)} onClick={() => insert(item.id, order.length)} aria-label={`Adicionar: ${item.label}`}><span><small>{blockKindLabels[item.kind]}</small><strong>{item.label}</strong><code>{item.code}</code></span><Plus size={17} /></button>)}
      </div>

      <div className="block-canvas"><div className="row between"><h3>2. Monte a sequência</h3><span className="tiny">{order.length}/{activity.required} blocos</span></div><div className="start-hat">⚑ quando eu clicar em executar</div>
        <ol aria-label="Sua sequência de blocos">{Array.from({ length: order.length + 1 }, (_, index) => {
          const item = activity.blocks.find((candidate) => candidate.id === order[index]);
          return <li key={item?.id || "end"}><div className={`block-drop ${over === index ? "over" : ""}`} data-drop-index={index} onDragOver={(event) => { event.preventDefault(); setOver(index); }} onDragLeave={() => setOver(null)} onDrop={(event) => drop(event, index)}>{index === order.length ? order.length ? "Solte aqui para acrescentar" : "Solte seu primeiro bloco aqui" : "Solte aqui para inserir"}</div>
            {item && <div className={`scratch-block assembled block-${item.kind}`} draggable={!python.running && !busy} onDragStart={(event) => { event.dataTransfer.setData("text/plain", item.id); event.dataTransfer.effectAllowed = "move"; }}><GripVertical size={16} aria-hidden="true"/><span><small>{index + 1}. {blockKindLabels[item.kind]}</small><strong>{item.label}</strong></span><div className="block-tools"><button aria-label={`Subir bloco ${index + 1}`} disabled={python.running || busy || index === 0} onClick={() => move(index, -1)}><ArrowUp size={15}/></button><button aria-label={`Descer bloco ${index + 1}`} disabled={python.running || busy || index === order.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15}/></button><button aria-label={`Remover bloco ${index + 1}`} disabled={python.running || busy} onClick={() => updateOrder(order.filter((candidate) => candidate !== item.id), "Bloco devolvido à prateleira.")}><X size={15}/></button></div></div>}
          </li>;
        })}</ol>
        <div className="row wrap"><button className="primary" disabled={python.running || busy || order.length !== activity.required} onClick={run}><Play size={16}/>{python.running ? "Executando…" : "Executar blocos"}</button><button disabled={python.running || busy || !order.length} onClick={() => { updateOrder([], "Sequência limpa. Escolha os blocos novamente."); python.clear(); }}><RotateCcw size={15}/>Recomeçar</button></div>
        {python.running && <button onClick={python.stop}>Parar execução</button>}
        <button className="block-hint" onClick={() => setHint(!hint)} aria-expanded={hint}>💡 {hint ? "Ocultar dica" : "Ver uma dica gratuita"}</button>
        {hint && <p className="notice">{activity.hint} Esta dica não desconta pontos.</p>}
        <button className="warning" disabled={python.running || busy} onClick={async () => { setBusy(true); try { const result = await api(`lessons/${lessonId}/solution`, { exercise }); setSolution(result.solution); setHints((previous) => previous.includes(key) ? previous : [...previous, key]); await refresh(); notify(result.gain < 0 ? `Solução revelada. ${xp(result.gain)} XP` : "Solução disponível para revisão."); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }}><Lightbulb size={15}/>{hints.includes(key) || user.role === "teacher" ? "Rever solução" : "Revelar solução · até −10 XP"}</button>
        <p className="tiny">A dica é gratuita. Revelar desconta uma vez e reduz a recompensa deste desafio para 25%.</p>
        {solution && <div className="solution-box"><div className="row between"><h3>Um caminho possível</h3><button className="small" onClick={() => setSolution("")}>Fechar</button></div><pre>{solution}</pre></div>}
      </div>

      <div className="block-stage"><h3>3. Veja acontecer</h3><div className="pet-stage"><span aria-hidden="true">🐍</span><p>{current && success ? "Boa! A sequência resolveu o desafio." : "Leia o objetivo e teste sua ideia."}</p></div>
        {activity.stdin && <div className="sample-input"><strong>Entradas deste desafio</strong><p>{activity.inputLabel}</p><small>O programa recebe uma resposta por pergunta.</small></div>}
        <h4>Caixas da memória</h4><div className="memory-boxes">{activity.memory.map(([name, value]) => <div key={name}><code>{name}</code><strong>{current && success ? value : "?"}</strong></div>)}</div><p className="tiny">Os valores aparecem depois de uma sequência correta.</p><h4>Saída do Python</h4><pre className="block-output" aria-live="polite">{current || python.running ? python.output || "Executando…" : "Execute para ver o resultado da sequência atual."}</pre>
      </div>
    </div>

    <div className="block-feedback" role="status">{feedback}</div><details className="block-code" open><summary>Seus blocos em Python</summary><pre>{code || "# Seu código vai aparecer aqui, bloco por bloco."}</pre></details>
    <div className="row wrap"><button disabled={!current || !success || python.running} onClick={() => setConfirm(true)}>Levar código ao laboratório ↓</button><span className="tiny">Depois de acertar, você pode continuar editando o programa no laboratório.</span></div>
    {confirm && <div className="notice"><p>Isso substitui o código e as entradas atuais do laboratório abaixo.</p><div className="row wrap"><button className="primary" onClick={() => { onUse(code, activity.stdin); setConfirm(false); setFeedback("Código enviado ao laboratório. Agora você pode modificá-lo e experimentar."); }}>Substituir código do laboratório</button><button onClick={() => setConfirm(false)}>Cancelar</button></div></div>}
  </section>;
}
