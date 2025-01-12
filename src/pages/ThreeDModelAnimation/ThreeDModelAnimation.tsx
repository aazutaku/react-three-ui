// 3DModelAnimation.tsx

// ================================
// PART 1: Meshyでのモデル生成
// ================================

// Meshy AIを利用して、3Dモデルを生成する

// ================================
// PART 2: 定数定義
// ================================
import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { AnimationMixer, Clock, DoubleSide, Vector3 } from 'three';
import './ThreeDModelAnimation.css';

// 定数定義
// モデル関連の設定
const MODEL_SCALE = 0.1; // モデルのスケール
const MODEL_INITIAL_POSITION = new Vector3(0, 0.5, 0); // モデルの初期位置
const MODEL_ROTATION_X = -0.3; // モデルのX軸回転

// 地面の設定
const GROUND_COLOR = 'green';
const GROUND_POSITION = new Vector3(0, 0, 0);
const GROUND_SIZE = 200; // 地面のサイズ
const GROUND_SEGMENTS = 50; // 地面の分割数

// 石の設定
const STONE_COUNT = 50; // 石の数
const STONE_SCALE_MIN = 0.1; // 石の最小スケール
const STONE_SCALE_MAX = 0.6; // 石の最大スケール

// カメラとライトの設定
const CAMERA_POSITION = new Vector3(0, 20, 50);
const AMBIENT_LIGHT_INTENSITY = 1.5; // 環境光の強さ
const POINT_LIGHT_POSITION = new Vector3(10, 20, 10);
const POINT_LIGHT_INTENSITY = 1; // 点光源の強さ

// 背景の設定
const BACKGROUND_COLOR = 'skyblue'; // 背景色

interface AnimatedFBXModelProps {
    path: string;
    isPlaying?: boolean;
}

// ================================
// PART 3: アニメーションモデル
// ================================
const AnimatedFBXModel: React.FC<AnimatedFBXModelProps> = ({ path, isPlaying = false }) => {
    const mixer = useRef<AnimationMixer | null>(null);
    const clock = useRef(new Clock());
    const [model, setModel] = useState<any>(null);
    const [action, setAction] = useState<any>(null);

    // フレームごとにモデルの位置とアニメーションを更新
    useFrame(() => {
        if (model && isPlaying) {
            model.position.z += 0.05; // モデルを前進させる
        }

        if (mixer.current && isPlaying) {
            const delta = clock.current.getDelta();
            mixer.current.update(delta); // アニメーションの更新
        }
    });

    // FBXモデルの読み込み
    useEffect(() => {
        const loader = new FBXLoader();

        loader.load(
            path,
            (fbx) => {
                if (!model) {
                    fbx.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE);
                    fbx.position.copy(MODEL_INITIAL_POSITION);
                    fbx.rotateX(MODEL_ROTATION_X);
                }

                mixer.current = new AnimationMixer(fbx);

                // アニメーションがあれば設定
                if (fbx.animations.length > 0) {
                    const newAction = mixer.current.clipAction(fbx.animations[0]);
                    newAction.paused = !isPlaying;
                    setAction(newAction);
                }

                setModel(fbx);
            },
            undefined,
            (error) => {
                console.error('Error loading FBX model:', error);
            }
        );
    }, [path]);

    // アニメーションの再生/停止を切り替え
    useEffect(() => {
        if (action) {
            action.paused = !isPlaying;
            if (isPlaying) {
                action.play();
            } else {
                action.stop();
            }
        }
    }, [isPlaying, action]);

    return model ? <primitive object={model} /> : null;
};

// ================================
// PART 4: 地面の設定
// ================================
const Ground: React.FC = () => {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={GROUND_POSITION}>
            <planeGeometry args={[GROUND_SIZE, GROUND_SIZE, GROUND_SEGMENTS, GROUND_SEGMENTS]} />
            <meshStandardMaterial color={GROUND_COLOR} side={DoubleSide} />
        </mesh>
    );
};

// ================================
// PART 5: ランダムな石の配置
// ================================
const RandomStones: React.FC = () => {
    // 初回レンダリング時にランダムな位置とスケールで石を生成
    const [stones] = useState(() => {
        return Array.from({ length: STONE_COUNT }, () => {
            const x = Math.random() * GROUND_SIZE - GROUND_SIZE / 2;
            const y = GROUND_POSITION.y;
            const z = Math.random() * GROUND_SIZE - GROUND_SIZE / 2;
            const scale = Math.random() * (STONE_SCALE_MAX - STONE_SCALE_MIN) + STONE_SCALE_MIN;

            return (
                <mesh key={`${x}-${z}`} position={[x, y, z]} scale={[scale, scale, scale]}>
                    <sphereGeometry args={[1, 8, 8]} />
                    <meshStandardMaterial color="gray" />
                </mesh>
            );
        });
    });

    return <>{stones}</>;
};

// ================================
// PART 6: メインコンポーネント
// ================================
const ThreeDModelAnimation: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <div className="canvas-container">
            <button
                style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 100 }}
                onClick={() => setIsPlaying(!isPlaying)}
            >
                {isPlaying ? 'Pause Animation' : 'Play Animation'}
            </button>
            <Canvas camera={{ position: CAMERA_POSITION.toArray() }}>
                <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
                <pointLight position={POINT_LIGHT_POSITION.toArray()} intensity={POINT_LIGHT_INTENSITY} />
                <OrbitControls />

                {/* 地面の表示 */}
                <Ground />

                {/* ランダムな石の配置 */}
                <RandomStones />

                {/* 背景色の設定 */}
                <color attach="background" args={[BACKGROUND_COLOR]} />

                {/* アニメーションモデル */}
                <AnimatedFBXModel path="/models/cuddly_bear/Animation_Walking_withSkin.fbx" isPlaying={isPlaying} />
            </Canvas>
        </div>
    );
};

export default ThreeDModelAnimation;
