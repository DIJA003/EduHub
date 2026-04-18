import { useState, useEffect } from "react";
import {
  PageHeader,
  TableWrap,
  EmptyState,
  Badge,
  tw,
} from "../../components/admin/adminUtils";
import { mentorApi } from "../../services/api";

const STATUS_V = {
  Active: "success",
  Draft: "warning",
  Rejected: "danger",
  Archived: "default",
};

function MentorHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mentorApi
      .getMyMaterials()
      .then((r) => setItems(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My History"
        subtitle="All materials you have uploaded or reviewed."
      />
      <TableWrap
        toolbar={
          <span
            className="text-[13.5px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {items.length} records
          </span>
        }
      >
        {loading ? (
          <div
            className="py-16 text-center"
            style={{ color: "var(--text-muted)" }}
          >
            Loading…
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No history yet"
            description="Uploaded materials will appear here."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                {[
                  "Title",
                  "Course",
                  "Type",
                  "Uploaded By",
                  "Date",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className={tw.th}
                    style={{
                      color: "var(--text-muted)",
                      borderBottomColor: "var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr
                  key={m._id}
                  className={tw.trHover}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-primary)",
                      borderBottomColor: "var(--border-light)",
                    }}
                  >
                    <span className="font-medium">{m.title}</span>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <Badge variant="blue">
                      {m.courseRef?.title || m.course || "—"}
                    </Badge>
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-secondary)",
                      borderBottomColor: "var(--border-light)",
                    }}
                  >
                    {m.type}
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-secondary)",
                      borderBottomColor: "var(--border-light)",
                    }}
                  >
                    {m.uploadedByRef?.name || m.uploader || "—"}
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-muted)",
                      borderBottomColor: "var(--border-light)",
                    }}
                  >
                    <span className="font-mono text-[12px]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <Badge variant={STATUS_V[m.status] || "default"}>
                      {m.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
    </div>
  );
}

export default MentorHistory;
