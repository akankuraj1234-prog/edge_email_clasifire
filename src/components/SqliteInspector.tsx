import React, { useState } from 'react';
import { Ticket } from '../types';
import {
  Database,
  Table,
  Play,
  Download,
  Search,
  CheckCircle2,
  FileText,
  Terminal,
  Code,
  Layers,
} from 'lucide-react';

interface SqliteInspectorProps {
  tickets: Ticket[];
}

export const SqliteInspector: React.FC<SqliteInspectorProps> = ({ tickets }) => {
  const [selectedTable, setSelectedTable] = useState<'tickets' | 'classifications' | 'draft_replies' | 'audit_logs'>('tickets');
  const [sqlQuery, setSqlQuery] = useState<string>('SELECT id, subject, status, received_at FROM tickets ORDER BY id DESC LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any[] | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);

  // Preset queries
  const presets = [
    {
      name: 'All Tickets & Status',
      query: 'SELECT id, subject, status, received_at FROM tickets ORDER BY id DESC;',
    },
    {
      name: 'Classifications by Urgency',
      query: 'SELECT urgency, COUNT(*) as ticket_count, AVG(confidence_score) as avg_confidence FROM classifications GROUP BY urgency;',
    },
    {
      name: 'Intent Distribution',
      query: 'SELECT intent, COUNT(*) as count FROM classifications GROUP BY intent ORDER BY count DESC;',
    },
    {
      name: 'Average Edge SLM Latency',
      query: 'SELECT model_used, AVG(latency_ms) as avg_latency_ms, AVG(tokens_per_sec) as avg_speed FROM classifications GROUP BY model_used;',
    },
  ];

  // Execute pseudo-SQL in client memory on tickets data
  const handleExecuteQuery = () => {
    setQueryError(null);
    const q = sqlQuery.trim().toLowerCase();

    try {
      if (q.includes('group by urgency')) {
        const counts: Record<string, { count: number; totalConf: number }> = {};
        tickets.forEach((t) => {
          const u = t.classification.urgency;
          if (!counts[u]) counts[u] = { count: 0, totalConf: 0 };
          counts[u].count += 1;
          counts[u].totalConf += t.classification.confidenceScore;
        });
        const rows = Object.entries(counts).map(([urgency, val]) => ({
          urgency,
          ticket_count: val.count,
          avg_confidence: Number((val.totalConf / val.count).toFixed(3)),
        }));
        setQueryResult(rows);
        return;
      }

      if (q.includes('group by intent')) {
        const counts: Record<string, number> = {};
        tickets.forEach((t) => {
          const i = t.classification.intent;
          counts[i] = (counts[i] || 0) + 1;
        });
        const rows = Object.entries(counts).map(([intent, count]) => ({
          intent,
          count,
        }));
        setQueryResult(rows);
        return;
      }

      if (q.includes('group by model_used') || q.includes('avg_latency_ms')) {
        const stats: Record<string, { count: number; lat: number; tok: number }> = {};
        tickets.forEach((t) => {
          const m = t.classification.modelUsed.split(' ')[0];
          if (!stats[m]) stats[m] = { count: 0, lat: 0, tok: 0 };
          stats[m].count += 1;
          stats[m].lat += t.classification.edgeLatencyMs;
          stats[m].tok += t.classification.tokensPerSec;
        });
        const rows = Object.entries(stats).map(([model_used, s]) => ({
          model_used,
          avg_latency_ms: Number((s.lat / s.count).toFixed(1)),
          avg_speed: Number((s.tok / s.count).toFixed(1)),
        }));
        setQueryResult(rows);
        return;
      }

      // Default: Return tickets representation
      if (q.includes('from tickets')) {
        const rows = tickets.map((t) => ({
          id: t.id,
          sqlite_row_id: t.sqliteRowId,
          subject: t.subject,
          sender: t.sender,
          status: t.status,
          received_at: t.receivedAt,
        }));
        setQueryResult(rows);
        return;
      }

      if (q.includes('from classifications')) {
        const rows = tickets.map((t) => ({
          ticket_id: t.id,
          intent: t.classification.intent,
          urgency: t.classification.urgency,
          sentiment: t.classification.sentiment,
          confidence_score: t.classification.confidenceScore,
          latency_ms: t.classification.edgeLatencyMs,
          model_used: t.classification.modelUsed,
        }));
        setQueryResult(rows);
        return;
      }

      if (q.includes('from draft_replies')) {
        const rows = tickets.map((t) => ({
          ticket_id: t.id,
          template_name: t.draftReply.templateName,
          tone: t.draftReply.tone,
          is_edited: t.draftReply.isEdited ? 1 : 0,
          draft_length: t.draftReply.generatedDraft.length,
        }));
        setQueryResult(rows);
        return;
      }

      // Fallback
      setQueryResult(
        tickets.map((t) => ({
          id: t.id,
          subject: t.subject,
          urgency: t.classification.urgency,
          intent: t.classification.intent,
          status: t.status,
        }))
      );
    } catch (err: any) {
      setQueryError(`SQL Parse Error: ${err.message}`);
    }
  };

  const handleDownloadSqlDump = () => {
    let sqlDump = `-- ==========================================================\n`;
    sqlDump += `-- Trackmind Edge Classifier SQLite v3 Database Dump\n`;
    sqlDump += `-- Target Edge Hardware: NVIDIA Jetson Orin Nano Developer Kit\n`;
    sqlDump += `-- Dump Timestamp: ${new Date().toISOString()}\n`;
    sqlDump += `-- ==========================================================\n\n`;

    sqlDump += `CREATE TABLE IF NOT EXISTS tickets (\n`;
    sqlDump += `  id TEXT PRIMARY KEY,\n`;
    sqlDump += `  sqlite_row_id INTEGER,\n`;
    sqlDump += `  subject TEXT,\n`;
    sqlDump += `  sender TEXT,\n`;
    sqlDump += `  sender_email TEXT,\n`;
    sqlDump += `  channel TEXT,\n`;
    sqlDump += `  body TEXT,\n`;
    sqlDump += `  status TEXT,\n`;
    sqlDump += `  received_at DATETIME\n`;
    sqlDump += `);\n\n`;

    sqlDump += `CREATE TABLE IF NOT EXISTS classifications (\n`;
    sqlDump += `  ticket_id TEXT PRIMARY KEY,\n`;
    sqlDump += `  intent TEXT,\n`;
    sqlDump += `  urgency TEXT,\n`;
    sqlDump += `  urgency_reason TEXT,\n`;
    sqlDump += `  sentiment TEXT,\n`;
    sqlDump += `  sentiment_score REAL,\n`;
    sqlDump += `  confidence_score REAL,\n`;
    sqlDump += `  model_used TEXT,\n`;
    sqlDump += `  latency_ms INTEGER,\n`;
    sqlDump += `  FOREIGN KEY(ticket_id) REFERENCES tickets(id)\n`;
    sqlDump += `);\n\n`;

    sqlDump += `CREATE TABLE IF NOT EXISTS draft_replies (\n`;
    sqlDump += `  id TEXT PRIMARY KEY,\n`;
    sqlDump += `  ticket_id TEXT,\n`;
    sqlDump += `  template_id TEXT,\n`;
    sqlDump += `  template_name TEXT,\n`;
    sqlDump += `  tone TEXT,\n`;
    sqlDump += `  generated_draft TEXT,\n`;
    sqlDump += `  edited_draft TEXT,\n`;
    sqlDump += `  is_edited INTEGER,\n`;
    sqlDump += `  FOREIGN KEY(ticket_id) REFERENCES tickets(id)\n`;
    sqlDump += `);\n\n`;

    tickets.forEach((t) => {
      sqlDump += `INSERT INTO tickets VALUES ('${t.id}', ${t.sqliteRowId}, '${t.subject.replace(/'/g, "''")}', '${t.sender}', '${t.senderEmail}', '${t.channel}', '${t.body.substring(0, 100).replace(/'/g, "''")}...', '${t.status}', '${t.receivedAt}');\n`;
      sqlDump += `INSERT INTO classifications VALUES ('${t.id}', '${t.classification.intent}', '${t.classification.urgency}', '${t.classification.urgencyReason.replace(/'/g, "''")}', '${t.classification.sentiment}', ${t.classification.sentimentScore}, ${t.classification.confidenceScore}, '${t.classification.modelUsed}', ${t.classification.edgeLatencyMs});\n`;
      sqlDump += `INSERT INTO draft_replies VALUES ('${t.draftReply.id}', '${t.id}', '${t.draftReply.templateId}', '${t.draftReply.templateName}', '${t.draftReply.tone}', '${t.draftReply.generatedDraft.substring(0, 80).replace(/'/g, "''")}...', '${(t.draftReply.editedDraft || '').replace(/'/g, "''")}', ${t.draftReply.isEdited ? 1 : 0});\n\n`;
    });

    const blob = new Blob([sqlDump], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackmind_jetson_edge_${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 p-4 lg:p-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center text-white shadow-lg">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Embedded SQLite v3 Storage Engine
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                /var/lib/trackmind/tickets.sqlite
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Local relational storage persisting all inbound tickets, zero-shot classification tags, and auto-drafts on the Jetson Orin Nano.
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadSqlDump}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-700 transition shadow-sm"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export SQLite .sql Dump</span>
        </button>
      </div>

      {/* SQL QUERY CONSOLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>Interactive SQL Query Runner</span>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500">Presets:</span>
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSqlQuery(p.query);
                }}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 hover:text-white border border-slate-800 transition"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <textarea
            rows={3}
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-400 focus:outline-none focus:border-cyan-500 transition"
            placeholder="SELECT * FROM tickets..."
          />
          <button
            onClick={handleExecuteQuery}
            className="absolute right-2.5 bottom-3 flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-xs font-bold shadow transition"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Run SQL</span>
          </button>
        </div>

        {queryError && (
          <div className="p-2.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 text-xs font-mono">
            {queryError}
          </div>
        )}

        {/* Query Result Grid if executed */}
        {queryResult && (
          <div className="bg-slate-950 rounded-lg border border-slate-800 p-3 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Returned {queryResult.length} rows</span>
              <button
                onClick={() => setQueryResult(null)}
                className="text-slate-500 hover:text-slate-300"
              >
                Close Results
              </button>
            </div>
            <div className="overflow-x-auto max-h-56">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    {Object.keys(queryResult[0] || {}).map((col) => (
                      <th key={col} className="pb-1.5 pr-4 font-semibold text-cyan-400">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {queryResult.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-900/40">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="py-1.5 pr-4 truncate max-w-xs">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TABLE TABS & VIEWER */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        {/* Table Selector Tabs */}
        <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/60 flex items-center gap-2 overflow-x-auto text-xs">
          {(['tickets', 'classifications', 'draft_replies', 'audit_logs'] as const).map(
            (tbl) => (
              <button
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  selectedTable === tbl
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>{tbl}</span>
                <span className="text-[10px] text-slate-500">
                  ({tbl === 'audit_logs' ? tickets.reduce((acc, t) => acc + t.auditTrail.length, 0) : tickets.length})
                </span>
              </button>
            )
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto max-h-[500px] scrollbar-thin">
          {selectedTable === 'tickets' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3">row_id</th>
                  <th className="py-2.5 px-3">subject</th>
                  <th className="py-2.5 px-3">sender</th>
                  <th className="py-2.5 px-3">channel</th>
                  <th className="py-2.5 px-3">status</th>
                  <th className="py-2.5 px-3">received_at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono font-bold text-cyan-400">{t.id}</td>
                    <td className="py-2 px-3 font-mono text-slate-400">#{t.sqliteRowId}</td>
                    <td className="py-2 px-3 font-semibold text-white max-w-xs truncate">{t.subject}</td>
                    <td className="py-2 px-3 text-slate-300 truncate">{t.sender}</td>
                    <td className="py-2 px-3 text-slate-400">{t.channel}</td>
                    <td className="py-2 px-3 font-mono text-xs">{t.status}</td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[11px]">{new Date(t.receivedAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'classifications' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">ticket_id</th>
                  <th className="py-2.5 px-3">intent</th>
                  <th className="py-2.5 px-3">urgency</th>
                  <th className="py-2.5 px-3">sentiment</th>
                  <th className="py-2.5 px-3">confidence</th>
                  <th className="py-2.5 px-3">latency_ms</th>
                  <th className="py-2.5 px-3">model_used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono text-cyan-400 font-bold">{t.id}</td>
                    <td className="py-2 px-3 font-semibold text-emerald-400">{t.classification.intent}</td>
                    <td className="py-2 px-3">{t.classification.urgency}</td>
                    <td className="py-2 px-3">{t.classification.sentiment}</td>
                    <td className="py-2 px-3 font-mono">{(t.classification.confidenceScore * 100).toFixed(1)}%</td>
                    <td className="py-2 px-3 font-mono text-amber-400">{t.classification.edgeLatencyMs} ms</td>
                    <td className="py-2 px-3 font-mono text-slate-400 truncate max-w-xs">{t.classification.modelUsed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'draft_replies' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">id</th>
                  <th className="py-2.5 px-3">ticket_id</th>
                  <th className="py-2.5 px-3">template_name</th>
                  <th className="py-2.5 px-3">tone</th>
                  <th className="py-2.5 px-3">is_edited</th>
                  <th className="py-2.5 px-3">draft_snippet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 font-mono text-purple-400">{t.draftReply.id}</td>
                    <td className="py-2 px-3 font-mono text-cyan-400">{t.id}</td>
                    <td className="py-2 px-3 font-mono text-slate-300">{t.draftReply.templateName}</td>
                    <td className="py-2 px-3">{t.draftReply.tone}</td>
                    <td className="py-2 px-3 font-mono">{t.draftReply.isEdited ? 'TRUE (1)' : 'FALSE (0)'}</td>
                    <td className="py-2 px-3 text-slate-400 truncate max-w-md">{t.draftReply.generatedDraft}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {selectedTable === 'audit_logs' && (
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="py-2.5 px-3">timestamp</th>
                  <th className="py-2.5 px-3">action</th>
                  <th className="py-2.5 px-3">actor</th>
                  <th className="py-2.5 px-3">details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {tickets.flatMap((t) =>
                  t.auditTrail.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono text-slate-400 text-[11px]">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-2 px-3 font-semibold text-emerald-400">{log.action}</td>
                      <td className="py-2 px-3 text-slate-300 font-mono">{log.actor}</td>
                      <td className="py-2 px-3 text-slate-400 truncate max-w-md">{log.details}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
