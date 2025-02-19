interface ToolbarAction {
  id: string;
  label: string;
  tooltip: string;
  action: () => void;
  isEnabled: () => boolean;
}

interface MapToolbarProps {
  booleanOperationsAvailable: boolean;
  onUnion?: () => void;
  onDifference?: () => void;
  onIntersection?: () => void;
  onDelete?: () => void;
}

export function Toolbar({ booleanOperationsAvailable, onUnion, onIntersection }: MapToolbarProps) {
  const tools: ToolbarAction[] = [
    {
      id: 'union',
      label: 'U',
      tooltip: 'Union',
      action: () => onUnion?.(),
      isEnabled: () => booleanOperationsAvailable,
    },
    {
      id: 'intersection',
      label: '∩',
      tooltip: 'Intersect',
      action: () => onIntersection?.(),
      isEnabled: () => booleanOperationsAvailable,
    },
  ];

  return (
    <div
      data-testid="toolbar"
      style={{
        position: 'absolute',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: 'white',
        borderRadius: '4px',
        padding: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'row',
        gap: '8px',
        alignItems: 'center',
      }}
    >
      <div>tools</div>
      {tools.map((tool) => (
        <div key={tool.id} className="group relative" title={tool.tooltip}>
          <button
            data-testid={`toolbar-${tool.id}-button`}
            onClick={tool.action}
            disabled={!tool.isEnabled()}
            className={`p-2 rounded-md transition-colors font-medium ${
              tool.isEnabled() ? 'hover:bg-gray-100 active:bg-gray-200' : 'opacity-50 cursor-not-allowed'
            }`}
            aria-label={tool.tooltip}
          >
            {tool.label}
          </button>
          <div className="absolute invisible group-hover:visible bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full mt-2">
            <div className="bg-gray-900 text-white text-sm rounded px-2 py-1">{tool.tooltip}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
