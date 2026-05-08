import { useNavigate } from "react-router-dom";

const YEARS = [
  { id: "1", title: "Year One", desc: "Foundations of computing and mathematics." },
  { id: "2", title: "Year Two", desc: "Data structures, algorithms, and systems." },
  { id: "3", title: "Year Three", desc: "Software engineering, cloud, and AI." },
  { id: "4", title: "Year Four", desc: "Capstone and research projects." },
];

export default function AcademicPathSection() {
  const navigate = useNavigate();
  return (
    <section>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-400">Academic Path</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {YEARS.map((y) => (
          <button
            key={y.id}
            onClick={() => navigate(`/academic-year/${y.id}`)}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">{y.id}</div>
              <h3 className="font-bold text-slate-900">{y.title}</h3>
            </div>
            <p className="text-sm text-slate-500">{y.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}