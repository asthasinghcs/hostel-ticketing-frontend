import Icon from "./Icon";
import { hostelGroups, hostelCount } from "./hostels";

export default function HostelPicker({ value, onChange }) {
  const family = value.startsWith("QC-") ? "QC" : "KP";
  const selectedGroup = hostelGroups.find((group) => group.code === family);
  return (
    <fieldset className="hostel-choice">
      <legend>
        Your hostel{" "}
        <span className="hostel-total">{hostelCount} available</span>
      </legend>
      <div className="hostel-family-options">
        {hostelGroups.map((group) => (
          <button
            type="button"
            key={group.code}
            className={`hostel-family ${family === group.code ? "selected" : ""}`}
            aria-pressed={family === group.code}
            onClick={() => onChange(group.hostels[0])}
          >
            <Icon name="building" size={24} />
            <span>
              <strong>{group.code} hostels</strong>
              <small>{group.name}</small>
            </span>
            <span className="family-count">{group.hostels.length}</span>
          </button>
        ))}
      </div>
      <label htmlFor="hostel-number" className="hostel-number-label">
        Select your {family} hostel
      </label>
      <select
        id="hostel-number"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {selectedGroup.hostels.map((block) => (
          <option key={block}>{block}</option>
        ))}
      </select>
      <p className="input-hint">
        <Icon name="lock" size={12} /> Your account gives access to your
        registered hostel only.
      </p>
    </fieldset>
  );
}
