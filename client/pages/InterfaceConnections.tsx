import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, Upload, FileImage } from "lucide-react";

export default function InterfaceConnections() {
  const [currentScale, setCurrentScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [svgContent, setSvgContent] = useState("");
  const [fileName, setFileName] = useState("");

  const svgDisplayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSvgContent(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  };

  const zoom = (scaleFactor: number) => {
    setCurrentScale(prev => prev * scaleFactor);
  };

  const resetView = () => {
    setCurrentScale(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  const updateTransform = () => {
    if (svgDisplayRef.current) {
      svgDisplayRef.current.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${currentScale})`;
    }
  };

  useEffect(() => {
    updateTransform();
  }, [currentScale, offsetX, offsetY]);

  const startDrag = (e: React.MouseEvent) => {
    if (!svgContent) return;
    setIsDragging(true);
    setStartX(e.clientX - offsetX);
    setStartY(e.clientY - offsetY);
    if (svgContainerRef.current) {
      svgContainerRef.current.style.cursor = 'grabbing';
    }
  };

  const drag = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - startX);
    setOffsetY(e.clientY - startY);
  };

  const endDrag = () => {
    setIsDragging(false);
    if (svgContainerRef.current) {
      svgContainerRef.current.style.cursor = 'grab';
    }
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!svgContent || e.touches.length !== 1) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX - offsetX);
    setStartY(e.touches[0].clientY - offsetY);
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - startX);
    setOffsetY(e.touches[0].clientY - startY);
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-white">
      {/* Header - Matching Dashboard Style */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-gray-300 p-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">T</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800 drop-shadow-sm">Interface Connections</h1>
          </div>
        </div>
      </div>

      {/* Controls - Matching Dashboard Style */}
      <div className="absolute top-20 left-4 z-40 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 shadow-lg">
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 rounded-full px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <Upload className="w-4 h-4 mr-2" />
            📁 Load SVG
          </Button>
          
          <Button
            onClick={() => zoom(1.2)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-full px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <ZoomIn className="w-4 h-4 mr-2" />
            🔍+ Zoom In
          </Button>
          
          <Button
            onClick={() => zoom(0.8)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-full px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
          >
            <ZoomOut className="w-4 h-4 mr-2" />
            🔍- Zoom Out
          </Button>

          {fileName && (
            <div className="mt-3 p-2 bg-white/5 border border-white/10 rounded-lg">
              <div className="text-xs text-white/80 italic">
                ✅ Loaded: {fileName}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept=".svg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* SVG Container - Matching Dashboard Style */}
      <div
        ref={svgContainerRef}
        className="absolute inset-0 flex items-center justify-center"
        style={{ cursor: svgContent ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
        onMouseDown={startDrag}
        onMouseMove={drag}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={svgDisplayRef}
          className="max-w-full max-h-full"
          style={{ transformOrigin: '0 0' }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
        
        {!svgContent && (
          <div className="text-center text-gray-500">
            <FileImage className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No SVG file loaded</p>
            <p className="text-sm">Click "Load SVG" to upload an SVG file</p>
          </div>
        )}
      </div>
    </div>
  );
}