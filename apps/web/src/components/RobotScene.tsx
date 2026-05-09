import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import URDFLoader from 'urdf-loader';

export type RobotJointState = {
  joint1: number;
  joint2: number;
  joint3: number;
  joint4: number;
  joint5: number;
  joint6: number;
};

type RobotSceneProps = {
  joints: RobotJointState;
};

export function RobotScene({ joints }: RobotSceneProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const robotRef = useRef<URDFRobotLike | null>(null);
  const targetJointsRef = useRef(joints);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;

    if (!host || !canvas || typeof WebGLRenderingContext === 'undefined') {
      return;
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas, preserveDrawingBuffer: true });
    renderer.setClearColor(0xf6f8f7, 1);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xf6f8f7, 7, 18);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(2.8, 2.1, 3.4);
    camera.lookAt(0, 0.65, 0);

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.target.set(0, 0.65, 0);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x5b6c66, 2.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    const grid = new THREE.GridHelper(3.6, 12, 0x9fb3ac, 0xd5dfdc);
    scene.add(grid);

    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);
    manager.onLoad = () => {
      const robot = robotRef.current;

      if (!robot) {
        return;
      }

      let meshCount = 0;
      robot.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          meshCount += 1;
          object.frustumCulled = false;
          object.geometry.computeVertexNormals();
          object.geometry.computeBoundingSphere();
          object.material = materialForMesh(object);
        }
      });
      canvas.dataset.meshCount = String(meshCount);
      const box = new THREE.Box3().setFromObject(robot);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      canvas.dataset.bounds = `${size.x.toFixed(3)},${size.y.toFixed(3)},${size.z.toFixed(3)}`;
      canvas.dataset.center = `${center.x.toFixed(3)},${center.y.toFixed(3)},${center.z.toFixed(3)}`;
      fitCameraToObject(camera, controls, robot);
      const projected = center.clone().project(camera);
      canvas.dataset.projectedCenter = `${projected.x.toFixed(3)},${projected.y.toFixed(3)},${projected.z.toFixed(3)}`;
      canvas.dataset.geometryLoaded = 'true';
    };
    loader.packages = {
      dobot_description: '/robots/dobot_description'
    };
    loader.parseCollision = false;
    loader.load('/robots/dobot_description/urdf/cr10_robot.urdf', (robot: URDFRobotLike) => {
      robot.rotation.x = -Math.PI / 2;
      scene.add(robot);
      robotRef.current = robot;
      applyJoints(robot, joints);
    });

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    resize();

    let frame = 0;
    let frameCount = 0;
    let previousTime = performance.now();
    const currentJoints = { ...targetJointsRef.current };
    const render = () => {
      frame = requestAnimationFrame(render);
      const now = performance.now();
      const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      frameCount += 1;
      canvas.dataset.frameCount = String(frameCount);
      const robot = robotRef.current;

      if (robot) {
        smoothJoints(currentJoints, targetJointsRef.current, deltaSeconds);
        applyJoints(robot, currentJoints);
      }

      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      robotRef.current = null;
    };
  }, []);

  useEffect(() => {
    targetJointsRef.current = joints;
  }, [joints]);

  return (
    <div className="robot-scene" ref={hostRef}>
      <canvas ref={canvasRef} aria-label="Dobot CR10 URDF renderer" data-testid="robot-canvas" />
    </div>
  );
}

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function applyJoints(robot: URDFRobotLike, joints: RobotJointState) {
  for (const [name, value] of Object.entries(joints)) {
    robot.setJointValue(name, degreesToRadians(value));
  }
}

function smoothJoints(current: RobotJointState, target: RobotJointState, deltaSeconds: number) {
  const smoothing = 1 - Math.exp(-8 * deltaSeconds);

  for (const key of Object.keys(current) as Array<keyof RobotJointState>) {
    current[key] = THREE.MathUtils.lerp(current[key], target[key], smoothing);
  }
}

function materialForMesh(mesh: THREE.Mesh) {
  const name = meshSemanticName(mesh);
  const isBase = name.includes('base');
  const isPrimaryJoint = name.includes('link1') || name.includes('link4') || name.includes('link6');
  const isSecondaryJoint = name.includes('link3') || name.includes('link5');

  return new THREE.MeshStandardMaterial({
    color: isBase ? 0x2f343b : isPrimaryJoint ? 0x1178b8 : isSecondaryJoint ? 0xd7dde1 : 0xf4f7f8,
    emissive: isPrimaryJoint ? 0x031923 : 0x000000,
    metalness: isBase ? 0.22 : 0.12,
    roughness: 0.36,
    side: THREE.DoubleSide
  });
}

function meshSemanticName(mesh: THREE.Object3D) {
  const names: string[] = [];
  let current: THREE.Object3D | null = mesh;

  while (current) {
    if (current.name) {
      names.push(current.name.toLowerCase());
    }
    current = current.parent;
  }

  return names.join(' ');
}

function fitCameraToObject(camera: THREE.PerspectiveCamera, controls: OrbitControls, object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const maxSize = Math.max(size.x, size.y, size.z);
  const distance = maxSize * 1.8;

  controls.target.copy(center);
  camera.position.set(center.x + distance, center.y + distance * 0.75, center.z + distance);
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

type URDFRobotLike = THREE.Object3D & {
  setJointValue(name: string, value: number): boolean;
};
