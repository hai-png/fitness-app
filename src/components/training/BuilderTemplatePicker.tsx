/**
 * BuilderTemplatePicker
 *
 * Renders the "Load Preset Split Configuration" grid inside the SplitBuilder
 * modal — a 2-column grid of buttons (one per `SPLIT_TEMPLATES` entry) that
 * load that preset's days/metadata into the builder when clicked.
 *
 * Pure presentational component.
 */

import { SPLIT_TEMPLATES, type SplitTemplate } from "../../data/workoutTemplates";

interface BuilderTemplatePickerProps {
  /** Apply the chosen preset split template. */
  onApplyTemplate: (template: SplitTemplate) => void;
}

export default function BuilderTemplatePicker({
  onApplyTemplate,
}: BuilderTemplatePickerProps) {
  return (
    <div className="bg-white border border-[#1A1A1A]/10 p-3 mb-2">
      <span className="text-[9px] uppercase tracking-wider font-bold text-[#1A1A1A]/50 block mb-2">
        Load Preset Split Configuration
      </span>
      <div className="grid grid-cols-2 gap-2">
        {SPLIT_TEMPLATES.map((t, idx) => (
          <button
            key={idx}
            id={`btn-load-template-${idx}`}
            onClick={() => onApplyTemplate(t)}
            type="button"
            className="p-2 border border-[#1A1A1A]/10 bg-[#F9F8F6] hover:bg-[#1A1A1A] hover:text-white transition-all text-left rounded-none text-xs"
          >
            <strong className="block uppercase tracking-tight text-[10px]">
              {t.name}
            </strong>
            <span className="text-[9px] opacity-70 italic font-serif block mt-0.5 truncate">
              {t.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
