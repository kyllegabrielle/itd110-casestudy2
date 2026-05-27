import { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axiosInstance from '../utils/axiosInstance';
import { Loader2, Info, Maximize, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

const NetworkMap = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const fgRef = useRef();
  const containerRef = useRef();

  // Handle responsive resizing
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await axiosInstance.get('/incidents/graph/data');
        setGraphData(response.data.data);
      } catch (err) {
        setError('Failed to load network map data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, []);

  const getNodeColor = useCallback((node) => {
    switch (node.label) {
      case 'Incident': return '#ef4444'; // Red
      case 'Suspect': return '#f59e0b'; // Amber
      case 'Victim': return '#10b981';  // Emerald
      case 'Officer': return '#3b82f6'; // Blue
      case 'Location': return '#8b5cf6'; // Violet
      case 'CrimeType': return '#ec4899'; // Pink
      default: return '#94a3b8';
    }
  }, []);

  const handleZoomToFit = () => {
    if (fgRef.current) {
      fgRef.current.zoomToFit(400, 100);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-slate-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Constructing relationship map...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-red-500">
        <p className="font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-0 space-y-4">
      <div className="flex-none flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relationship Network</h2>
          <p className="text-slate-500 text-sm">Visualizing connections across the crime database</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 px-4 rounded-xl border border-slate-200 shadow-sm text-[10px] font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Incident</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div> Suspect</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Officer</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Victim</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-violet-500"></div> Location</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-pink-500"></div> Crime Type</div>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="flex-1 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 relative group overflow-hidden"
        style={{ minHeight: '400px' }}
      >
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel={(node) => `${node.label}: ${node.name}`}
          nodeColor={getNodeColor}
          linkColor={() => 'rgba(255, 255, 255, 0.15)'}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.2}
          linkWidth={1}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            
            // Draw node circle
            const r = (node.label === 'Incident' ? 6 : 4);
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4 / globalScale;
            ctx.fillStyle = getNodeColor(node);
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fill();
            
            // Draw label
            ctx.shadowBlur = 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillText(label, node.x, node.y + r + fontSize + 2);
          }}
          nodePointerAreaPaint={(node, color, ctx) => {
            const r = (node.label === 'Incident' ? 6 : 4);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          cooldownTicks={100}
          onEngineStop={() => {
            // Slight delay to ensure dimensions are stable
            setTimeout(() => {
              if (fgRef.current) fgRef.current.zoomToFit(400, 50);
            }, 100);
          }}
        />
        
        {/* Controls Overlay */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <button 
            onClick={handleZoomToFit}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg border border-white/10 shadow-lg transition-colors"
            title="Zoom to Fit"
          >
            <Maximize size={18} />
          </button>
          <button 
            onClick={() => fgRef.current.zoom(fgRef.current.zoom() * 1.5, 400)}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg border border-white/10 shadow-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={18} />
          </button>
          <button 
            onClick={() => fgRef.current.zoom(fgRef.current.zoom() / 1.5, 400)}
            className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-white rounded-lg border border-white/10 shadow-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={18} />
          </button>
        </div>

        <div className="absolute bottom-6 right-6 bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white max-w-xs space-y-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-widest">
            <Info size={14} />
            Navigation Tips
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Drag nodes to explore connections. Scroll to zoom. Double-click to center on a node. The map helps identify criminal clusters.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
