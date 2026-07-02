/**
 * BuilderMetadataForm
 *
 * Renders the global metadata inputs section of the SplitBuilder modal:
 * Routine Title, Workout Difficulty (select), and Split Description (textarea).
 *
 * Pure presentational component.
 */

interface BuilderMetadataFormProps {
  /** Current routine title text. */
  builderTitle: string;
  /** Update the routine title. */
  onUpdateTitle: (val: string) => void;
  /** Current difficulty selection. */
  builderDifficulty: string;
  /** Update the difficulty selection. */
  onUpdateDifficulty: (val: string) => void;
  /** Current description text. */
  builderDescription: string;
  /** Update the description text. */
  onUpdateDescription: (val: string) => void;
}

export default function BuilderMetadataForm({
  builderTitle,
  onUpdateTitle,
  builderDifficulty,
  onUpdateDifficulty,
  builderDescription,
  onUpdateDescription,
}: BuilderMetadataFormProps) {
  return (
    <>
      {/* Global Metadata Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="input-builder-title"
            className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
          >
            Routine Title
          </label>
          <input
            id="input-builder-title"
            type="text"
            value={builderTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs focus:border-[#1A1A1A] focus:outline-none"
            placeholder="My Tailored Workout Split"
          />
        </div>
        <div>
          <label
            htmlFor="select-builder-difficulty"
            className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
          >
            Workout Difficulty
          </label>
          <select
            id="select-builder-difficulty"
            value={builderDifficulty}
            onChange={(e) => onUpdateDifficulty(e.target.value)}
            className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-2 text-xs focus:border-[#1A1A1A] focus:outline-none"
          >
            <option value="Beginner-Friendly">Beginner-Friendly</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All Levels">All Levels</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="textarea-builder-desc"
          className="block text-[9px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-1"
        >
          Split Description
        </label>
        <textarea
          id="textarea-builder-desc"
          rows={2}
          value={builderDescription}
          onChange={(e) => onUpdateDescription(e.target.value)}
          className="w-full bg-white border border-[#1A1A1A]/15 px-3 py-1.5 text-xs focus:border-[#1A1A1A] focus:outline-none font-serif italic"
          placeholder="Tell us what makes this split effective..."
        />
      </div>
    </>
  );
}
