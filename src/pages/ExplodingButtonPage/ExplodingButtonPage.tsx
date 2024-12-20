import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Text } from "@react-three/drei";
import * as THREE from "three";

// ================================
// PART 1: 定数定義
// ================================
const PARTICLE_SIZE = 0.1; // 1パーティクルのサイズ
const PARTICLE_NUM_WIDTH = 40; // パーティクル数（横）
const PARTICLE_NUM_HEIGHT = 20; // パーティクル数（横）
const PARTICLE_NUM_THICKNESS = 5; // パーティクル数（横）
const BUTTON_SIZE_WIDTH = PARTICLE_SIZE * PARTICLE_NUM_WIDTH; // ボタンサイズ=1パーティクル*パーティクル数
const BUTTON_SIZE_HEIGHT = PARTICLE_SIZE * PARTICLE_NUM_HEIGHT; // ボタンサイズ=1パーティクル*パーティクル数
const BUTTON_SIZE_THICKNESS = PARTICLE_SIZE * PARTICLE_NUM_THICKNESS; // ボタンサイズ=1パーティクル*パーティクル数

const TEXT = "Click Me!!"; // 表示するテキスト
const TEXT_SIZE = BUTTON_SIZE_WIDTH / TEXT.length; // 1文字あたりのサイズ
const TEXT_FLOAT_OFFSET = 0.01; // テキストをボタン表面から浮かせる距離

const PARTICLE_SPEED = 2.0; // 爆発時の速度
const PARTICLE_TIME = 5 * 1000; // 爆発の継続時間（秒）
const RESET_SPEED = 0.05; // 元の位置に戻る速度

// ================================
// PART 2: 型定義
// ================================
type Particle = {
    id: number; // 一意のID
    startPosition: THREE.Vector3; // 初期位置
    position: THREE.Vector3; // 現在位置
    velocity: THREE.Vector3; // 爆発時の速度ベクトル
    scale: number; // サイズ
    char?: string; // テキストパーティクルの場合の文字
};

// ================================
// PART 3: パーティクル生成関数
// ================================
const generateButtonParticles = (): Particle[] => {
    const particles: Particle[] = [];

    // --- ボタンのパーティクルを生成 ---
    for (let x = 0; x < PARTICLE_NUM_WIDTH; x++) {
        for (let y = 0; y < PARTICLE_NUM_HEIGHT; y++) {
            for (let z = 0; z < PARTICLE_NUM_THICKNESS; z++) {
                const position = new THREE.Vector3(
                    x * PARTICLE_SIZE - BUTTON_SIZE_WIDTH / 2,
                    y * PARTICLE_SIZE - BUTTON_SIZE_HEIGHT / 2,
                    z * PARTICLE_SIZE
                );
                particles.push({
                    id: particles.length,
                    startPosition: position.clone(),
                    position: position.clone(),
                    velocity: new THREE.Vector3(
                        (Math.random() - 0.5) * PARTICLE_SPEED,
                        (Math.random() - 0.5) * PARTICLE_SPEED,
                        (Math.random() - 0.5) * PARTICLE_SPEED
                    ),
                    scale: PARTICLE_SIZE,
                });
            }
        }
    }

    // --- テキストのパーティクルを生成 ---
    TEXT.split("").forEach((char, i) => {
        const position = new THREE.Vector3(
            i * TEXT_SIZE - BUTTON_SIZE_WIDTH / 2 + TEXT_SIZE / 2,
            0, // Y軸中央
            BUTTON_SIZE_THICKNESS + TEXT_FLOAT_OFFSET // Z軸: 表面から少し浮かせる
        );
        particles.push({
            id: particles.length,
            startPosition: position.clone(),
            position: position.clone(),
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * PARTICLE_SPEED,
                (Math.random() - 0.5) * PARTICLE_SPEED,
                (Math.random() - 0.5) * PARTICLE_SPEED
            ),
            scale: TEXT_SIZE,
            char,
        });
    });

    return particles;
};

// ================================
// PART 4: パーティクル描画コンポーネント
// ================================
const ExplodingParticles: React.FC<{ particles: Particle[]; state: string }> = ({ particles, state }) => {
    const groupRef = useRef<THREE.Group>(null);

    // useFrame: 毎フレームの処理（爆発 or 初期位置に戻す）
    useFrame((_, delta) => {
        groupRef.current?.children.forEach((child) => {
            const particle = child.userData.particle as Particle;

            if (state === "explode") {
                // 爆発: 速度ベクトルに基づいて移動
                child.position.add(particle.velocity.clone().multiplyScalar(delta));
            } else {
                // 初期位置に戻す
                child.position.lerp(particle.startPosition, RESET_SPEED);
            }
        });
    });

    return (
        <group ref={groupRef}>
            {particles.map((particle) =>
                particle.char ? (
                    // テキストパーティクル
                    <group key={particle.id} position={particle.position} userData={{ particle }}>
                        <Text fontSize={particle.scale} color="white">
                            {particle.char}
                        </Text>
                    </group>
                ) : (
                    // ボタン形状のパーティクル
                    <mesh key={particle.id} position={particle.position} userData={{ particle }}>
                        <boxGeometry args={[particle.scale, particle.scale, particle.scale]} />
                        <meshStandardMaterial color={"#3498db"} />
                    </mesh>
                )
            )}
        </group>
    );
};

// ================================
// PART 5: メインコンポーネント
// ================================
const ExplodingButtonPage: React.FC = () => {
    const [particles] = useState<Particle[]>(generateButtonParticles());
    const [state, setState] = useState<"idle" | "explode">("idle");

    const handleClick = () => {
        if (state === "idle") {
            setState("explode");
            setTimeout(() => setState("idle"), PARTICLE_TIME);
        }
    };

    return (
        <div style={{ width: "100vw", height: "100vh", background: "black" }}>
            <Canvas camera={{ position: [0, 0, 8] }}>
                {/* 背景効果 */}
                <Stars radius={100} depth={50} count={1000} factor={4} fade />
                <ambientLight intensity={0.8} />
                <spotLight position={[10, 10, 10]} intensity={2} castShadow />

                {/* パーティクル表示 */}
                <group onClick={handleClick}>
                    <ExplodingParticles particles={particles} state={state} />
                </group>

                {/* カメラ操作 */}
                <OrbitControls />
            </Canvas>
        </div>
    );
};

export default ExplodingButtonPage;
