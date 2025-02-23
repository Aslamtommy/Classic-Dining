interface TimeSlotSelectorProps {
    slots: string[];
    selected: string;
    onSelect: (slot: string) => void;
  }
  
  const TimeSlotSelector = ({ slots, selected, onSelect }: TimeSlotSelectorProps) => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {slots.map((slot: string) => (
          <button
            key={slot}
            type="button"
            onClick={() => onSelect(slot)}
            className={`p-3 border rounded-lg ${
              selected === slot ? 'bg-primary text-white' : 'hover:bg-gray-50'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    );
  };
  
  export default TimeSlotSelector;