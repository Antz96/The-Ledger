"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Wallet, Target, NotebookPen, SlidersHorizontal, GraduationCap, Landmark, CreditCard, TrendingDown, Bot,
} from "lucide-react";

const SECTIONS = [
  { href: "/dashboard", label: "Dashboard", desc: "Income, expenses, and savings at a glance.", Icon: LayoutDashboard },
  { href: "/assistant", label: "Assistant", desc: "Ask about your accounts, spending, and goals.", Icon: Bot },
  { href: "/assets", label: "Assets", desc: "Everything you own and owe, in one place.", Icon: Wallet },
  { href: "/debt-payoff", label: "Debt Payoff", desc: "Track what you owe against what you're repaying each month.", Icon: TrendingDown },
  { href: "/goals", label: "Goals", desc: "Track progress toward what you're saving for.", Icon: Target },
  { href: "/ledger", label: "Ledger", desc: "Every transaction, month by month.", Icon: NotebookPen },
  { href: "/allocate", label: "Allocate", desc: "Split your monthly savings across risk tiers, and see what's actually in each one.", Icon: SlidersHorizontal },
  { href: "/learn", label: "Learn", desc: "Plain-English explainers on risk, in one place.", Icon: GraduationCap },
  { href: "/rates", label: "Rates", desc: "Current high-yield savings rates, sourced and dated.", Icon: Landmark },
  { href: "/credit-health", label: "Credit Health", desc: "Ways you may be able to strengthen your credit profile.", Icon: CreditCard },
];

const N = SECTIONS.length;
const STEP = 360 / N;
const RADIUS = 170;

function normalize(a) {
  a = a % 360;
  if (a < 0) a += 360;
  return a;
}
function signedDiff(a) {
  a = normalize(a);
  return a > 180 ? a - 360 : a;
}

export default function WheelNav() {
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = useMemo(() => {
    const i = SECTIONS.findIndex((s) => s.href === pathname);
    return i === -1 ? 0 : i;
  }, [pathname]);

  const stageRef = useRef(null);
  const ringRef = useRef(null);
  const nodeRefs = useRef([]);
  const rotationRef = useRef(-currentIndex * STEP);
  const activeIndexRef = useRef(currentIndex);
  const [panelIndex, setPanelIndex] = useState(currentIndex);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // Keep the wheel in sync if navigation happens some other way (browser back/forward, a link elsewhere).
  useEffect(() => {
    if (activeIndexRef.current === currentIndex) return;
    const ring = ringRef.current;
    if (!ring) return;
    ring.classList.add("snapping");
    rotationRef.current = -currentIndex * STEP;
    activeIndexRef.current = currentIndex;
    setPanelIndex(currentIndex);
    render();
    const t = window.setTimeout(() => ring.classList.remove("snapping"), 650);
    return () => window.clearTimeout(t);
  }, [currentIndex]);

  function render() {
    const ring = ringRef.current;
    if (!ring) return;
    const rotation = rotationRef.current;
    let best = 0;
    let bestDist = 999;
    nodeRefs.current.forEach((el, i) => {
      if (!el) return;
      const worldAngle = i * STEP + rotation;
      const d = signedDiff(worldAngle);
      const abs = Math.abs(d);
      if (abs < bestDist) { bestDist = abs; best = i; }
      const depth = Math.cos((d * Math.PI) / 180);
      const scale = 0.66 + ((depth + 1) / 2) * 0.5;
      const opacity = 0.3 + ((depth + 1) / 2) * 0.7;
      el.style.opacity = opacity.toFixed(2);
      el.style.zIndex = Math.round((depth + 1) * 500);
      el.style.transform = `rotateY(${i * STEP}deg) translateZ(${RADIUS}px) scale(${scale.toFixed(3)})`;
    });
    nodeRefs.current.forEach((el, i) => {
      if (!el) return;
      el.classList.toggle("wn-active", i === best);
    });
    ring.style.transform = `rotateX(-9deg) rotateY(${rotation}deg)`;
    if (best !== activeIndexRef.current) {
      activeIndexRef.current = best;
      setPanelIndex(best);
    }
  }

  function commitNavigation(index) {
    const href = SECTIONS[index].href;
    if (pathname !== href) router.push(href);
  }

  function snap(target) {
    const ring = ringRef.current;
    if (!ring) return;
    if (typeof target !== "number") {
      target = Math.round(rotationRef.current / STEP) * STEP;
    }
    ring.classList.add("snapping");
    rotationRef.current = target;
    render();
    window.setTimeout(() => ring.classList.remove("snapping"), 650);
    commitNavigation(activeIndexRef.current);
  }

  function goTo(i) {
    const current = normalize(rotationRef.current);
    const target = normalize(-i * STEP);
    const delta = signedDiff(target - current);
    snap(rotationRef.current + delta);
  }

  useEffect(() => {
    const stage = stageRef.current;
    const ring = ringRef.current;
    if (!stage || !ring) return;

    ring.classList.add("snapping");
    render();
    const initT = window.setTimeout(() => ring.classList.remove("snapping"), 700);

    let idleTimer = null;
    function scheduleIdleSnap() {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => snap(), 220);
    }

    function onWheel(e) {
      e.preventDefault();
      ring.classList.remove("snapping");
      rotationRef.current += e.deltaY * 0.22;
      render();
      scheduleIdleSnap();
    }

    let dragging = false;
    let dragStartX = 0;
    let dragStartRotation = 0;
    let lastX = 0;
    let lastT = 0;
    let velocity = 0;

    function onPointerDown(e) {
      dragging = true;
      dragStartX = e.clientX;
      lastX = e.clientX;
      lastT = performance.now();
      velocity = 0;
      dragStartRotation = rotationRef.current;
      ring.classList.remove("snapping");
      stage.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - dragStartX;
      rotationRef.current = dragStartRotation + dx * 0.35;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        velocity = (((e.clientX - lastX) * 0.35) / dt) * 16;
        lastX = e.clientX;
        lastT = now;
      }
      render();
    }
    function coast() {
      velocity *= 0.94;
      rotationRef.current += velocity;
      render();
      if (Math.abs(velocity) > 0.15) {
        window.requestAnimationFrame(coast);
      } else {
        snap();
      }
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      if (!reduceMotionRef.current && Math.abs(velocity) > 0.6) {
        coast();
      } else {
        snap();
      }
    }

    function onKeyDown(e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo((activeIndexRef.current + 1) % N); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo((activeIndexRef.current - 1 + N) % N); }
    }

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", onPointerUp);
    stage.addEventListener("pointercancel", onPointerUp);
    stage.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(initT);
      window.clearTimeout(idleTimer);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", onPointerUp);
      stage.removeEventListener("pointercancel", onPointerUp);
      stage.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = SECTIONS[panelIndex];

  return (
    <div className="wn-wrap">
      <div className="wn-stage" ref={stageRef} tabIndex={0} aria-hidden="true">
        <div className="wn-floor" />
        <div className="wn-ring" ref={ringRef}>
          {SECTIONS.map((s, i) => (
            <button
              key={s.href}
              type="button"
              className="wn-node"
              ref={(el) => { nodeRefs.current[i] = el; }}
              onClick={() => goTo(i)}
              tabIndex={-1}
            >
              <span className="wn-icon"><s.Icon size={15} /></span>
              <span className="wn-label">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="wn-dots" role="group" aria-label="Jump to section">
        {SECTIONS.map((s, i) => (
          <button
            key={s.href}
            type="button"
            className="wn-dot"
            aria-label={s.label}
            aria-current={i === panelIndex ? "true" : "false"}
            onClick={() => { goTo(i); stageRef.current?.focus(); }}
          />
        ))}
      </div>

      <p className="wn-desc mono">{active.desc}</p>

      <style jsx>{`
        .wn-wrap { position: relative; padding: 4px 0 10px; }
        .wn-stage {
          position: relative;
          height: 190px;
          perspective: 900px;
          perspective-origin: 50% 40%;
          cursor: grab;
          touch-action: pan-y;
          outline: none;
        }
        .wn-stage:active { cursor: grabbing; }
        .wn-floor {
          position: absolute;
          left: 50%; top: 62%;
          width: 420px; height: 160px;
          transform: translate(-50%, -50%) rotateX(78deg);
          background-image:
            linear-gradient(rgba(34,211,238,0.09) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.09) 1px, transparent 1px);
          background-size: 30px 30px;
          -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 72%);
          mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, transparent 72%);
          pointer-events: none;
        }
        .wn-ring {
          position: absolute;
          left: 50%; top: 42%;
          width: 0; height: 0;
          transform-style: preserve-3d;
          transform: rotateX(-9deg) rotateY(0deg);
          will-change: transform;
        }
        .wn-ring.snapping { transition: transform 0.55s cubic-bezier(.2,.8,.25,1); }
        @media (prefers-reduced-motion: reduce) {
          .wn-ring.snapping { transition: none; }
        }
        .wn-node {
          position: absolute;
          width: 74px; height: 86px;
          margin-left: -37px; margin-top: -43px;
          border-radius: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
          border: 1px solid var(--line);
          backdrop-filter: blur(8px);
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          padding: 6px;
          cursor: pointer;
          transition: background 0.25s, box-shadow 0.25s;
          backface-visibility: hidden;
          font-family: inherit;
        }
        .wn-node:hover { background: linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03)); }
        .wn-icon {
          width: 26px; height: 26px; border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          background: var(--panel-hi);
          color: var(--muted);
          transition: background 0.25s, color 0.25s, box-shadow 0.25s;
        }
        .wn-label {
          font-size: 10px; font-weight: 500; color: var(--muted);
          text-align: center; line-height: 1.2;
          transition: color 0.25s;
        }
        .wn-node.wn-active {
          border-color: transparent;
          box-shadow: 0 0 0 1.5px rgba(34,211,238,0.55), 0 14px 26px -10px rgba(0,0,0,0.6), 0 0 22px rgba(34,211,238,0.16);
        }
        .wn-node.wn-active .wn-icon {
          background: linear-gradient(140deg, var(--emerald), var(--cyan));
          color: var(--obsidian);
          box-shadow: 0 0 12px rgba(34,211,238,0.4);
        }
        .wn-node.wn-active .wn-label { color: var(--text); font-weight: 600; }
        .wn-dots { display: flex; justify-content: center; gap: 6px; margin: 4px 0 6px; }
        .wn-dot {
          width: 6px; height: 6px; border-radius: 50%; padding: 0;
          background: var(--panel-hi); border: 1px solid var(--line);
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
        }
        .wn-dot:hover { background: var(--muted); }
        .wn-dot[aria-current="true"] {
          background: linear-gradient(140deg, var(--emerald), var(--cyan));
          border-color: transparent;
          transform: scale(1.3);
          box-shadow: 0 0 7px rgba(34,211,238,0.5);
        }
        .wn-dot:focus-visible { outline: 2px solid var(--cyan); outline-offset: 3px; }
        .wn-desc {
          text-align: center;
          font-size: 11px;
          color: var(--faint);
          margin: 0;
          padding: 0 12px;
        }
      `}</style>
    </div>
  );
}
