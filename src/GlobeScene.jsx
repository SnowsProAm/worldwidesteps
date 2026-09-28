import { useEffect, useRef, useState } from 'react';

// NASA Blue Marble textures are served locally. See public/globe/CREDITS.md.
export default function GlobeScene() {
  const host = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const element = host.current;
    const start = async () => {
      try {
        const THREE = await import('three');
        if (disposed) return;
        const loader = new THREE.TextureLoader();
        const [surface, cloudMap] = await Promise.all([
          loader.loadAsync('/globe/earth-day.webp'),
          loader.loadAsync('/globe/earth-clouds.webp').catch(() => null),
        ]);
        if (disposed) { surface.dispose(); cloudMap?.dispose(); return; }
        surface.colorSpace = THREE.SRGBColorSpace;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
        camera.position.z = 4.5;
        const globe = new THREE.Group();
        globe.rotation.set(0.12, -1.5, -0.1);
        scene.add(globe);
        scene.add(new THREE.AmbientLight(0xffffff, 1.4));
        const light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(-3, 3, 5);
        scene.add(light);
        const earth = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 48), new THREE.MeshPhongMaterial({ map: surface, shininess: 5, specular: 0x111827 }));
        globe.add(earth);
        const clouds = cloudMap ? new THREE.Mesh(new THREE.SphereGeometry(1.012, 48, 32), new THREE.MeshPhongMaterial({ color: 0xffffff, alphaMap: cloudMap, transparent: true, opacity: 0.72, depthWrite: false, shininess: 0 })) : null;
        if (clouds) globe.add(clouds);
        const orbits = new THREE.Group();
        scene.add(orbits);
        for (let i = 0; i < 2; i++) {
          const orbit = new THREE.Mesh(new THREE.TorusGeometry(1.28 + i * 0.11, 0.002, 4, 120), new THREE.MeshBasicMaterial({ color: 0x0c69c8, transparent: true, opacity: 0.22 }));
          orbit.rotation.set(0.8 + i * 0.5, 0.4, i * 0.6);
          orbits.add(orbit);
        }
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let frame = 0, previous = 0, visible = true;
        const draw = now => {
          frame = 0;
          if (disposed || !visible || document.hidden) return;
          if (now - previous >= 33) {
            const delta = previous ? Math.min((now - previous) / 1000, 0.1) : 0;
            previous = now;
            if (!motion.matches) {
              globe.rotation.y += delta * 0.085;
              if (clouds) clouds.rotation.y += delta * 0.012;
              orbits.rotation.y += delta * 0.025;
            }
            renderer.render(scene, camera);
          }
          if (!motion.matches) frame = requestAnimationFrame(draw);
        };
        const resume = () => {
          cancelAnimationFrame(frame);
          previous = 0;
          draw(performance.now() + 34);
        };
        const resize = new ResizeObserver(() => {
          const { width, height } = element.getBoundingClientRect();
          renderer.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.render(scene, camera);
        });
        resize.observe(element);
        const visibility = new IntersectionObserver(entries => {
          visible = entries[0].isIntersecting;
          resume();
        });
        visibility.observe(element);
        const contextLost = event => { event.preventDefault(); cancelAnimationFrame(frame); setReady(false); };
        renderer.domElement.addEventListener('webglcontextlost', contextLost);
        document.addEventListener('visibilitychange', resume);
        motion.addEventListener('change', resume);
        setReady(true);
        resume();
        cleanup = () => {
          cancelAnimationFrame(frame);
          resize.disconnect();
          visibility.disconnect();
          document.removeEventListener('visibilitychange', resume);
          motion.removeEventListener('change', resume);
          renderer.domElement.removeEventListener('webglcontextlost', contextLost);
          scene.traverse(object => {
            object.geometry?.dispose();
            object.material?.dispose();
          });
          renderer.dispose();
          surface.dispose();
          cloudMap?.dispose();
          renderer.domElement.remove();
        };
      } catch {
        // Keep the rendered Earth image visible when WebGL or a texture is unavailable.
      }
    };
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { observer.disconnect(); start(); }
    });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); cleanup(); };
  }, []);

  return <div className="world-globe" aria-hidden="true">
    <div className="globe-halo" />
    <img src="/globe/earth-fallback.webp" className="globe-fallback" alt="" style={{ opacity: ready ? 0 : 1 }} />
    <div ref={host} className="globe-canvas" style={{ opacity: ready ? 1 : 0 }} />
    <div className="globe-caption">Every step connects us.</div>
  </div>;
}
