import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";

// ================================
// PART 1: 定数定義
// ================================
const CAMERA_POSITION = new THREE.Vector3(0, 0, 3); // Vector3形式でカメラ位置を定義
const MONITOR_SCALE = 1;
const MONITOR_ROTATION = [0, -Math.PI / 2, 0];
const HTML_POSITION = new THREE.Vector3(0, 0.15, 0.06);
const HTML_ROTATION = new THREE.Euler(-0.075, 0, 0);
const HTML_SCALE = new THREE.Vector3(2.45, 1.85, 0.5);

// ================================
// PART 2: モニターディスプレイコンポーネント
// ================================
const MonitorDisplay: React.FC = () => {
    const materials = useLoader(MTLLoader, "/models/monitor.mtl");
    const obj = useLoader(OBJLoader, "/models/monitor.obj", (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    });

    return (
        <>
            {/* モニターモデル */}
            <primitive
                object={obj}
                scale={MONITOR_SCALE}
                position={[0, 0, 0]}
                rotation={MONITOR_ROTATION}
            />

            {/* HTML要素（ディスプレイ部分） */}
            <Html
                transform
                position={HTML_POSITION}
                distanceFactor={1}
                occlude
                scale={HTML_SCALE}
                rotation={HTML_ROTATION}
            >
                <div
                    style={{
                        width: "300px",
                        height: "200px",
                        background: "white",
                        borderRadius: "10px",
                        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "10px",
                        textAlign: "center",
                    }}
                >
                    <h2>Login</h2>
                    <input
                        type="text"
                        placeholder="Username"
                        style={{ marginBottom: "10px", padding: "5px" }}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        style={{ marginBottom: "10px", padding: "5px" }}
                    />
                    <button
                        style={{
                            padding: "10px 20px",
                            background: "blue",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Submit
                    </button>
                </div>
            </Html>
        </>
    );
};

// ================================
// PART 3: メインコンポーネント
// ================================
const Meshy3DModel: React.FC = () => {
    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                background: "linear-gradient(135deg, #1e3c72,rgb(78, 126, 211))", // グラデーション
            }}
        >
            <Canvas camera={{ position: CAMERA_POSITION, fov: 60 }}>
                <ambientLight intensity={20} />
                <spotLight position={[10, 10, 10]} intensity={2} />

                {/* モニターディスプレイ */}
                <MonitorDisplay />

                {/* カメラ操作を制限 */}
                <OrbitControls
                    minPolarAngle={Math.PI / 2}
                    maxPolarAngle={Math.PI / 2}
                />
            </Canvas>
        </div>
    );
};

export default Meshy3DModel;
