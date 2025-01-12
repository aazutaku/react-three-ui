// ================================
// PART 1: 必要なモジュールのインポート
// ================================
import React, { useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader";
import * as THREE from "three";

// ================================
// PART 2: 定数の定義
// ================================
// アニメーションファイルのリスト
// 各アニメーションの名前とパスを格納
const ANIMATION_FILES = [
    { name: "Pod Baby Groove", path: "/models/uncle_glb/Animation_Pod_Baby_Groove_withSkin.glb" },
    { name: "Gangnam Groove", path: "/models/uncle_glb/Animation_Gangnam_Groove_withSkin.glb" },
    { name: "Pop Dance", path: "/models/uncle_glb/Animation_Superlove_Pop_Dance_withSkin.glb" },
];

// モデルファイルのパス
const DEFAULT_ANIMATION_FILE = ANIMATION_FILES[0].path;

// HDRI画像のパス (背景用)
const HDRI_FILE = "/hdri/cobblestone_street_night_4k.exr";

// 初期カメラ位置 (x, y, z)
const INITIAL_CAMERA_POSITION = new THREE.Vector3(10, 4, 10);

// モデルのスケール倍率
const MODEL_SCALE = 4;

// モデルの初期回転角度 (y軸回り、ラジアン単位)
const MODEL_ROTATION_Y = -1;

// モデルの初期位置 (x, y, z)
const MODEL_POSITION = new THREE.Vector3(0, -2, 0);

// ライトの設定
// 環境光、方向光、ポイントライトの位置と強度を定義
const LIGHT_SETTINGS = {
    ambient: { intensity: 0.5 }, // 環境光の強度
    directional: { position: new THREE.Vector3(10, 20, 10), intensity: 1.5 }, // 方向光の位置と強度
    point: { position: new THREE.Vector3(0, 10, 0), intensity: 1.5 }, // ポイントライトの位置と強度
};

// ================================
// PART 3: 背景の設定
// ================================
// シーンの背景をHDRI画像で設定
const Background: React.FC = () => {
    const { gl, scene } = useThree();

    useEffect(() => {
        const hdrLoader = new EXRLoader();
        const pmremGenerator = new THREE.PMREMGenerator(gl);
        pmremGenerator.compileEquirectangularShader();

        hdrLoader.load(HDRI_FILE, (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            const envMap = pmremGenerator.fromEquirectangular(texture).texture;
            scene.background = envMap; // シーン全体の背景を設定
            scene.environment = envMap; // 環境マップを設定

            // メモリ解放
            texture.dispose();
            pmremGenerator.dispose();
        });
    }, [gl, scene]);

    return null; // レンダリング対象はなし
};

// ================================
// PART 4: モデルとアニメーション
// ================================
// メインモデルの読み込みとアニメーションの管理
const Model: React.FC<{ currentAnimation: string }> = ({ currentAnimation }) => {
    const { camera } = useThree();
    const [model, setModel] = useState<THREE.Group | null>(null);
    const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

    // モデルの読み込み
    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load(DEFAULT_ANIMATION_FILE, (gltf) => {
            const { scene: loadedScene } = gltf;
            loadedScene.scale.set(MODEL_SCALE, MODEL_SCALE, MODEL_SCALE); // モデルのサイズを設定
            loadedScene.rotateY(MODEL_ROTATION_Y); // モデルの初期回転を設定
            loadedScene.position.copy(MODEL_POSITION); // モデルの初期位置を設定
            setModel(loadedScene);

            const animationMixer = new THREE.AnimationMixer(loadedScene);
            setMixer(animationMixer);

            // カメラの初期位置を設定
            camera.position.copy(INITIAL_CAMERA_POSITION);
            camera.lookAt(0, 4, 0); // モデルの中心を見る
        });
    }, [camera]);

    // アニメーションの切り替え
    useEffect(() => {
        if (!model || !mixer) return;

        const loader = new GLTFLoader();
        loader.load(currentAnimation, (gltf) => {
            const newAnimation = gltf.animations[0];

            if (newAnimation) {
                const action = mixer.clipAction(newAnimation);
                mixer.stopAllAction(); // 既存のアクションを停止
                action.reset().fadeIn(0.5).play(); // 新しいアクションを再生
            }
        });
    }, [currentAnimation, model, mixer]);

    // アニメーションの更新
    useFrame((_, delta) => {
        if (mixer) mixer.update(delta);
    });

    return model ? <primitive object={model} /> : null; // モデルを表示
};

// ================================
// PART 5: メインコンポーネント
// ================================
// 全体のアプリケーションを構成
const ThreeDDancingUncle: React.FC = () => {
    const [currentAnimation, setCurrentAnimation] = useState(ANIMATION_FILES[0].path);

    return (
        <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
            {/* アニメーション選択ボタン */}
            <div
                style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    zIndex: 10, // ボタンをCanvasの上に表示
                }}
            >
                {ANIMATION_FILES.map((anim, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentAnimation(anim.path)} // アニメーションを切り替え
                        style={{
                            margin: "5px",
                            padding: "10px",
                            fontSize: "14px",
                            background: "rgba(255, 255, 255, 0.8)",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        {anim.name}
                    </button>
                ))}
            </div>
            <Canvas>
                {/* 背景コンポーネント */}
                <Background />
                {/* モデルとアニメーション */}
                <Model currentAnimation={currentAnimation} />
                {/* ライト設定 */}
                <ambientLight intensity={LIGHT_SETTINGS.ambient.intensity} />
                <directionalLight
                    position={LIGHT_SETTINGS.directional.position}
                    intensity={LIGHT_SETTINGS.directional.intensity}
                />
                <pointLight
                    position={LIGHT_SETTINGS.point.position}
                    intensity={LIGHT_SETTINGS.point.intensity}
                />
                {/* カメラ操作 */}
                <OrbitControls />
            </Canvas>
        </div>
    );
};

export default ThreeDDancingUncle;
