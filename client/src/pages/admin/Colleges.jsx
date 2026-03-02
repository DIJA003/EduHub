import { useState } from "react";
import CollegeForm from "../../components/admin/CollegeForm";

function Colleges() {
  const [colleges, setColleges] = useState();
  const [edit, setEdit] = useState(null);

  const addCollege = () => {
    //to be written
  };

  const deleteCollege = () => {
    //to be written
  };

  return (
    <div>
      <h1>Colleges</h1>
      <CollegeForm onSubmit={addCollege} edit={edit} />
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Years</th>
            <th>Semesters/Year</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {colleges.map((college) => (
            <tr key={college.id}>
              <td>{college.name}</td>
              <td>{college.years}</td>
              <td>{college.semesters}</td>
              <td>
                <button onClick={() => setEdit(college)}>Edit</button>
                <button onClick={() => deleteCollege(college.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default Colleges;
