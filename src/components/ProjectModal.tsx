import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { drawProjectPreviewCanvas, PROJECTS, ProjectItem } from '../data/projects';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onSelectProject: (project: ProjectItem) => void;
  onBuildSimilar: (project: ProjectItem) => void;
}

export function ProjectModal({
  project,
  onClose,
  onSelectProject,
  onBuildSimilar,
}: ProjectModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  useEffect(() => {
    if (!project || !canvasRef.current) return;
    const canvas = canvasRef.current;
    drawProjectPreviewCanvas(canvas, project, null);

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (!cancelled && canvasRef.current) {
        drawProjectPreviewCanvas(canvasRef.current, project, img);
      }
    };
    img.src = project.imageUrl;

    return () => {
      cancelled = true;
    };
  }, [project]);

  if (!project) return null;

  const currentIdx = PROJECTS.findIndex((p) => p.id === project.id);
  const prevProject = PROJECTS[(currentIdx - 1 + PROJECTS.length) % PROJECTS.length];
  const nextProject = PROJECTS[(currentIdx + 1) % PROJECTS.length];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} case study`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid w-full max-w-[1160px] grid-cols-1 gap-6 lg:grid-cols-12 items-stretch"
      >
        {/* Left High-Resolution Live UI Preview Frame */}
        <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-[#D4B475]/40 bg-[#0A0A0D] shadow-2xl flex flex-col">
          <div className="relative flex-1 bg-[#09090C]">
            <canvas
              ref={canvasRef}
              width={1024}
              height={640}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-white/10 bg-[#09090C] px-5 py-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-mono-tech text-xs text-[#D4B475]">{project.number}</span>
              <span className="truncate text-sm font-semibold text-[#F4F0E8]">{project.title}</span>
            </div>
            <span className="hidden sm:inline font-mono-tech text-[10px] tracking-[0.16em] text-[#8E8A82]">
              {project.category}
            </span>
          </div>
        </div>

        {/* Right Editorial Detail Panel */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-white/15 bg-[#0D0D12] p-6 sm:p-8 text-[#F4F0E8]">
          <div>
            {/* Controls Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectProject(prevProject)}
                  aria-label="Previous project"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-[#F4F0E8] transition-colors hover:bg-white/10"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onSelectProject(nextProject)}
                  aria-label="Next project"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-[#F4F0E8] transition-colors hover:bg-white/10"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 text-[#F4F0E8] transition-colors hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-6 font-mono-tech text-[10px] tracking-[0.18em] text-[#D4B475]">
              {project.category}
            </p>
            <h3 className="mt-2 font-serif-editorial text-3xl sm:text-4xl font-normal text-[#F4F0E8]">
              {project.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[#B4B0A8]">{project.description}</p>

            {/* Clean unboxed typographic stack list */}
            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="font-mono-tech text-[10px] tracking-[0.18em] text-[#78746C]">
                ARCHITECTURE &amp; TOOLS
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 font-mono-tech text-[11px] text-[#D4CFC5]">
                {project.stack.map((tech, i) => (
                  <span key={tech} className="inline-flex items-center gap-2.5">
                    <span>{tech}</span>
                    {i < project.stack.length - 1 && (
                      <span aria-hidden="true" className="text-[#D4B475]/60">
                        ·
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => onBuildSimilar(project)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#F4F0E8] px-5 py-2.5 text-xs font-semibold text-[#070709] transition-transform hover:scale-[1.02]"
            >
              <span>Build something similar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-mono-tech text-[11px] tracking-[0.14em] text-[#D4B475] transition-colors hover:text-[#F4F0E8]"
            >
              <span>CASE ARCHIVE</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
