/**
 * Folder / section labels for student & mentor material uploads.
 * Stored as `sectionLabel` on materials for grouping in the course player.
 */

/** Maximum numbered "Lecture N" choices in the folder dropdown. */
export const MAX_LECTURE_FOLDERS = 15;

/** Maximum numbered "Section N" choices (tutorials / recitations). */
export const MAX_SECTION_FOLDERS = 12;

/**
 * Options for the custom `Select` (supports `{ header: true }` rows).
 * @returns {Array<{ value?: string, label: string, header?: boolean, key?: string }>}
 */
export function buildMaterialFolderSelectOptions() {
  return [
    { value: "", label: "General" },
    { header: true, key: "hdr-lectures", label: "Lectures" },
    ...Array.from({ length: MAX_LECTURE_FOLDERS }, (_, i) => {
      const n = i + 1;
      return { value: `Lecture ${n}`, label: `Lecture ${n}` };
    }),
    { header: true, key: "hdr-sections", label: "Sections" },
    ...Array.from({ length: MAX_SECTION_FOLDERS }, (_, i) => {
      const n = i + 1;
      return { value: `Section ${n}`, label: `Section ${n}` };
    }),
    {
      header: true,
      key: "hdr-coursework",
      label: "Assignments, exams & resources",
    },
    { value: "Assignments", label: "Assignments" },
    { value: "Exams", label: "Exams" },
    { value: "Resources", label: "Resources" },
  ];
}

export const MATERIAL_FOLDER_SELECT_OPTIONS = buildMaterialFolderSelectOptions();
