"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Download, Lightbulb, Play, RotateCcw, Send, Square } from "lucide-react";
import type { User } from "@/lib/auth";
import { api, xp } from "./api";
import CodeBlocks from "./code-blocks";
import { codingActivities } from "./coding-activities";
import { usePython } from "./use-python";

type Work = Record<number, { code: string; stdin: string }>;
const rewardKey = (lessonId: string, challenge: number) => `coding:${lessonId}:${challenge}`;

function initialState(data: any) {
  const items = codingActivities[data.lesson.id];
  const defaults: Work = Object.fromEntries(items.map((item, index) => [index + 1, { code: item.starter, stdin: item.stdin }]));
  try {
    const parsed = JSON.parse(data.draft?.code || "null");
    if (parsed?.kind === "chapter1-coding" && parsed.work) return { active: Math.min(3, Math.max(1, Number(parsed.active) || 1)), work: { ...defaults, ...parsed.work } };
  } catch {}
  if (data.draft?.code) defaults[1] = { code: data.draft.code.slice(0, 5000), stdin: data.draft.stdin || items[0].stdin };
  return { active: 1, work: defaults };
}

function downloadCode(code: string, name: string) {
  const url = URL.createObjectURL(new Blob([code], { type: "text/x-python;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ChapterOneLearning({ data, user, notify, refresh }: {
  data: any;
  user: User;
  notify: (message: string) => void;
  refresh: () => Promise<void>;
}) {
  const lesson = data.lesson;
  const activities = codingActivities[lesson.id];
  const initial = initialState(data);
  const [challenge, setChallenge] = useState(initial.active);
  const [work, setWork] = useState<Work>(initial.work);
  const [rewards, setRewards] = useState<string[]>(data.rewards);
  const [hints, setHints] = useState<string[]>(data.hints);
  const [solution, setSolution] = useState("");
  const [hintOpen, setHintOpen] = useState(false);
  const [feedback, setFeedback] = useState("Digite sua solução, execute e valide quando estiver pronta.");
  const [busy, setBusy] = useState(false);
  const [submissions, setSubmissions] = useState(data.submissions);
  const [saveState, setSaveState] = useState("Salvo na conta");
  const python = usePython();
  const version = useRef(data.draft?.version || 0);
  const saved = useRef(data.draft?.code || "");
  const requestId = useRef<string | null>(null);
  const saveChain = useRef<Promise<void>>(Promise.resolve());
  const activity = activities[challenge - 1];
  const current = work[challenge];
  const serialized = useMemo(() => JSON.stringify({ kind: "chapter1-coding", active: challenge, work }), [challenge, work]);

  function saveDraft(value = serialized) {
    const task = async () => {
      if (value === saved.current) return;
      setSaveState("Salvando…");
      const result = await api(`lessons/${lesson.id}/draft`, { code: value, stdin: "", version: version.current });
      version.current = result.version;
      saved.current = value;
      setSaveState("Salvo na conta");
    };
    const next = saveChain.current.catch(() => {}).then(task);
    saveChain.current = next;
    return next;
  }

  useEffect(() => {
    if (serialized === saved.current) return;
    setSaveState("Alterações ainda não salvas");
    const timer = setTimeout(() => { void saveDraft(serialized).catch(() => setSaveState("Sem conexão: alterações ainda não salvas.")); }, 850);
    return () => clearTimeout(timer);
  }, [serialized]);

  function changeCode(code: string) {
    setWork((previous) => ({ ...previous, [challenge]: { ...previous[challenge], code } }));
    setFeedback("Código alterado. Execute para observar o resultado.");
  }

  function changeStdin(stdin: string) {
    setWork((previous) => ({ ...previous, [challenge]: { ...previous[challenge], stdin } }));
  }

  function chooseChallenge(next: number) {
    if (python.running || busy) return;
    setChallenge(next);
    setSolution("");
    setHintOpen(false);
    setFeedback("Novo desafio selecionado. Leia o problema antes de começar.");
    python.clear();
  }

  async function validate() {
    setBusy(true);
    setFeedback("Executando os testes deste desafio…");
    try {
      const result = await python.run(current.code + activity.test, current.stdin, true);
      const proof = result.words?.at(-1) || "";
      const response = await api(`lessons/${lesson.id}/coding`, { challenge, proof });
      if (!response.correct) {
        setFeedback(response.feedback);
        return;
      }
      const key = rewardKey(lesson.id, challenge);
      setRewards((previous) => previous.includes(key) ? previous : [...previous, key]);
      setFeedback(response.gain ? `Desafio validado! +${xp(response.gain)} XP.` : "Desafio validado novamente. A pontuação já havia sido registrada.");
      await refresh();
    } catch {
      setFeedback("Os testes ainda não passaram. Leia a saída do Python, revise os nomes pedidos e tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  const completed = activities.filter((_, index) => rewards.includes(rewardKey(lesson.id, index + 1))).length;

  return <>
    <CodeBlocks lessonId={lesson.id} data={{ ...data, rewards }} user={user} notify={notify} refresh={refresh} onUse={(code, stdin) => { changeCode(code); changeStdin(stdin); document.querySelector(".coding-lab")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} />

    <section className="coding-lab card workspace">
      <div className="row between wrap"><div><p className="eyebrow">LABORATÓRIO DE CÓDIGO · {completed}/3 CONCLUÍDOS</p><h2>Seu laboratório Python</h2><p className="muted">Agora você escreve o programa. Cada desafio validado vale 50 XP.</p></div><span className="save-state" role="status">{saveState}</span></div>

      <div className="coding-tabs" aria-label="Desafios de código">
        {activities.map((item, index) => { const done = rewards.includes(rewardKey(lesson.id, index + 1)); return <button key={item.title} className={challenge === index + 1 ? "active" : ""} aria-pressed={challenge === index + 1} disabled={python.running || busy} onClick={() => chooseChallenge(index + 1)}><span>{done ? <Check size={16}/> : index + 1}</span><span><small>DESAFIO {index + 1}</small><strong>{item.title}</strong></span><em>{done ? "Concluído" : "50 XP"}</em></button>; })}
      </div>

      <article className="coding-brief"><div><span className="eyebrow">PROBLEMA {challenge} DE 3</span><h3>{activity.title}</h3><p>{activity.goal}</p></div><ul>{activity.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}</ul></article>

      <div className="workspace-grid">
        <div>
          <label className="editor-label">Seu código Python
            <textarea className="code-editor" value={current.code} maxLength={5000} onChange={(event) => changeCode(event.target.value)} spellCheck={false} onKeyDown={(event) => { if (event.key === "Tab") { event.preventDefault(); const target = event.currentTarget; const start = target.selectionStart; target.setRangeText("    ", start, target.selectionEnd, "end"); changeCode(target.value); requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = start + 4; }); } }} />
          </label>
          <div className="row wrap">
            <button disabled={python.running || busy} onClick={async () => { try { await python.run(current.code, current.stdin); setFeedback("Código executado. Compare a saída com o problema e valide quando estiver pronta."); } catch { setFeedback("O Python encontrou um erro. Use a mensagem da saída para localizar o problema."); } }}><Play size={16}/>{python.running ? "Executando…" : "Executar código"}</button>
            <button className="primary" disabled={python.running || busy || !current.code.trim()} onClick={validate}><Check size={16}/>{busy ? "Validando…" : "Validar desafio"}</button>
            {python.running && <button onClick={python.stop}><Square size={15}/>Parar</button>}
            <button onClick={() => downloadCode(current.code, `${lesson.id}-desafio-${challenge}.py`)}><Download size={15}/>Exportar .py</button>
            <button disabled={python.running || busy} onClick={() => { setWork((previous) => ({ ...previous, [challenge]: { code: activity.starter, stdin: activity.stdin } })); setSolution(""); python.clear(); setFeedback("Rascunho inicial restaurado."); }}><RotateCcw size={15}/>Restaurar início</button>
          </div>
        </div>
        <div>
          <label>Entradas · uma resposta por linha<textarea className="stdin" value={current.stdin} maxLength={5000} onChange={(event) => changeStdin(event.target.value)} rows={5} placeholder="Respostas para input(), em ordem"/></label>
          {activity.inputLabel && <p className="sample-input"><strong>Entradas sugeridas</strong><br/>{activity.inputLabel}</p>}
          <label>Saída do Python<pre className="code-output" aria-live="polite">{python.output || "O resultado aparece aqui."}</pre></label>
          <p className="tiny" role="status">{python.status}</p>
        </div>
      </div>

      <div className="coding-feedback" role="status">{feedback}</div>
      <div className="row between wrap section-gap">
        <div>
          <button className="block-hint" onClick={() => setHintOpen(!hintOpen)} aria-expanded={hintOpen}>💡 {hintOpen ? "Ocultar dica" : "Ver uma dica gratuita"}</button>
          {hintOpen && <p className="notice">{activity.hint} Esta dica não desconta pontos.</p>}
        </div>
        <button className="warning" disabled={busy || python.running} onClick={async () => { setBusy(true); try { const response = await api(`lessons/${lesson.id}/solution`, { codingChallenge: challenge }); setSolution(response.solution); const key = rewardKey(lesson.id, challenge); setHints((previous) => previous.includes(key) ? previous : [...previous, key]); await refresh(); notify(response.gain < 0 ? `Solução revelada. ${xp(response.gain)} XP` : "Solução disponível para revisão."); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }}><Lightbulb size={16}/>{hints.includes(rewardKey(lesson.id, challenge)) || user.role === "teacher" ? "Rever solução" : "Revelar solução · até −20 XP"}</button>
      </div>
      <p className="tiny">Revelar desconta uma vez e reduz a recompensa deste desafio para 25%. A dica permanece gratuita.</p>
      {solution && <div className="solution-box"><div className="row between"><h3>Um caminho possível</h3><button className="small" onClick={() => setSolution("")}>Fechar</button></div><pre>{solution}</pre></div>}

      <div className="coding-submit row between wrap">
        <p className="tiny">Envie o desafio atual para o professor quando quiser receber uma revisão.</p>
        <button className="primary" disabled={busy || python.running} onClick={async () => { setBusy(true); requestId.current ??= crypto.randomUUID(); try { await saveDraft(); await api(`lessons/${lesson.id}/submit`, { code: `# Desafio ${challenge}: ${activity.title}\n${current.code}`, stdin: current.stdin, output: python.output, requestId: requestId.current }); requestId.current = null; notify("Desafio enviado. Seu professor poderá revisar."); const latest = await api(`lessons/${lesson.id}`); setSubmissions(latest.submissions); } catch (error) { notify((error as Error).message); } finally { setBusy(false); } }}><Send size={15}/>{busy ? "Aguarde…" : "Enviar desafio ao professor"}</button>
      </div>

      {submissions.length > 0 && <details className="section-gap"><summary>Minhas entregas e feedback</summary>{submissions.map((submission: any) => <div className="feedback-item" key={submission.id}><strong>{new Date(submission.created_at).toLocaleString("pt-BR")} · {submission.status === "reviewed" ? "Revisada" : "Aguardando revisão"}</strong><pre>{submission.code.split("\n")[0]}</pre><p>{submission.feedback || "Seu professor ainda não comentou esta entrega."}</p></div>)}</details>}
    </section>
  </>;
}
