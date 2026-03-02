// import { useState, useEffect } from "react";

// function StudentForm({onSubmit, edit}){
//     const [form, setForm] = useState({
        
//     });

//     useEffect(() => {
//         if(edit) setForm(edit);
//     }, [edit]);

//     const handelSubmit = (e) => {
//         e.preventDefault();
//         onSubmit(form);
//         setForm({name : "", year: "", semesters: ""});  
//     }

//     return(
//         <form onSubmit={handelSubmit} className="admin-form">
//             <input
//                 placeholder="College Name"
//                 value={form.name}
//                 onChange={(e) => setForm({...form, name: e.target.value})}
//             />
//             <input
//                 type="number"
//                 placeholder="Years"
//                 value={form.years}
//                 onChange={(e) => setForm({ ...form, years: e.target.value })}
//             />

//             <input
//                 type="number"
//                 placeholder="Semesters per Year"
//                 value={form.semesters}
//                 onChange={(e) => setForm({ ...form, semesters: e.target.value })}
//             />

//             <button type="submit">Save</button>
//         </form>
//     );
// }

// export default StudentForm;