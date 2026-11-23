import { useEffect, useState } from 'react';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { HeroSection } from './components/HeroSection';
import { LoginPage } from './components/LoginPage';
import { MarqueeBand } from './components/MarqueeBand';
import { Navbar } from './components/Navbar';
import { NightTunnelSection } from './components/NightTunnelSection';
import { ProjectModal } from './components/ProjectModal';
import { StackSection } from './components/StackSection';
import { ProjectItem } from './data/projects';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [view, setView] = useState<'portfolio' | 'login'>(() =>
    typeof window !== 'undefined' && window.location.hash === '#login' ? 'login' : 'portfolio'
  );
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [preselectedProjectType, setPreselectedProjectType] = useState<string | undefined>(
    undefined
  );

  // Sync Tailwind v4 dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  // Sync URL hash for #login navigation
  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === '#login') setView('login');
      else if (view === 'login' && window.location.hash !== '#login') setView('portfolio');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [view]);

  const openLogin = () => {
    setView('login');
    window.history.replaceState(null, '', '#login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openPortfolio = () => {
    setView('portfolio');
    if (window.location.hash === '#login') {
      window.history.replaceState(null, '', '#top');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuildSimilar = (project: ProjectItem) => {
    setSelectedProject(null);
    if (project.category.includes('E-COMMERCE')) setPreselectedProjectType('E-Commerce & Payments');
    else if (project.category.includes('AI') || project.category.includes('IOT'))
      setPreselectedProjectType('SaaS / AI Dashboard');
    else setPreselectedProjectType('3D & Interactive Web');

    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleStartProjectFromTunnel = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[#141417] dark:bg-[#070709] dark:text-[#F4F0E8] transition-colors">
      <Navbar
        isDark={isDark}
        onToggleTheme={() => setIsDark((d) => !d)}
        onOpenLogin={openLogin}
        currentView={view}
        onBackToPortfolio={openPortfolio}
      />

      {view === 'login' ? (
        <LoginPage isDark={isDark} onBackToPortfolio={openPortfolio} />
      ) : (
        <main>
          <HeroSection isDark={isDark} onOpenLogin={openLogin} />
          <MarqueeBand />
          <AboutSection isDark={isDark} />
          <NightTunnelSection
            isDark={isDark}
            onSelectProject={setSelectedProject}
            onStartProject={handleStartProjectFromTunnel}
          />
          <StackSection isDark={isDark} onInspectProject={setSelectedProject} />
          <ContactSection preselectedProjectType={preselectedProjectType} />
        </main>
      )}

      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onSelectProject={setSelectedProject}
        onBuildSimilar={handleBuildSimilar}
      />
    </div>
  );
}
