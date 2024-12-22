import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { useLoader } from "@react-three/fiber";

const GamingRoomLogin: React.FC = () => {
    // OBJ形式のディスプレイモデルを読み込む
    const materials = useLoader(MTLLoader, "/3dmodel/monitor.mtl");
    const monitor = useLoader(OBJLoader, "/3dmodel/monitor.obj", (loader) => {
        materials.preload();
        loader.setMaterials(materials);
    });

    return (
        <div style={{ width: "100vw", height: "100vh", background: "white" }}>
            <Canvas camera={{ position: [0, 2, 8], fov: 60 }}>
                {/* 照明 */}
                <ambientLight intensity={0.3} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} />

                {/* ディスプレイモデル */}
                <primitive
                    object={monitor}
                    scale={0.5} // サイズを調整
                    position={[0, 2, 0]} // モデルの位置を調整
                    rotation={[0, Math.PI / 2, 0]} // モデルの向きを調整（例: ディスプレイを正面に向ける）
                />

                {/* ログインフォーム */}
                <Html transform position={[-0.14, 2.1, 0.05]} distanceFactor={1.5}>
                    <div
                        style={{
                            textAlign: "center",
                            color: "white",
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            padding: "10px",
                            borderRadius: "10px",
                            width: "130%", // 横幅をディスプレイ全体に合わせる
                            margin: "0 auto",
                        }}
                    >
                        <h2 style={{ marginBottom: "10px" }}>Login</h2>
                        <input
                            type="text"
                            placeholder="Username"
                            style={{
                                display: "block",
                                marginBottom: "10px",
                                padding: "5px",
                                width: "150px",
                                borderRadius: "5px",
                                border: "1px solid #666",
                            }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            style={{
                                display: "block",
                                marginBottom: "10px",
                                padding: "5px",
                                width: "150px",
                                borderRadius: "5px",
                                border: "1px solid #666",
                            }}
                        />
                        <button
                            style={{
                                padding: "5px 10px",
                                backgroundColor: "#00cc66",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                            }}
                        >
                            Login
                        </button>
                    </div>
                </Html>

                {/* カメラ操作 */}
                <OrbitControls />
            </Canvas>
        </div>
    );
};

export default GamingRoomLogin;
