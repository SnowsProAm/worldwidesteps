import { useEffect, useRef, useState } from 'react';

// Continent points derived from Natural Earth 1:110m land polygons.
// Source: https://www.naturalearthdata.com/ (public domain).
export default function GlobeScene() {
  const host = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    const element = host.current;
    const start = async () => {
      try {
        const [THREE, land] = await Promise.all([import('three'), import('./assets/land-points.json')]);
        if (disposed) return;
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        element.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
        camera.position.z = 4.5;
        const globe = new THREE.Group();
        globe.rotation.set(0.12, -0.35, -0.1);
        scene.add(globe);
        scene.add(new THREE.AmbientLight(0xffffff, 1.8));
        const light = new THREE.DirectionalLight(0xffffff, 1.8);
        light.position.set(-3, 3, 5);
        scene.add(light);
        const ocean = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), new THREE.MeshPhongMaterial({ color: 0x0c69c8, shininess: 28, specular: 0x0b4b8d }));
        globe.add(ocean);
        const points = new THREE.BufferGeometry();
        points.setAttribute('position', new THREE.Float32BufferAttribute(land.default.map(n => n * 1.009), 3));
        globe.add(new THREE.Points(points, new THREE.PointsMaterial({ color: 0xdcedff, size: 0.017, sizeAttenuation: true })));
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
          renderer.domElement.remove();
        };
      } catch {
        // Keep the CSS globe visible when WebGL or the deferred chunk is unavailable.
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
    <div className="globe-fallback" style={{ opacity: ready ? 0 : 1 }} />
    <div ref={host} className="globe-canvas" style={{ opacity: ready ? 1 : 0 }} />
    <div className="globe-caption">Every step connects us.</div>
  </div>;
}
