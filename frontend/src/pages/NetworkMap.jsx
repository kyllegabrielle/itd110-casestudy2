import { useState, useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axiosInstance from '../utils/axiosInstance';
import { Loader2, Info, Maximize, Minimize } from 'lucide-react';

const NetworkMap = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fgRef = useRef();

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

  const getNodeColor = (node) => {
    switch (node.label) {
      case 'Incident': return '#ef4444'; // Red
      case 'Suspect': return '#f59e0b'; // Amber
      case 'Victim': return '#10b981';  // Emerald
      case 'Officer': return '#3b82f6'; // Blue
      case 'Location': return '#8b5cf6'; // Violet
      default: return '#94a3b8';
    }
  };

  const getNodeSize = (node) => {
    return node.label === 'Incident' ? 6 : 4;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] text-slate-500">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-medium">Constructing relationship map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 text-left">Incident Relationship Map</h2>
          <p className="text-slate-500 text-left text-sm">Interactive visualization of connections between crimes, suspects, and locations.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-xs font-semibold">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div> Incident</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Suspect</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-500"></div> Officer</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Victim</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-violet-500"></div> Location</div>
        </div>
      </div>

      <div className="flex-1 bg-slate-900 rounded-2xl shadow-inner border border-slate-800 overflow-hidden relative">
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          nodeLabel={(node) => `${node.label}: ${node.name}`}
          nodeColor={getNodeColor}
          nodeRelSize={getNodeSize}
          linkColor={() => 'rgba(255, 255, 255, 0.2)'}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.25}
          linkWidth={1.5}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            ctx.fillStyle = getNodeColor(node);
            ctx.beginPath();
            ctx.arc(node.x, node.y, getNodeSize(node), 0, 2 * Math.PI, false);
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff';
            ctx.fillText(label, node.x, node.y + getNodeSize(node) + 3);
          }}
          cooldownTicks={100}
          onEngineStop={() => fgRef.current.zoomToFit(400, 50)}
        />
        
        <div className="absolute bottom-6 right-6 bg-slate-800/80 backdrop-blur-md p-4 rounded-xl border border-white/10 text-white max-w-xs space-y-2 pointer-events-none">
          <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-widest">
            <Info size={14} />
            Instructions
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Drag nodes to reorganize. Scroll to zoom. The lines represent real-time connections stored in the Neo4j graph database.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;
