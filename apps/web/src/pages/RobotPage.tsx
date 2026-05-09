import { useEffect, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { RobotJointState, RobotScene } from '../components/RobotScene';

const initialJoints: RobotJointState = {
  joint1: 20,
  joint2: 28,
  joint3: -42,
  joint4: 18,
  joint5: 32,
  joint6: 0
};

const controls: Array<{ key: keyof RobotJointState; label: string; min: number; max: number }> = [
  { key: 'joint1', label: 'J1', min: -180, max: 180 },
  { key: 'joint2', label: 'J2', min: -180, max: 180 },
  { key: 'joint3', label: 'J3', min: -160, max: 160 },
  { key: 'joint4', label: 'J4', min: -180, max: 180 },
  { key: 'joint5', label: 'J5', min: -180, max: 180 },
  { key: 'joint6', label: 'J6', min: -360, max: 360 }
];

export function RobotPage() {
  const [joints, setJoints] = useState(initialJoints);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      const time = Date.now() / 1000;
      setJoints({
        joint1: Math.sin(time * 0.42) * 50,
        joint2: 18 + Math.sin(time * 0.58) * 28,
        joint3: -38 + Math.cos(time * 0.64) * 38,
        joint4: Math.sin(time * 0.72) * 56,
        joint5: 24 + Math.cos(time * 0.76) * 34,
        joint6: Math.sin(time * 0.86) * 95
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  return (
    <section className="robot-page">
      <div className="robot-toolbar">
        <div>
          <h1>Robot Digital Twin</h1>
          <p>Dobot CR10 URDF renderer using mock joint states.</p>
        </div>
        <button className="icon-button" type="button" onClick={() => setIsPlaying((value) => !value)} aria-label={isPlaying ? 'Pause joint animation' : 'Play joint animation'}>
          {isPlaying ? <Pause aria-hidden="true" size={18} /> : <Play aria-hidden="true" size={18} />}
        </button>
      </div>

      <RobotScene joints={joints} />

      <section className="joint-panel" aria-label="Mock joint controls">
        {controls.map((control) => (
          <label key={control.key}>
            <span>{control.label}</span>
            <input
              type="range"
              min={control.min}
              max={control.max}
              value={joints[control.key]}
              onChange={(event) => {
                setIsPlaying(false);
                setJoints((current) => ({ ...current, [control.key]: Number(event.target.value) }));
              }}
            />
            <output>{Math.round(joints[control.key])} deg</output>
          </label>
        ))}
      </section>
    </section>
  );
}
