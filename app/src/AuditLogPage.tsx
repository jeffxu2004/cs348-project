// AuditLogPage.tsx
import { useEffect, useState } from "react";

const AuditLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/admin/audit-log", {
      credentials: "include"
    })
      .then((res) => res.ok ? res.json() : Promise.reject(res))
      .then(setLogs)
      .catch(() => setError("Failed to fetch audit log"));
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Audit Log</h1>
      {error && <p className="text-red-600">{error}</p>}
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border px-4 py-2">Timestamp</th>
            <th className="border px-4 py-2">Admin</th>
            <th className="border px-4 py-2">Action</th>
            <th className="border px-4 py-2">Details</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, i) => (
            <tr key={i}>
              <td className="border px-4 py-2">{new Date(log.action_time).toLocaleString()}</td>
              <td className="border px-4 py-2">{log.username}</td>
              <td className="border px-4 py-2">{log.action_type}</td>
              <td className="border px-4 py-2 whitespace-pre-wrap">{log.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditLogPage;
