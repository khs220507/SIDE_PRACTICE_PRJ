declare module 'urdf-loader' {
  import type { LoadingManager, Object3D } from 'three';

  export default class URDFLoader {
    packages: string | Record<string, string> | ((packageName: string) => string);
    parseCollision: boolean;

    constructor(manager?: LoadingManager);

    load(
      urdfPath: string,
      onComplete: (robot: Object3D & { setJointValue(name: string, value: number): boolean }) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (error: unknown) => void
    ): void;
  }
}
